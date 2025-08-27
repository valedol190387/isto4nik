'use client';

import { Page } from '@/components/Page';
import Image from 'next/image';
import styles from './page.module.css';

export default function ResourcesPage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Блок Елены Теребениной */}
        <div className={styles.authorSection}>
          <div className={styles.authorImageContainer}>
            <Image
              src="/images/resourses/elena.webp"
              alt="Елена Теребенина"
              width={280}
              height={300}
              className={styles.authorImage}
              quality={95}
              sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 240px, 280px"
            />
          </div>
          <div className={styles.authorContent}>
            <h1 className={styles.authorTitle}>
              Елена<br />
              Теребенина —
            </h1>
            <p className={styles.authorText}>
              ректор Международного университета современной психологии, бизнес-тренер. 
              Более 20 лет опыта в создании, управлении и развитии проектов, в том числе 
              в рамках больших корпораций.
            </p>
          </div>
        </div>

        {/* Блок Евгения Теребенина */}
        <div className={styles.authorSectionReverse}>
          <div className={styles.authorContentLeft}>
            <h1 className={styles.authorTitle}>
              Евгений<br />
              Теребенин —
            </h1>
            <p className={styles.authorText}>
              психолог, эксперт по развитию практического мировоззрения людей, 
              член Международной ассоциации психологов и бизнес-тренер
            </p>
          </div>
          <div className={styles.authorImageContainer}>
            <Image
              src="/images/resourses/evgenii.webp"
              alt="Евгений Теребенин"
              width={280}
              height={300}
              className={styles.authorImage}
              quality={95}
              sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 240px, 280px"
            />
          </div>
        </div>

        {/* Дополнительный текст о методе */}
        <div className={styles.methodDescription}>
          <p className={styles.methodText}>
            Его авторский метод «Терапия Души» базируется на более чем 19-ти летней практике 
            и знаниях в области аналитической психологии, системного анализа и гештальт-терапии.
          </p>
          <p className={styles.methodText}>
            «Терапия Души» работает с источниками формирования уникального внутреннего 
            контента человека и, определив их, помогает изменить восприятие и стать свободным 
            от присвоенных образов, схем и историй.
          </p>
          <p className={styles.methodText}>
            «Терапия Души» делает это оперативно, понятно и эффективно.
          </p>
        </div>

        {/* Блок статистики с синим фоном */}
        <div className={styles.statsSection}>
          <p className={styles.statsText}>
            Более 14 000 человек прошли «Терапию Души» и решили свои жизненные запросы.
          </p>
        </div>

        {/* Дополнительный текст */}
        <div className={styles.additionalDescription}>
          <p className={styles.additionalText}>
            Евгений регулярно проводит обучение методу, уже более 
            1 500 человек практикуют «Терапию Души» по всему миру
          </p>
        </div>

        {/* Заголовок метода */}
        <div className={styles.methodHeader}>
          <h1 className={styles.authorTitle}>
            Метод «Терапия Души»
        </h1>
        </div>

        {/* Блоки с пунктами */}
        <div className={styles.methodPoints}>
          <div className={styles.pointCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <p className={styles.pointText}>
              «Я»/самопознание: проявленность, призвание и предназначение
            </p>
          </div>

          <div className={styles.pointCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <p className={styles.pointText}>
              Межличностные отношения: с родителями, детьми, родственниками, мужем/женой, партнёрами
            </p>
          </div>

          <div className={styles.pointCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <p className={styles.pointText}>
              Финансы: личные финансы, внутренние проблемы, которые мешают зарабатывать, финансовый потолок и пр.
            </p>
          </div>

          <div className={styles.pointCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <p className={styles.pointText}>
              Бизнес: внутренние предпосылки успешного бизнеса, партнёрство в бизнесе, работа с проектами, выбор способа инвестиций и выявление нарушений в технологии
            </p>
          </div>
        </div>

        {/* Заголовок тест-драйва */}
        <div className={styles.methodHeader}>
          <h1 className={styles.authorTitle}>
            Тест-драйв метода «Терапия Души»
          </h1>
        </div>

        {/* Блок тест-драйва с бежевым фоном */}
        <div className={styles.testDriveSection}>
          <p className={styles.testDriveText}>
            Здесь вы найдёте{' '}
            <a 
              href="https://terebenin.com/minicourses" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              бесплатные курсы онлайн-школы
            </a>
            {' '}и сможете познакомиться с методом «Терапия Души».
          </p>
          <p className={styles.testDriveText}>
            Посмотрите мини-курс «Как управлять силой Рода», 
            мини-курс «Размышления про устройство мира и человека» 
            и запись интерактивного психологического шоу «ПроЯвись!».
          </p>
        </div>

        {/* Дополнительная информация на обычном фоне */}
        <div className={styles.additionalDescription}>
          <p className={styles.additionalText}>
            <a 
              href="https://t.me/eterebenin" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              В Telegram-канале
            </a>
            {' '}максимум полезной информации, анонсы предстоящих событий, ответы на вопросы, розыгрыши полезных призов и прямые эфиры.
          </p>

          <p className={styles.additionalText}>
            На видеохостингах вы найдёте разборы Евгения Теребенина и его учеников терапевтов Души, полезные подкасты и почту «Терапию Души» с ответами на ваши вопросы, рекомендациями и советами, шоу «Скажи мне правду!». На каналах размещено более 400 видео с полезной информацией.
          </p>

          <p className={styles.additionalText}>
            Видео выходят еженедельно!
          </p>
        </div>

        {/* Кнопки видеохостингов */}
        <div className={styles.videoHostingButtons}>
          <a 
            href="https://www.youtube.com/@evgenyterebenin" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.hostingButton}
          >
            <Image
              src="/images/resourses/you.svg"
              alt="YouTube"
              width={200}
              height={100}
              quality={95}
              className={styles.hostingImage}
            />
          </a>
          
          <a 
            href="https://vk.com/video/@evterebenin" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.hostingButton}
          >
            <Image
              src="/images/resourses/vk.svg"
              alt="VK"
              width={200}
              height={100}
              quality={95}
              className={styles.hostingImage}
            />
          </a>
          
          <a 
            href="https://vk.com/video/@evterebenin" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.hostingButton}
          >
            <Image
              src="/images/resourses/rutube.svg"
              alt="RuTube"
              width={200}
              height={100}
              quality={95}
              className={styles.hostingImage}
            />
          </a>
        </div>

        {/* Заголовок освобождения от травм */}
        <div className={styles.methodHeader}>
          <h1 className={styles.authorTitle}>
            Освобождение от травм
          </h1>
        </div>

        {/* Изображение на всю ширину */}
        <div className={styles.fullWidthImageSection}>
          <Image
            src="/images/resourses/image3.webp"
            alt="Освобождение от травм"
            width={800}
            height={400}
            quality={95}
            className={styles.fullWidthImage}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 600px, 800px"
          />
        </div>

        {/* Текст о вебинарах */}
        <div className={styles.additionalDescription}>
          <p className={styles.additionalText}>
            Приглашаем на ежемесячные бесплатные вебинары с разбором трудных жизненных ситуаций{' '}
            <a 
              href="https://web.telegram.org/a/#-1001969346481" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              «Освобождение от травм»
            </a>
            . За четыре часа Терапевты Души и Евгений Теребенин помогут ответить на запросы конкретных людей, у которых есть трудности в отношениях с родителями и детьми, с партнёрами и финансовые проблемы.
          </p>

          <p className={styles.additionalText}>
            Ваш запрос может оказаться одним из 20-ти, выбранных для вебинара.
          </p>

          <p className={styles.additionalText}>
            В{' '}
            <a 
              href="https://web.telegram.org/a/#-1001969346481" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              ТГ-канале Мир «Терапии Души». Освобождение от травм
            </a>
            {' '}- информация о ближайшем вебинаре, сбор запросов на вебинар (за 20 дней до вебинара), консультации терапевтов Души.
          </p>
        </div>

        {/* Заголовок онлайн-школы */}
        <div className={styles.methodHeader}>
          <h1 className={styles.authorTitle}>
            Онлайн-школа Евгения Теребенина
          </h1>
        </div>

        {/* Изображение онлайн-школы на всю ширину */}
        <div className={styles.fullWidthImageSection}>
          <Image
            src="/images/resourses/image4.webp"
            alt="Онлайн-школа Евгения Теребенина"
            width={800}
            height={400}
            quality={95}
            className={styles.fullWidthImage}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 600px, 800px"
          />
        </div>

        {/* Текст об онлайн-школе */}
        <div className={styles.additionalDescription}>
          <p className={styles.additionalText}>
            Чтобы самостоятельно разобраться с трудностями и наладить свою жизнь приглашаю вас в мою{' '}
            <a 
              href="https://terapiyadushi.online/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              Онлайн-школу
            </a>
            {' '}на Медиатеке.
          </p>

          <p className={styles.additionalText}>
            <a 
              href="https://terapiyadushi.online/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              Онлайн-школа
            </a>
            {' '}– это короткие и доступные по цене курсы, помогающие справляться с трудными жизненными ситуациями.
          </p>

          <p className={styles.additionalText}>
            В школе есть курсы, которые помогут: разобраться в отношениях с родителями и детьми, с мужем и женой, ответить на вопросы о призвании и предназначении,
          </p>

          <p className={styles.additionalText}>
            Курсы онлайн-школы дадут рекомендации по личным финансам и проблеме финансового потолка. А так же помогут тем, кто строит бизнес и партнёрство.
          </p>
        </div>

        {/* Заголовок доступных курсов */}
        <div className={styles.availableCoursesHeader}>
          <h2 className={styles.availableCoursesTitle}>
            В НАСТОЯЩЕЕ ВРЕМЯ ДОСТУПНЫ:
          </h2>
        </div>

        {/* Блоки с доступными курсами */}
        <div className={styles.availableCoursesGrid}>
          <div className={styles.courseCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <a 
              href="https://terapiyadushi.online/samoterapiya" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.courseLink}
            >
              Шесть курсов «Самотерапия»
            </a>
          </div>

          <div className={styles.courseCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <a 
              href="https://terapiyadushi.online/besedi" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.courseLink}
            >
              Четыре «Беседы с Евгением Теребениным»
            </a>
          </div>

          <div className={styles.courseCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <a 
              href="https://terapiyadushi.online/partnerskie_otnosheniya" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.courseLink}
            >
              Курс «Партнёрские отношения»
            </a>
          </div>

          <div className={styles.courseCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <a 
              href="https://terapiyadushi.online/kod_deneg" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.courseLink}
            >
              Практикум «Код денег»
            </a>
          </div>

          <div className={styles.courseCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <a 
              href="https://terapiyadushi.online/trening_dengi" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.courseLink}
            >
              Онлайн-тренинг «Где мои деньги?»
            </a>
          </div>

          <div className={styles.courseCard}>
            <div className={styles.pointIcon}>
              <Image
                src="/images/resourses/punkt.png"
                alt="Пункт"
                width={40}
                height={40}
                quality={95}
                sizes="(max-width: 480px) 24px, (max-width: 768px) 28px, 40px"
                className={styles.pointIconImage}
              />
            </div>
            <a 
              href="https://terapiyadushi.online/celepolaganie" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.courseLink}
            >
              Видеосеминар «Целеполагание»
            </a>
          </div>
        </div>

        {/* Обучение методу */}
        <div className={styles.methodHeader}>
          <h1 className={styles.authorTitle}>
            Обучение методу «Терапия Души»
          </h1>
        </div>

        <div className={styles.additionalDescription}>
          <p className={styles.additionalText}>
            Метод позволяет специалисту работать также быстро и эффективно, как Евгений Теребенин.
          </p>

          <p className={styles.additionalText}>
            «Терапии Души» обучились уже более 1 500 человек.
          </p>

          <p className={styles.additionalText}>
            Он стал дополнительным действенным инструментом в руках психологов, специалистов помогающих профессий и тех, кто интересуется темой саморазвития.
          </p>

          <p className={styles.additionalText}>
            Приходите на обучение!
          </p>

          <p className={styles.additionalText}>
            Получите современный метод и пользуйтесь им для повышения профессиональных компетенций и изменения жизни. Информация о датах и форматах обучения <a 
              href="https://terebenin.com/terapia_dushi#!/tab/729746087-3" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              на сайте
            </a>.
          </p>

          <p className={styles.additionalText}>
            <a 
              href="https://terebenin.com/terapiya_dushi?utm_source=teletype&utm_medium=seo&utm_campaign=ob_7&utm_content=ssilka&utm_term=25" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              Онлайн-обучение методу «Терапия Души»
            </a>
          </p>
        </div>

        {/* Изображение обучения */}
        <div className={styles.fullWidthImageSection}>
          <Image
            src="/images/resourses/image6.webp"
            alt="Обучение методу Терапия Души"
            width={800}
            height={400}
            quality={95}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 800px, 800px"
            className={styles.fullWidthImage}
          />
        </div>

        <div className={styles.additionalDescription}>
          <p className={styles.additionalText}>
            Для тех, кто успешно обучился и практикует - открыт портал терапевтов Души, где каждый желающий клиент может выбрать себе терапевта по региону и по душе. Специалисты работают в офлайн и онлайн-форматах, а также проводят личные консультации.
          </p>

          <p className={styles.additionalText}>
            <a 
              href="https://clck.ru/3AsPr9" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              Выберите своего терапевта Души
            </a>
          </p>

          <p className={styles.additionalText}>
            <a 
              href="http://www.terebenin.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              На сайте
            </a> Евгения Теребенина - максимально полная информация, <a 
              href="http://www.terebenin.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              расписание групповых терапий
            </a>, <a 
              href="http://www.terebenin.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              онлайн-школа Евгения Теребенина
            </a>, <a 
              href="https://terebenin.com/#afisha" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.testDriveLink}
            >
              афиша событий
            </a>, отзывы. На сайте можно связаться с менеджером и оставить свой вопрос.
          </p>
        </div>

        {/* Кнопка назад на главную */}
        <div className={styles.backToHomeContainer}>
          <a href="/" className={styles.backToHomeLink}>
            <Image
              src="/images/resourses/back.svg"
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
    </Page>
  );
} 
