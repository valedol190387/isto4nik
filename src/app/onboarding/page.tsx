'use client';

import { Page } from '@/components/Page';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { getMessengerId } from '@/lib/platform';
import styles from './page.module.css';

// ===== STORAGE =====
const STORAGE_KEY_STEP = 'onboarding_step';
const STORAGE_KEY_ANSWERS = 'onboarding_answers';

// ===== QUIZ =====
const questions = [
  {
    label: '1/5',
    title: 'Что для вас сейчас главное?',
    options: [
      'Внутренняя опора и состояние',
      'Разобраться со сливом денег',
      'Отношения',
      'Сложный выбор / тупик',
      'Пока не могу сформулировать',
    ],
  },
  {
    label: '2/5',
    title: 'Где сейчас ощущается наибольшая нестабильность?',
    options: [
      'Деньги / доход',
      'Отношения',
      'Я сам(а): тревога, усталость, потеря смысла',
      'Будущее / неопределённость',
      'Всё сразу',
    ],
  },
  {
    label: '3/5',
    title: 'Что вы хотите получить в «Источнике»?',
    options: [
      'Понять, что со мной происходит',
      'Получить ответы и ясность',
      'Поддержку и ощущение, что я не один(а)',
      'Структуру и ориентиры',
      'Просто быть в правильном пространстве',
    ],
  },
  {
    label: '4/5',
    title: 'Как вам комфортнее взаимодействовать?',
    options: [
      'Читать и смотреть, без активного участия',
      'Иногда писать и задавать вопросы',
      'Быть в диалоге, участвовать в обсуждениях',
      'Пока не знаю',
    ],
  },
  {
    label: '5/5',
    title: 'Какой путь предпочтительнее?',
    options: [
      'Быстро разобраться с текущей ситуацией',
      'Постепенные внутренние изменения',
      'Долгий путь и глубину',
    ],
  },
];

// ===== ПЕРСОНАЛЬНЫЕ ТЕКСТЫ (по 1-му вопросу) =====
const personalTexts = [
  {
    paragraphs: [
      'Сейчас вы, скорее всего, живёте в напряжении. Много держите внутри, справляетесь сами, но ощущение устойчивости всё равно ускользает. Может быть тревожно, пусто или просто «тяжело без причины».',
      'Мы постепенно разберёмся, что именно **забирает вашу энергию** и почему нет внутренней опоры.',
      'Вы сможете понять, как обрести спокойствие, ясность и ощущение «устойчивости» на ногах.',
    ],
  },
  {
    paragraphs: [
      'Сейчас может быть ощущение, что вы стараетесь, делаете многое правильно, но деньги всё равно утекают или не растут так, как хотелось бы.',
      'Это злит, выматывает и заставляет сильнее контролировать всё вокруг.',
      'Скоро вы начнёте видеть, куда именно уходят ресурсы и какие внутренние сценарии управляют деньгами.',
      'Вы сможете понять, почему деньги ведут себя именно так, и что нужно изменить внутри, чтобы доход перестал «сливаться», а начал стабилизироваться.',
    ],
  },
  {
    paragraphs: [
      'Сейчас вы можете замечать, что в отношениях снова повторяются одни и те же сценарии.',
      'Близость даётся сложно, появляются обиды, ожидания или ощущение, что тебя не слышат и не выбирают.',
      'Скоро вы начнёте видеть, **откуда берутся эти сценарии и почему они включаются.**',
      'У вас появится больше ясности в отношениях, спокойствия внутри и понимания, как выходить из повторяющихся кругов и строить контакт по-другому.',
    ],
  },
  {
    paragraphs: [
      'Сейчас у вас может быть ощущение тупика. Старые ориентиры больше не работают, а новых пока нет — и непонятно, куда идти и на что опираться.',
      'В ближайшее время вы начнёте складывать общую картину происходящего: что сейчас происходит, почему это состояние возникло и как устроены эти периоды в жизни человека.',
      'У вас появится больше ясности, понимание своего этапа и ощущение, что снова видите направление, а не просто стоите на месте.',
    ],
  },
  {
    paragraphs: [
      'Сейчас вы не можете сформулировать запрос — это не проблема, а точка входа.',
      'Чаще всего за этим стоит не «пустота», а перегрузка и потеря ориентира.',
      'Давайте я помогу:\n— погружаться в материалы, которые собирают мышление;\n— осознавать «почему я оказался именно в этом состоянии»;\n— замечать, где теряется энергия и смысл.',
      'По итогу у вас появится понимание «кто я сейчас и куда нужно идти». И с этого начинается движение.',
    ],
  },
];

