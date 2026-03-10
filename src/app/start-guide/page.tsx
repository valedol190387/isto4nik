'use client';

import { useState, useEffect, useCallback } from 'react';
import { Page } from '@/components/Page';
import { ScrollSpacer } from '@/components/ScrollSpacer';
import Image from 'next/image';
import { initData, useSignal, backButton } from '@telegram-apps/sdk-react';
import { getMessengerId } from '@/lib/platform';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// Данные категорий с видео
const categories = [
  {
    id: 'money',
    label: 'Деньги и финансовые потолки',
    emoji: '1️⃣',
    image: '/images/fornews/money.jpg',
    title: 'Почему деньги приходят — и снова уходят?',
    text: 'Иногда кажется, что вы делаете всё правильно:\nработаете, стараетесь, ищете возможности.\nНо деньги будто не задерживаются.\n\nПоявляются долги, потолок в доходе или зависимость от других.\n\nВ этих историях люди рассказывают о своих ситуациях —\nи вместе с Евгением Теребениным ищут причину,\nпочему финансовые сценарии повторяются.\n\nВо время просмотра наблюдайте за собой.\nИногда ответ приходит неожиданно.',
    videos: [
      { id: 'money-1', title: 'Почему дело, которое доставляет удовольствие, не приносит денег?', embedId: 'uJHuNmRqRzDBbkWrLpnQEF' },
      { id: 'money-2', title: 'Почему я в долгах?', embedId: '2sQnoETzKMokZW2aMoYDmD' },
      { id: 'money-3', title: 'Какой я должна быть, чтобы мой муж реализовал себя, обрел силу и уверенность', embedId: '8xa6n9jjiwJvAoFVsJHp2a' },
      { id: 'money-4', title: 'Как выйти из финансовой зависимости от мужа', embedId: 'gYhnkE76Zc8ny6H5oKmLiJ' },
      { id: 'money-5', title: 'Как изменив жизнь, достичь финансового благополучия', embedId: 'm9uBXSZdb5APS5GAu3JMSH' },
    ],
  },
  {
    id: 'husband',
    label: 'Отношения с мужем',
    emoji: '2️⃣',
    image: '/images/fornews/husband.jpg',
    title: 'Почему отношения повторяют один и тот же сценарий?',
    text: 'Иногда партнёры меняются,\nа ощущения остаются прежними.\n\nОдни и те же конфликты.\nОдиночество рядом с человеком.\nСтрах снова ошибиться.\n\nВ этих историях женщины делятся тем,\nчто происходит в их отношениях.\nИ вместе с Евгением ищут ответ:\nчто внутри заставляет выбирать похожие сценарии.',
    videos: [
      { id: 'husband-1', title: 'Развелась, но снова вернулась к мужу, чувствую себя некомфортно', embedId: 'pzLvXQjMc2bL7RQwDzxLsR' },
      { id: 'husband-2', title: 'Развелась девять лет назад и до сих пор не могу построить новые отношения', embedId: 'kQNzTkZsc1jBpYL5JPN6Be' },
      { id: 'husband-3', title: 'Не могу выйти из зависимых отношений', embedId: '8D43i2Z4MYGVeqqfR2MQSo' },
      { id: 'husband-4', title: 'Как восстановиться после тяжелых отношений, в которых мужчина применял насилие', embedId: 'c5v8ATFq8wooQMc2nFp5RK' },
      { id: 'husband-5', title: 'Хочу развязаться со старыми отношениями, вступить в новые, не повторять ошибок', embedId: '4kVD5xW3oAi2uCAx6UCmUw' },
    ],
  },
  {
    id: 'parents',
    label: 'Напряжение с родителями',
    emoji: '3️⃣',
    image: '/images/fornews/parents.jpg',
    title: 'Почему отношения с родителями продолжают влиять на жизнь?',
    text: 'Даже когда мы взрослые,\nвнутренние переживания из детства могут оставаться с нами.\n\nОбида.\nОщущение долга.\nНевысказанные чувства.\n\nИногда именно эти связи\nнезаметно влияют на отношения, выбор партнёров\nи даже на жизненные решения.\n\nПосмотрите истории людей,\nкоторые пытаются разобраться в этих чувствах.',
    videos: [
      { id: 'parents-1', title: 'После рождения ребенка я стала обижаться на родителей', embedId: 'wH9VfYe5XfNVbt9Ehrgdc2' },
      { id: 'parents-2', title: 'Отсутствие отца в моей жизни мешает мне строить отношения', embedId: '3GHM5xbj1eDsgxvhc7hy6m' },
      { id: 'parents-3', title: 'Моя мама закрывалась мной в отношениях с отцом', embedId: '8qSPzh6MX2s2LYBvJDuPwg' },
      { id: 'parents-4', title: 'Моя мама ревнует меня ко всем', embedId: 'aXtVKHxyg9Bgp4LNNMRfJ3' },
      { id: 'parents-5', title: 'Хочу чувствовать любовь к маме, дочери, мужу', embedId: 'eZSxsqEq6QqmpH4xPPY627' },
    ],
  },
  {
    id: 'ceiling',
    label: 'Как пробить финансовый потолок',
    emoji: '4️⃣',
    image: '/images/fornews/ceiling.jpg',
    title: 'Почему доход останавливается на одной цифре?',
    text: 'Бывает ощущение, что вы упираетесь в невидимый потолок.\nДоход растёт — но потом снова возвращается на прежний уровень.\n\nИ сколько бы усилий вы ни прикладывали,\nкартина повторяется.\n\nВ этих историях люди рассказывают,\nкак они столкнулись с финансовыми ограничениями\nи пытаются понять их причину.',
    videos: [
      { id: 'ceiling-1', title: 'Остановилась на определенной цифре в доходах и не могу ее увеличить', embedId: 'tdNebvvdCBQmqer3HLSu29' },
      { id: 'ceiling-2', title: 'Моя кредитная линия всегда открыта', embedId: 'kKY31BA9L3uDdBHh8dhBtx' },
      { id: 'ceiling-3', title: 'Как изменив жизнь, достичь финансового благополучия?', embedId: '5rzpA7JzvJ4D6DMvmAJd76' },
      { id: 'ceiling-4', title: 'Дохожу до определенной суммы в доходах и снова скатываюсь в ноль', embedId: 'tqCSBHQ91fWqBQtsEYCdjL' },
    ],
  },
  {
    id: 'children',
    label: 'Отношения с детьми',
    emoji: '5️⃣',
    image: '/images/fornews/children.jpg',
    title: 'Почему самые сильные чувства возникают рядом с детьми?',
    text: 'Иногда любовь к ребёнку переплетается\nс раздражением, усталостью или чувством вины.\n\nИ это вызывает внутренний конфликт:\nвы хотите быть лучшим родителем, но эмоции берут верх.\n\nВ этих историях родители делятся тем,\nчто происходит внутри них на самом деле.\n\nПосмотрите и наблюдайте за своими ощущениями.',
    videos: [
      { id: 'children-1', title: 'Не подавлять своих детей, быть им мамой', embedId: 'vcAeeXAgbG88s3PfTNBtku' },
      { id: 'children-2', title: 'Не могу смотреть в глаза своим детям', embedId: '3Ls7myAV6Ks2a1AqLNgHfT' },
      { id: 'children-3', title: 'Меня бесят мои дочери!', embedId: '5B2qb1YKqWfBujM76kwvNY' },
      { id: 'children-4', title: 'Меня бесят мои дети, особенно старший сын', embedId: 'aGh6LhzTgjwp3qtGpJLV6H' },
    ],
  },
  {
    id: 'longterm',
    label: 'Долгие отношения — что дальше',
    emoji: '6️⃣',
    image: '/images/fornews/longterm.jpg',
    title: 'Когда вы много лет вместе — что происходит дальше?',
    text: 'Иногда после многих лет отношений возникает ощущение пустоты или усталости.\n\nВроде бы всё есть: семья, дом, общая история.\nНо внутри появляется вопрос:\nчто дальше?\n\nВ этих историях люди рассказывают о своих отношениях,\nкоторые длятся много лет,\nи пытаются понять, что происходит с ними сейчас.',
    videos: [
      { id: 'longterm-1', title: 'Уже 25 лет с мужем. Что дальше?', embedId: 'bndFqWEesAneYcUhNzabRq' },
      { id: 'longterm-2', title: 'Хочу возродить отношения с мужем', embedId: '9ZAssbMg7JXggPYiQkqCSy' },
      { id: 'longterm-3', title: 'Хочу наладить отношения с мужем', embedId: '3k7bXqhXKirXqsRqSJwUxp' },
      { id: 'longterm-4', title: '15 лет вместе с мужем: во мне что-то сломалось', embedId: '8W522ErAiMByHu5HhcZSFT' },
    ],
  },
];

