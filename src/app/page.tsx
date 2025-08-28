'use client';

import { Page } from '@/components/Page';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { checkDeepLink, getStartParam } from '@/lib/deepLinks';

import styles from './page.module.css';

// Данные для хайлайтов с изображениями
const highlights = [
  { id: 1, image: '/images/starthere.webp', route: '/start-here' },
  { id: 2, image: '/images/about.webp', route: '/about' },
  { id: 3, image: '/images/zabota.webp', route: 'https://t.me/care_service_soul_therapy_bot' },
  { id: 4, image: '/images/faq.webp', route: '/faq' },
  { id: 5, image: '/images/review.webp', route: '/reviews' },
];

// Данные курсов с изображениями
const courses = [
  { 
    id: 'mini-courses', 
    image: '/images/materials.webp',
    type: 'full-width',
    route: '/courses/mini-courses'
  },
  { 
    id: 'questions', 
    image: '/images/questions.webp',
    type: 'square',
    route: '/courses/questions'
  },
  { 
    id: 'speeches', 
    image: '/images/speeches.webp',
    type: 'square',
    route: '/courses/speeches'
  },
  { 
    id: 'dialogs', 
    image: '/images/dialogs.webp',
    type: 'square',
    route: '/courses/dialogs'
  },
  { 
    id: 'opinion', 
    image: '/images/opinion.webp',
    type: 'square',
    route: '/courses/opinion'
  },
];