// ===== ТИПЫ ЭКРАНОВ =====
type ScreenMaterial = {
  key: string;
  type: 'material';
  paragraphs: string[];
  buttonText: string;
  materialId: number;
  doneText?: string;
  image?: string;
};

type ScreenLinks = {
  key: string;
  type: 'links';
  paragraphs: string[];
  links: { label: string; url: string }[];
  doneText?: string;
  image?: string;
};

type ScreenFinal = {
  key: string;
  type: 'final';
  paragraphs: string[];
  buttonText: string;
  image?: string;
};

type OnboardingScreen = ScreenMaterial | ScreenLinks | ScreenFinal;

// ===== ОБЩИЕ УРОКИ (для всех, после квиза) =====
const commonLessons: OnboardingScreen[] = [
  {
    key: 'lesson-umich-1',
    type: 'material',
    paragraphs: [
      'Начнём с фундамента.',
      'За это время «Источник» регулярно пополнялся огромным количеством материалов, и это нормально, если сейчас непонятно, с чего начинать.',
      'Поэтому у нас есть точка входа, с которой начинают все — курс **«Устройство Мира и Человека»**.',
      'Вы научитесь разбираться в устройстве человека, сознания, памяти, восприятия и бессознательного.',
      'Время просмотра ~ 1 час 30 минут.',
    ],
    buttonText: 'Устройство Мира и Человека — 1 часть',
    materialId: 47,
    doneText: 'Посмотрел',
    image: '/images/onboarding/photo_4_2026-02-26_10-04-11.jpg',
  },
  {
    key: 'lesson-umich-2',
    type: 'material',
    paragraphs: [
      'Ну как вы сейчас?',
      'Чуть больше ясности или, наоборот, появилось больше вопросов?',
      'Это нормально, когда человек впервые сталкивается с реальной картиной себя и мира, обычно возникает странное чувство: «Как будто многое встало на место — и одновременно стало неуютно».',
      'Давайте продолжим, впереди ещё 4 части.',
      'Время просмотра ~ 1 час 20 минут.',
    ],
    buttonText: 'Устройство Мира и Человека — 2 часть',
    materialId: 48,
    doneText: 'Посмотрел',
    image: '/images/onboarding/photo_7_2026-02-26_10-04-11.jpg',
  },
  {
    key: 'lesson-questions-format',
    type: 'links',
    paragraphs: [
      'Отлично, вы большая(ой) молодец!',
      'Теперь познакомимся со следующим форматом в нашем сообществе — это **разборы вопросов участников**.',
      'Каждую неделю по понедельникам Евгений собирает вопросы и во вторник отвечает минимум на 3 интересных вопроса!',
      'Вот несколько глубоких ответов, послушайте.',
    ],
    links: [
      { label: 'Про энергию', url: 'https://t.me/c/2580260729/254' },
      { label: 'Про негатив', url: 'https://t.me/c/2580260729/347' },
      { label: 'Не усваивается информация', url: 'https://t.me/c/2580260729/383' },
    ],
    doneText: 'Изучил',
    image: '/images/onboarding/photo_5_2026-02-26_10-04-11.jpg',
  },
  {
    key: 'lesson-umich-3',
    type: 'material',
    paragraphs: [
      'Хорошо, вы познакомились с ещё одним форматом сообщества «Источник»!',
      'Давайте вернёмся к курсу **«Устройство Мира и Человека»**, ведь нам ещё смотреть 3 урока.',
      'Время просмотра ~ 1 час 20 минут.',
    ],
    buttonText: 'Устройство Мира и Человека — 3 часть',
    materialId: 58,
    doneText: 'Посмотрел',
  },
  {
    key: 'lesson-podcast-elena',
    type: 'links',
    paragraphs: [
      'Как вы помните, наше сообщество Евгения и Елены Теребениных, и я это к тому, что Елена так же принимает активное участие в жизни «Источника».',
      'Делится своими инсайтами, жизненным опытом и мировоззрением.',
      'Недавно Лена провела разговор с Юлией Игнатовой, автором подкаста **«Девочка. Девушка. Женщина»**.',
      'Послушайте, подкаст состоит из 2-х частей, в среднем по 40 минут.',
    ],
    links: [
      { label: '1 часть', url: 'https://t.me/c/2580260729/265' },
      { label: '2 часть', url: 'https://t.me/c/2580260729/266' },
    ],
    doneText: 'Изучил',
    image: '/images/onboarding/838A2106.JPG',
  },
  {
    key: 'lesson-umich-4',
    type: 'material',
    paragraphs: [
      'Надеюсь, вы поймали наш заряд и воспользуетесь несколькими жизненными принципами.',
      'А пока давайте продолжим погружаться в материал курса **«Устройство Мира и Человека»**.',
      'Осталось ещё 2 части.',
      'Время просмотра ~ 1 час.',
    ],
    buttonText: 'Устройство Мира и Человека — 4 часть',
    materialId: 61,
    doneText: 'Посмотрел',
  },
  {
    key: 'lesson-umich-5',
    type: 'material',
    paragraphs: [
      'В финальной части курса разбираем понятие «слайд», говорим о человеке как системе и её поломках.',
      'А ещё обсуждаем:\n— Уровни взаимодействия в системе «Человек»,\n— Динамики,\n— Ресурсы и Круг Аристотеля.',
      'И ещё раз выполняем практику осознанности.',
      'Время просмотра ~ 1 час 40 минут.',
    ],
    buttonText: 'Устройство Мира и Человека — 5 часть',
    materialId: 69,
    doneText: 'Посмотрел',
  },
  {
    key: 'lesson-zoom',
    type: 'material',
    paragraphs: [
      'В завершении знакомства с сообществом предлагаем посмотреть запись Zoom-эфира с Евгением — **«Разговор у Источника»**.',
      'В данном формате мы 1 раз в месяц проводим живой эфир с разбором всех вопросов месяца (в среднем Евгений успевает ответить на 50–60 вопросов).',
      'Каждый месяц мы уделяем одной основной теме и работаем только в этом направлении. Каждый месяц — тема меняется.',
      'Давайте посмотрим, как всё устроено.',
      'Время просмотра ~ 2 часа.',
    ],
    buttonText: 'Разговор у Источника 28.01.2026',
    materialId: 163,
    doneText: 'Посмотрел',
  },
];

