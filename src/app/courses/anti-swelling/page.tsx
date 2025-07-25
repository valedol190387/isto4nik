'use client';

import { Page } from '@/components/Page';
import Image from 'next/image';
import styles from './page.module.css';

export default function AntiSwellingPage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок */}
        <h1 className={styles.title}>
          Курс «Отеки»
        </h1>
        <p className={styles.description}>
          Отёки — это не просто лишняя жидкость. Это сигнал организма, что пора восстановить баланс. За внешним проявлением — усталые ноги, опухшее лицо, тяжесть в теле — скрывается дисбаланс внутренних систем.
        </p>

        {/* Цветная плашка */}
        <div className={styles.topHighlightBlock}>
          <span className={styles.topHighlightText}>
            На этом курсе мы будем работать с отёками через остеопатию — мягко, эффективно и безопасно.
          </span>
        </div>

        {/* Главное изображение */}
        <Image
          src="/images/anti-swelling/girlswelling.webp"
          alt="Курс против отеков"
          width={800}
          height={600}
          className={styles.heroImg}
          priority
        />

        {/* Подзаголовок */}
        <h2 className={styles.subtitle}>Что вас ждёт на курсе:</h2>

        {/* Пронумерованные пункты - только 3 пункта */}
        <div className={styles.pointsList}>
          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 1.png"
              alt="1"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Разминка для лимфы — активируем естественный дренаж, убираем застои, возвращаем тонус коже и телу.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 2.png"
              alt="2"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Остеотехника для сияющего лица —подтягиваем черты, убираем мешки и отёчность, дарим лицу свежесть.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 3.png"
              alt="3"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Стройные ноги без целлюлит — мягкие техники, которые разглаживают кожу, улучшают кровообращение и делают ноги лёгкими и красивыми.
            </p>
          </div>
        </div>

        {/* Блок с часами */}
        <div className={styles.timeBlock}>
          <div className={styles.timeHeader}>
            <Image
              src="/images/anti-swelling/clock.svg"
              alt="Часы"
              width={30}
              height={30}
              className={styles.timeIcon}
            />
            <h3 className={styles.timeTitle}>ВСЕГО 15 МИНУТ УТРОМ</h3>
          </div>
          <p className={styles.timeText}>
            и ваш организм запускает глубокие процессы очищения, восстановления и перезагрузки.
          </p>
        </div>

        {/* Раздел с результатами - цветная вставка */}
        <div className={styles.resultsSection}>
          <h2 className={styles.resultsTitle}>К КАКИМ РЕЗУЛЬТАТАМ ВЫ ПРИДЁТЕ:</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.svg"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                уйдёт до 7 см в талии
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                целлюлит станет менее выраженным, кожа — ровнее
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                живот станет более подтянутым и упругим
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                вы почувствуете лёгкость, энергию и прилив сил уже после первой недели занятий
              </p>
            </div>

            <div className={styles.resultItem}>
              <Image
                src="/images/anti-swelling/check.png"
                alt="Галочка"
                width={24}
                height={24}
                className={styles.checkIcon}
              />
              <p className={styles.resultText}>
                лицо — чётче, моложе, прекраснее
              </p>
            </div>
          </div>
        </div>

        {/* Изображение девушки без отступа */}
        <Image
          src="/images/anti-swelling/lastone.webp"
          alt="Результаты курса"
          width={800}
          height={600}
          className={styles.bellGirlImg}
        />
      </div>
    </Page>
  );
} 