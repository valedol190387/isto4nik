'use client';

// import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Review } from '@/types/database';
import styles from './ReviewCard.module.css';

interface ReviewCardProps {
  review: Review;
  index: number;
}

export function ReviewCard({ review }: ReviewCardProps) {
  // Генерируем инициалы из имени
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Генерируем цвет аватара на основе имени
  const getAvatarColorClass = (name: string) => {
    const colors = [
      styles.avatarBlue,
      styles.avatarPurple, 
      styles.avatarPink,
      styles.avatarOrange,
      styles.avatarTeal,
      styles.avatarGreen,
      styles.avatarIndigo,
      styles.avatarRed
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewContent}>
        {/* Заголовок с аватаром и именем */}
        <div className={styles.reviewHeader}>
          {/* Аватар */}
          <div className={`${styles.avatar} ${!review.avatar ? getAvatarColorClass(review.customer_name) : ''}`}>
            {review.avatar ? (
              <img 
                src={review.avatar} 
                alt={`Аватар ${review.customer_name}`}
                className={styles.avatarImage}
                onError={(e) => {
                  // Если изображение не загрузилось, показываем инициалы
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.add(getAvatarColorClass(review.customer_name));
                    parent.innerHTML = getInitials(review.customer_name);
                  }
                }}
              />
            ) : (
              getInitials(review.customer_name)
            )}
          </div>
          
          {/* Информация о пользователе */}
          <div className={styles.userInfo}>
            <h3 className={styles.customerName}>
              {review.customer_name}
            </h3>
            {review.description && (
              <p className={styles.customerDescription}>
                {review.description}
              </p>
            )}
          </div>
        </div>

        {/* Текст отзыва */}
        <div className={styles.reviewTextContainer}>
          <p className={styles.reviewText}>
            {review.review_text}
          </p>
        </div>

        {/* Рейтинг */}
        <div className={styles.ratingContainer}>
          <Star className={styles.starIcon} />
          <span className={styles.ratingValue}>
            {review.rating.toFixed(2)}
          </span>
          <span className={styles.ratingMax}>
            / 5
          </span>
        </div>
      </div>
    </div>
  );
} 