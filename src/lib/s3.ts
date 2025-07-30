import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Конфигурация S3 клиента
const s3Client = new S3Client({
  region: 'ru1', // Регион для s3.ru1.storage.beget.cloud
  endpoint: 'https://s3.ru1.storage.beget.cloud',
  credentials: {
    accessKeyId: '4FLCG86G4V106X9VD8M2',
    secretAccessKey: 'MDpXAa6eGJ2qKe17XAFciZ7sLlJDQGRjrHWOFswu',
  },
  forcePathStyle: true, // Использовать path style URLs
});

const BUCKET_NAME = '57698b39f785-thoughtful-ansel';
const AVATARS_FOLDER = 'avatars';

// Разрешенные типы файлов для аватаров
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Функция для загрузки аватара
export async function uploadAvatar(file: File): Promise<string> {
  // Валидация типа файла
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Недопустимый тип файла. Разрешены только: JPEG, PNG, WebP');
  }

  // Валидация размера файла
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Файл слишком большой. Максимальный размер: 5MB');
  }

  // Генерируем уникальное имя файла
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatar-${Date.now()}-${uuidv4()}.${fileExtension}`;
  const key = `${AVATARS_FOLDER}/${fileName}`;

  try {
    // Конвертируем File в Buffer для загрузки
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Команда для загрузки файла
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Делаем файл публично доступным
    });

    // Загружаем файл
    await s3Client.send(command);

    // Возвращаем публичный URL файла
    const publicUrl = `https://s3.ru1.storage.beget.cloud/${BUCKET_NAME}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Ошибка загрузки файла. Попробуйте еще раз.');
  }
}

// Функция для удаления аватара
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    // Извлекаем ключ из URL
    const urlParts = avatarUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // Получаем "avatars/filename.jpg"

    // Команда для удаления файла
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // Удаляем файл
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    // Не бросаем ошибку, чтобы не блокировать удаление записи из БД
  }
}

// Функция для проверки валидности URL аватара
export function isValidAvatarUrl(url: string): boolean {
  return url.startsWith(`https://s3.ru1.storage.beget.cloud/${BUCKET_NAME}/${AVATARS_FOLDER}/`);
} 