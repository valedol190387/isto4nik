'use client';

import { Page } from '@/components/Page';
import Image from 'next/image';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Логотип на всю ширину */}
        <Image
          src="/images/about/logo+title.webp"
          alt="Логотип проекта"
          width={800}
          height={400}
          quality={95}
          sizes="(max-width: 768px) 100vw, 800px"
          className={styles.heroImg}
          priority
        />

        {/* Список правил */}
        <div className={styles.reasonsList}>
          {/* 01 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>01</div>
            <div className={styles.reasonText}>
              Размещать ссылки с целью привлечения внимания для перехода, подписки и других действий
            </div>
          </div>

          {/* 02 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>02</div>
            <div className={styles.reasonText}>
              Размещать таблицы, сторонние файлы
            </div>
          </div>

          {/* 03 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>03</div>
            <div className={styles.reasonText}>
              Размещать сторонний контент, который не относится к тематике сообщества и не несет пользы для участников.
            </div>
          </div>

          {/* 04 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>04</div>
            <div className={styles.reasonText}>
              Нативная реклама в чате с призывами написать в личные сообщения, перейти в Telegram-канал, подписаться, получить бесплатный разбор и тд
            </div>
          </div>

          {/* 05 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>05</div>
            <div className={styles.reasonText}>
              Рассылать участникам сообщества сообщения с саморекламой
            </div>
          </div>

          {/* 06 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>06</div>
            <div className={styles.reasonText}>
              Поведение должно оставаться уважительным ко всем участникам сообщества
            </div>
          </div>

          {/* 07 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>07</div>
            <div className={styles.reasonText}>
              Запрещается писать оскорбления, нелестные комментарии относительно других участников сообщества. За использование запрещенных фраз (мат, привлечение участников в сторонние проекты, продающие термины и тд.) ваше сообщение удаляется ботом автоматически
            </div>
          </div>

          {/* 08 */}
          <div className={styles.reasonItem}>
            <div className={styles.reasonNumber}>08</div>
            <div className={styles.reasonText}>
              Размещать ЛЮБЫЕ материалы из "ИСТОЧНИКА" (скриншоты/записи) вне телеграм-канала и чатов "ИСТОЧНИКА" от 1 до 8 соответственно
            </div>
          </div>
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