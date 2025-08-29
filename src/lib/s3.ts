import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Проверяем наличие обязательных переменных окружения
const hasS3Config = process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME;

if (!hasS3Config) {
  console.warn('S3 configuration missing');
}

// Конфигурация S3 клиента - только если есть переменные
const s3Client = hasS3Config ? new S3Client({
  region: process.env.S3_REGION || 'ru1',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Использовать path style URLs
}) : null;

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const AVATARS_FOLDER = 'avatars';
const PROMOPIC_FOLDER = 'promopic';

// Разрешенные типы файлов для аватаров
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Функция для загрузки аватара
export async function uploadAvatar(file: File): Promise<string> {
  if (!s3Client) {
    throw new Error('S3 не настроен');
  }

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
    const publicUrl = `${process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud'}/${BUCKET_NAME}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Ошибка загрузки файла. Попробуйте еще раз.');
  }
}

// Функция для удаления аватара
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  if (!s3Client) return;
  
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

// Функция для загрузки промо-картинки материала
export async function uploadPromoImage(file: File): Promise<string> {
  if (!s3Client) {
    throw new Error('S3 не настроен');
  }

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
  const fileName = `promo-${Date.now()}-${uuidv4()}.${fileExtension}`;
  const key = `${PROMOPIC_FOLDER}/${fileName}`;

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
    const publicUrl = `${process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud'}/${BUCKET_NAME}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading promo image to S3:', error);
    throw new Error('Ошибка загрузки изображения. Попробуйте еще раз.');
  }
}

// Функция для удаления промо-картинки
export async function deletePromoImage(imageUrl: string): Promise<void> {
  if (!s3Client) return;
  
  try {
    // Извлекаем ключ из URL
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // Получаем "promopic/filename.jpg"

    // Команда для удаления файла
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // Удаляем файл
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting promo image from S3:', error);
    // Не бросаем ошибку, чтобы не блокировать удаление записи из БД
  }
}

// Функция для проверки валидности URL промо-картинки
export function isValidPromoImageUrl(url: string): boolean {
  return url.startsWith(`${process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud'}/${BUCKET_NAME}/${PROMOPIC_FOLDER}/`);
}

// Функция для проверки валидности URL аватара
export function isValidAvatarUrl(url: string): boolean {
  return url.startsWith(`${process.env.S3_ENDPOINT || 'https://s3.ru1.storage.beget.cloud'}/${BUCKET_NAME}/${AVATARS_FOLDER}/`) ||
         url.startsWith(`https://s3.ru1.storage.beget.cloud/57698b39f785-thoughtful-ansel/avatars/`); // Совместимость со старыми URL
} 