'use client';

import { Page } from '@/components/Page';
import Image from 'next/image';
import styles from './page.module.css';

export default function FlatBellyPage() {
  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок */}
        <h1 className={styles.title}>
          Курс «Плоский живот» —
        </h1>
        <p className={styles.description}>
          не про голодание, качание пресса и тренировки до изнеможения. Это комплекс мягких, но работающих практик, которые помогут вам сотворить плоский живот своими руками.
        </p>

        {/* Главное изображение */}
        <Image
          src="/images/flat-belly/mainflat.webp"
          alt="Курс плоский живот"
          width={800}
          height={600}
          className={styles.heroImg}
          priority
        />

        {/* Подзаголовок */}
        <h2 className={styles.subtitle}>Что мы будем делать:</h2>

        {/* Пронумерованные пункты */}
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
              Высвободим защемлённые нервы, чтобы тело перестало "держать" напряжение.
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
              Поднимем кишечник на его естественное место — он часто опускается и выпирает вперёд, создавая ложный "живот".
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
              Наладим паттерн дыхания — научимся дышать так, чтобы живот не раздувался, а помогал нам двигаться.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 4.png"
              alt="4"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Исправим осанку — ведь сутулость и перекосы таза — главные причины "вечно напряжённого живота".
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 5.png"
              alt="5"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Активируем мышцы кора и научим их работать в согласии, а не по отдельности.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 6.png"
              alt="6"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Уберём спайки и внутренние блоки, мешающие органам двигаться и функционировать.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 7.png"
              alt="7"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Уберем привычку втягивать живот — потому что постоянное напряжение только ухудшает форму.
            </p>
          </div>

          <div className={styles.pointItem}>
            <Image
              src="/images/flat-belly/Group 8.png"
              alt="8"
              width={40}
              height={40}
              className={styles.numberIcon}
            />
            <p className={styles.pointText}>
              Снизим воспаления через комплекс остеопатических практик — ведь хроническое воспаление = отёки, вздутие и лишний объём.
            </p>
          </div>
        </div>

        {/* Синий блок с текстом */}
        <div className={styles.highlightBlock}>
          <p className={styles.highlightText}>
            сотни женщин уже выполняли эти практики и заметили изменения через несколько недель
          </p>
        </div>

        {/* Изображение девушки без отступа */}
        <Image
          src="/images/flat-belly/bellgirl.webp"
          alt="Результаты курса"
          width={800}
          height={600}
          className={styles.bellGirlImg}
        />
      </div>
    </Page>
  );
} 