// Все видео ID для подсчёта прогресса
const ALL_VIDEO_IDS = categories.flatMap(c => c.videos.map(v => v.id));
const MAX_FREE_DAYS = 14;

// Карточки преимуществ для блока "Про Источник"
const benefits = [
  { title: 'Дыхание, а не зубрежка', text: 'Изменения встраиваются в ваш ритм жизни. Не нужно выделять время на «уроки» — практика становится частью вашего дня' },
  { title: 'Круг поддержки 24/7', text: 'Прямой доступ к общению с Евгением и Еленой. Задавайте вопросы и получайте ответы напрямую от авторов метода' },
  { title: 'Проверенные методики', text: 'Авторские подходы, подтвержденные 15 000+ реальных историй' },
  { title: 'Среда для роста', text: 'Постоянное развитие без необходимости «заставлять себя»' },
  { title: 'Систематизация', text: 'Все материалы организованы для вашего удобства' },
  { title: 'Безопасное пространство', text: 'Можно быть собой, без страха осуждения' },
];

export default function StartGuidePage() {
  // screen: 1, 2, 3, 'category-{id}', 'about'
  const [screen, setScreen] = useState<string | number>(1);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);

  // Форма поддержки
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const user = useSignal(initData.user);
  const router = useRouter();

  // Управление нативной кнопкой «назад» Telegram
  useEffect(() => {
    if (backButton.show.isAvailable()) {
      if (screen !== 1) {
        backButton.show();
      } else {
        backButton.hide();
      }
    }
  }, [screen]);

  useEffect(() => {
    if (backButton.onClick.isAvailable()) {
      return backButton.onClick(() => {
        if (screen === 1) {
          router.back();
        } else {
          window.history.back();
        }
      });
    }
  }, [screen, router]);

  // Загружаем прогресс из localStorage
  const [screensVisited, setScreensVisited] = useState<Set<string>>(new Set(['screen-1']));

  useEffect(() => {
    try {
      const saved = localStorage.getItem('start_guide_watched');
      if (saved) {
        setWatchedVideos(new Set(JSON.parse(saved)));
      }
      const savedScreens = localStorage.getItem('start_guide_screens');
      if (savedScreens) {
        setScreensVisited(new Set(JSON.parse(savedScreens)));
      }
    } catch {}
  }, []);

  // Отправка аналитики в БД
  const sendAnalytics = useCallback((currentScreen: string, videos: Set<string>, screens: Set<string>) => {
    const telegramId = user?.id?.toString() || getMessengerId() || '0';
    if (telegramId === '0') return;

    fetch('/api/funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegram_id: telegramId,
        current_screen: currentScreen,
        screens_visited: [...screens],
        videos_watched: [...videos],
        completed: currentScreen === 'about',
      }),
    }).catch(() => {});
  }, [user]);

  // Сохраняем прогресс
  const saveProgress = useCallback((newSet: Set<string>) => {
    setWatchedVideos(newSet);
    try {
      localStorage.setItem('start_guide_watched', JSON.stringify([...newSet]));
    } catch {}
  }, []);

  // Отметить видео просмотренным (по клику)
  const markWatched = useCallback((videoId: string) => {
    setWatchedVideos(prev => {
      if (prev.has(videoId)) return prev;
      const newSet = new Set(prev);
      newSet.add(videoId);
      saveProgress(newSet);
      // Отправляем аналитику с обновлённым списком видео
      const screenKey = typeof screen === 'number' ? `screen-${screen}` : screen as string;
      sendAnalytics(screenKey, newSet, screensVisited);
      return newSet;
    });
  }, [saveProgress, screen, sendAnalytics, screensVisited]);

  // Переключение видео (аккордеон)
  const toggleVideo = useCallback((videoId: string) => {
    markWatched(videoId);
    setOpenVideoId(prev => prev === videoId ? null : videoId);
  }, [markWatched]);

  const watchedCount = Math.min(watchedVideos.size, MAX_FREE_DAYS);
  const progressPercent = (watchedCount / MAX_FREE_DAYS) * 100;

  // Отправка вопроса на вебхук
  const handleSendSupport = useCallback(async () => {
    if (!supportMessage.trim()) return;
    setIsSending(true);
    try {
      const telegramId = user?.id?.toString() || getMessengerId() || '0';
      const userInfo = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Воронка';
      const res = await fetch('https://n8n.istochnikbackoffice.ru/webhook/zabota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: supportMessage,
          raw_message: supportMessage,
          telegram_id: telegramId,
          user_name: userInfo,
          source: 'start-guide',
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSupportMessage('');
        setMessageSent(true);
        setTimeout(() => setMessageSent(false), 2500);
      }
    } catch (err) {
      console.error('Support send error:', err);
    } finally {
      setIsSending(false);
    }
  }, [supportMessage, user]);

  // Навигация с поддержкой кнопки «назад» браузера / Telegram
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0 });
    document.documentElement.scrollTo({ top: 0 });
    document.body.scrollTo({ top: 0 });
    const mobileWrap = document.querySelector('.mobile-wrap');
    if (mobileWrap) mobileWrap.scrollTo({ top: 0 });
  }, []);

  const goToScreen = useCallback((s: string | number) => {
    const screenKey = typeof s === 'number' ? `screen-${s}` : s;
    setScreen(s);
    setOpenVideoId(null);
    scrollToTop();
    window.history.pushState({ screen: s }, '');

    // Трекаем посещённый экран
    setScreensVisited(prev => {
      const newSet = new Set(prev);
      newSet.add(screenKey);
      try { localStorage.setItem('start_guide_screens', JSON.stringify([...newSet])); } catch {}
      // Отправляем аналитику
      sendAnalytics(screenKey, watchedVideos, newSet);
      return newSet;
    });
  }, [scrollToTop, sendAnalytics, watchedVideos]);

  // Перехватываем popstate (нативная кнопка «назад»)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen !== undefined) {
        setScreen(e.state.screen);
        setOpenVideoId(null);
        scrollToTop();
      }
    };

    // Начальный state
    window.history.replaceState({ screen: 1 }, '');

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const allWatched = watchedCount >= MAX_FREE_DAYS;

  // Рендер прогресс-бара
  const renderProgressBar = () => (
    <div className={styles.progressSection}>
      <div className={styles.progressHeader}>
        <span className={styles.progressStar}>⭐️</span>
        <span className={styles.progressLabel}>
          {allWatched
            ? 'Все ролики просмотрены! Вам доступна подписка на 30 дней за 450 рублей вместо 1 800 рублей'
            : 'Посмотрите все 14 роликов — и получите 30 дней подписки за 450 рублей вместо 1 800 рублей'
          }
        </span>
      </div>
      <div className={styles.progressBarTrack}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className={styles.progressCount}>
        {watchedCount} из {MAX_FREE_DAYS} роликов
      </div>
    </div>
  );

  // Рендер нижних кнопок (общих для категорий и "Про Источник")
  const renderBottomButtons = (options: { showOffer?: boolean; hideAbout?: boolean } = {}) => (
    <div className={styles.bottomButtons}>
      {/* Оффер — всегда сверху */}
      <div className={styles.offerBlock}>
        <div className={allWatched ? styles.offerLabelBonus : styles.offerLabel}>
          {allWatched ? '30 дней за 450 рублей' : '14 дней за 1 800 рублей'}
        </div>
        <a
          href={allWatched
            ? 'https://t.me/istochnik_clubbot?start=fromnewonboardallvideodone'
            : 'https://t.me/istochnik_clubbot?start=fromnewonboarding'
          }
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.primaryButton} ${allWatched ? styles.primaryButtonBonus : ''}`}
        >
          Получить доступ
        </a>
      </div>

      {!options.hideAbout && (
        <a
          href="#"
          className={styles.secondaryButton}
          onClick={(e) => { e.preventDefault(); goToScreen('about'); }}
        >
          Узнать подробнее про Источник
        </a>
      )}

      {/* Выпадашка «Остались вопросы?» */}
      <div className={styles.supportBlock}>
        <button
          className={styles.supportToggle}
          onClick={() => setSupportOpen(!supportOpen)}
        >
          <span>Остались вопросы?</span>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: supportOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {supportOpen && (
          <div className={styles.supportBody}>
            <textarea
              className={styles.supportTextarea}
              placeholder="Опишите вашу проблему или задайте вопрос..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              rows={3}
            />
            <button
              className={`${styles.supportSendBtn} ${messageSent ? styles.supportSent : ''}`}
              onClick={handleSendSupport}
              disabled={!supportMessage.trim() || isSending || messageSent}
            >
              {isSending ? 'Отправка...' : messageSent ? '✓ Отправлено' : 'Отправить'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Рендер текста с переносами строк
  const renderText = (text: string) =>
    text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));

  // Показывать кнопку назад на всех экранах кроме первого
  const showBack = screen !== 1;

  // Обработчик кнопки назад — возвращаемся на предыдущий экран через history
  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <Page back={false}>
      {/* Своя кнопка назад для экранов 2+ */}
      {showBack && (
        <button
          className="ui-back-button"
          onClick={handleBack}
          aria-label="Назад"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className={styles.container}>

        {/* ===== ЭКРАН 1: Вступление ===== */}
        {screen === 1 && (
          <div className={styles.screen}>
            <div className={styles.heroImageContainer}>
              <Image
                src="/images/fornews/mainpic.jpg"
                alt="Евгений Теребенин"
                fill
                className={styles.heroImage}
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 600px, 800px"
                priority
              />
            </div>

            <h1 className={styles.title}>
              Почему в жизни повторяются одни и те же сценарии?
            </h1>

            <div className={styles.textBlock}>
              <p className={styles.text}>
                Иногда мы меняем людей, работу, города.
                <br />Но сценарий жизни остается тем же.
              </p>
              <p className={styles.text}>
                Я, <strong>Евгений Теребенин</strong>, предлагаю простой формат:
                <br />посмотреть реальные жизненные истории и наблюдать за собой.
              </p>
              <div className={styles.bulletList}>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>Что вы почувствуете</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>О чем вспомните</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>Где в теле откликнется</span>
                </div>
              </div>
              <p className={styles.textAccent}>
                Именно в такие моменты часто происходят внутренние озарения.
              </p>
            </div>

            <button
              className={styles.primaryButton}
              onClick={() => goToScreen(2)}
            >
              Начать
            </button>
          </div>
        )}

        {/* ===== ЭКРАН 2: Видео-объяснение ===== */}
        {screen === 2 && (
          <div className={styles.screenPadded}>
            <h1 className={styles.title}>Как работает самотерапия?</h1>

            <div className={styles.videoEmbed}>
              <iframe
                src="https://kinescope.io/embed/pZdXTyQ4gWHvDGVWS3vm5g"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
                frameBorder="0"
                allowFullScreen
              />
            </div>

            <div className={styles.textBlock}>
              <p className={styles.text}>
                Посмотрите короткое объяснение от Евгения Теребенина.
              </p>
              <p className={styles.text}>Он расскажет:</p>
              <div className={styles.bulletList}>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>как правильно смотреть ролики</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>на что обращать внимание</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>почему это может менять ваше состояние</span>
                </div>
              </div>

              <div className={styles.hintBox}>
                <p className={styles.hintText}>
                  📌 <strong>Важно:</strong> не просто слушайте — наблюдайте за собой.
                </p>
              </div>
            </div>

            <button
              className={styles.primaryButton}
              onClick={() => goToScreen(3)}
            >
              Понятно, хочу попробовать
            </button>
          </div>
        )}

        {/* ===== ЭКРАН 3: Выбор ситуации ===== */}
        {screen === 3 && (
          <div className={styles.screenPadded}>
            <h1 className={styles.title}>Выберите жизненную ситуацию</h1>

            <div className={styles.textBlock}>
              <p className={styles.text}>
                Ниже — реальные истории людей.
                <br />Какая ситуация сейчас ближе всего?
              </p>
              <p className={styles.text}>
                Во время просмотра:
              </p>
              <div className={styles.bulletList}>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>наблюдайте свои чувства</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>вспоминайте похожие ситуации</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletDot} />
                  <span>замечайте мысли и реакции</span>
                </div>
              </div>
              <p className={styles.textAccent}>
                Иногда одна история может показать ответ на ваш вопрос.
              </p>
            </div>

            {/* Кнопки категорий */}
            <div className={styles.categoryList}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={styles.categoryButton}
                  onClick={() => goToScreen(`category-${cat.id}`)}
                >
                  <span className={styles.categoryEmoji}>{cat.emoji}</span>
                  <span className={styles.categoryLabel}>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Прогресс-бар */}
            {renderProgressBar()}

            {/* Нижние кнопки */}
            {renderBottomButtons()}
          </div>
        )}

        {/* ===== ЭКРАНЫ КАТЕГОРИЙ ===== */}
        {categories.map((cat) =>
          screen === `category-${cat.id}` ? (
            <div key={cat.id} className={styles.screen}>
              {/* Картинка категории */}
              <div className={styles.categoryImageContainer}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className={styles.categoryImage}
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 600px, 800px"
                  priority
                />
              </div>

              <h1 className={styles.title}>{cat.title}</h1>

              <div className={styles.textBlock}>
                <p className={styles.text}>{renderText(cat.text)}</p>
              </div>

              {/* Видео-блоки (аккордеон) */}
              <div className={styles.videoList}>
                {cat.videos.map((video) => (
                  <div key={video.id} className={styles.videoBlock}>
                    <button
                      className={`${styles.videoTrigger} ${openVideoId === video.id ? styles.videoTriggerActive : ''} ${watchedVideos.has(video.id) ? styles.videoTriggerWatched : ''}`}
                      onClick={() => toggleVideo(video.id)}
                    >
                      <span className={styles.videoTriggerText}>{video.title}</span>
                      <span className={styles.videoTriggerIcon}>
                        {openVideoId === video.id ? '▲' : '▶'}
                      </span>
                    </button>

                    {openVideoId === video.id && (
                      <div className={styles.videoEmbed}>
                        <iframe
                          src={`https://kinescope.io/embed/${video.embedId}`}
                          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
                          frameBorder="0"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Прогресс */}
              {renderProgressBar()}

              {/* Кнопки */}
              {renderBottomButtons({ showOffer: true })}
            </div>
          ) : null
        )}

        {/* ===== ЭКРАН "ПРО ИСТОЧНИК" ===== */}
        {screen === 'about' && (
          <div className={styles.screenPadded}>
            {/* Видео */}
            <div className={styles.videoEmbed}>
              <iframe
                src="https://kinescope.io/embed/hhnS6WcvbfVCasg1ornwmh"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
                frameBorder="0"
                allowFullScreen
              />
            </div>

            <p className={styles.textSmall}>
              <strong>Евгений Теребенин</strong>, психолог, автор метода «Терапия Души»
            </p>

            {/* Прогресс */}
            <div className={styles.aboutProgressLabel}>Ваш прогресс</div>
            {renderProgressBar()}

            {/* Описание */}
            <h1 className={styles.title}>
              Что такое сообщество «Источник»
            </h1>

            <div className={styles.textBlock}>
              <p className={styles.text}>
                «Источник» — это живая система, которая меняет жизнь изнутри.
              </p>
              <p className={styles.text}>
                Ежедневная практика, окружение единомышленников и прямой диалог с теми, кто уже прошел этот путь.
              </p>
            </div>

            {/* Карточки преимуществ */}
            <h2 className={styles.subtitle}>Что вас ждет внутри:</h2>

            <div className={styles.benefitsGrid}>
              {benefits.map((b, i) => (
                <div key={i} className={styles.benefitCard}>
                  <h3 className={styles.benefitTitle}>{b.title}</h3>
                  <p className={styles.benefitText}>{b.text}</p>
                </div>
              ))}
            </div>

            {/* Подключение */}
            <h2 className={styles.subtitle}>Как подключиться к сообществу?</h2>

            <div className={styles.textBlock}>
              <p className={styles.text}>
                Предлагаем вам «заглянуть» в Источник в формате пробного периода.
              </p>
              <p className={styles.textAccent}>
                {allWatched
                  ? 'Вы посмотрели все ролики! Подписка на 30 дней — 450 рублей вместо 1 800 рублей.'
                  : 'Подписка — 1 800 рублей/мес. Посмотрите все 14 роликов и получите 30 дней за 450 рублей!'
                }
              </p>
            </div>

            {renderBottomButtons({ showOffer: true, hideAbout: true })}
          </div>
        )}
      </div>

      <ScrollSpacer />
    </Page>
  );
}
