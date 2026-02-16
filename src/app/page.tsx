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
import { DailyPopup } from '@/components/DailyPopup';
import { searchService } from '@/services/searchService';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { User as DbUser, PopupSettings } from '@/types/database';
import { checkDeepLink, getStartParam, parseUtmFromStartParam } from '@/lib/deepLinks';
import { getMessengerId, getMessengerData, getPlatform } from '@/lib/platform';

import styles from './page.module.css';

// Данные для хайлайтов с изображениями
const highlights = [
  { id: 1, image: '/images/starthere.webp', route: '/start-here' },
  { id: 2, image: '/images/about.webp', route: '/about' },
  { id: 3, image: '/images/zabota.webp', route: 'https://t.me/istochnik_clubbot?start=zabota' },
  { id: 4, image: '/images/faq.webp', route: '/faq' },
  { id: 5, image: '/images/review.webp', route: '/reviews' },
];

// Маппинг id курса на section_key в БД
const SECTION_KEY_MAP: Record<string, string> = {
  'mini-courses': 'materials',
  'questions': 'questions',
  'speeches': 'speeches',
  'dialogs': 'dialogs',
  'opinion': 'opinion',
};

// Данные курсов с изображениями
const courses = [
  {
    id: 'mini-courses',
    image: '/images/materials.webp',
    type: 'full-width',
    route: '/courses/mini-courses',
    theme: 'dark' as const,
  },
  {
    id: 'questions',
    image: '/images/questions.webp',
    type: 'square',
    route: '/courses/questions',
    theme: 'light' as const,
  },
  {
    id: 'speeches',
    image: '/images/speeches.webp',
    type: 'square',
    route: '/courses/speeches',
    theme: 'light' as const,
  },
  {
    id: 'dialogs',
    image: '/images/dialogs.webp',
    type: 'square',
    route: '/courses/dialogs',
    theme: 'dark' as const,
  },
  {
    id: 'opinion',
    image: '/images/opinion.webp',
    type: 'square',
    route: '/courses/opinion',
    theme: 'dark' as const,
  },
];