// ===== ВЕТВЯЩИЕСЯ ЭКРАНЫ (по 1-му вопросу, после общих уроков) =====

// Ответ 0: Опора → Изоляция (3 части)
// TODO: заменить materialId на реальные ID из БД
const branchOpera: OnboardingScreen[] = [
  {
    key: 'branch-opora-intro',
    type: 'material',
    paragraphs: [
      'Итак, вы сделали первые шаги и поняли, как устроен «Источник».',
      'Теперь можно идти глубже — не во всё сразу, а туда, где сейчас ваш реальный запрос.',
      'Дальше вас ждёт курс **«Изоляция»**.',
      'Вы разберётесь:\n— почему иногда мы отдаляемся от Мира\n— как вернуть контакт с собой и другими\n— и как выйти из замкнутого круга одиночества, тревоги и социальной изоляции.',
      'Информация будет полезна тем, кто хочет быть проявленным, живым и профессионально развиваться.',
      'Курс состоит из 3 частей, общее время просмотра 37 минут.',
    ],
    buttonText: 'Изоляция',
    materialId: 11,
    doneText: 'Посмотрел',
  },
];

// Ответ 1: Деньги → Анатомия сливов (8 частей)
const branchMoney: OnboardingScreen[] = [
  {
    key: 'branch-money-intro',
    type: 'links',
    paragraphs: [
      'Итак, вы сделали первые шаги и поняли, как устроен «Источник».',
      'Теперь можно идти глубже — не во всё сразу, а туда, где сейчас ваш реальный запрос.',
      'Дальше вас ждёт курс **«Анатомия сливов»**.',
      '**«Анатомия сливов»** поможет понять, куда уходят ваша энергия и деньги, а также научиться эффективно ими управлять.',
      '«Сливы» — это утечки энергии, которые происходят из-за внешних или внутренних причин. Они могут быть связаны с семейными программами, травмами или негативным окружением.',
      'Что даст курс?\n— Понимание законов работы денег и энергии,\n— Погружение в причины возникновения долгов и финансовых проблем,\n— Разбор ограничений, которые не дают увеличить доход,\n— Знакомство с технологией работы со «сливами» и подавлениями.',
      'Курс состоит из 8 частей, общее время просмотра ~ 13 часов.',
    ],
    links: [
      { label: 'Анатомия сливов — 1 часть', url: '/materials/109' },
      { label: 'Анатомия сливов — 2 часть', url: '/materials/121' },
      { label: 'Анатомия сливов — 3 часть', url: '/materials/122' },
      { label: 'Анатомия сливов — 4 часть', url: '/materials/123' },
      { label: 'Анатомия сливов — 5 часть', url: '/materials/128' },
      { label: 'Анатомия сливов — 6 часть', url: '/materials/129' },
      { label: 'Анатомия сливов — 7 часть', url: '/materials/130' },
      { label: 'Анатомия сливов — 8 часть', url: '/materials/134' },
    ],
    doneText: 'Изучил',
  },
];

