'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import Image from 'next/image';
import { Lock, LockOpen, X, Play } from 'lucide-react';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { User as DbUser } from '@/types/database';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { hasAccessToSection } from '@/utils/courseAccessMapping';
import styles from './page.module.css';

export default function AntiSwellingPage() {
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCourseAccessModal, setShowCourseAccessModal] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [courseLink, setCourseLink] = useState<string | null>(null);

  // Получаем пользователя из Telegram
  const user = useSignal(initData.user);

  // Получаем доступы к курсам из БД
  const { access: courseAccess, loading: accessLoading } = useCourseAccess();

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

  // Загружаем ссылку на курс когда статус подписки меняется
  useEffect(() => {
    loadCourseLink();
  }, [isSubscriptionActive, user?.id]);

  // Функция для загрузки защищенной ссылки на курс
  const loadCourseLink = async () => {
    if (isSubscriptionActive) {
      try {
        const telegramId = user?.id?.toString() || getTelegramId();
        const response = await fetch(`/api/secure-links?telegram_id=${telegramId}&type=course_anti_swelling`);
        
        if (response.ok) {
          const data = await response.json();
          setCourseLink(data.link);
        }
      } catch (error) {
        console.error('Error loading course link:', error);
        setCourseLink(null);
      }
    } else {
      setCourseLink(null);
    }
  };

  // Функция для запроса доступа к курсу через webhook
  const requestCourseAccess = async () => {
    try {
      setRequestingAccess(true);
      
      // Получаем РЕАЛЬНЫЙ telegram_id пользователя
      const realTelegramId = user?.id;
      
      if (!realTelegramId) {
        alert('Не удалось получить данные пользователя из Telegram');
        return;
      }
      
      // Отправляем telegram_id и название курса на webhook
      const webhookData = {
        telegram_id: realTelegramId,
        section_name: 'Отёки'
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
        setShowCourseAccessModal(false);
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

  // Обработчик клика по кнопке курса 
  const handleCourseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Сначала проверяем подписку
    if (!isSubscriptionActive) {
      setShowSubscriptionModal(true);
      return;
    }

    // Если подписка активна, проверяем доступ к курсу
    if (!courseAccess || accessLoading) {
      // Данные о доступе еще загружаются
      return;
    }

    const hasAccess = hasAccessToSection(courseAccess, 'course_anti_swelling');
    if (!hasAccess) {
      // Нет доступа к курсу - показываем модальное окно с webhook
      setShowCourseAccessModal(true);
      return;
    }

    // Есть доступ - переходим на материалы
    window.location.href = "/materials?section=course_anti_swelling";
  };

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок */}
        <h1 className={styles.title}>
          Курс «Отеки»
        </h1>
        <p className={styles.description}>
          Отёки — это не просто лишняя жидкость. Это сигнал организма, что пора восстановить баланс. За внешним проявлением — усталые ноги, опухшее лицо, тяжесть в теле — скрывается дисбаланс внутренних систем.
        </p>

        {/* Цветная плашка */}
        <div className={styles.topHighlightBlock}>
          <span className={styles.topHighlightText}>
            На этом курсе мы будем работать с отёками через остеопатию — мягко, эффективно и безопасно.
          </span>
        </div>

        {/* Главное изображение */}
        <Image
          src="/images/anti-swelling/girlswelling.webp"
          alt="Курс против отеков"
          width={800}
          height={600}
          className={styles.heroImg}
          priority
        />

        {/* Подзаголовок */}
        <h2 className={styles.subtitle}>Что вас ждёт на курсе:</h2>

        {/* Пронумерованные пункты - только 3 пункта */}
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
              Разминка для лимфы — активируем естественный дренаж, убираем застои, возвращаем тонус коже и телу.
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
              Остеотехника для сияющего лица —подтягиваем черты, убираем мешки и отёчность, дарим лицу свежесть.
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
              Стройные ноги без целлюлит — мягкие техники, которые разглаживают кожу, улучшают кровообращение и делают ноги лёгкими и красивыми.
            </p>
          </div>
        </div>

        {/* Блок с часами */}
        <div className={styles.timeBlock}>
          <div className={styles.timeHeader}>
            <Image
              src="/images/anti-swelling/clock.svg"
              alt="Часы"
              width={30}
              height={30}
              className={styles.timeIcon}
            />
            <h3 className={styles.timeTitle}>ВСЕГО 15 МИНУТ УТРОМ</h3>
          </div>
          <p className={styles.timeText}>
            и ваш организм запускает глубокие процессы очищения, восстановления и перезагрузки.
          </p>
        </div>

        {/* Раздел с результатами - цветная вставка */}
        <div className={styles.resultsSection}>
          <h2 className={styles.resultsTitle}>К КАКИМ РЕЗУЛЬТАТАМ ВЫ ПРИДЁТЕ:</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.svg"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                уйдёт до 7 см в талии
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                целлюлит станет менее выраженным, кожа — ровнее
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                живот станет более подтянутым и упругим
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                вы почувствуете лёгкость, энергию и прилив сил уже после первой недели занятий
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                лицо — чётче, моложе, прекраснее
              </p>
            </div>
          </div>
        </div>

        {/* Изображение девушки без отступа */}
        <Image
          src="/images/anti-swelling/lastone.webp"
          alt="Результаты курса"
          width={800}
          height={600}
          className={styles.bellGirlImg}
        />

        {/* Кнопка курса */}
        <div className={styles.courseButtonContainer}>
          <button 
            onClick={handleCourseClick}
            className={`${styles.courseButton} ${(!isSubscriptionActive || (courseAccess && !hasAccessToSection(courseAccess, 'course_anti_swelling'))) ? styles.lockedButton : ''} ${loadingUserData || accessLoading ? styles.disabled : ''}`}
            disabled={loadingUserData || accessLoading}
          >
            <span className={styles.buttonContent}>
              <span className={styles.lockIcon}>
                {(isSubscriptionActive && courseAccess && hasAccessToSection(courseAccess, 'course_anti_swelling')) ? (
                  <Play size={24} />
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

      {/* Модальное окно доступа к курсу */}
      {showCourseAccessModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCourseAccessModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowCourseAccessModal(false)}
            >
              <X size={24} />
            </button>
            
            <div className={styles.modalBody}>
              <div className={styles.modalIcon}>
                <Lock size={48} />
              </div>
              
              <h3 className={styles.modalTitle}>🔒 Курс пока недоступен</h3>
              
              <p className={styles.modalText}>
                Открытие этого курса возможно только через нашего Telegram-бота.<br/>
                Там вы узнаете условия доступа и сможете разблокировать материалы всего за пару кликов
              </p>
              
              <button
                className={styles.modalButton}
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