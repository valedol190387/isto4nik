'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import styles from './DailyPopup.module.css';

interface DailyPopupProps {
  title: string;
  subtitle: string;
  price: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
}

export function DailyPopup({
  title,
  subtitle,
  price,
  buttonText,
  buttonLink,
  imageSrc
}: DailyPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, показывали ли попап сегодня
    const lastShown = localStorage.getItem('dailyPopupLastShown');
    const today = new Date().toDateString();

    if (lastShown !== today) {
      // Показываем попап через небольшую задержку для плавности
      setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('dailyPopupLastShown', today);
      }, 500);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleButtonClick = () => {
    window.open(buttonLink, '_blank');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          <X size={24} />
        </button>

        <div className={styles.imageContainer}>
          <Image
            src={imageSrc}
            alt={title}
            fill
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
          <p className={styles.price}>{price}</p>

          <button className={styles.actionButton} onClick={handleButtonClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