// Ответ 2: Отношения → Родовая система (7 частей)
const branchRelations: OnboardingScreen[] = [
  {
    key: 'branch-relations-intro',
    type: 'links',
    paragraphs: [
      'Итак, вы сделали первые шаги и поняли, как устроен «Источник».',
      'Теперь можно идти глубже — не во всё сразу, а туда, где сейчас ваш реальный запрос.',
      'Дальше вас ждёт курс **«Родовая система»**.',
      '**«Родовая система»** — уникальный курс, который позволит вам глубже понять устройство родовых связей и их влияние на жизнь. Этот курс для вас, если вы повторяете судьбу родителей или кого-то из родственников, а проблемы повторяются, как бы вы ни старались их решить.',
      'Что даст курс?\n— Понимание устройства рода и его влияния на судьбу,\n— Возможность проработать травмы внутреннего ребёнка и наладить взаимоотношения дома,\n— Изучение психологической наследственности и способов работы,\n— Получение новых знаний, как другие системы влияют на структуру рода.',
      'Курс состоит из 7 частей, общее время просмотра ~ 7 часов.',
    ],
    links: [
      { label: 'Родовая система — 1 часть', url: '/materials/83' },
      { label: 'Родовая система — 2 часть', url: '/materials/84' },
      { label: 'Родовая система — 3 часть', url: '/materials/86' },
      { label: 'Родовая система — 4 часть', url: '/materials/93' },
      { label: 'Родовая система — 5 часть', url: '/materials/94' },
      { label: 'Родовая система — 6 часть', url: '/materials/97' },
      { label: 'Родовая система — 7 часть', url: '/materials/102' },
    ],
    doneText: 'Изучил',
  },
];

// Финальный экран (для всех)
const finishScreen: OnboardingScreen = {
  key: 'finish',
  type: 'final',
  image: '/images/onboarding/photo_2_2026-02-26_10-04-11.jpg',
  paragraphs: [
    'Вы завершили первое знакомство с сообществом и поняли, как оно устроено.',
    'Теперь вы можете сами выбирать, что делать в «Источнике»:\n— заходить в основной канал и смотреть то, что откликается сейчас\n— пользоваться библиотекой и мини-приложением, возвращаясь к нужным темам\n— задавать свои вопросы в чате и слушать ответы Евгения\n— делиться инсайтами, наблюдениями, поддерживать других участников',
    'Здесь не требуется активность «по расписанию».\nМожно молчать. Можно говорить. Можно приходить и уходить — в своём ритме.\n«Источник» — живое пространство.',
    'Мы регулярно наполняем его новыми смыслами, разговорами, разборами и темами, которые откликаются на то, что происходит с людьми здесь и сейчас.\nВы на своём месте.',
    'Если нужна помощь или остались вопросы — всегда можно обратиться в отдел заботы, мы на связи.',
  ],
  buttonText: 'Завершить обучение',
};

// Собираем полный путь экранов в зависимости от ответа на 1-й вопрос
function buildLessonPath(firstAnswer: number): OnboardingScreen[] {
  const path = [...commonLessons];

  switch (firstAnswer) {
    case 0: // Опора → Изоляция → Финиш
      path.push(...branchOpera, finishScreen);
      break;
    case 1: // Деньги → Анатомия сливов → Финиш
      path.push(...branchMoney, finishScreen);
      break;
    case 2: // Отношения → Родовая система → Финиш
      path.push(...branchRelations, finishScreen);
      break;
    case 3: // Тупик → сразу Финиш
    case 4: // Не могу сформулировать → сразу Финиш
    default:
      path.push(finishScreen);
      break;
  }

  return path;
}

