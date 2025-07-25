'use client';

import { Page } from '@/components/Page';
import styles from './page.module.css';

export default function IntroTrainingPage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок */}
        <h1 className={styles.title}>
          Вы тренируетесь, считаете калории, но живот всё равно торчит?
        </h1>

        {/* Основной текст */}
        <p className={styles.mainText}>
          Не вините себя! Скорее всего, вы выбрали не самый подходящий способ похудения для своего типа живота.
        </p>

        {/* Синяя плашка */}
        <div className={styles.highlightBlock}>
          <span className={styles.highlightText}>
            Существует целых 7 типов выпирающего живота
          </span>
        </div>

        {/* Текст после плашки */}
        <p className={styles.secondaryText}>
          И только зная свой тип, можно избавиться от объемов в талии навсегда.
        </p>

        {/* Видео проигрыватель */}
        <div className={styles.videoPlaceholder}>
          <div style={{position: 'relative', paddingTop: '56.25%', width: '100%'}}>
            <iframe 
              src="https://kinescope.io/embed/m5TDJj9zPbifV2HQfY8Kxc" 
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" 
              frameBorder="0" 
              allowFullScreen 
              style={{position: 'absolute', width: '100%', height: '100%', top: 0, left: 0}}
            />
          </div>
        </div>

        {/* Финальный текст */}
        <p className={styles.finalText}>
          В этом коротком видео — быстрый тест и точная инструкция: что делать, чтобы живот ушёл и не вернулся.
        </p>
      </div>
    </Page>
  );
} 