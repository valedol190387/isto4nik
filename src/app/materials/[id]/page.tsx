'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar, Tag, Loader2 } from 'lucide-react';
import { Page } from '@/components/Page';
import { Material } from '@/types/database';
import styles from './page.module.css';

export default function MaterialViewPage() {
  const params = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const materialId = params.id as string;

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await fetch(`/api/materials/${materialId}`);
        if (!response.ok) {
          throw new Error('Материал не найден');
        }
        
        const materialData: Material = await response.json();
        
        // Если это не встроенное видео - редирект на внешнюю ссылку
        if (!materialData.is_embedded_video) {
          window.open(materialData.url, '_blank');
          router.back();
          return;
        }
        
        setMaterial(materialData);
      } catch (error) {
        console.error('Error fetching material:', error);
        setError('Не удалось загрузить материал');
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchMaterial();
    }
  }, [materialId, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p>Загружаем материал...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <Page>
        <div className={styles.error}>
          <div className={styles.errorContent}>
            <h2>Ошибка</h2>
            <p>{error || 'Материал не найден'}</p>
            <button onClick={() => router.back()} className={styles.backButton}>
              <ArrowLeft size={16} />
              Вернуться назад
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className={styles.container}>
        {/* Шапка без кнопки назад (используется системная кнопка Telegram) */}
        <header className={styles.header}>
        </header>

        {/* Основной контент */}
        <main className={styles.main}>
          {/* Заголовок материала */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{material.title}</h1>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <Calendar size={14} />
                <span>Добавлено {formatDate(material.created_at)}</span>
              </div>
              {material.tags && material.tags.length > 0 && (
                <div className={styles.metaItem}>
                  <Tag size={14} />
                  <span>{material.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Встроенное видео */}
          {material.video_embed_code && (
            <div className={styles.videoSection}>
              <div 
                className={styles.videoContainer}
                dangerouslySetInnerHTML={{ __html: material.video_embed_code }}
              />
            </div>
          )}

          {/* Описание */}
          {material.description && (
            <div className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Описание</h2>
              <div className={styles.description}>
                {material.description.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Внешняя ссылка как дополнительная (если есть) */}
          {material.url && (
            <div className={styles.linkSection}>
              <a 
                href={material.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                <ExternalLink size={16} />
                <span>Перейти к источнику</span>
              </a>
            </div>
          )}
        </main>
      </div>
    </Page>
  );
} 