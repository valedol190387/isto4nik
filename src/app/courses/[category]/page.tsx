'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Page } from '@/components/Page';
import { Star, ExternalLink, Loader2, FileText } from 'lucide-react';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
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
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

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

  // Функция для правильного обрезания текста с многоточием в конце
  const truncateText = (text: string, isCompact: boolean = false) => {
    if (!text) return { text: '', needsReadMore: false, isHtml: false };
    
    const plainText = text.replace(/<[^>]*>/g, '');
    const maxLength = isCompact ? 200 : 150; // Больше символов для компактных карточек
    
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

  // Загрузка материалов из API и избранных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const telegramId = user?.id?.toString() || getTelegramId();
        
        // Загружаем материалы
        const materialsResponse = await fetch('/api/materials');
        const materialsData: Material[] = await materialsResponse.json();
        
        // Фильтруем материалы по section_key текущей категории
        const categoryMaterials = materialsData.filter(material => 
          material.section_key === categoryConfig?.section_key
        );
        setMaterials(categoryMaterials);
        
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

    if (categoryConfig) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [resolvedParams.category, categoryConfig, user?.id]);

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

        {/* Список материалов */}
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
                              stroke={favorites.has(material.id) ? '#082445' : '#082445'}
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
          ) : (
            <div className={styles.emptyState}>
              <FileText className={styles.emptyIcon} size={48} />
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
