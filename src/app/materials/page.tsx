'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Heart, Play, ExternalLink, Dumbbell, BookOpen, Sparkles, UtensilsCrossed, Video, Loader2 } from 'lucide-react';
import { Material } from '@/types/database';
import styles from './page.module.css';

// Интерфейс для разделов (локальные данные)
interface Section {
  id: string;
  name: string;
  description: string;
  icon: any;
  image: string;
}

// Данные разделов (статичные)
const sections: Section[] = [
  { 
    id: 'workouts', 
    name: 'Тренировки', 
    description: 'Видеотренировки и практики для красоты и здоровья',
    icon: Dumbbell,
    image: '/images/materials/trening.png'
  },
  { 
    id: 'guides', 
    name: 'Методички', 
    description: 'Подробные руководства и инструкции по уходу за собой',
    icon: BookOpen,
    image: '/images/materials/book.png'
  },
  { 
    id: 'motivation', 
    name: 'Мотивация', 
    description: 'Вдохновляющие материалы для поддержания мотивации',
    icon: Sparkles,
    image: '/images/materials/motivation.png'
  },
  { 
    id: 'nutrition', 
    name: 'Питание', 
    description: 'Рецепты и советы по питанию для красоты изнутри',
    icon: UtensilsCrossed,
    image: '/images/materials/food.png'
  },
  { 
    id: 'livestreams', 
    name: 'Прямые эфиры', 
    description: 'Записи прямых эфиров и вебинаров',
    icon: Video,
    image: '/images/materials/live.png'
  }
];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('workouts');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentDot, setCurrentDot] = useState(0);

  // Получаем Telegram ID пользователя
  const getTelegramId = () => {
    // В реальном приложении здесь будет Telegram WebApp API
    // window.Telegram.WebApp.initDataUnsafe.user.id
    // Пока используем тестовый ID
    return 123456789;
  };

  // 3 точки для навигации как на главной
  const dotsCount = 3;
  
  const scrollToPosition = (dotIndex: number) => {
    setCurrentDot(dotIndex);
    const container = document.getElementById('highlights-container');
    if (container) {
      const scrollPercentage = dotIndex / (dotsCount - 1);
      const maxScroll = container.scrollWidth - container.clientWidth;
      const scrollAmount = maxScroll * scrollPercentage;
      container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    const currentIndex = Math.round(scrollPercentage * (dotsCount - 1));
    setCurrentDot(currentIndex);
  };

  // Загрузка материалов из API и избранных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const telegramId = getTelegramId();
        
        // Загружаем материалы
        const materialsResponse = await fetch('/api/materials');
        const materialsData: Material[] = await materialsResponse.json();
        setMaterials(materialsData);
        
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
  }, []);

  const currentSection = sections.find(section => section.id === activeSection);
  
  // Получаем материалы текущего раздела
  const sectionMaterials = materials.filter(material => material.section_key === activeSection);
  
  // Собираем все теги из материалов текущего раздела
  const allTags = Array.from(new Set(sectionMaterials.flatMap(material => material.tags)));

  // Фильтруем материалы по выбранному тегу
  const filteredMaterials = selectedTag 
    ? sectionMaterials.filter(material => material.tags.includes(selectedTag))
    : sectionMaterials;

  const toggleFavorite = async (materialId: number) => {
    const telegramId = getTelegramId();
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

  const handleMaterialClick = (url: string) => {
    window.open(url, '_blank');
  };

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
            <h1 className={styles.headerTitle}>МАТЕРИАЛЫ</h1>
          </div>
        </div>

        {/* Хайлайты разделов */}
        <div className={styles.highlightsSection}>
          <div 
            id="highlights-container"
            className={styles.highlightsContainer}
            onScroll={handleScroll}
          >
            {sections.map((section) => {
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSelectedTag(null);
                  }}
                  className={styles.highlightCard}
                >
                  <div className={styles.highlightContent}>
                    <Image
                      src={section.image}
                      alt={section.name}
                      fill
                      className={styles.highlightImage}
                      sizes="120px"
                    />
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Точечная навигация */}
          <div className={styles.highlightsDots}>
            {Array.from({ length: dotsCount }, (_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentDot ? styles.activeDot : ''}`}
                onClick={() => scrollToPosition(index)}
              />
            ))}
          </div>
        </div>

        {/* Фильтр по тегам */}
        {allTags.length > 0 && (
          <div className={styles.tagsFilter}>
            <h3 className={styles.tagsTitle}>Фильтр по тегам:</h3>
            <div className={styles.tagsContainer}>
              <button
                onClick={() => setSelectedTag(null)}
                className={`${styles.tagButton} ${selectedTag === null ? styles.tagButtonActive : ''}`}
              >
                Все
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`${styles.tagButton} ${selectedTag === tag ? styles.tagButtonActive : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Список материалов */}
        <div className={styles.materialsSection}>
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <div key={material.id} className={styles.materialCard}>
                <div className={styles.materialContent} onClick={() => handleMaterialClick(material.url)}>
                  <div className={styles.materialIcon}>
                    <Play className={styles.playIcon} />
                  </div>
                  <div className={styles.materialInfo}>
                    <h3 className={styles.materialTitle}>{material.title}</h3>
                    <p className={styles.materialDescription}>{material.description}</p>
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
              <FileText className={styles.emptyIcon} size={48} />
              <h3 className={styles.emptyTitle}>Материалы не найдены</h3>
              <p className={styles.emptyDescription}>
                {selectedTag 
                  ? `Нет материалов с тегом "${selectedTag}"` 
                  : 'В этом разделе пока нет материалов'
                }
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