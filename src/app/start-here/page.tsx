'use client';

import { Page } from '@/components/Page';
import { ScrollSpacer } from '@/components/ScrollSpacer';
import Image from 'next/image';
import styles from './page.module.css';

export default function StartHerePage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок с фото */}
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>
            Для кого<br />
            сообщество
          </h1>
          <div className={styles.headerImageContainer}>
        <Image
              src="/images/starthere/starthere1.webp"
              alt="Для кого сообщество"
              fill
              className={styles.headerImage}
              sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 240px, 280px"
              quality={95}
          priority
        />
          </div>
        </div>

        {/* Блоки контента */}
        <div className={styles.blocksContainer}>
          {/* Блок 1 - Практики */}
          <div className={styles.contentBlock}>
            <h2 className={styles.blockTitle}>Практики</h2>
            <p className={styles.blockText}>
              Вы прошли или проходите флагманский курс и хотите
              больше разборов, супервизии и поддержки
              в ежедневном применении метода
            </p>
          </div>

          {/* Блок 2 - Исследователи */}
          <div className={styles.contentBlock}>
            <h2 className={styles.blockTitle}>Исследователи</h2>
            <p className={styles.blockText}>
              Интерес к глубинной психологии, духовности
              и «Терапии Души» как альтернативе «классике». Нужны
              смыслы, инструменты, близость к автору
            </p>
          </div>

          {/* Блок 3 - Ищущие быстрых инсайтов */}
          <div className={styles.contentBlock}>
            <h2 className={styles.blockTitle}>Ищущие быстрых инсайтов</h2>
            <p className={styles.blockText}>
              Нужно регулярно «подпитывать» ясность и мотивацию
              короткими практиками и живыми эфирами без долгого
              обучения
            </p>
          </div>

          {/* Блок 4 - Будущие «Терапевты Души» */}
          <div className={styles.contentBlock}>
            <h2 className={styles.blockTitle}>Будущие «Терапевты Души»</h2>
            <p className={styles.blockText}>
              Студенты и сертифицированные специалисты, которые
              пришли за разборами супервизий, кейсов
              и профессиональным сообществом
            </p>
              </div>
            </div>

        {/* Заголовок "Чем полезно" */}
        <div className={styles.secondHeaderSection}>
          <h2 className={styles.secondHeaderTitle}>
            Чем полезно
          </h2>
        </div>

        {/* Сетка преимуществ */}
        <div className={styles.benefitsGrid}>
          {/* 1. Закулисье метода */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <Image
                src="/images/starthere/1.png"
                alt="Закулисье метода"
                width={60}
                height={60}
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>ЗАКУЛИСЬЕ МЕТОДА</h3>
            </div>
            <p className={styles.benefitText}>
              Живые мысли, находки и рабочие процессы Евгения и Елены — без «глянца»
            </p>
          </div>

          {/* 2. Практика 24/7 */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <Image
                src="/images/starthere/2.png"
                alt="Практика 24/7"
                width={60}
                height={60}
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>ПРАКТИКА 24/7</h3>
            </div>
            <p className={styles.benefitText}>
              Не теория, а применение инструментария к повседневным ситуациям
            </p>
          </div>

          {/* 3. Живая супервизия */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <Image
                src="/images/starthere/3.png"
                alt="Живая супервизия"
                width={60}
                height={60}
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>ЖИВАЯ СУПЕРВИЗИЯ</h3>
            </div>
            <p className={styles.benefitText}>
              Разбор реальных кейсов (видео/аудио + выжимки техник и алгоритмов)
            </p>
          </div>

          {/* 4. База знаний */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <Image
                src="/images/starthere/4.png"
                alt="База знаний"
                width={60}
                height={60}
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>БАЗА ЗНАНИЙ</h3>
            </div>
            <p className={styles.benefitText}>
              Глоссарий, ответы на частые вопросы, конспекты и лучшие инсайты
            </p>
          </div>

          {/* 5. Сообщество */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <Image
                src="/images/starthere/5.png"
                alt="Сообщество"
                width={60}
                height={60}
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>СООБЩЕСТВО</h3>
            </div>
            <p className={styles.benefitText}>
              Закрытый чат единомышленников с поддержкой и безопасной обратной связью
            </p>
          </div>

          {/* 6. Эксклюзив и ранний доступ */}
          <div className={styles.benefitCard}>
            <div className={styles.benefitHeader}>
              <Image
                src="/images/starthere/6.png"
                alt="Эксклюзив и ранний доступ"
                width={60}
                height={60}
                className={styles.benefitIcon}
              />
              <h3 className={styles.benefitTitle}>ЭКСКЛЮЗИВ И РАННИЙ ДОСТУП</h3>
            </div>
            <p className={styles.benefitText}>
              Мини-курсы, эфиры, приглашённые спикеры, анонсы новинок
            </p>
          </div>
        </div>

        {/* Заголовок "Зачем оставаться надолго" */}
        <div className={styles.secondHeaderSection}>
          <h2 className={styles.secondHeaderTitle}>
            Зачем оставаться надолго
          </h2>
        </div>

        {/* Причины оставаться надолго */}
        <div className={styles.reasonsList}>
          {/* 01 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>01</div>
            <div className={styles.reasonText}>
              Регулярность → результат. Еженедельные супервизии, «Запрос недели», эфиры и мини-курсы дают накопительный эффект
            </div>
          </div>

          {/* 02 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>02</div>
            <div className={styles.reasonText}>
              Фиксация цены. Долгосрочная подписка — выгоднее и с «вечной» фиксацией стоимости
            </div>
          </div>

          {/* 03 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>03</div>
            <div className={styles.reasonText}>
              Глубина. От быстрых инсайтов к устойчивым изменениям в ролях, границах, семье, деньгах и самореализации
            </div>
          </div>

          {/* 04 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>04</div>
            <div className={styles.reasonText}>
              Поддержка. Вы не «в одиночку»: кураторство, ответы на ключевые вопросы, поле единомышленников
            </div>
          </div>
        </div>

        {/* Кнопка назад на главную */}
        <div className={styles.backToHomeContainer}>
          <a href="/" className={styles.backToHomeLink}>
            <Image
              src="/images/resourses/backwhite.svg"
              alt="Назад на главную"
              width={300}
              height={300}
              quality={95}
              sizes="(max-width: 480px) 60vw, (max-width: 768px) 60vw, (max-width: 1024px) 60vw, 60vw"
              className={styles.backToHomeImage}
            />
          </a>
        </div>
      </div>
      
      {/* Предотвращаем закрытие TMA при свайпе на страницах с коротким контентом */}
      <ScrollSpacer />
    </Page>
  );
} 