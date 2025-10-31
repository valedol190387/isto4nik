'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './DailyPopup.module.css';

interface DailyPopupProps {
  title?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function DailyPopup({
  title = "Добро пожаловать!",
  content = "Это важное сообщение для вас.",
  buttonText = "Понятно",
  buttonLink
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
    if (buttonLink) {
      window.location.href = buttonLink;
    }
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          <X size={24} />
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.text}>{content}</p>

          <button className={styles.actionButton} onClick={handleButtonClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
