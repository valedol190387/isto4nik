'use client';

import { Page } from '@/components/Page';
import Image from 'next/image';
import styles from './page.module.css';

export default function AuthorPage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Первое изображение */}
        <Image
          src="/images/autor/first.webp"
          alt="Аюна - автор программы"
          width={800}
          height={600}
          className={styles.heroImg}
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />

        {/* Пункты с иконками точек в два столбца */}
        <div className={styles.pointsGrid}>
          <div className={styles.pointItem}>
            <Image
              src="/images/autor/dot.png"
              alt=""
              width={16}
              height={16}
              className={styles.dotIcon}
            />
            <span className={styles.pointText}>
              Остеопрактик с высшим медицинским образованием
            </span>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/autor/dot.png"
              alt=""
              width={16}
              height={16}
              className={styles.dotIcon}
            />
            <span className={styles.pointText}>
              Специалист по фейспластике
            </span>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/autor/dot.png"
              alt=""
              width={16}
              height={16}
              className={styles.dotIcon}
            />
            <span className={styles.pointText}>
              Сертифицированный бьюти тренер и массажист лица
            </span>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/autor/dot.png"
              alt=""
              width={16}
              height={16}
              className={styles.dotIcon}
            />
            <span className={styles.pointText}>
              Специалист по висцеральным техникам
            </span>
          </div>

          {/* Длинный пункт последним на всю ширину */}
          <div className={styles.pointItemFull}>
            <Image
              src="/images/autor/dot.png"
              alt=""
              width={16}
              height={16}
              className={styles.dotIcon}
            />
            <span className={styles.pointText}>
              Дипломированный инструктор по коррекционной гимнастике для детей и взрослых
            </span>
          </div>
        </div>

        {/* Текст о студии */}
        <p className={styles.studioText}>
          Также Аюна ведет очный прием в своей студии по массажу и остеопластике в Улан-Удэ.
        </p>

        {/* Второе изображение */}
        <Image
          src="/images/autor/second.webp"
          alt="Студия Аюны"
          width={800}
          height={600}
          className={styles.secondImg}
          sizes="(max-width: 768px) 100vw, 800px"
        />

        {/* Пункты с галочками в два столбца */}
        <div className={styles.checksGrid}>
          <div className={styles.checkItem}>
            <Image
              src="/images/autor/check.png"
              alt=""
              width={32}
              height={32}
              className={styles.checkIcon}
            />
            <span className={styles.checkText}>
              избавиться от выпирающего живота, валиков после кесарево, «второго» подбородка, отеков, проблем с осанкой и т.д.
            </span>
          </div>

          <div className={styles.checkItem}>
            <Image
              src="/images/autor/check.png"
              alt=""
              width={32}
              height={32}
              className={styles.checkIcon}
            />
            <span className={styles.checkText}>
              продлить свою молодость и красоту
            </span>
          </div>

          <div className={styles.checkItem}>
            <Image
              src="/images/autor/check.png"
              alt=""
              width={32}
              height={32}
              className={styles.checkIcon}
            />
            <span className={styles.checkText}>
              восстановить здоровье
            </span>
          </div>

          <div className={styles.checkItem}>
            <Image
              src="/images/autor/check.png"
              alt=""
              width={32}
              height={32}
              className={styles.checkIcon}
            />
            <span className={styles.checkText}>
              вернуть органы на место
            </span>
          </div>
        </div>

        {/* Синяя плашка */}
        <div className={styles.highlightBlock}>
          <span className={styles.highlightText}>
            и наполниться энергией!
          </span>
        </div>

        {/* Финальный текст */}
        <p className={styles.finalText}>
          Аюна знает всё о том, как остановить возрастные изменения и восстановить здоровье и красоту через остеопатические практики и массажи.
        </p>
      </div>
    </Page>
  );
} 