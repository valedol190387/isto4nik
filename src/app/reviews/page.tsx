'use client';

import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { Loader2, MessageCircle, Star, Plus } from 'lucide-react';
import { Page } from '@/components/Page';
import { ReviewCard } from '@/components/ReviewCard';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types/database';
import styles from './page.module.css';

const REVIEWS_PER_PAGE = 10;

interface ReviewStats {
  totalCount: number;
  averageRating: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true); // Вернул loading для правильной работы
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false); // Флаг инициализации

  // Загружаем общую статистику отзывов
  const fetchReviewStats = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('reviews')
        .select('rating')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const stats: ReviewStats = {
        totalCount: data?.length || 0,
        averageRating: data && data.length > 0 
          ? data.reduce((sum, review) => sum + review.rating, 0) / data.length 
          : 0
      };

      setReviewStats(stats);
      return stats;
    } catch (err) {
      console.error('Ошибка загрузки статистики отзывов:', err);
      return null;
    }
  };

  // Загружаем отзывы порциями
  const fetchReviews = async (offset = 0, isLoadingMore = false) => {
    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setError(null);
      }

      const { data, error: supabaseError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + REVIEWS_PER_PAGE - 1);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const newReviews = data || [];
      
      if (isLoadingMore) {
        setReviews(prev => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }

      // Проверяем, есть ли еще отзывы
      setHasMore(newReviews.length === REVIEWS_PER_PAGE);
      return newReviews;

    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке отзывов');
      return [];
    } finally {
      setLoadingMore(false);
    }
  };

  // Загрузка дополнительных отзывов
  const loadMoreReviews = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(reviews.length, true);
    }
  };

  // Начальная загрузка
  useEffect(() => {
    // Не запускаем повторную загрузку, если данные уже загружены
    if (initialized) return;
    
    const loadInitialData = async () => {
      try {
        // Загружаем данные параллельно
        const [stats, reviewsData] = await Promise.all([
        fetchReviewStats(),
        fetchReviews(0, false)
      ]);
        
        // Отмечаем, что инициализация завершена
        setInitialized(true);
      } catch (err) {
        console.error('Ошибка при начальной загрузке:', err);
      } finally {
        // Убираем loading только после полной загрузки
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок страницы */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <MessageCircle className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>Отзывы участников</h1>
          </div>
          {reviewStats && reviewStats.totalCount > 0 && (
            <div className={styles.headerStats}>
              <Star className={styles.starIcon} />
              <span className={styles.statsText}>
                {reviewStats.averageRating.toFixed(1)} из 5 • {reviewStats.totalCount} отзыв{reviewStats.totalCount !== 1 ? (reviewStats.totalCount < 5 ? 'а' : 'ов') : ''}
              </span>
            </div>
          )}
        </div>

        {/* Контент */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingContent}>
                <Loader2 className={styles.loadingIcon} />
                <p className={styles.loadingText}>Загружаем отзывы...</p>
              </div>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <div className={styles.errorContent}>
                <div className={styles.errorIconContainer}>
                  <MessageCircle className={styles.errorIcon} />
                </div>
                <div>
                  <h3 className={styles.errorTitle}>Ошибка загрузки</h3>
                  <p className={styles.errorText}>{error}</p>
                </div>
              </div>
            </div>
          ) : reviews.length === 0 && initialized ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconContainer}>
                <MessageCircle className={styles.emptyIcon} />
              </div>
              <h3 className={styles.emptyTitle}>
                Пока нет отзывов
              </h3>
              <p className={styles.emptyText}>
                Отзывы участников появятся здесь позже
              </p>
            </div>
          ) : (
            <div className={styles.reviewsList}>
              {reviews.map((review, index) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  index={index}
                />
              ))}

              {/* Кнопка "Показать еще" */}
              {hasMore && (
                <div className={styles.loadMoreContainer}>
                  <button
                    onClick={loadMoreReviews}
                    disabled={loadingMore}
                    className={styles.loadMoreButton}
                  >
                    <div className={styles.loadMoreContent}>
                      {loadingMore ? (
                        <>
                          <Loader2 className={styles.loadMoreIcon} />
                          <span className={styles.loadMoreText}>Загружаем...</span>
                        </>
                      ) : (
                        <>
                          <Plus className={styles.loadMoreIcon} />
                          <span className={styles.loadMoreText}>Показать еще</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              )}

              {/* Показываем количество загруженных отзывов */}
              {reviewStats && reviews.length > 0 && (
                <div className={styles.reviewsCounter}>
                  <span className={styles.counterText}>
                    Показано {reviews.length} из {reviewStats.totalCount} отзывов
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
} 