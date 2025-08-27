'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import { Heart, Play, ExternalLink, Loader2, BookOpen } from 'lucide-react';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import styles from './page.module.css';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Получаем реального пользователя из Telegram
  const user = useSignal(initData.user);
  
  // Получаем доступы к курсам из БД
  const { access: courseAccess, loading: accessLoading } = useCourseAccess();

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

  // Функция для проверки, нужна ли кнопка "далее"
  const needsReadMore = (description: string) => {
    if (!description) return false;
    const lines = description.split('\n');
    let totalLines = 0;
    lines.forEach(line => {
      const charsPerLine = 55;
      const linesForThisText = Math.ceil(line.length / charsPerLine) || 1;
      totalLines += linesForThisText;
    });
    return totalLines > 3;
  };

  // Загрузка материалов из API и избранных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const telegramId = user?.id?.toString() || getTelegramId();
        
        // Загружаем материалы
        const materialsResponse = await fetch('/api/materials');
        const materialsData: Material[] = await materialsResponse.json();
        
        // Фильтруем материалы по section_key 'materials'
        const sectionMaterials = materialsData.filter(material => 
          material.section_key === 'materials'
        );
        setMaterials(sectionMaterials);
        
        // Загружаем избранные
        const favoritesResponse = await fetch(`/api/favorites?telegramId=${telegramId}`);
        const favoritesData: Material[] = await favoritesResponse.json();
        const favoriteIds = new Set(favoritesData.map(material => material.id));
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const toggleFavorite = async (materialId: number) => {
    const telegramId = user?.id?.toString() || getTelegramId();
    const isFavorite = favorites.has(materialId);

    try {
      if (isFavorite) {
        // Удаляем из избранного
        await fetch(`/api/favorites?telegramId=${telegramId}&materialId=${materialId}`, {
          method: 'DELETE',
        });
        
        // Обновляем локальное состояние
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(materialId);
          return newFavorites;
        });
      } else {
        // Добавляем в избранное
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId,
            materialId,
          }),
        });
        
        // Обновляем локальное состояние
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(materialId);
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleMaterialClick = (material: Material) => {
    // Всегда переходим на страницу детального просмотра материала
    window.location.href = `/materials/${material.id}`;
  };

  if (loading || accessLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p>Загружаем материалы...</p>
        </div>
      </div>
    );
  }

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок страницы */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <BookOpen className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>Мини-курсы</h1>
          </div>
        </div>

        {/* Список материалов */}
        <div className={styles.materialsSection}>
          {materials.length > 0 ? (
            materials.map((material) => (
              <div 
                key={material.id} 
                className={styles.materialCard}
                onClick={() => handleMaterialClick(material)}
              >
                <div className={styles.materialContent}>
                  <div className={styles.materialIcon}>
                    <Play className={styles.playIcon} />
                  </div>
                  <div className={styles.materialInfo}>
                    <h3 className={styles.materialTitle}>{material.title}</h3>
                    <div 
                      className={styles.materialDescription}
                      dangerouslySetInnerHTML={{ __html: material.description?.replace(/\n/g, '<br />') || '' }}
                    />
                    {material.description && needsReadMore(material.description) && (
                      <button 
                        className={styles.readMoreButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMaterialClick(material);
                        }}
                      >
                        далее
                      </button>
                    )}
                    {material.tags.length > 0 && (
                      <div className={styles.materialTags}>
                        {material.tags.map((tag, index) => (
                          <span key={index} className={styles.materialTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ExternalLink className={styles.linkIcon} size={16} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(material.id);
                  }}
                  className={styles.favoriteButton}
                >
                  <Heart 
                    className={`${styles.heartIcon} ${favorites.has(material.id) ? styles.favoriteActive : ''}`}
                    fill={favorites.has(material.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <BookOpen className={styles.emptyIcon} size={48} />
              <h3 className={styles.emptyTitle}>Материалы не найдены</h3>
              <p className={styles.emptyDescription}>
                В этом разделе пока нет материалов
              </p>
            </div>
          )}
        </div>

        {/* Отступ снизу */}
        <div className={styles.bottomSpacing}></div>
      </div>
    </Page>
  );
} 