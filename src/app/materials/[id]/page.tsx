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
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

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

  // Детекция мобильного устройства
  useEffect(() => {
    const detectMobileDevice = () => {
      const hasTouchScreen = 'ontouchstart' in window;
      const isSmallScreen = window.innerWidth < 1024;
      const isMobile = hasTouchScreen || isSmallScreen;
      
      
      setIsMobileDevice(isMobile);
    };

    // Проверяем при загрузке
    detectMobileDevice();
    
    // Слушаем изменения размера экрана
    window.addEventListener('resize', detectMobileDevice);
    return () => window.removeEventListener('resize', detectMobileDevice);
  }, []);

  // Автоматическое скрытие подсказки через 5 секунд
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

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

  // Обработка клика на кнопку перехода к материалу
  const handleMaterialClick = (url: string) => {
    // Открываем ссылку
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Показываем подсказку только на мобильных устройствах для телеграм ссылок
    if (url.includes('t.me') && isMobileDevice) {
      setTimeout(() => {
        setShowSwipeHint(true);
      }, 1000);
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

          {/* Встроенные видео */}
          {material.videos && material.videos.length > 0 && (
            <div className={styles.videoSection}>
              {material.videos.map((video, index) => (
                <div key={index} className={styles.videoItem}>
                  {video.title && material.videos.length > 1 && (
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                  )}
                  <div
                    className={styles.videoContainer}
                    dangerouslySetInnerHTML={{ __html: video.embed_code }}
                  />
                </div>
              ))}
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
              <button 
                onClick={() => handleMaterialClick(material.url)}
                className={styles.primaryButton}
              >
                <ExternalLink size={20} />
                <span>Перейти к материалу</span>
              </button>
            </div>
          )}
        </main>
      </div>
      
      {/* Анимация подсказки свайпа для телеграм ссылок - только на мобильных */}
      {showSwipeHint && isMobileDevice && (
        <>
          <style>{`
            @keyframes customBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
          <div 
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 120px)',
              left: '16px',
              right: '16px',
              backgroundColor: 'rgba(8, 36, 69, 0.95)',
              padding: '20px 16px',
              borderRadius: '16px',
              zIndex: 9999,
              boxShadow: '0 4px 20px rgba(8,36,69,0.4)',
              animation: 'customBounce 2s ease-in-out infinite'
            }}
          >
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <span 
                style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  letterSpacing: '0.5px'
                }}
              >
                НЕ ОТКРЫЛОСЬ?<br/>СВЕРНИ ПРИЛОЖЕНИЕ НАЖАВ НА
              </span>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.4))'
                }}
              >
                <path 
                  d="M6 9L12 15L18 9" 
                  stroke="white" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span 
                style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  letterSpacing: '0.5px'
                }}
              >
                Или потяни вниз за это сообщение
              </span>
            </div>
          </div>
        </>
      )}
      
    </Page>
  );
} 