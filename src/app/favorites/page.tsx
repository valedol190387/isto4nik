'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import { Heart, Play, ExternalLink, Loader2, Star } from 'lucide-react';
import { Material } from '@/types/database';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import styles from './page.module.css';

export default function FavoritesPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Получаем реального пользователя из Telegram
  const user = useSignal(initData.user);

  // Получаем Telegram ID пользователя
  const getTelegramId = () => {
    // Пробуем получить из Telegram WebApp API
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id.toString();
      }
    }
    
    // Fallback - только для разработки
    return '123456789';
  };

  // Загрузка избранных материалов
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const telegramId = user?.id?.toString() || getTelegramId();
        const response = await fetch(`/api/favorites?telegramId=${telegramId}`);
        const data: Material[] = await response.json();
        
        setMaterials(data);
        
        // Устанавливаем все материалы как избранные
        const favoriteIds = new Set(data.map(material => material.id));
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (materialId: number) => {
    const telegramId = user?.id?.toString() || getTelegramId();
    const isFavorite = favorites.has(materialId);

    try {
      if (isFavorite) {
        // Удаляем из избранного
        await fetch(`/api/favorites?telegramId=${telegramId}&materialId=${materialId}`, {
          method: 'DELETE',
        });
        
        // Удаляем из локального состояния
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(materialId);
          return newFavorites;
        });
        
        // Удаляем из списка материалов
        setMaterials(prev => prev.filter(material => material.id !== materialId));
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleMaterialClick = (material: Material) => {
    if (material.is_embedded_video) {
      // Для встроенного видео - переход на страницу просмотра
      window.location.href = `/materials/${material.id}`;
    } else {
      // Для внешних ссылок - открытие в новом окне
      window.open(material.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p>Загружаем избранное...</p>
        </div>
      </div>
    );
  }

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок страницы */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Star className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>ИЗБРАННОЕ</h1>
          </div>
        </div>

        {/* Список избранных материалов */}
        <div className={styles.materialsSection}>
          {materials.length > 0 ? (
            materials.map((material) => (
              <div key={material.id} className={styles.materialCard}>
                <div className={styles.materialContent} onClick={() => handleMaterialClick(material)}>
                  <div className={styles.materialIcon}>
                    <Play className={styles.playIcon} />
                  </div>
                  <div className={styles.materialInfo}>
                    <h3 className={styles.materialTitle}>{material.title}</h3>
                    <p className={styles.materialDescription}>{material.description}</p>
                    {material.tags.length > 0 && (
                      <div className={styles.materialTags}>
                        {material.tags.map((tag, index) => (
                          <span key={index} className={styles.materialTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ExternalLink className={styles.linkIcon} size={16} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(material.id);
                  }}
                  className={styles.favoriteButton}
                >
                  <Heart 
                    className={`${styles.heartIcon} ${favorites.has(material.id) ? styles.favoriteActive : ''}`}
                    fill={favorites.has(material.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <Star className={styles.emptyIcon} size={48} />
              <h3 className={styles.emptyTitle}>Пока нет избранных материалов</h3>
              <p className={styles.emptyDescription}>
                Отмечайте понравившиеся материалы сердечком, и они появятся здесь
              </p>
            </div>
          )}
        </div>

        {/* Отступ снизу */}
        <div className={styles.bottomSpacing}></div>
      </div>
    </Page>
  );
} 