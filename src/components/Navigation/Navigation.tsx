'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home as HomeIcon,
  Calendar,
  User,
  Star,
  FileText,
  Lock,
  X
} from 'lucide-react';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { getMessengerId, getMessengerData, getPlatform } from '@/lib/platform';
import { User as DbUser } from '@/types/database';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();
  const user = useSignal(initData.user);

  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Получение ID пользователя из мессенджера (Telegram или Max)
  // Приоритет: getMessengerId() (напрямую из SDK) > signal > fallback
  // В Max signal может быть 0 (из мока), а getMessengerId() читает реальный ID из window.WebApp
  const getUserId = (): string => {
    const messengerId = getMessengerId();
    if (messengerId && messengerId !== '0') return messengerId;
    const signalId = user?.id?.toString();
    if (signalId && signalId !== '0') return signalId;
    return Math.floor(Math.random() * 1000000000).toString();
  };

  // Функция для загрузки данных пользователя из базы данных (как на главной)
  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      const messengerInfo = getMessengerData();
      const platform = messengerInfo.platform === 'unknown' ? 'telegram' : messengerInfo.platform;
      const userId = getUserId();

      // Не загружаем фейковых юзеров (mock fallback)
      if (!userId || userId === '0') {
        setUserData(null);
        return;
      }
      const queryParam = platform === 'max' ? `maxId=${userId}` : `telegramId=${userId}`;

      const response = await fetch(`/api/users?${queryParam}`);

      if (!response.ok) {
        if (response.status === 404) {
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

  // В Max: Telegram SDK сигнал не заполняется, но __MAX_PLATFORM__ установлен
  const isMax = typeof window !== 'undefined' && !!(window as any).__MAX_PLATFORM__;
  const hasMessengerId = !!getMessengerId();
  const resolvedUserId = getUserId();

  useEffect(() => {
    if (user?.id || isMax || hasMessengerId) {
      // Не перезагружаем если данные уже получены
      if (userData && !loadingUserData) return;
      loadUserData();
    }
  }, [user?.id]);

  // В Max: если первый useEffect отработал с id=0 (userData=null), ретригерим
  // когда реальный getMessengerId() станет доступен (Max SDK догрузился)
  useEffect(() => {
    if (!userData && !loadingUserData && isMax) {
      const realId = getMessengerId();
      if (realId && realId !== '0') {
        loadUserData();
      }
    }
  }, [resolvedUserId, pathname]);

  // Скрываем навигацию для админских страниц и онбординга
  if (pathname.startsWith('/admin') || pathname.startsWith('/onboarding')) {
    return null;
  }

  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const isSubscriptionActive = isLocalhost || userData?.status === 'Активна';

  // Обработчик для заблокированных разделов
  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSubscriptionModal(true);
  };

  const lockedSections = ['/calendar', '/favorites'];

  return (
    <>
      <div className={styles.navigationMenu}>
        <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
          <HomeIcon className={styles.navIcon} size={20} />
          <span className={styles.navText}>Главная</span>
        </Link>

        {/* Ресурсы - всегда доступен */}
        <Link href="/resources" className={`${styles.navItem} ${pathname === '/resources' ? styles.active : ''}`}>
          <FileText className={styles.navIcon} size={20} />
          <span className={styles.navText}>Ресурсы</span>
        </Link>

        {/* Календарь */}
        {(!loadingUserData && isSubscriptionActive) ? (
          <Link href="/calendar" className={`${styles.navItem} ${pathname === '/calendar' ? styles.active : ''}`}>
            <Calendar className={styles.navIcon} size={20} />
            <span className={styles.navText}>Календарь</span>
          </Link>
        ) : (
          <div className={`${styles.navItem} ${styles.lockedItem}`} onClick={handleLockedClick}>
            <Lock className={styles.navIcon} size={20} />
            <span className={styles.navText}>Календарь</span>
          </div>
        )}

        {/* Профиль - всегда доступен */}
        <Link href="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`}>
          <User className={styles.navIcon} size={20} />
          <span className={styles.navText}>Профиль</span>
        </Link>

        {/* Избранное */}
        {(!loadingUserData && isSubscriptionActive) ? (
          <Link href="/favorites" className={`${styles.navItem} ${pathname === '/favorites' ? styles.active : ''}`}>
            <Star className={styles.navIcon} size={20} />
            <span className={styles.navText}>Избранное</span>
          </Link>
        ) : (
          <div className={`${styles.navItem} ${styles.lockedItem}`} onClick={handleLockedClick}>
            <Lock className={styles.navIcon} size={20} />
            <span className={styles.navText}>Избранное</span>
          </div>
        )}
      </div>

      {/* Модальное окно подписки */}
      {showSubscriptionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowSubscriptionModal(false)}
            >
              <X size={24} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <Lock size={32} />
              </div>
              <h2 className={styles.modalTitle}>Требуется подписка</h2>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Для доступа к этому разделу необходима активная подписка.
                Получите доступ ко всем материалам и функциям приложения.
              </p>

              <a
                href="https://t.me/istochnik_clubbot?start=closedclub"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.subscribeButton}
                onClick={() => setShowSubscriptionModal(false)}
              >
                ПОЛУЧИТЬ ДОСТУП
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