export default function Home() {
  const [currentDot, setCurrentDot] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [chatLink, setChatLink] = useState<string | null>(null);
  const [channelLink, setChannelLink] = useState<string | null>(null);
  const [popupData, setPopupData] = useState<PopupSettings | null>(null);
  const [materialCounts, setMaterialCounts] = useState<Record<string, number>>({});
  const router = useRouter();




  // Получаем пользователя из Telegram
  const user = useSignal(initData.user);
  
  // 3 точки для навигации (4 хайлайта)
  const dotsCount = 3;

  // Получаем ID пользователя из мессенджера (Telegram или Max)
  const getUserId = () => {
    const id = getMessengerId();
    return id || '123456789'; // Fallback для разработки
  };

  // Функция автоматической регистрации пользователя с UTM параметрами
  const autoRegisterUser = async (userId: string, startParam: string | null) => {
    try {
      const utmParams = parseUtmFromStartParam(startParam);
      const messengerData = getMessengerData();
      const platform = messengerData.platform === 'unknown' ? 'telegram' : messengerData.platform;

      const registrationData: Record<string, any> = {
        name_from_ml: user?.first_name || messengerData.user?.first_name || 'Новый пользователь',
        username: user?.username || messengerData.user?.username || null,
        start_param: startParam,
        platform,
        ...utmParams,
      };

      if (platform === 'max') {
        registrationData.max_id = userId;
      } else {
        registrationData.telegram_id = userId;
      }

      const response = await fetch('/api/users/auto-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (data.success) {
        return data.user;
      } else {
        console.error('Auto-registration failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Auto-registration error:', error);
      return null;
    }
  };

  // Функция для загрузки данных пользователя из базы данных (с автоматической регистрацией)
  const loadUserData = async () => {
    try {
      const messengerData = getMessengerData();
      const platform = messengerData.platform === 'unknown' ? 'telegram' : messengerData.platform;
      const userId = user?.id?.toString() || getUserId();

      // Сначала пытаемся загрузить существующего пользователя
      const queryParam = platform === 'max' ? `maxId=${userId}` : `telegramId=${userId}`;
      console.log('[loadUserData]', { platform, userId, queryParam, signalId: user?.id, webApp: !!(window as any).WebApp, telegram: !!(window as any).Telegram?.WebApp });
      const response = await fetch(`/api/users?${queryParam}`);
      
      if (response.ok) {
        // Пользователь найден
        const data: DbUser = await response.json();
        setUserData(data);
        return;
      }
      
      if (response.status === 404) {
        // Пользователь не найден - автоматически регистрируем
        const startParam = getStartParam();
        const newUser = await autoRegisterUser(userId, startParam);
        
        if (newUser) {
          setUserData(newUser);
        } else {
          setUserData(null);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error in loadUserData:', error);
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
        // Deep link already processed in this session, skipping
        return;
      }

      const startParam = getStartParam();
      const deepLinkResult = checkDeepLink(startParam);
      
      if (deepLinkResult.isDeepLink && deepLinkResult.type === 'materials' && deepLinkResult.materialId) {
        // Deep link navigation to material
        
        // Отмечаем что deep link был обработан
        sessionStorage.setItem('deepLinkProcessed', 'true');
        
        // Небольшая задержка для полной инициализации Telegram WebApp
        setTimeout(() => {
          router.push(`/materials/${deepLinkResult.materialId}`);
        }, 800);
      }
    };

    handleDeepLink();

    // Обработка привязки Max-аккаунта (startapp=link_UUID)
    const handleMaxLinking = async () => {
      const platform = getPlatform();
      if (platform !== 'max') return; // Только для Max

      const startParam = getStartParam();
      if (!startParam || !startParam.startsWith('link_')) return;

      const alreadyLinked = sessionStorage.getItem('maxLinkProcessed');
      if (alreadyLinked) return;

      const linkingCode = startParam.replace('link_', '');
      const maxId = getMessengerId();
      if (!maxId) return;

      try {
        const response = await fetch('/api/users/link-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linking_code: linkingCode, max_id: parseInt(maxId) }),
        });

        const data = await response.json();
        if (data.success) {
          console.log('✅ Max account linked to telegram_id:', data.telegram_id);
          sessionStorage.setItem('maxLinkProcessed', 'true');
          // Перезагружаем данные пользователя чтобы подписка подхватилась
          window.location.reload();
        } else {
          console.error('Max linking failed:', data.error);
        }
      } catch (error) {
        console.error('Max linking error:', error);
      }
    };

    handleMaxLinking();
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

  // Функция для загрузки настроек попапа
  const loadPopupSettings = async () => {
    try {
      const response = await fetch('/api/popup');

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.popup) {
          setPopupData(data.popup);
        }
      }
    } catch (error) {
      console.error('Error loading popup settings:', error);
    }
  };



  // Вызываем загрузку данных пользователя при монтировании
  // user?.id falsy для fallback mock (id=0), поэтому фантомные юзеры не создаются
  // В Max: Telegram SDK сигнал не заполняется, но __MAX_PLATFORM__ установлен
  const isMax = typeof window !== 'undefined' && !!(window as any).__MAX_PLATFORM__;
  useEffect(() => {
    if (user?.id || isMax) {
      loadUserData();
    }
  }, [user?.id]);

  // Загружаем ссылки когда статус подписки меняется
  useEffect(() => {
    loadLinks();
  }, [isSubscriptionActive, user?.id]);

  // Загружаем настройки попапа при монтировании
  useEffect(() => {
    loadPopupSettings();
  }, []);

  // Загружаем количество материалов по разделам
  useEffect(() => {
    const loadMaterialCounts = async () => {
      try {
        const sectionKeys = Object.values(SECTION_KEY_MAP);
        const counts: Record<string, number> = {};

        await Promise.all(
          sectionKeys.map(async (sectionKey) => {
            const res = await fetch(`/api/materials?section=${sectionKey}`);
            if (res.ok) {
              const data = await res.json();
              counts[sectionKey] = Array.isArray(data) ? data.length : 0;
            }
          })
        );

        setMaterialCounts(counts);
      } catch (error) {
        console.error('Error loading material counts:', error);
      }
    };

    loadMaterialCounts();
  }, []);

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

  // DEBUG: временная информация для диагностики Max (только в Max)
  const [debugInfo, setDebugInfo] = useState<string>('');
  useEffect(() => {
    if (!(window as any).__MAX_PLATFORM__) return;
    const info = {
      platform: getPlatform(),
      userId: user?.id,
      maxFlag: true,
      webAppUser: (window as any).WebApp?.initDataUnsafe?.user?.id || 'none',
      status: userData?.status || 'not loaded',
      maxId: userData?.max_id || 'none',
    };
    setDebugInfo(JSON.stringify(info, null, 1));
  }, [user?.id, userData]);

  return (
    <Page back={false}>
      <DailyPopup popupData={popupData} />

      {/* DEBUG: временный блок — удалить после отладки Max */}
      {debugInfo && (
        <div style={{ background: '#1a1a2e', color: '#0f0', padding: '8px', fontSize: '10px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', borderRadius: '8px', margin: '8px 16px', maxHeight: '120px', overflow: 'auto' }}>
          {debugInfo}
        </div>
      )}

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
            const sectionKey = SECTION_KEY_MAP[course.id];
            const count = sectionKey ? materialCounts[sectionKey] : undefined;
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
                  {count !== undefined && count > 0 && (
                    <span className={`${styles.materialCount} ${course.theme === 'dark' ? styles.materialCountOnDark : styles.materialCountOnLight}`}>
                      {count}
                    </span>
                  )}
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
              const sectionKey = SECTION_KEY_MAP[course.id];
              const count = sectionKey ? materialCounts[sectionKey] : undefined;
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
                    {count !== undefined && count > 0 && (
                      <span className={`${styles.materialCount} ${course.theme === 'dark' ? styles.materialCountOnDark : styles.materialCountOnLight}`}>
                        {count}
                      </span>
                    )}
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