export default function Home() {
  const [currentDot, setCurrentDot] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [chatLink, setChatLink] = useState<string | null>(null);
  const [channelLink, setChannelLink] = useState<string | null>(null);
  const router = useRouter();




  // Получаем пользователя из Telegram
  const user = useSignal(initData.user);
  
  // 3 точки для навигации (4 хайлайта)
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
    }
  };

  // Проверяем статус подписки
  const isSubscriptionActive = userData?.status === 'Активна';

  // Обработчик клика по кнопке чата (только для заблокированных)
  const handleChatClick = (e: React.MouseEvent) => {
    if (!isSubscriptionActive) {
      e.preventDefault();
      setShowSubscriptionModal(true);
    }
  };

  // Обработчик клика по блокам материалов/курсов
  const handleCourseClick = (e: React.MouseEvent, route: string) => {
    if (!isSubscriptionActive) {
      e.preventDefault();
      setShowSubscriptionModal(true);
    } else {
      // Если подписка активна, используем программный переход
      e.preventDefault();
      router.push(route);
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

    // НОВОЕ: Проверяем deep links (только один раз за сессию)
    const handleDeepLink = () => {
      // Проверяем, был ли deep link уже обработан в этой сессии
      const deepLinkProcessed = sessionStorage.getItem('deepLinkProcessed');
      if (deepLinkProcessed) {
        console.log('🔄 Deep link already processed in this session, skipping');
        return;
      }

      const startParam = getStartParam();
      const deepLinkResult = checkDeepLink(startParam);
      
      if (deepLinkResult.isDeepLink && deepLinkResult.type === 'materials' && deepLinkResult.materialId) {
        console.log('🚀 Deep link navigation to material:', deepLinkResult.materialId);
        
        // Отмечаем что deep link был обработан
        sessionStorage.setItem('deepLinkProcessed', 'true');
        
        // Небольшая задержка для полной инициализации Telegram WebApp
        setTimeout(() => {
          router.push(`/materials/${deepLinkResult.materialId}`);
        }, 800);
      }
    };

    handleDeepLink();
  }, [router]);

  // Функция для загрузки ссылок из переменных окружения
  const loadLinks = async () => {
    if (isSubscriptionActive) {
      try {
        const response = await fetch('/api/env-links');
        
        if (response.ok) {
          const data = await response.json();
          setChatLink(data.chatLink);
          setChannelLink(data.channelLink);
        }
      } catch (error) {
        console.error('Error loading links:', error);
        setChatLink(null);
        setChannelLink(null);
      }
    } else {
      setChatLink(null);
      setChannelLink(null);
    }
  };



  // Вызываем загрузку данных пользователя при монтировании
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  // Загружаем ссылки когда статус подписки меняется
  useEffect(() => {
    loadLinks();
  }, [isSubscriptionActive, user?.id]);
  
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
              // Проверяем, является ли ссылка внешней
              const isExternalLink = highlight.route.startsWith('http');
              
              if (isExternalLink) {
                return (
                  <a 
                    key={highlight.id} 
                    href={highlight.route} 
                    className={styles.highlightCard}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className={styles.highlightContent}>
                      <Image
                        src={highlight.image}
                        alt=""
                        fill
                        className={styles.highlightImage}
                        sizes="120px"
                      />
                    </div>
                  </a>
                );
              }

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
              <a 
                key={course.id} 
                href="#"
                className={styles.courseCardFullWidth}
                onClick={(e) => handleCourseClick(e, course.route)}
              >
                <div className={styles.courseContent}>
                  <Image
                    src={course.image}
                    alt=""
                    fill
                    className={styles.courseImage}
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                  {/* Блокировка при отсутствии подписки */}
                  {!isSubscriptionActive && (
                    <div className={styles.courseGlassOverlay}>
                      <div className={styles.courseLockContainer}>
                        <div className={`${styles.courseLockIcon} ${styles.pulsingLock}`}>
                          <Lock size={24} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
          
          {/* Сетка для остальных курсов - теперь 2x2 */}
          <div className={styles.coursesGrid}>
            {courses.filter(course => course.type === 'square').map((course) => {
              return (
                <a 
                  key={course.id} 
                  href="#"
                  className={styles.courseCardSquare}
                  onClick={(e) => handleCourseClick(e, course.route)}
                >
                  <div className={styles.courseContent}>
                    <Image
                      src={course.image}
                      alt=""
                      fill
                      className={styles.courseImage}
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                    {/* Блокировка при отсутствии подписки */}
                    {!isSubscriptionActive && (
                      <div className={styles.courseGlassOverlay}>
                        <div className={styles.courseLockContainer}>
                          <div className={`${styles.courseLockIcon} ${styles.pulsingLock}`}>
                            <Lock size={20} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Чат клуба */}
        <div className={styles.clubChatSection}>
          <a 
            href={isSubscriptionActive && chatLink ? chatLink : "#"}
            target={isSubscriptionActive && chatLink ? "_blank" : "_self"}
            rel={isSubscriptionActive && chatLink ? "noopener noreferrer" : ""}
            className={styles.clubChatCard}
            onClick={handleChatClick}
          >
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
          </a>
        </div>

        {/* Канал сообщества */}
        <div className={styles.clubChannelSection}>
          <a 
            href={isSubscriptionActive && channelLink ? channelLink : "#"}
            target={isSubscriptionActive && channelLink ? "_blank" : "_self"}
            rel={isSubscriptionActive && channelLink ? "noopener noreferrer" : ""}
            className={styles.clubChannelCard}
            onClick={handleChatClick}
          >
            <div className={styles.clubChannelContent}>
              <Image
                src="/images/channel.webp"
                alt=""
                fill
                className={styles.clubChannelImage}
                sizes="(max-width: 768px) 100vw, 600px"
              />
              {/* Прозрачное стекло поверх всей кнопки при заблокированном доступе */}
              {!isSubscriptionActive && (
                <div className={styles.channelGlassOverlay}>
                  {/* Замок поверх стекла */}
                  <div className={styles.channelLockContainer}>
                    <div className={`${styles.channelLockIcon} ${styles.pulsingLock}`}>
                      <Lock size={24} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </a>
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
              
              <h3 className={styles.modalTitle}>Требуется активная подписка</h3>
              
              <p className={styles.modalText}>
                Для доступа к материалам и чату сообщества необходима активная подписка. 
                Получите полный доступ ко всем материалам и присоединяйтесь к нашему сообществу!
              </p>
              
              <a 
                href="https://t.me/istochnik_clubbot?start=closedclub"
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
