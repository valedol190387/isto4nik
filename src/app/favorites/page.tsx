'use client';

import { useState, useEffect, useCallback } from 'react';
import { Page } from '@/components/Page';
import { Star, ExternalLink, Loader2, FileText } from 'lucide-react';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import styles from './page.module.css';

export default function FavoritesPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

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

  // Функция загрузки избранных материалов с пагинацией
  const fetchFavorites = useCallback(async (pageNumber: number = 0, append: boolean = false) => {
    try {
      const telegramId = user?.id?.toString() || getTelegramId();
      const response = await fetch(`/api/favorites?telegramId=${telegramId}&page=${pageNumber}&limit=${ITEMS_PER_PAGE}`);
      const data: Material[] = await response.json();
      
      if (append) {
        setMaterials(prev => [...prev, ...data]);
      } else {
        setMaterials(data);
      }
      
      // Проверяем, есть ли еще данные
      setHasMore(data.length === ITEMS_PER_PAGE);
      
      // Устанавливаем все материалы как избранные
      const favoriteIds = new Set(data.map(material => material.id));
      if (append) {
        setFavorites(prev => new Set([...prev, ...favoriteIds]));
      } else {
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      if (pageNumber === 0) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [user?.id, ITEMS_PER_PAGE]);

  // Загрузка дополнительных материалов
  const loadMoreMaterials = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchFavorites(nextPage, true);
  }, [page, loadingMore, hasMore, fetchFavorites]);

  // Обработчик скролла для infinite scroll
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loadingMore || !hasMore) {
      return;
    }
    loadMoreMaterials();
  }, [loadMoreMaterials, loadingMore, hasMore]);

  // Загрузка первых материалов
  useEffect(() => {
    fetchFavorites(0, false);
  }, [fetchFavorites]);

  // Добавление обработчика скролла
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const toggleFavorite = async (materialId: number) => {
    const telegramId = user?.id?.toString() || getTelegramId();
    const isFavorite = favorites.has(materialId);

    try {
      if (isFavorite) {
        // Удаляем из избранного
        await fetch(`/api/favorites?telegramId=${telegramId}&materialId=${materialId}`, {
          method: 'DELETE',
        });
        
        // Удаляем из локального состояния
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(materialId);
          return newFavorites;
        });
        
        // Удаляем из списка материалов
        setMaterials(prev => prev.filter(material => material.id !== materialId));
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleMaterialClick = (material: Material) => {
    // Всегда переходим на страницу детального просмотра материала
    window.location.href = `/materials/${material.id}`;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p>Загружаем избранное...</p>
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
            <Star className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>ИЗБРАННОЕ</h1>
          </div>
        </div>

        {/* Список избранных материалов */}
        <div className={styles.materialsSection}>
          {materials.length > 0 ? (
            <>
              {materials.map((material) => (
                <div 
                  key={material.id} 
                  className={styles.materialCard}
                  onClick={() => handleMaterialClick(material)}
                >
                  {/* Изображение с кнопкой избранного */}
                  <div className={styles.materialImageContainer}>
                    {material.pic_url ? (
                      <img 
                        src={material.pic_url} 
                        alt={material.title}
                        className={styles.materialImage}
                        onError={(e) => {
                          // Если изображение не загрузилось, показываем placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector('.' + styles.materialImagePlaceholder) as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={styles.materialImagePlaceholder}
                      style={{ display: material.pic_url ? 'none' : 'flex' }}
                    >
                      <FileText className={styles.placeholderIcon} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(material.id);
                      }}
                      className={styles.favoriteButtonOverlay}
                    >
                      <Star 
                        className={`${styles.starIcon} ${favorites.has(material.id) ? styles.favoriteActive : ''}`}
                        fill={favorites.has(material.id) ? 'currentColor' : 'none'}
                        stroke={favorites.has(material.id) ? '#ffffff' : '#ffffff'}
                      />
                    </button>
                  </div>
                  
                  {/* Контент материала */}
                  <div className={styles.materialContent}>
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
                </div>
              ))}
              
              {/* Индикатор загрузки дополнительных материалов */}
              {loadingMore && (
                <div className={styles.loadingMore}>
                  <Loader2 className={styles.loadingMoreIcon} />
                  <p>Загружаем еще...</p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <Star className={styles.emptyIcon} size={48} />
              <h3 className={styles.emptyTitle}>Пока нет избранных материалов</h3>
              <p className={styles.emptyDescription}>
                Отмечайте понравившиеся материалы звёздочкой, и они появятся здесь
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