// ===== STEP MAPPING =====
const STEP_WELCOME = 0;
const STEP_INTRO = 1;
const STEP_QUESTIONS_START = 2;
const STEP_DONE = questions.length + STEP_QUESTIONS_START; // 7
const STEP_PERSONAL = STEP_DONE + 1; // 8
const STEP_LESSONS_START = STEP_PERSONAL + 1; // 9

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

// Хелпер для рендера motion-обёртки (вынесен из компонента, чтобы React не пересоздавал)
function MotionScreen({ children, direction, className, onDone }: { children: React.ReactNode; direction: number; className: string; onDone?: () => void }) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={className}
      onAnimationComplete={(def) => { if (def === 'center' && onDone) onDone(); }}
    >
      {children}
    </motion.div>
  );
}

// Рендер текста с **жирным** и \n
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const lines = part.split('\n');
    if (lines.length === 1) return <span key={i}>{part}</span>;
    return (
      <span key={i}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {line}
          </span>
        ))}
      </span>
    );
  });
}

export default function OnboardingPage() {
  const router = useRouter();
  const user = useSignal(initData.user);
  const [step, setStep] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const getTelegramId = (): number => {
    const id = user?.id || parseInt(getMessengerId() || '0', 10);
    return id || 0;
  };

  // Отправка прогресса на сервер (upsert по telegram_id)
  const syncProgress = useCallback(async (newStep: number, newAnswers: Record<number, number>, isCompleted = false, isSkipped = false) => {
    const telegramId = user?.id || parseInt(getMessengerId() || '0', 10) || 0;
    if (!telegramId) return;

    try {
      const maxStep = Math.max(newStep, parseInt(localStorage.getItem(STORAGE_KEY_STEP) || '0', 10));
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          current_step: newStep,
          max_step: maxStep,
          answers: newAnswers,
          completed: isCompleted,
          skipped: isSkipped,
        }),
      });
    } catch (err) {
      console.error('Failed to sync onboarding progress:', err);
    }
  }, [user?.id]);

  // Загрузка прогресса
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem(STORAGE_KEY_STEP);
      const savedAnswers = localStorage.getItem(STORAGE_KEY_ANSWERS);
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      setStep(savedStep !== null ? parseInt(savedStep, 10) : STEP_WELCOME);
    } catch {
      setStep(STEP_WELCOME);
    }
  }, []);

  const saveProgress = useCallback((newStep: number, newAnswers?: Record<number, number>) => {
    try {
      localStorage.setItem(STORAGE_KEY_STEP, String(newStep));
      if (newAnswers) localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(newAnswers));
    } catch {}
  }, []);

  const goTo = useCallback((newStep: number, currentAnswers?: Record<number, number>) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    setStep(newStep);
    saveProgress(newStep);
    syncProgress(newStep, currentAnswers || answers);
  }, [saveProgress, syncProgress, isAnimating, answers]);

  const goNext = () => goTo((step ?? 0) + 1);

  const selectAnswer = (questionIdx: number, optionIdx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const newAnswers = { ...answers, [questionIdx]: optionIdx };
    setAnswers(newAnswers);
    setTimeout(() => {
      setDirection(1);
      const newStep = questionIdx < questions.length - 1
        ? questionIdx + STEP_QUESTIONS_START + 1
        : STEP_DONE;
      setStep(newStep);
      saveProgress(newStep, newAnswers);
      syncProgress(newStep, newAnswers);
    }, 300);
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const finishOnboarding = () => {
    syncProgress(step ?? 0, answers, true);
    try {
      localStorage.removeItem(STORAGE_KEY_STEP);
      localStorage.removeItem(STORAGE_KEY_ANSWERS);
    } catch {}
    router.push('/');
  };

  const skipOnboarding = () => {
    syncProgress(step ?? 0, answers, false, true);
    try {
      localStorage.removeItem(STORAGE_KEY_STEP);
      localStorage.removeItem(STORAGE_KEY_ANSWERS);
    } catch {}
    router.push('/');
  };

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    setIsSending(true);
    try {
      const telegramId = getTelegramId().toString();
      const userInfo = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Онбординг';
      const res = await fetch('https://n8n.istochnikbackoffice.ru/webhook/zabota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: supportMessage,
          raw_message: supportMessage,
          telegram_id: telegramId,
          user_name: userInfo,
          source: 'onboarding',
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
  };

  if (step === null) return null;

  const firstAnswer = answers[0] ?? 0;
  const personal = personalTexts[firstAnswer];
  const lessonPath = buildLessonPath(firstAnswer);

  return (
    <Page back={false}>
      <div className={styles.container}>
        <AnimatePresence mode="wait" custom={direction}>
          {/* ===== WELCOME ===== */}
          {step === STEP_WELCOME && (
            <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key="welcome">
              <div className={styles.welcomeContent}>
                <img src="/images/onboarding/photo_1_2026-02-26_10-04-11.jpg" alt="" className={styles.screenImage} />
                <h1 className={styles.welcomeTitle}>Вы внутри «Источника»</h1>
                <p className={styles.welcomeText}>
                  Это <strong>живая система</strong>, которая меняет жизнь <em>изнутри</em>.
                </p>
                <p className={styles.welcomeText}>
                  Вас ждут <strong>ежедневная практика</strong>, окружение единомышленников и прямой диалог с теми, кто уже прошёл этот путь.
                </p>
                <div className={styles.featureList}>
                  {[
                    { title: 'Проверенные методики', desc: 'авторские подходы, подтверждённые 15 000+ реальных историй' },
                    { title: 'Среда для роста', desc: 'постоянное развитие без необходимости «заставлять себя»' },
                    { title: 'Систематизация', desc: 'все материалы организованы для вашего удобства' },
                    { title: 'Безопасное пространство', desc: 'можно быть собой, без страха осуждения' },
                  ].map((f) => (
                    <div key={f.title} className={styles.featureItem}>
                      <span className={styles.featureDot} />
                      <div>
                        <strong>{f.title}</strong>
                        <span className={styles.featureDesc}>{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className={styles.hint}>
                  Кстати, не забудьте <strong>закрепить</strong> бота, сообщество и чат, чтобы не потерять!
                </p>
              </div>
              <button className={styles.primaryBtn} onClick={goNext}>Хорошо</button>
              <button className={styles.skipBtn} onClick={() => setShowSkipModal(true)}>Пропустить обучение</button>
            </MotionScreen>
          )}

          {/* ===== INTRO ===== */}
          {step === STEP_INTRO && (
            <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key="intro">
              <div className={styles.introContent}>
                <div className={styles.introIcon}>✦</div>
                <p className={styles.introText}>Первое время я буду вашим <strong>проводником</strong>.</p>
                <p className={styles.introText}>Чтобы «Источник» стал для вас <em>живым и точным</em>, ответьте, пожалуйста, на несколько вопросов.</p>
                <p className={styles.introMeta}>Это займёт не больше минуты.</p>
              </div>
              <button className={styles.primaryBtn} onClick={goNext}>Начать</button>
            </MotionScreen>
          )}

          {/* ===== QUIZ ===== */}
          {questions.map((q, qIdx) =>
            step === qIdx + STEP_QUESTIONS_START ? (
              <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key={`q-${qIdx}`}>
                <div className={styles.questionContent}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }} />
                  </div>
                  <span className={styles.questionLabel}>{q.label}</span>
                  <h2 className={styles.questionTitle}>{q.title}</h2>
                  <div className={styles.optionsList}>
                    {q.options.map((option, oIdx) => (
                      <button
                        key={oIdx}
                        className={`${styles.optionBtn} ${answers[qIdx] === oIdx ? styles.optionSelected : ''}`}
                        onClick={() => selectAnswer(qIdx, oIdx)}
                      >
                        <span className={styles.optionNumber}>{oIdx + 1}</span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </MotionScreen>
            ) : null
          )}

          {/* ===== DONE (Спасибо) ===== */}
          {step === STEP_DONE && (
            <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key="done">
              <div className={styles.doneContent}>
                <img src="/images/onboarding/photo_6_2026-02-26_10-04-11.jpg" alt="" className={styles.screenImage} />
                <div className={styles.doneIcon}>✦</div>
                <h2 className={styles.doneTitle}>Спасибо.</h2>
                <p className={styles.doneText}>Я буду ориентироваться на ваши ответы.</p>
                <p className={styles.doneText}>Давайте вместе пройдём этот путь<br />и откроем <strong>«Источник»</strong> внутри себя!</p>
                <p className={styles.doneWelcome}>Добро пожаловать.</p>
              </div>
              <button className={styles.primaryBtn} onClick={() => goTo(STEP_PERSONAL)}>Поехали!</button>
            </MotionScreen>
          )}

          {/* ===== PERSONAL ===== */}
          {step === STEP_PERSONAL && (
            <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key="personal">
              <div className={styles.personalContent}>
                <img src="/images/onboarding/photo_3_2026-02-26_10-04-11.jpg" alt="" className={styles.screenImage} />
                {personal.paragraphs.map((text, i) => (
                  <p key={i} className={styles.personalText}>{renderText(text)}</p>
                ))}
              </div>
              <button className={styles.primaryBtn} onClick={() => goTo(STEP_LESSONS_START)}>Начать путь</button>
            </MotionScreen>
          )}

          {/* ===== LESSON SCREENS (общие + ветвящиеся + финиш) ===== */}
          {lessonPath.map((screen, idx) => {
            const screenStep = STEP_LESSONS_START + idx;
            if (step !== screenStep) return null;

            // Финальный экран
            if (screen.type === 'final') {
              return (
                <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key={screen.key}>
                  <div className={styles.personalContent}>
                    {screen.image && <img src={screen.image} alt="" className={styles.screenImage} />}
                    {screen.paragraphs.map((text, i) => (
                      <p key={i} className={styles.lessonText}>{renderText(text)}</p>
                    ))}
                  </div>

                  {/* Нужна помощь */}
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

                  <button className={styles.primaryBtn} onClick={finishOnboarding}>
                    {screen.buttonText}
                  </button>
                </MotionScreen>
              );
            }

            // Экран с материалом
            if (screen.type === 'material') {
              return (
                <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key={screen.key}>
                  {screen.image && <img src={screen.image} alt="" className={styles.screenImage} />}
                  <div className={styles.lessonContent}>
                    {screen.paragraphs.map((text, i) => (
                      <p key={i} className={styles.lessonText}>{renderText(text)}</p>
                    ))}
                  </div>
                  <div className={styles.lessonButtons}>
                    <button
                      className={styles.primaryBtn}
                      onClick={() => navigateTo(`/materials/${screen.materialId}`)}
                    >
                      {screen.buttonText}
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => goTo(screenStep + 1)}>
                      {screen.doneText || 'Далее'}
                    </button>
                  </div>
                </MotionScreen>
              );
            }

            // Экран со ссылками
            if (screen.type === 'links') {
              return (
                <MotionScreen direction={direction} className={styles.screen} onDone={() => setIsAnimating(false)} key={screen.key}>
                  {screen.image && <img src={screen.image} alt="" className={styles.screenImage} />}
                  <div className={styles.lessonContent}>
                    {screen.paragraphs.map((text, i) => (
                      <p key={i} className={styles.lessonText}>{renderText(text)}</p>
                    ))}
                    <div className={styles.linksList}>
                      {screen.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url.startsWith('/') ? undefined : link.url}
                          onClick={link.url.startsWith('/') ? (e) => { e.preventDefault(); navigateTo(link.url); } : undefined}
                          target={link.url.startsWith('/') ? undefined : '_blank'}
                          rel={link.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                          className={styles.linkBtn}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className={styles.lessonButtons}>
                    <button className={styles.secondaryBtn} onClick={() => goTo(screenStep + 1)}>
                      {screen.doneText || 'Далее'}
                    </button>
                  </div>
                </MotionScreen>
              );
            }

            return null;
          })}
        </AnimatePresence>
      </div>

      {/* Модалка подтверждения пропуска */}
      {showSkipModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSkipModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalText}>Вы уверены, что хотите пропустить вводное обучение?</p>
            <p className={styles.modalSubtext}>Вы сможете изучить материалы самостоятельно в каталоге.</p>
            <div className={styles.modalButtons}>
              <button className={styles.modalConfirm} onClick={skipOnboarding}>Да, пропустить</button>
              <button className={styles.modalCancel} onClick={() => setShowSkipModal(false)}>Остаться</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
