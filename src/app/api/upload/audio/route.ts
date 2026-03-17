import { NextRequest, NextResponse } from 'next/server';
import { uploadAudioFile } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Файл не найден' },
        { status: 400 }
      );
    }

    const audioUrl = await uploadAudioFile(file);

    return NextResponse.json({
      success: true,
      audioUrl
    });
  } catch (error) {
    console.error('Error uploading audio:', error);

    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки файла';

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
