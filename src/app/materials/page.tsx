'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Page } from '@/components/Page';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Heart, Play, ExternalLink, Dumbbell, BookOpen, Sparkles, UtensilsCrossed, Video, Loader2, Sun, Droplets, HelpCircle, Lock, X } from 'lucide-react';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { hasAccessToSection } from '@/utils/courseAccessMapping';
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
    id: 'course_flat_belly', 
    name: 'Курс: Плоский живот', 
    description: 'Комплексная программа для создания идеального живота',
    icon: Dumbbell,
    image: '/images/materials/slim.png'
  },
  { 
    id: 'course_anti_swelling', 
    name: 'Курс: Отёки', 
    description: 'Эффективные методы борьбы с отёками и улучшения самочувствия',
    icon: Droplets,
    image: '/images/materials/oteki.png'
  },
  { 
    id: 'course_bloom', 
    name: 'Курс: Расцветай', 
    description: 'Программа для раскрытия внутренней красоты и уверенности',
    icon: Sun,
    image: '/images/materials/sun.png'
  },
  { 
    id: 'useful', 
    name: 'Рельеф и гибкость', 
    description: 'Упражнения для создания красивого рельефа и развития гибкости',
    icon: HelpCircle,
    image: '/images/materials/relef.png'
  },
  { 
    id: 'workouts', 
    name: 'Для лица', 
    description: 'Специальные упражнения и практики для красоты лица',
    icon: Dumbbell,
    image: '/images/materials/face.png'
  },
  { 
    id: 'guides', 
    name: 'Стопы', 
    description: 'Комплексы упражнений для здоровья и красоты стоп',
    icon: BookOpen,
    image: '/images/materials/foot.png'
  },
  { 
    id: 'motivation', 
    name: 'BodyFlow', 
    description: 'Плавные движения и мобильность для гармонии тела',
    icon: Sparkles,
    image: '/images/materials/mobility.png'
  },
  { 
    id: 'nutrition', 
    name: 'Осанка', 
    description: 'Упражнения и рекомендации для правильной осанки',
    icon: UtensilsCrossed,
    image: '/images/materials/osanka.png'
  }
];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('course_flat_belly');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentDot, setCurrentDot] = useState(0);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [lockedSectionName, setLockedSectionName] = useState<string>('');
  const [requestingAccess, setRequestingAccess] = useState(false);

  // Получаем реального пользователя из Telegram
  const user = useSignal(initData.user);
  
  // Получаем доступы к курсам из БД
  const { access: courseAccess, loading: accessLoading } = useCourseAccess();
  
  // Читаем URL параметры
  const searchParams = useSearchParams();

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
        const telegramId = user?.id?.toString() || getTelegramId();
        
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

  // Инициализация раздела из URL при загрузке
  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');
    if (sectionFromUrl && sectionFromUrl !== 'course_bloom') {
      // Проверяем что раздел существует
      const validSection = sections.find(section => section.id === sectionFromUrl);
      if (validSection) {
        setActiveSection(sectionFromUrl);
      }
    }
  }, [searchParams]);

  // Если выбран заблокированный раздел, переключаем на первый доступный
  const hasAccessToActiveSection = courseAccess ? hasAccessToSection(courseAccess, activeSection) : false;
  const actualActiveSection = hasAccessToActiveSection ? activeSection : 'course_flat_belly';
  
  const currentSection = sections.find(section => section.id === actualActiveSection);
  
  // Получаем материалы текущего раздела
  const sectionMaterials = materials.filter(material => material.section_key === actualActiveSection);
  
  // Собираем все теги из материалов текущего раздела
  const allTags = Array.from(new Set(sectionMaterials.flatMap(material => material.tags)));

  // Фильтруем материалы по выбранному тегу
  const filteredMaterials = selectedTag 
    ? sectionMaterials.filter(material => material.tags.includes(selectedTag))
    : sectionMaterials;

  // Функция для запроса доступа к курсу через webhook
  const requestCourseAccess = async () => {
    try {
      setRequestingAccess(true);
      
      const telegramId = getTelegramId();
      
      // Отправляем только telegram_id на webhook
      const webhookData = {
        telegram_id: parseInt(telegramId)
      };
      
      const webhookResponse = await fetch('https://n8n.ayunabackoffice.ru/webhook/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
      
      if (webhookResponse.ok) {
        alert('Запрос на доступ отправлен! В боте вы увидите дальнейшие инструкции.');
        setShowComingSoonModal(false);
      } else {
        alert('Произошла ошибка при отправке запроса. Попробуйте позже.');
      }
      
    } catch (error) {
      console.error('Error requesting course access:', error);
      alert('Произошла ошибка при отправке запроса. Попробуйте позже.');
    } finally {
      setRequestingAccess(false);
    }
  };

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
    if (material.is_embedded_video) {
      // Для встроенного видео - переход на страницу просмотра
      window.location.href = `/materials/${material.id}`;
    } else {
      // Для внешних ссылок - открытие в новом окне
      window.open(material.url, '_blank');
    }
  };

  if (loading || accessLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p>Загружаем курсы...</p>
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
            <h1 className={styles.headerTitle}>КУРСЫ</h1>
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
              const sectionHasAccess = courseAccess ? hasAccessToSection(courseAccess, section.id) : false;
              const isLocked = !sectionHasAccess;
              
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    if (isLocked) {
                      setLockedSectionName(section.name);
                      setShowComingSoonModal(true);
                    } else {
                      setActiveSection(section.id);
                      setSelectedTag(null);
                    }
                  }}
                  className={`${styles.highlightCard} ${isLocked ? styles.lockedSection : ''}`}
                >
                  <div className={styles.highlightContent}>
                    <Image
                      src={section.image}
                      alt={section.name}
                      fill
                      className={styles.highlightImage}
                      sizes="120px"
                    />
                    {isLocked && (
                      <div className={styles.lockOverlay}>
                        <div className={styles.lockIcon}>
                          <Lock size={32} />
                        </div>
                      </div>
                    )}
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
                <div className={styles.materialContent} onClick={() => handleMaterialClick(material)}>
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

      {/* Модальное окно доступа к курсу */}
      {showComingSoonModal && (
        <div className={styles.modalOverlay} onClick={() => setShowComingSoonModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowComingSoonModal(false)}
            >
              <X size={24} />
            </button>
            
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <Lock size={32} />
              </div>
              <h2 className={styles.modalTitle}>Курс пока недоступен</h2>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Открытие этого курса возможно только через нашего Telegram-бота.
                Там вы узнаете условия доступа и сможете разблокировать материалы всего за пару кликов
              </p>
              
              <button
                className={styles.subscribeButton}
                onClick={requestCourseAccess}
                disabled={requestingAccess}
              >
                {requestingAccess ? 'Отправляем...' : 'ПОЛУЧИТЬ ДОСТУП'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
} 