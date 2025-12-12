'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import styles from './DailyPopup.module.css';
import { PopupSettings } from '@/types/database';

interface DailyPopupProps {
  popupData?: PopupSettings | null;
}

export function DailyPopup({ popupData }: DailyPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Функция для получения номера недели в году
  const getWeekNumber = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  };

  useEffect(() => {
    // Если нет данных или попап неактивен, не показываем
    if (!popupData || !popupData.is_active || popupData.frequency === 'disabled') {
      return;
    }

    const storageKey = `popup_${popupData.id}_shown`;
    const lastShown = localStorage.getItem(storageKey);
    const today = new Date().toDateString();
    const currentWeek = getWeekNumber(new Date());

    let shouldShow = false;

    switch (popupData.frequency) {
      case 'always':
        // Показываем всегда
        shouldShow = true;
        break;

      case 'daily':
        // Показываем раз в день
        shouldShow = lastShown !== today;
        break;

      case 'weekly':
        // Показываем раз в неделю
        shouldShow = lastShown !== currentWeek;
        break;

      case 'once':
        // Показываем один раз за все время
        shouldShow = !lastShown;
        break;

      default:
        shouldShow = false;
    }

    if (shouldShow) {
      // Показываем попап через небольшую задержку для плавности
      setTimeout(() => {
        setIsVisible(true);

        // Сохраняем время показа
        if (popupData.frequency === 'daily') {
          localStorage.setItem(storageKey, today);
        } else if (popupData.frequency === 'weekly') {
          localStorage.setItem(storageKey, currentWeek);
        } else if (popupData.frequency === 'once') {
          localStorage.setItem(storageKey, 'shown');
        }
      }, 500);
    }
  }, [popupData]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleButtonClick = () => {
    if (popupData?.button_link) {
      window.open(popupData.button_link, '_blank');
      handleClose();
    }
  };

  if (!isVisible || !popupData) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          <X size={24} />
        </button>

        <div className={styles.imageContainer}>
          <Image
            src={popupData.image_url}
            alt={popupData.title}
            fill
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{popupData.title}</h2>
          {popupData.subtitle && (
            <p className={styles.subtitle}>{popupData.subtitle}</p>
          )}
          <p className={styles.price}>{popupData.price_text}</p>

          <button className={styles.actionButton} onClick={handleButtonClick}>
            {popupData.button_text}
          </button>
        </div>
      </div>
    </div>
  );
}
