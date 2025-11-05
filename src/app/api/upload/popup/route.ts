import { NextRequest, NextResponse } from 'next/server';
import { uploadPopupImage } from '@/lib/s3';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Получаем форм-данные
    const formData = await request.formData();
    const file = formData.get('popupImage') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверяем наличие S3 конфигурации
    const hasS3Config = process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME;

    let imageUrl: string;

    if (hasS3Config) {
      // Загружаем файл в S3
      imageUrl = await uploadPopupImage(file);
    } else {
      // Fallback: сохраняем локально в /public/images/popup/
      console.log('S3 не настроен, сохраняю локально');
      console.log('File name:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      console.log('Buffer length:', buffer.length);

      // Создаём уникальное имя файла
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `popup-${timestamp}.${fileExtension}`;
      console.log('Generated filename:', fileName);

      // Путь к папке public/images/popup
      const publicDir = path.join(process.cwd(), 'public', 'images', 'popup');
      console.log('Public dir:', publicDir);

      // Создаём директорию если её нет
      await mkdir(publicDir, { recursive: true });

      // Сохраняем файл
      const filePath = path.join(publicDir, fileName);
      console.log('Full file path:', filePath);
      await writeFile(filePath, buffer);
      console.log('File saved successfully!');

      // Возвращаем относительный URL
      imageUrl = `/images/popup/${fileName}`;
      console.log('Image URL:', imageUrl);
    }

    return NextResponse.json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading popup image:', error);

    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки файла';

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
