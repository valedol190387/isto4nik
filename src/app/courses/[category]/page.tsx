'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { Star, ExternalLink, Loader2, FileText, Filter } from 'lucide-react';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import styles from './page.module.css';

// Mapping категорий к section_key в таблице materials
const CATEGORY_MAPPING: Record<string, { section_key: string; title: string }> = {
  'dialogs': {
    section_key: 'dialogs',
    title: 'ДИАЛОГИ'
  },
  'questions': {
    section_key: 'questions', 
    title: 'Решаем запросы'
  },
  'speeches': {
    section_key: 'speeches',
    title: 'Разговор у источника'
  },
  'opinion': {
    section_key: 'opinion',
    title: 'Мнение'
  },
  'mini-courses': {
    section_key: 'materials',
    title: 'Мини-курсы'
  }
};

export default function CourseCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // Получаем параметры асинхронно
  const resolvedParams = use(params);
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // Состояние для фильтров по тегам
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Ref для infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 40;

  // Router для навигации
  const router = useRouter();

  // Восстановление позиции скролла при возврате на страницу
  useScrollRestoration();

  // Получаем реального пользователя из Telegram
  const user = useSignal(initData.user);

  // Получаем конфигурацию текущей категории
  const categoryConfig = CATEGORY_MAPPING[resolvedParams.category];

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

  // Функция загрузки материалов с пагинацией
  const loadMaterials = useCallback(async (pageNum: number = 0, tag: string | null = null, append: boolean = false) => {
    if (!categoryConfig) return;
    
    try {
      const offset = pageNum * ITEMS_PER_PAGE;
      let url = `/api/materials?section=${categoryConfig.section_key}&limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      
      if (tag) {
        url += `&tag=${encodeURIComponent(tag)}`;
      }
      
      const materialsResponse = await fetch(url);
      const materialsData: Material[] = await materialsResponse.json();
      
      // Обновляем состояние материалов
      if (append && pageNum > 0) {
        setMaterials(prev => [...prev, ...materialsData]);
      } else {
        setMaterials(materialsData);
      }
      
      // Проверяем есть ли еще материалы
      if (materialsData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      setPage(pageNum);
      
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  }, [categoryConfig, ITEMS_PER_PAGE]);

  // Функция загрузки следующей порции материалов
  const loadMoreMaterials = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    await loadMaterials(nextPage, selectedTag, true);
    setLoadingMore(false);
  }, [hasMore, loadingMore, loading, page, selectedTag, loadMaterials]);

  // Загружаем избранные материалы
  const loadFavorites = useCallback(async () => {
    try {
      const telegramId = user?.id?.toString() || getTelegramId();
      const favoritesResponse = await fetch(`/api/favorites?telegramId=${telegramId}`);
      if (favoritesResponse.ok) {
        const favoritesData: Material[] = await favoritesResponse.json();
        setFavorites(new Set(favoritesData.map((f: any) => f.material_id || f.id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [user?.id]);

  // Загружаем теги для фильтров (серверный запрос для получения всех тегов раздела)
  const loadAllTags = useCallback(async () => {
    if (!categoryConfig) return;
    
    try {
      // Загружаем все материалы раздела только для получения тегов
      const response = await fetch(`/api/materials?section=${categoryConfig.section_key}`);
      const allMaterials: Material[] = await response.json();
      
      const tagsSet = new Set<string>();
      allMaterials.forEach(material => {
        material.tags?.forEach(tag => tagsSet.add(tag));
      });
      
      setAllTags(Array.from(tagsSet).sort());
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }, [categoryConfig]);

  // Первоначальная загрузка
  useEffect(() => {
    const initializeData = async () => {
      if (!categoryConfig) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setPage(0);
      setHasMore(true);
      
      // Загружаем данные параллельно
      await Promise.all([
        loadMaterials(0, selectedTag, false),
        loadFavorites(),
        loadAllTags()
      ]);
      
      setLoading(false);
    };

    initializeData();
  }, [resolvedParams.category, categoryConfig]);

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
    // Сохраняем текущую позицию скролла перед переходом
    const scrollKey = `scroll:${window.location.pathname}`;
    const scrollPosition = window.scrollY;

    console.log('[MaterialClick] Saving scroll:', scrollPosition, 'for key:', scrollKey);
    sessionStorage.setItem(scrollKey, String(scrollPosition));

    // Проверяем что сохранилось
    const saved = sessionStorage.getItem(scrollKey);
    console.log('[MaterialClick] Verified saved value:', saved);

    // Используем router.push вместо window.location для SPA навигации
    router.push(`/materials/${material.id}`);
  };

  // Обработка фильтрации по тегам (серверная)
  const handleTagFilter = useCallback(async (tag: string | null) => {
    setSelectedTag(tag);
    setLoading(true);
    setPage(0);
    setHasMore(true);
    
    await loadMaterials(0, tag, false);
    setLoading(false);
  }, [loadMaterials]);

  // Intersection Observer для infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreMaterials();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMoreMaterials]);

  // Показываем только 5 популярных тегов, остальные под кнопкой "все теги" 
  const maxVisibleTags = 5;
  const visibleTags = showAllTags ? allTags : allTags.slice(0, maxVisibleTags);
  const hasMoreTags = allTags.length > maxVisibleTags;

  // Если категория не найдена
  if (!categoryConfig) {
    return (
      <Page>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <FileText className={styles.errorIcon} size={48} />
            <h1 className={styles.errorTitle}>Категория не найдена</h1>
            <p className={styles.errorDescription}>
              Запрашиваемая категория "{resolvedParams.category}" не существует.
            </p>
          </div>
        </div>
      </Page>
    );
  }

  if (loading) {
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
            <FileText className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>{categoryConfig.title}</h1>
          </div>
        </div>

        {/* Фильтры по тегам */}
        {allTags.length > 0 && (
          <div className={styles.filtersCard}>
            <div className={styles.sectionHeader}>
              <Filter className={styles.sectionIcon} />
              <h3 className={styles.filtersTitle}>Фильтры</h3>
            </div>
            <div className={styles.filterButtons}>
              <button
                onClick={() => handleTagFilter(null)}
                className={`${styles.filterButton} ${!selectedTag ? styles.filterButtonActive : ''}`}
              >
                Все
              </button>
              {visibleTags.map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`${styles.filterButton} ${selectedTag === tag ? styles.filterButtonActive : ''}`}
                >
                  {tag}
                </button>
              ))}
              {hasMoreTags && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className={`${styles.filterButton} ${styles.showAllButton}`}
                >
                  {showAllTags ? 'Скрыть' : 'Все теги'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Список материалов */}
        {/* Счетчик материалов с учетом фильтрации */}
        {selectedTag && (
          <div className={styles.filterInfo}>
            <p>Найдено материалов: {materials.length}{hasMore ? '+' : ''}</p>
          </div>
        )}

        <div className={styles.materialsSection}>
                    {materials.length > 0 ? (
            materials.map((material) => (
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
            ))
          ) : loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingContent}>
                <Loader2 className={styles.loadingIcon} />
                <p>Загружаем материалы...</p>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FileText className={styles.emptyIcon} size={48} />
              <h3 className={styles.emptyTitle}>
                {selectedTag ? `Нет материалов с тегом "${selectedTag}"` : 'Материалы не найдены'}
              </h3>
              <p className={styles.emptyDescription}>
                {selectedTag 
                  ? 'Попробуйте выбрать другой тег или сбросить фильтр.'
                  : 'В этом разделе пока нет материалов'
                }
              </p>
            </div>
          )}
          
          {/* Invisible trigger element for infinite scroll */}
          {hasMore && materials.length > 0 && (
            <div 
              ref={loadMoreRef}
              className={styles.loadTrigger}
            >
              {loadingMore && (
                <div className={styles.loadingMore}>
                  <Loader2 className={styles.loadingIcon} />
                  <p>Загружаем еще материалы...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Отступ снизу */}
        <div className={styles.bottomSpacing}></div>
      </div>
    </Page>
  );
}
