'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import Image from 'next/image';
import { Lock, LockOpen, X } from 'lucide-react';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { User as DbUser } from '@/types/database';
import styles from './page.module.css';

export default function FlatBellyPage() {
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Получаем пользователя из Telegram
  const user = useSignal(initData.user);

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

  // Вызываем загрузку данных пользователя при монтировании
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  // Проверяем статус подписки
  const isSubscriptionActive = userData?.status === 'Активна';

  // Обработчик клика по кнопке курса
  const handleCourseClick = async () => {
    if (isSubscriptionActive) {
      try {
        const telegramId = user?.id?.toString() || getTelegramId();
        const response = await fetch(`/api/secure-links?telegram_id=${telegramId}&type=course_flat_belly`);
        
        if (response.ok) {
          const data = await response.json();
          window.open(data.link, '_blank');
        } else {
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

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок */}
        <h1 className={styles.title}>
          Курс «Плоский живот» —
        </h1>
        <p className={styles.description}>
          не про голодание, качание пресса и тренировки до изнеможения. Это комплекс мягких, но работающих практик, которые помогут вам сотворить плоский живот своими руками.
        </p>

        {/* Главное изображение */}
        <Image
          src="/images/flat-belly/mainflat.webp"
          alt="Курс плоский живот"
          width={800}
          height={600}
          className={styles.heroImg}
          priority
        />

        {/* Подзаголовок */}
        <h2 className={styles.subtitle}>Что мы будем делать:</h2>

        {/* Пронумерованные пункты */}
        <div className={styles.pointsList}>
          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 1.png"
              alt="1"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Высвободим защемлённые нервы, чтобы тело перестало "держать" напряжение.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 2.png"
              alt="2"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Поднимем кишечник на его естественное место — он часто опускается и выпирает вперёд, создавая ложный "живот".
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 3.png"
              alt="3"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Наладим паттерн дыхания — научимся дышать так, чтобы живот не раздувался, а помогал нам двигаться.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 4.png"
              alt="4"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Исправим осанку — ведь сутулость и перекосы таза — главные причины "вечно напряжённого живота".
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 5.png"
              alt="5"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Активируем мышцы кора и научим их работать в согласии, а не по отдельности.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 6.png"
              alt="6"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Уберём спайки и внутренние блоки, мешающие органам двигаться и функционировать.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 7.png"
              alt="7"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Уберем привычку втягивать живот — потому что постоянное напряжение только ухудшает форму.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 8.png"
              alt="8"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Снизим воспаления через комплекс остеопатических практик — ведь хроническое воспаление = отёки, вздутие и лишний объём.
            </p>
          </div>
        </div>

        {/* Синий блок с текстом */}
        <div className={styles.highlightBlock}>
          <p className={styles.highlightText}>
            сотни женщин уже выполняли эти практики и заметили изменения через несколько недель
          </p>
        </div>

        {/* Изображение девушки без отступа */}
        <Image
          src="/images/flat-belly/bellgirl.webp"
          alt="Результаты курса"
          width={800}
          height={600}
          className={styles.bellGirlImg}
        />

        {/* Кнопка курса */}
        <div className={styles.courseButtonContainer}>
          <button 
            onClick={handleCourseClick}
            className={`${styles.courseButton} ${!isSubscriptionActive ? styles.lockedButton : ''}`}
            disabled={loadingUserData}
          >
            <span className={styles.buttonContent}>
              <span className={styles.lockIcon}>
                {isSubscriptionActive ? (
                  <LockOpen size={24} />
                ) : (
                  <Lock size={24} className={styles.pulsingLock} />
                )}
              </span>
              СМОТРЕТЬ КУРС
            </span>
          </button>
        </div>
      </div>

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
              
              <h3 className={styles.modalTitle}>Доступ к курсу</h3>
              
              <p className={styles.modalText}>
                Для просмотра курса необходима активная подписка. 
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