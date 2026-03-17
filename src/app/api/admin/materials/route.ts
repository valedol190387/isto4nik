import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { deletePromoImage, isValidPromoImageUrl, deleteAudioFile, isValidAudioUrl } from '@/lib/s3';

// GET - получить все материалы для админки
export async function GET() {
  try {
    const { data: materials, error } = await supabase
      .from('materials')
      .select('*')
      .order('section_key', { ascending: true })
      .order('display_order', { ascending: false });

    if (error) {
      throw error;
    }

    // Сортируем мини-курсы (section_key = 'materials') в обратном порядке
    const sortedMaterials = materials?.map(m => m).sort((a, b) => {
      if (a.section_key === b.section_key) {
        if (a.section_key === 'materials') {
          // Для мини-курсов сортируем по возрастанию
          return a.display_order - b.display_order;
        }
        // Для остальных по убыванию (уже отсортировано в запросе)
        return b.display_order - a.display_order;
      }
      return a.section_key.localeCompare(b.section_key);
    });

    return NextResponse.json({ success: true, materials: sortedMaterials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

// POST - создать новый материал
export async function POST(request: Request) {
  try {
    const materialData = await request.json();
    const { display_order, section_key } = materialData;
    
    // Проверяем, есть ли другой материал с таким же display_order в том же разделе
    if (display_order && section_key) {
      const { data: existingMaterial, error: checkError } = await supabase
        .from('materials')
        .select('id')
        .eq('section_key', section_key)
        .eq('display_order', display_order)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingMaterial) {
        return NextResponse.json(
          { success: false, message: `Материал с порядком отображения ${display_order} уже существует в разделе "${section_key}"` },
          { status: 400 }
        );
      }
    }
    
    // Добавляем временные метки
    materialData.created_at = new Date().toISOString();
    materialData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('materials')
      .insert([materialData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, material: data[0] });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create material' },
      { status: 500 }
    );
  }
}

// PUT - обновить материал
export async function PUT(request: Request) {
  try {
    const materialData = await request.json();
    const { id, display_order, section_key, oldPicUrl, oldAudios } = materialData;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Проверяем, есть ли другой материал с таким же display_order в том же разделе
    if (display_order && section_key) {
      const { data: existingMaterial, error: checkError } = await supabase
        .from('materials')
        .select('id')
        .eq('section_key', section_key)
        .eq('display_order', display_order)
        .neq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingMaterial) {
        return NextResponse.json(
          { success: false, message: `Материал с порядком отображения ${display_order} уже существует в разделе "${section_key}"` },
          { status: 400 }
        );
      }
    }

    // Если изображение изменилось, удаляем старое
    if (oldPicUrl && oldPicUrl !== materialData.pic_url && isValidPromoImageUrl(oldPicUrl)) {
      await deletePromoImage(oldPicUrl);
    }

    // Удаляем старые аудио файлы с S3, если они были убраны
    if (oldAudios && Array.isArray(oldAudios)) {
      const newAudioUrls = new Set((materialData.audios || []).map((a: { audio_url: string }) => a.audio_url));
      for (const oldAudio of oldAudios) {
        if (oldAudio.audio_url && !newAudioUrls.has(oldAudio.audio_url) && isValidAudioUrl(oldAudio.audio_url)) {
          await deleteAudioFile(oldAudio.audio_url);
        }
      }
    }

    // Удаляем oldPicUrl и oldAudios из данных для обновления
    delete materialData.oldPicUrl;
    delete materialData.oldAudios;

    // Добавляем временную метку обновления
    materialData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('materials')
      .update(materialData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, material: data[0] });
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update material' },
      { status: 500 }
    );
  }
}

// DELETE - удалить материал
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Сначала получаем данные материала для удаления промо-картинки и аудио
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('pic_url, audios')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Удаляем материал из БД
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Удаляем промо-картинку из S3, если она есть
    if (material?.pic_url && isValidPromoImageUrl(material.pic_url)) {
      await deletePromoImage(material.pic_url);
    }

    // Удаляем аудио файлы из S3, если они есть
    if (material?.audios && Array.isArray(material.audios)) {
      for (const audio of material.audios) {
        if (audio.audio_url && isValidAudioUrl(audio.audio_url)) {
          await deleteAudioFile(audio.audio_url);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete material' },
      { status: 500 }
    );
  }
} 