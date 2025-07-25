'use client';

import { Page } from '@/components/Page';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function StartHerePage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Главное изображение */}
        <Image
          src="/images/starthere/mainstart.webp"
          alt="Начни отсюда"
          width={800}
          height={600}
          className={styles.heroImg}
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />

        {/* Блоки с чередованием */}
        <div className={styles.blocksContainer}>
          {/* Блок 1 - прозрачный */}
          <div className={styles.blockTransparent}>
            <div className={styles.blockContent}>
              <div className={styles.blockNumber}>01</div>
              <div className={styles.blockText}>
                УБЕРЕШЬ ТОРЧАЩИЙ<br />
                ЖИВОТ И ВАЛИК<br />
                НАД ШРАМОМ
              </div>
            </div>
            <div className={styles.blockImageContainer}>
              <Image
                src="/images/starthere/1.png"
                alt="Блок 1"
                fill
                className={styles.blockImage}
                sizes="200px"
              />
            </div>
          </div>

          {/* Блок 2 - с заливкой */}
          <div className={styles.blockFilled}>
            <div className={styles.blockContent}>
              <div className={styles.blockNumber}>02</div>
              <div className={styles.blockText}>
                ВЕРНЕШЬ СВОЕ<br />
                ЖЕНСКОЕ ЗДОРОВЬЕ
              </div>
            </div>
            <div className={styles.blockImageContainer}>
              <Image
                src="/images/starthere/2.png"
                alt="Блок 2"
                fill
                className={styles.blockImage}
                sizes="200px"
              />
            </div>
          </div>

          {/* Блок 3 - прозрачный */}
          <div className={styles.blockTransparent}>
            <div className={styles.blockContent}>
              <div className={styles.blockNumber}>03</div>
              <div className={styles.blockText}>
                ПРОДЛИШЬ СВОЮ<br />
                МОЛОДОСТЬ И КРАСОТУ
              </div>
            </div>
            <div className={styles.blockImageContainer}>
              <Image
                src="/images/starthere/3.png"
                alt="Блок 3"
                fill
                className={styles.blockImage}
                sizes="200px"
              />
            </div>
          </div>

          {/* Блок 4 - с заливкой */}
          <div className={styles.blockFilled}>
            <div className={styles.blockContent}>
              <div className={styles.blockNumber}>04</div>
              <div className={styles.blockText}>
                ПОСТАВИШЬ ОРГАНЫ<br />
                НА МЕСТО
              </div>
            </div>
            <div className={styles.blockImageContainer}>
              <Image
                src="/images/starthere/4.png"
                alt="Блок 4"
                fill
                className={styles.blockImage}
                sizes="200px"
              />
            </div>
          </div>

          {/* Блок 5 - прозрачный */}
          <div className={styles.blockTransparent}>
            <div className={styles.blockContent}>
              <div className={styles.blockNumber}>05</div>
              <div className={styles.blockText}>
                И НАПОЛНИШЬСЯ<br />
                ЭНЕРГИЕЙ!
              </div>
            </div>
            <div className={styles.blockImageContainer}>
              <Image
                src="/images/starthere/5.png"
                alt="Блок 5"
                fill
                className={styles.blockImage}
                sizes="200px"
              />
            </div>
          </div>
        </div>

        {/* Кнопка добро пожаловать */}
        <div className={styles.welcomeButtonContainer}>
          <Link href="/" className={styles.welcomeButton}>
            <span>ДОБРО ПОЖАЛОВАТЬ!</span>
          </Link>
        </div>
      </div>
    </Page>
  );
} 