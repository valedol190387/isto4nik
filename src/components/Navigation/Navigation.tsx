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
import { User as DbUser } from '@/types/database';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();
  const user = useSignal(initData.user);

  // Скрываем навигацию для админских страниц
  if (pathname.startsWith('/admin')) {
    return null;
  }
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Получение telegram_id с приоритетом реального ID
  const getTelegramId = (): string => {
    if (typeof window !== 'undefined') {
      const telegramId = user?.id?.toString();
      if (telegramId) return telegramId;
      
      // Fallback для разработки
      return Math.floor(Math.random() * 1000000000).toString();
    }
    return '123456789';
  };

  // Функция для загрузки данных пользователя из базы данных (как на главной)
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

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const isSubscriptionActive = userData?.status === 'Активна';
  
  // DEBUG: временно показываем статус
  console.log('Navigation userData:', userData);
  console.log('Navigation isSubscriptionActive:', isSubscriptionActive);

  // Обработчик для заблокированных разделов
  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSubscriptionModal(true);
  };

  const lockedSections = ['/materials', '/calendar', '/favorites'];

  return (
    <>
      <div className={styles.navigationMenu}>
        <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
          <HomeIcon className={styles.navIcon} size={20} />
          <span className={styles.navText}>Главная</span>
        </Link>

        {/* Курсы */}
        {(!loadingUserData && isSubscriptionActive) ? (
          <Link href="/materials" className={`${styles.navItem} ${pathname === '/materials' ? styles.active : ''}`}>
            <FileText className={styles.navIcon} size={20} />
            <span className={styles.navText}>Курсы</span>
          </Link>
        ) : (
          <div className={`${styles.navItem} ${styles.lockedItem}`} onClick={handleLockedClick}>
            <Lock className={styles.navIcon} size={20} />
            <span className={styles.navText}>Курсы</span>
          </div>
        )}

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
                href="https://t.me/Ploskiy_zhivot_s_Ayunoy_bot"
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