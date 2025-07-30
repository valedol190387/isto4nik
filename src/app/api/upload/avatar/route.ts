import { NextRequest, NextResponse } from 'next/server';
import { uploadAvatar } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    // Получаем форм-данные
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Загружаем файл в S3
    const avatarUrl = await uploadAvatar(file);

    return NextResponse.json({
      success: true,
      avatarUrl
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки файла';
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 