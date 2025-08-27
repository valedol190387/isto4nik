'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar, Tag, Loader2, Star } from 'lucide-react';
import { Page } from '@/components/Page';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import styles from './page.module.css';

export default function MaterialViewPage() {
  const params = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const materialId = params.id as string;
  
  // Получаем реального пользователя из Telegram
  const user = useSignal(initData.user);

  // Получаем Telegram ID пользователя
  const getTelegramId = () => {
    // Пробуем получить из Telegram WebApp API
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id.toString();
      }
    }
    
    // Fallback - только для разработки
    return '123456789';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const telegramId = user?.id?.toString() || getTelegramId();
        
        // Загружаем материал
        const response = await fetch(`/api/materials/${materialId}`);
        if (!response.ok) {
          throw new Error('Материал не найден');
        }
        
        const materialData: Material = await response.json();
        setMaterial(materialData);

        // Загружаем статус избранного
        const favoritesResponse = await fetch(`/api/favorites?telegramId=${telegramId}`);
        const favoritesData: Material[] = await favoritesResponse.json();
        const isInFavorites = favoritesData.some(fav => fav.id === parseInt(materialId));
        setIsFavorite(isInFavorites);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Не удалось загрузить материал');
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchData();
    }
  }, [materialId, user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleFavorite = async () => {
    const telegramId = user?.id?.toString() || getTelegramId();

    try {
      if (isFavorite) {
        // Удаляем из избранного
        await fetch(`/api/favorites?telegramId=${telegramId}&materialId=${materialId}`, {
          method: 'DELETE',
        });
        setIsFavorite(false);
      } else {
        // Добавляем в избранное
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId,
            materialId: parseInt(materialId),
          }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p>Загружаем материал...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <Page>
        <div className={styles.error}>
          <div className={styles.errorContent}>
            <h2>Ошибка</h2>
            <p>{error || 'Материал не найден'}</p>
            <button onClick={() => router.back()} className={styles.backButton}>
              <ArrowLeft size={16} />
              Вернуться назад
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className={styles.container}>
        {/* Основной контент */}
        <main className={styles.main}>
          {/* Изображение материала */}
          {material.pic_url && (
            <div className={styles.imageSection}>
              <div className={styles.materialImageContainer}>
                <img 
                  src={material.pic_url} 
                  alt={material.title}
                  className={styles.materialImage}
                />
                <button
                  onClick={toggleFavorite}
                  className={styles.favoriteButtonOverlay}
                >
                  <Star 
                    className={`${styles.starIcon} ${isFavorite ? styles.favoriteActive : ''}`}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="#ffffff"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Заголовок материала */}
          <div className={styles.titleSection}>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>{material.title}</h1>
              {/* Кнопка избранного для материалов без изображения */}
              {!material.pic_url && (
                <button
                  onClick={toggleFavorite}
                  className={styles.favoriteButtonTitle}
                >
                  <Star 
                    className={`${styles.starIcon} ${isFavorite ? styles.favoriteActive : ''}`}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="#082445"
                  />
                </button>
              )}
            </div>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <Calendar size={14} />
                <span>Добавлено {formatDate(material.created_at)}</span>
              </div>
              {material.tags && material.tags.length > 0 && (
                <div className={styles.metaItem}>
                  <Tag size={14} />
                  <span>{material.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Встроенное видео */}
          {material.video_embed_code && (
            <div className={styles.videoSection}>
              <div 
                className={styles.videoContainer}
                dangerouslySetInnerHTML={{ __html: material.video_embed_code }}
              />
            </div>
          )}

          {/* Описание */}
          {material.description && (
            <div className={styles.descriptionSection}>
              <div 
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: material.description.replace(/\n/g, '<br />') }}
              />
            </div>
          )}

          {/* Кнопка перехода к материалу */}
          {material.url && (
            <div className={styles.actionSection}>
              <a 
                href={material.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.primaryButton}
              >
                <ExternalLink size={20} />
                <span>Перейти к материалу</span>
              </a>
            </div>
          )}
        </main>
      </div>
    </Page>
  );
} 