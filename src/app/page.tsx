'use client';

import { Page } from '@/components/Page';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Home as HomeIcon,
  Calendar,
  User,
  Star,
  MessageSquare,
  FileText,
  Lock,
  LockOpen,
  X
} from 'lucide-react';
import { SearchModal } from '@/components/SearchModal';
import { searchService } from '@/services/searchService';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { User as DbUser } from '@/types/database';
import styles from './page.module.css';

// Данные для хайлайтов с изображениями
const highlights = [
  { id: 1, image: '/images/starthere.webp', route: '/start-here' },
  { id: 2, image: '/images/about.webp', route: '/about' },
  { id: 3, image: '/images/review.webp', route: '/reviews' },
  { id: 4, image: '/images/faq.webp', route: '/faq' },
];

// Данные курсов с изображениями
const courses = [
  { 
    id: 'intro-training', 
    image: '/images/ploskii.webp',
    type: 'full-width',
    route: '/courses/intro-training'
  },
  { 
    id: 'flat-belly', 
    image: '/images/jivot.webp',
    type: 'square',
    route: '/courses/flat-belly'
  },
  { 
    id: 'anti-swelling', 
    image: '/images/oteki.webp',
    type: 'square',
    route: '/courses/anti-swelling'
  },
  { 
    id: 'author', 
    image: '/images/autor.webp',
    type: 'tall',
    route: '/author'
  },
];

export default function Home() {
  const [currentDot, setCurrentDot] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Получаем пользователя из Telegram
  const user = useSignal(initData.user);
  
  // 3 точки для навигации
  const dotsCount = 3;

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

  // Функция для загрузки данных пользователя из базы данных
  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      const telegramId = user?.id?.toString() || getTelegramId();
      
      const response = await fetch(`/api/users?telegramId=${telegramId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Пользователь не найден в базе
          setUserData(null);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const data: DbUser = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
      setUserData(null);
    } finally {
      setLoadingUserData(false);
    }
  };

  // Проверяем статус подписки
  const isSubscriptionActive = userData?.status === 'Активна';

  // Обработчик клика по кнопке чата
  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubscriptionActive) {
      try {
        const telegramId = user?.id?.toString() || getTelegramId();
        const response = await fetch(`/api/secure-links?telegram_id=${telegramId}&type=chat`);
        
        if (response.ok) {
          const data = await response.json();
          window.open(data.link, '_blank');
        } else {
          // Если API вернул ошибку, показываем модальное окно
          setShowSubscriptionModal(true);
        }
      } catch (error) {
        console.error('Error getting secure link:', error);
        setShowSubscriptionModal(true);
      }
    } else {
      setShowSubscriptionModal(true);
    }
  };

  // Инициализация поискового индекса в фоне
  useEffect(() => {
    // Запускаем индексацию в фоне для быстрого поиска
    searchService.buildIndex().catch(console.error);
    
    // Проверяем параметры URL на ошибки безопасности
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'no_subscription') {
      setShowSubscriptionModal(true);
    }
  }, []);

  // Вызываем загрузку данных пользователя при монтировании
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);
  
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

  return (
    <Page back={false}>
      <div className={styles.container}>
        {/* Хайлайты */}
        <div className={styles.highlightsSection}>
          <div 
            id="highlights-container"
            className={styles.highlightsContainer}
            onScroll={handleScroll}
          >
            {highlights.map((highlight) => {
              return (
                <Link key={highlight.id} href={highlight.route} className={styles.highlightCard}>
                  <div className={styles.highlightContent}>
                    <Image
                      src={highlight.image}
                      alt=""
                      fill
                      className={styles.highlightImage}
                      sizes="120px"
                    />
                  </div>
                </Link>
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

        {/* Поисковая строка */}
        <div className={styles.searchContainer}>
          <button 
            className={styles.searchBox}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className={styles.searchIcon} size={20} />
            <span className={styles.searchPlaceholder}>Поиск...</span>
          </button>
        </div>

        {/* Курсы */}
        <div className={styles.coursesSection}>
          {/* Вводная тренировка - полная ширина */}
          {courses.filter(course => course.type === 'full-width').map((course) => {
            return (
              <Link key={course.id} href={course.route} className={styles.courseCardFullWidth}>
                <div className={styles.courseContent}>
                  <Image
                    src={course.image}
                    alt=""
                    fill
                    className={styles.courseImage}
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </Link>
            );
          })}
          
          {/* Сетка для остальных курсов */}
          <div className={styles.coursesGrid}>
            {/* Левая колонка - два квадратных курса */}
            <div className={styles.leftColumn}>
              {courses.filter(course => course.type === 'square').map((course) => {
                return (
                  <Link key={course.id} href={course.route} className={styles.courseCardSquare}>
                    <div className={styles.courseContent}>
                      <Image
                        src={course.image}
                        alt=""
                        fill
                        className={styles.courseImage}
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Правая колонка - автор программы */}
            <div className={styles.rightColumn}>
              {courses.filter(course => course.type === 'tall').map((course) => {
                return (
                  <Link key={course.id} href={course.route} className={styles.courseCardTall}>
                    <div className={styles.courseContent}>
                      <Image
                        src={course.image}
                        alt=""
                        fill
                        className={styles.courseImage}
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Чат клуба */}
        <div className={styles.clubChatSection}>
          <div className={styles.clubChatCard} onClick={handleChatClick}>
            <div className={styles.clubChatContent}>
              <Image
                src="/images/chat.webp"
                alt=""
                fill
                className={styles.clubChatImage}
                sizes="(max-width: 768px) 100vw, 600px"
              />
              {/* Прозрачное стекло поверх всей кнопки при заблокированном доступе */}
              {!isSubscriptionActive && (
                <div className={styles.chatGlassOverlay}>
                  {/* Замок поверх стекла */}
                  <div className={styles.chatLockContainer}>
                    <div className={`${styles.chatLockIcon} ${styles.pulsingLock}`}>
                      <Lock size={24} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Поисковая модалка */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Модальное окно для покупки подписки */}
      {showSubscriptionModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSubscriptionModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowSubscriptionModal(false)}
            >
              <X size={24} />
            </button>
            
            <div className={styles.modalBody}>
              <div className={styles.modalIcon}>
                <Lock size={48} />
              </div>
              
              <h3 className={styles.modalTitle}>Доступ к чату клуба</h3>
              
              <p className={styles.modalText}>
                Для доступа к чату клуба необходима активная подписка. 
                Получите доступ ко всем материалам и начните свой путь к здоровью!
              </p>
              
              <a 
                href="https://t.me/Ploskiy_zhivot_s_Ayunoy_bot"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.modalButton}
              >
                ПОЛУЧИТЬ ДОСТУП
              </a>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
