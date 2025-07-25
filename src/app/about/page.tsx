'use client';

import { Page } from '@/components/Page';
import Image from 'next/image';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Главное изображение */}
        <div className={styles.heroImage}>
          <Image
            src="/images/about/main.webp"
            alt="Клуб Плоский Живот"
            fill
            className={styles.heroImg}
            sizes="(max-width: 768px) 100vw, 600px"
            priority
          />
        </div>

        {/* Основной контент */}
        <div className={styles.content}>
          {/* Заголовок */}
          <h1 className={styles.title}>Клуб "ПЛОСКИЙ ЖИВОТ" —</h1>
          
          {/* Описание */}
          <p className={styles.description}>
            это место, где прекрасные женщины восстанавливают свое здоровье и вместе приходят к стройному, энергичному и красивому телу.
          </p>
          
          {/* Подзаголовок */}
          <h2 className={styles.subtitle}>чем богат клуб?</h2>
          
          {/* Блоки с изображениями */}
          <div className={styles.blocksSection}>
            <div className={styles.blocksGrid}>
              {/* Блок 1 - узкий */}
              <div className={styles.blockNarrow}>
                <Image
                  src="/images/about/1 block.png"
                  alt="Блок 1"
                  fill
                  className={styles.blockImage}
                  sizes="200px"
                />
            </div>
            
              {/* Блок 2 - широкий */}
              <div className={styles.blockWide}>
                <Image
                  src="/images/about/2 block.png"
                  alt="Блок 2"
                  fill
                  className={styles.blockImage}
                  sizes="300px"
                />
            </div>
            
              {/* Блок 3 - узкий */}
              <div className={styles.blockNarrow}>
                <Image
                  src="/images/about/3 block.png"
                  alt="Блок 3"
                  fill
                  className={styles.blockImage}
                  sizes="200px"
                />
            </div>
            
              {/* Блок 4 - широкий */}
              <div className={styles.blockWide}>
                <Image
                  src="/images/about/4 block.png"
                  alt="Блок 4"
                  fill
                  className={styles.blockImage}
                  sizes="300px"
                />
              </div>
            </div>
          </div>
          
          {/* Уникальность клуба */}
          <div className={styles.uniqueSection}>
            <h3 className={styles.uniqueTitle}>В ЧЕМ УНИКАЛЬНОСТЬ КЛУБА?</h3>
            <h2 className={styles.subtitle}>КЛУБ "ПЛОСКИЙ ЖИВОТ" —</h2>
          <p className={styles.uniqueDescription}>
            это не просто набор техник или упражнений. Мы создали пространство, где восстанавливаем здоровье комплексно, используя подходы из:
          </p>
          
            {/* Список подходов */}
            <div className={styles.approachList}>
              <div className={styles.approachItem}>
                <div className={styles.checkIcon}>
                  <Image
                    src="/images/about/check.png"
                    alt="Чекбокс"
                    width={24}
                    height={24}
                  />
                </div>
                <span>остеопатии</span>
              </div>
              
              <div className={styles.approachItem}>
                <div className={styles.checkIcon}>
                  <Image
                    src="/images/about/check.png"
                    alt="Чекбокс"
                    width={24}
                    height={24}
                  />
                </div>
                <span>нутрициологии</span>
              </div>
              
              <div className={styles.approachItem}>
                <div className={styles.checkIcon}>
                  <Image
                    src="/images/about/check.png"
                    alt="Чекбокс"
                    width={24}
                    height={24}
                  />
                </div>
                <span>коррекционной гимнастики</span>
              </div>
              
              <div className={styles.approachItem}>
                <div className={styles.checkIcon}>
                  <Image
                    src="/images/about/check.png"
                    alt="Чекбокс"
                    width={24}
                    height={24}
                  />
                </div>
                <span>психосоматики</span>
              </div>
            </div>
          </div>
        </div>

        {/* Изображение девушки в конце */}
        <div className={styles.girlImage}>
          <Image
            src="/images/about/girl.webp"
            alt="Девушка"
            fill
            className={styles.girlImg}
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      </div>
    </Page>
  );
} 