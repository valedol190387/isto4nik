'use client';

import { useState, useEffect, useCallback } from 'react';
import { Page } from '@/components/Page';
import { Star, ExternalLink, Loader2, FileText } from 'lucide-react';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { getMessengerId } from '@/lib/platform';
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

  // Получаем ID пользователя из мессенджера (Telegram или Max)
  const getUserId = () => {
    return getMessengerId() || '123456789';
  };

  // Состояние для определения размера экрана
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Проверяем при загрузке
    checkScreenSize();
    
    // Слушаем изменения размера экрана
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Функция для правильного обрезания текста с многоточием в конце
  const truncateText = (text: string, isCompact: boolean = false) => {
    if (!text) return { text: '', needsReadMore: false, isHtml: false };
    
    const plainText = text.replace(/<[^>]*>/g, '');
    
    // Адаптивная длина текста в зависимости от типа карточки и размера экрана
    let maxLength;
    if (isCompact) {
      maxLength = isMobile ? 120 : 200; // Меньше текста на мобильных для компактных карточек
    } else {
      maxLength = isMobile ? 100 : 150; // Меньше текста на мобильных для обычных карточек
    }
    
    if (plainText.length <= maxLength) {
      // Если текст короткий, возвращаем с HTML форматированием
      return { text: text.replace(/\n/g, '<br />'), needsReadMore: false, isHtml: true };
    }
    
    // Если текст длинный, обрезаем и убираем HTML теги
    const truncated = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    const finalText = lastSpaceIndex > -1 ? truncated.substring(0, lastSpaceIndex) : truncated;
    
    return { text: finalText + '...', needsReadMore: true, isHtml: false };
  };

  // Функция загрузки избранных материалов с пагинацией
  const fetchFavorites = useCallback(async (pageNumber: number = 0, append: boolean = false) => {
    try {
      const telegramId = user?.id?.toString() || getUserId();
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
    const telegramId = user?.id?.toString() || getUserId();
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
                  className={material.pic_url ? styles.materialCard : styles.materialCardCompact}
                  onClick={() => handleMaterialClick(material)}
                >
                  {/* Изображение с кнопкой избранного - только для материалов с картинкой */}
                  {material.pic_url && (
                    <div className={styles.materialImageContainer}>
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
                      <div 
                        className={styles.materialImagePlaceholder}
                        style={{ display: 'none' }}
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
                  )}
                  
                  {/* Контент материала */}
                  <div className={styles.materialContent}>
                    <div className={styles.materialInfo}>
                      <div className={styles.materialMainContent}>
                        <div className={styles.materialHeader}>
                          <h3 className={styles.materialTitle}>{material.title}</h3>
                          {/* Кнопка избранного для компактных карточек */}
                          {!material.pic_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(material.id);
                              }}
                              className={styles.favoriteButtonInline}
                            >
                                                          <Star 
                              className={`${styles.starIcon} ${favorites.has(material.id) ? styles.favoriteActive : ''}`}
                              fill={favorites.has(material.id) ? 'currentColor' : 'none'}
                              stroke={favorites.has(material.id) ? '#ffffff' : '#ffffff'}
                            />
                            </button>
                          )}
                        </div>
                        <div className={styles.materialDescription}>
                          {(() => {
                            const result = truncateText(material.description || '', !material.pic_url);
                            return (
                              <>
                                {result.isHtml ? (
                                  <span dangerouslySetInnerHTML={{ __html: result.text }} />
                                ) : (
                                  <span>{result.text}</span>
                                )}
                                {result.needsReadMore && (
                                  <button
                                    className={styles.readMoreButtonInline}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMaterialClick(material);
                                    }}
                                  >
                                    далее
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div className={styles.materialFooter}>
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
                    </div>
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