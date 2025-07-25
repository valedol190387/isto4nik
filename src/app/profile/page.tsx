'use client';

import { useState, useEffect } from 'react';
import { User, MessageCircle, Info, CreditCard, Send, ChevronDown, ChevronUp, Copy, Calendar, ChevronRight, Clock } from 'lucide-react';
import { Page } from '@/components/Page';
import { Payment } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ProfilePage() {


  // Получаем Telegram ID пользователя
  const getTelegramId = () => {
    // В реальном приложении здесь будет Telegram WebApp API
    // return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    return '123456789';
  };

  // Состояние для платежей
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Загрузка истории платежей
  const loadPayments = async () => {
    if (payments.length > 0) return; // Уже загружены
    
    setLoadingPayments(true);
    try {
      const telegramId = getTelegramId();
      const response = await fetch(`/api/payments?telegramId=${telegramId}&limit=10`);
      const data: Payment[] = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

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
  const user = useSignal(initData.user);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [systemInfoOpen, setSystemInfoOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    
    setIsSending(true);
    try {
      // Здесь будет отправка в службу поддержки
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация отправки
      setSupportMessage('');
      alert('Сообщение отправлено в службу поддержки!');
    } catch (error) {
      alert('Ошибка при отправке сообщения');
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

  const copySystemInfo = () => {
    const info = getDetailedSystemInfo();
    
    const systemInfo = `
=== ДИАГНОСТИЧЕСКАЯ ИНФОРМАЦИЯ ===

БАЗОВАЯ ИНФОРМАЦИЯ О СИСТЕМЕ:
Браузер: ${info.userAgent}
Платформа: ${info.platform}
Язык: ${info.language}
Языки: ${info.languages}
Куки включены: ${info.cookieEnabled ? 'Да' : 'Нет'}
Онлайн: ${info.onLine ? 'Да' : 'Нет'}

ЭКРАН И ДИСПЛЕЙ:
Разрешение экрана: ${info.screenWidth}x${info.screenHeight}
Доступное разрешение: ${info.screenAvailWidth}x${info.screenAvailHeight}
Глубина цвета: ${info.screenColorDepth} бит
Пиксельная плотность: ${info.devicePixelRatio}
Ориентация: ${info.screenOrientation}

ОКНО БРАУЗЕРА:
Размер окна: ${info.windowWidth}x${info.windowHeight}
Внешний размер: ${info.windowOuterWidth}x${info.windowOuterHeight}

СЕТЕВОЕ СОЕДИНЕНИЕ:
Тип соединения: ${info.connectionType}
Скорость загрузки: ${info.connectionDownlink} Mbps
RTT: ${info.connectionRtt} ms
Экономия трафика: ${info.connectionSaveData ? 'Да' : 'Нет'}

ПАМЯТЬ (JavaScript):
Используется: ${typeof info.memoryUsedJSHeapSize === 'number' ? Math.round(info.memoryUsedJSHeapSize / 1024 / 1024) + ' MB' : info.memoryUsedJSHeapSize}
Всего доступно: ${typeof info.memoryTotalJSHeapSize === 'number' ? Math.round(info.memoryTotalJSHeapSize / 1024 / 1024) + ' MB' : info.memoryTotalJSHeapSize}
Лимит: ${typeof info.memoryJSHeapSizeLimit === 'number' ? Math.round(info.memoryJSHeapSizeLimit / 1024 / 1024) + ' MB' : info.memoryJSHeapSizeLimit}

ВРЕМЯ И ЛОКАЦИЯ:
Текущее время: ${info.timestamp}
Часовой пояс: ${info.timezone}
Смещение: ${info.timezoneOffset} минут
Текущий URL: ${info.currentUrl}
Источник перехода: ${info.referrer}

TELEGRAM WEBAPP ДЕТАЛИ:
Платформа: ${info.tgPlatform}
Версия: ${info.tgVersion}
Цветовая схема: ${info.tgColorScheme}
Развернуто: ${info.tgIsExpanded}
Высота viewport: ${info.tgViewportHeight}
Стабильная высота: ${info.tgViewportStableHeight}
Цвет заголовка: ${info.tgHeaderColor}
Цвет фона: ${info.tgBackgroundColor}
Подтверждение закрытия: ${info.tgIsClosingConfirmationEnabled}
Вертикальные свайпы: ${info.tgIsVerticalSwipesEnabled}
Init Data: ${info.tgInitData}
${info.tgInitDataUnsafe !== 'Нет' ? 'Init Data (детали): ' + info.tgInitDataUnsafe : ''}
Параметры темы: ${info.tgThemeParams}

SAFE AREA ОТСТУПЫ:
Сверху: ${info.safeAreaTop}
Снизу: ${info.safeAreaBottom}
Слева: ${info.safeAreaLeft}
Справа: ${info.safeAreaRight}

ПОДДЕРЖИВАЕМЫЕ ВОЗМОЖНОСТИ:
Touch поддержка: ${info.touchSupport ? 'Да' : 'Нет'}
WebGL: ${info.webGL ? 'Да' : 'Нет'}
WebGL2: ${info.webGL2 ? 'Да' : 'Нет'}
WebRTC: ${info.webRTC ? 'Да' : 'Нет'}
LocalStorage: ${info.localStorage ? 'Да' : 'Нет'}
SessionStorage: ${info.sessionStorage ? 'Да' : 'Нет'}
IndexedDB: ${info.indexedDB ? 'Да' : 'Нет'}
Service Worker: ${info.serviceWorker ? 'Да' : 'Нет'}
WebAssembly: ${info.webAssembly ? 'Да' : 'Нет'}

=== КОНЕЦ ДИАГНОСТИЧЕСКОЙ ИНФОРМАЦИИ ===
    `.trim();
    
    navigator.clipboard.writeText(systemInfo);
    alert('Расширенная диагностическая информация скопирована!');
  };

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <User className={styles.headerIcon} />
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
                <User className={styles.avatarIcon} />
              )}
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>
                {user.first_name} {user.last_name || ''}
              </h2>
              <div className={styles.userId}>
                <p className={styles.userIdText}>Telegram ID: {user.id}</p>
                <button 
                  className={styles.copyIdButton}
                  onClick={() => {
                    navigator.clipboard.writeText(user.id?.toString() || '');
                    alert('ID скопирован');
                  }}
                >
                  <Copy size={16} />
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
          <h3 className={styles.sectionTitle}>СТАТУС ПОДПИСКИ</h3>
          <div className={styles.subscriptionStatus}>
            <span className={styles.statusBadge}>Неактивна</span>
          </div>
          <div className={styles.subscriptionContent}>
            <p className={styles.subscriptionText}>
              Подписка неактивна. Для получения доступа к материалам обратитесь к боту.
            </p>
            <button className={styles.botButton}>
              Перейти в бот
            </button>
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
                  className={styles.sendButton}
                  onClick={handleSendSupport}
                  disabled={!supportMessage.trim() || isSending}
                >
                  {isSending ? (
                    <>
                      <div className={styles.spinner} />
                      Отправка...
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
                <p><strong>Системная информация:</strong></p>
                <p><strong>Браузер:</strong> {navigator.userAgent}</p>
                <p><strong>Платформа:</strong> {navigator.platform}</p>
                <p><strong>Язык:</strong> {navigator.language}</p>
                <p><strong>Разрешение экрана:</strong> {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Неизвестно'}</p>
                <p><strong>Время:</strong> {new Date().toISOString()}</p>
                <br />
                <p><strong>Telegram WebApp:</strong></p>
                <p><strong>Telegram Platform:</strong> {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.platform || 'Неизвестно'}</p>
                <p><strong>Theme Scheme:</strong> {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.colorScheme || 'Неизвестно'}</p>
                <p><strong>Is Expanded:</strong> {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.isExpanded ? 'Да' : 'Нет'}</p>
                <p><strong>Viewport Height:</strong> {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.viewportHeight || 'Неизвестно'}</p>
                <p><strong>Init Data:</strong> {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData ? 'Присутствует' : 'Нет'}</p>
                <p><strong>Start Param:</strong> {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param || 'Нет'}</p>
                <br />
                <p><strong>User ID:</strong> {user?.id || 'Неизвестно'}</p>
                <p><strong>Username:</strong> {user?.username || 'Неизвестно'}</p>
                <p><strong>Database Status:</strong> Активный</p>
                

                

              </div>
              
              <button className={styles.copyButton} onClick={copySystemInfo}>
                <Copy className={styles.copyIcon} />
                Скопировать
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
                  <p>Загружаем историю платежей...</p>
                </div>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className={styles.paymentItem}>
                    <div className={styles.paymentInfo}>
                      <div className={styles.paymentMethod}>{payment.payment_callback.Description || 'Платеж'}</div>
                      <div className={styles.paymentDate}>{formatDate(payment.payment_callback.DateTime)}</div>
                    </div>
                    <div className={styles.paymentAmount}>
                      <div className={styles.amount}>{formatAmount(payment.payment_callback.Amount, payment.payment_callback.Currency)}</div>
                      <div className={styles.status} style={{ color: getStatusColor(payment.payment_callback.Status) }}>
                        {getStatusText(payment.payment_callback.Status)}
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