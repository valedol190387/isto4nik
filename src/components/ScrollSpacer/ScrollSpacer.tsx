import styles from './ScrollSpacer.module.css';

interface ScrollSpacerProps {
  /** Высота невидимого элемента в пикселях. По умолчанию 80px */
  height?: number;
  /** Дополнительный класс для кастомизации */
  className?: string;
}

/**
 * Невидимый элемент для обеспечения возможности скрола.
 * Предотвращает закрытие Telegram Mini App при свайпе вниз
 * на страницах где контент помещается на один экран.
 */
export function ScrollSpacer({ height = 80, className }: ScrollSpacerProps) {
  return (
    <div 
      className={`${styles.scrollSpacer} ${className || ''}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    />
  );
}
