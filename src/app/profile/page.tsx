'use client';

import { useState, useEffect } from 'react';
import { User as LucideUser, MessageCircle, Info, CreditCard, Send, ChevronDown, ChevronUp, Copy, Calendar, ChevronRight, Clock, Check, Loader2, Shield } from 'lucide-react';
import { Page } from '@/components/Page';
import { Payment, User as DbUser } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ProfilePage() {


  // Получаем Telegram ID пользователя
  const getTelegramId = () => {
    // Пробуем получить из Telegram WebApp API
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id.toString();
      }
    }
    
    // Fallback для разработки - используем разные ID для тестирования
    if (typeof window !== 'undefined') {
      // В реальной среде этого не будет - только для разработки
      const testIds = ['123456789', '987654321', '555666777'];
      const randomId = testIds[Math.floor(Math.random() * testIds.length)];

      return randomId;
    }
    
    return '123456789';
  };

  // Состояние для платежей
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  
  // Состояние для копирования
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSystemInfo, setCopiedSystemInfo] = useState(false);
  
  // Получаем пользователя из Telegram
  const user = useSignal(initData.user);

  // Добавляем состояние для данных пользователя из базы данных
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  // Загрузка истории платежей
  const loadPayments = async () => {
    if (payments.length > 0) return; // Уже загружены
    
    setLoadingPayments(true);
    try {
      const telegramId = user?.id?.toString() || getTelegramId();

      const response = await fetch(`/api/payments?telegramId=${telegramId}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Payment[] = await response.json();

      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      // В случае ошибки показываем пустое состояние
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
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
          console.log('Пользователь не найден в базе данных');
          setUserData(null);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const data: DbUser = await response.json();
        setUserData(data);
        console.log('Данные пользователя загружены:', data);
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

  // Форматирование даты
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Форматирование даты только для дат (без времени)
  const formatDateOnly = (dateString: string | undefined) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Форматирование суммы
  const formatAmount = (amount: string | undefined, currency: string | undefined) => {
    if (!amount) return 'Неизвестно';
    const num = parseFloat(amount);
    return `${num.toLocaleString('ru-RU')} ${currency || 'RUB'}`;
  };

  // Получение статуса платежа на русском
  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'Completed': return 'Завершен';
      case 'Pending': return 'Ожидание';
      case 'Failed': return 'Ошибка';
      case 'Cancelled': return 'Отменен';
      default: return status || 'Неизвестно';
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Completed': return '#22c55e';
      case 'Pending': return '#f59e0b';
      case 'Failed': return '#ef4444';
      case 'Cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [systemInfoOpen, setSystemInfoOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    
    setIsSending(true);
    try {
      const telegramId = user?.id?.toString() || getTelegramId();
      const userInfo = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Неизвестный пользователь';
      
      // Отправляем сообщение на webhook
      const response = await fetch('https://n8n.istochnikbackoffice.ru/webhook/zabota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: supportMessage,
          raw_message: supportMessage,
          telegram_id: telegramId,
          user_name: userInfo,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setSupportMessage('');
        setMessageSent(true);
        setTimeout(() => setMessageSent(false), 2500); // Убираем зеленое состояние через 2.5 секунды
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      // При ошибке просто ничего не показываем (или можно добавить красную подсветку)
    } finally {
      setIsSending(false);
    }
  };

  const getDetailedSystemInfo = () => {
    const tg = (window as any).Telegram?.WebApp;
    const nav = navigator;
    const screen = window.screen;
    const connection = (nav as any).connection;
    
    return {
      // Базовая информация о системе
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      languages: nav.languages?.join(', ') || 'unknown',
      cookieEnabled: nav.cookieEnabled,
      onLine: nav.onLine,
      
      // Экран и дисплей
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenAvailWidth: screen.availWidth,
      screenAvailHeight: screen.availHeight,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth,
      screenOrientation: (screen as any).orientation?.type || 'unknown',
      devicePixelRatio: window.devicePixelRatio,
      
      // Окно браузера
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      windowOuterWidth: window.outerWidth,
      windowOuterHeight: window.outerHeight,
      
      // Сетевое соединение
      connectionType: connection?.effectiveType || 'unknown',
      connectionDownlink: connection?.downlink || 'unknown',
      connectionRtt: connection?.rtt || 'unknown',
      connectionSaveData: connection?.saveData || false,
      
      // Память (если доступно)
      memoryUsedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 'unknown',
      memoryTotalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 'unknown',
      memoryJSHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 'unknown',
      
      // Время и часовой пояс
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      
      // URL и локация
      currentUrl: window.location.href,
      referrer: document.referrer || 'Нет',
      
      // Telegram WebApp детальная информация
      tgPlatform: tg?.platform || 'unknown',
      tgVersion: tg?.version || 'unknown',
      tgColorScheme: tg?.colorScheme || 'unknown',
      tgThemeParams: tg?.themeParams ? JSON.stringify(tg.themeParams) : 'Нет',
      tgIsExpanded: tg?.isExpanded ? 'Да' : 'Нет',
      tgViewportHeight: tg?.viewportHeight || 'unknown',
      tgViewportStableHeight: tg?.viewportStableHeight || 'unknown',
      tgHeaderColor: tg?.headerColor || 'unknown',
      tgBackgroundColor: tg?.backgroundColor || 'unknown',
      tgIsClosingConfirmationEnabled: tg?.isClosingConfirmationEnabled ? 'Да' : 'Нет',
      tgIsVerticalSwipesEnabled: tg?.isVerticalSwipesEnabled ? 'Да' : 'Нет',
      tgInitData: tg?.initData ? 'Присутствует' : 'Нет',
      tgInitDataUnsafe: tg?.initDataUnsafe ? JSON.stringify(tg.initDataUnsafe, null, 2) : 'Нет',
      
      // Поддерживаемые возможности
      touchSupport: 'ontouchstart' in window,
      webGL: !!window.WebGLRenderingContext,
      webGL2: !!window.WebGL2RenderingContext,
      webRTC: !!(nav as any).getUserMedia || !!(nav as any).webkitGetUserMedia || !!(nav as any).mozGetUserMedia,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      serviceWorker: 'serviceWorker' in nav,
      webAssembly: typeof WebAssembly === 'object',
      
      // Safe Area (Telegram)
      safeAreaTop: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top'),
      safeAreaBottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom'),
      safeAreaLeft: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left'),
      safeAreaRight: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right'),
    };
  };

  // Универсальная функция копирования в буфер обмена
  const copyToClipboard = async (text: string, setCopiedState: (value: boolean) => void) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000); // Убираем галочку через 2 секунды
      } else {
        // Fallback для старых браузеров или HTTP
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000); // Убираем галочку через 2 секунды
      }
    } catch (error) {
      console.error('Ошибка копирования:', error);
      // При ошибке можно показать красную иконку или просто ничего не делать
    }
  };

  const copySystemInfo = () => {
    const nav = navigator;
    const screen = window.screen;
    const connection = (nav as any).connection;
    
    const systemInfo = `
=== ДИАГНОСТИЧЕСКАЯ ИНФОРМАЦИЯ ===

СИСТЕМНАЯ ИНФОРМАЦИЯ:
Браузер: ${nav.userAgent}
Платформа: ${nav.platform}
Язык: ${nav.language}
Часовой пояс: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
Смещение времени: ${new Date().getTimezoneOffset()} мин

ЭКРАН И ДИСПЛЕЙ:
Разрешение экрана: ${screen.width}x${screen.height}
Доступное разрешение: ${screen.availWidth}x${screen.availHeight}
Пиксельная плотность: ${window.devicePixelRatio}
Размер окна: ${window.innerWidth}x${window.innerHeight}

СЕТЕВОЕ СОЕДИНЕНИЕ:
Онлайн статус: ${nav.onLine ? 'Да' : 'Нет'}
Тип соединения: ${connection?.effectiveType || 'Неизвестно'}
Скорость загрузки: ${connection?.downlink ? connection.downlink + ' Mbps' : 'Неизвестно'}
RTT: ${connection?.rtt ? connection.rtt + ' ms' : 'Неизвестно'}

ВОЗМОЖНОСТИ:
Touch поддержка: ${'ontouchstart' in window ? 'Да' : 'Нет'}
Cookies включены: ${nav.cookieEnabled ? 'Да' : 'Нет'}
LocalStorage: ${typeof localStorage !== 'undefined' ? 'Да' : 'Нет'}
WebGL: ${window.WebGLRenderingContext ? 'Да' : 'Нет'}

ПОЛЬЗОВАТЕЛЬ:
User ID: ${user?.id || 'Неизвестно'}
Username: ${user?.username || 'Неизвестно'}
Текущий URL: ${window.location.href}
Время загрузки: ${new Date().toISOString()}

=== КОНЕЦ ДИАГНОСТИЧЕСКОЙ ИНФОРМАЦИИ ===
    `.trim();
    
    copyToClipboard(systemInfo, setCopiedSystemInfo);
  };

  // Проверяем статус подписки
  const isSubscriptionActive = userData?.status === 'Активна';

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <LucideUser className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>Профиль</h1>
          </div>
        </div>

        {/* Информация о пользователе */}
        {user && (
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {user.photo_url ? (
                <img src={user.photo_url} alt="Аватар" className={styles.avatarImage} />
              ) : (
                <LucideUser className={styles.avatarIcon} />
              )}
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>
                {user.first_name} {user.last_name || ''}
              </h2>
              <div className={styles.userId}>
                <p className={styles.userIdText}>Telegram ID: {user.id}</p>
                <button 
                  className={`${styles.copyIdButton} ${copiedId ? styles.copied : ''}`}
                  onClick={() => {
                    copyToClipboard(user.id?.toString() || '', setCopiedId);
                  }}
                >
                  {copiedId ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {user.username && (
                <p className={styles.userDetails}>@{user.username}</p>
              )}
            </div>
          </div>
        )}

        {/* Статус подписки */}
        <div className={styles.subscriptionCard}>
          <div className={styles.sectionHeader}>
            <Shield className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>СТАТУС ПОДПИСКИ</h3>
          </div>
          {loadingUserData ? (
            <div className={styles.subscriptionLoading}>
              <Loader2 className={styles.loadingSpinner} />
              <span>Загружаем подписку...</span>
            </div>
          ) : (
            <div className={styles.subscriptionStatus}>
              <span className={styles.statusBadge} style={{ 
                background: isSubscriptionActive ? '#22c55e' : '#ef4444'
              }}>
                {isSubscriptionActive ? 'Активна' : 'Неактивна'}
              </span>
              {isSubscriptionActive && userData?.next_payment_date && (
                <div className={styles.subscriptionEndDate}>
                  <Clock className={styles.clockIcon} />
                  <span className={styles.endDateText}>
                    до {formatDateOnly(userData.next_payment_date)}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className={styles.subscriptionContent}>
            {isSubscriptionActive ? (
              <p className={styles.subscriptionText}>
                Ваша подписка активна. Вы имеете доступ ко всем материалам.
              </p>
            ) : (
              <>
                <p className={styles.subscriptionText}>
                  Подписка неактивна. Для получения доступа к материалам обратитесь к боту "Источник".
                </p>
                <a 
                  href="https://t.me/istochnik_clubbot?start=closedclub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.botButton}
                >
                  Перейти в бот
                </a>
              </>
            )}
          </div>
        </div>

        

        {/* Нужна помощь */}
        <div className={styles.accordion}>
          <div 
            className={styles.accordionHeader}
            onClick={() => setSupportOpen(!supportOpen)}
          >
            <MessageCircle className={styles.accordionIcon} />
            <span className={styles.accordionTitle}>Нужна помощь</span>
            {supportOpen ? (
              <ChevronUp className={styles.chevronIcon} />
            ) : (
              <ChevronDown className={styles.chevronIcon} />
            )}
          </div>
          
          {supportOpen && (
            <div className={styles.accordionContent}>
              <div className={styles.supportContent}>
                <textarea
                  className={styles.supportTextarea}
                  placeholder="Опишите вашу проблему или задайте вопрос..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                />
                <button 
                  className={`${styles.sendButton} ${messageSent ? styles.sent : ''}`}
                  onClick={handleSendSupport}
                  disabled={!supportMessage.trim() || isSending || messageSent}
                >
                  {isSending ? (
                    <>
                      <div className={styles.spinner} />
                      Отправка...
                    </>
                  ) : messageSent ? (
                    <>
                      <Check className={styles.sendIcon} />
                      Отправлено
                    </>
                  ) : (
                    <>
                      <Send className={styles.sendIcon} />
                      Отправить
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Системная информация */}
        <div className={styles.accordion}>
          <div 
            className={styles.accordionHeader}
            onClick={() => setSystemInfoOpen(!systemInfoOpen)}
          >
            <Info className={styles.accordionIcon} />
            <span className={styles.accordionTitle}>Системная информация</span>
            {systemInfoOpen ? (
              <ChevronUp className={styles.chevronIcon} />
            ) : (
              <ChevronDown className={styles.chevronIcon} />
            )}
          </div>
          
          {systemInfoOpen && (
            <div className={styles.accordionContent}>
              <p className={styles.systemNote}>
                Скопируйте данный текст в случае проблем с приложением и предоставьте службе заботы
              </p>
              
              <div className={styles.systemInfo}>
                <p><strong>СИСТЕМНАЯ ИНФОРМАЦИЯ:</strong></p>
                <p><strong>Браузер:</strong> {navigator.userAgent}</p>
                <p><strong>Платформа:</strong> {navigator.platform}</p>
                <p><strong>Язык:</strong> {navigator.language}</p>
                <p><strong>Часовой пояс:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
                <p><strong>Смещение времени:</strong> {new Date().getTimezoneOffset()} мин</p>
                <br />
                <p><strong>ЭКРАН И ДИСПЛЕЙ:</strong></p>
                <p><strong>Разрешение экрана:</strong> {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Неизвестно'}</p>
                <p><strong>Доступное разрешение:</strong> {typeof window !== 'undefined' ? `${window.screen.availWidth}x${window.screen.availHeight}` : 'Неизвестно'}</p>
                <p><strong>Пиксельная плотность:</strong> {typeof window !== 'undefined' ? window.devicePixelRatio : 'Неизвестно'}</p>
                <p><strong>Размер окна:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Неизвестно'}</p>
                <br />
                <p><strong>СЕТЕВОЕ СОЕДИНЕНИЕ:</strong></p>
                <p><strong>Онлайн статус:</strong> {navigator.onLine ? 'Да' : 'Нет'}</p>
                <p><strong>Тип соединения:</strong> {(navigator as any).connection?.effectiveType || 'Неизвестно'}</p>
                <p><strong>Скорость загрузки:</strong> {(navigator as any).connection?.downlink ? `${(navigator as any).connection.downlink} Mbps` : 'Неизвестно'}</p>
                <p><strong>RTT:</strong> {(navigator as any).connection?.rtt ? `${(navigator as any).connection.rtt} ms` : 'Неизвестно'}</p>
                <br />
                <p><strong>ВОЗМОЖНОСТИ:</strong></p>
                <p><strong>Touch поддержка:</strong> {'ontouchstart' in window ? 'Да' : 'Нет'}</p>
                <p><strong>Cookies включены:</strong> {navigator.cookieEnabled ? 'Да' : 'Нет'}</p>
                <p><strong>LocalStorage:</strong> {typeof localStorage !== 'undefined' ? 'Да' : 'Нет'}</p>
                <p><strong>WebGL:</strong> {typeof window !== 'undefined' && window.WebGLRenderingContext ? 'Да' : 'Нет'}</p>
                <br />
                <p><strong>ПОЛЬЗОВАТЕЛЬ:</strong></p>
                <p><strong>User ID:</strong> {user?.id || 'Неизвестно'}</p>
                <p><strong>Username:</strong> {user?.username || 'Неизвестно'}</p>
                <p><strong>Текущий URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Неизвестно'}</p>
                <p><strong>Время загрузки:</strong> {new Date().toISOString()}</p>
              </div>
              
              <button className={`${styles.copyButton} ${copiedSystemInfo ? styles.copied : ''}`} onClick={copySystemInfo}>
                {copiedSystemInfo ? <Check className={styles.copyIcon} /> : <Copy className={styles.copyIcon} />}
                {copiedSystemInfo ? 'Скопировано' : 'Скопировать'}
              </button>
            </div>
          )}
        </div>

        {/* История платежей */}
        <div className={styles.accordion}>
          <div 
            className={styles.accordionHeader}
            onClick={() => {
              setPaymentsOpen(!paymentsOpen);
              if (!paymentsOpen) loadPayments();
            }}
          >
            <CreditCard className={styles.accordionIcon} />
            <span className={styles.accordionTitle}>Платежи</span>
            {paymentsOpen ? (
              <ChevronUp className={styles.chevronIcon} />
            ) : (
              <ChevronDown className={styles.chevronIcon} />
            )}
          </div>
          
          {paymentsOpen && (
            <div className={styles.accordionContent}>
              {loadingPayments ? (
                <div className={styles.paymentsLoading}>
                  <Clock className={styles.loadingIcon} />
                  <p>Загружаем платежи...</p>
                </div>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className={styles.paymentItem}>
                    <div className={styles.paymentInfo}>
                      <div className={styles.paymentMethod}>{payment.payment_callback.payment_type || 'Платеж'}</div>
                      <div className={styles.paymentDate}>{formatDate(payment.payment_callback.date)}</div>
                    </div>
                    <div className={styles.paymentAmount}>
                      <div className={styles.amount}>{formatAmount(payment.payment_callback.sum, payment.payment_callback.currency)}</div>
                      <div className={styles.status} style={{ color: getStatusColor(payment.payment_callback.payment_status || payment.payment_callback.Status) }}>
                        {getStatusText(payment.payment_callback.payment_status || payment.payment_callback.Status)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.paymentsEmpty}>
                  <CreditCard className={styles.emptyIcon} />
                  <p className={styles.emptyText}>Платежи не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
} 