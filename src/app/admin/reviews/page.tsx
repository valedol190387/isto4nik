'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, ExternalLink, Upload, User, Star, MessageCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

interface Review {
  id: number;
  customer_name: string;
  description: string;
  review_text: string;
  rating: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

interface ReviewForm {
  customer_name: string;
  description: string;
  review_text: string;
  rating: string;
  avatar: string;
}

const initialForm: ReviewForm = {
  customer_name: '',
  description: '',
  review_text: '',
  rating: '5.0',
  avatar: ''
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [form, setForm] = useState<ReviewForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    // Проверяем авторизацию
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }

    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error('Failed to fetch reviews:', data.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingReview ? 'PUT' : 'POST';
      const reviewData = editingReview 
        ? { ...form, id: editingReview.id, oldAvatar: editingReview.avatar } 
        : form;

      const response = await fetch('/api/admin/reviews', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchReviews();
        setShowForm(false);
        setEditingReview(null);
        setForm(initialForm);
      } else {
        console.error('Error saving review:', data.message);
      }
    } catch (error) {
      console.error('Error saving review:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setForm({
      customer_name: review.customer_name,
      description: review.description,
      review_text: review.review_text,
      rating: review.rating,
      avatar: review.avatar
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchReviews();
      } else {
        console.error('Error deleting review:', data.message);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setForm({ ...form, avatar: data.avatarUrl });
      } else {
        alert(`Ошибка загрузки: ${data.message}`);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Ошибка загрузки файла');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRating = (rating: string) => {
    return parseFloat(rating).toFixed(1);
  };

  const showMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Управление отзывами</h1>
              <p className={styles.subtitle}>
                {reviews.length} отзывов • Средний рейтинг: {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / reviews.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingReview(null);
                setForm(initialForm);
                setShowForm(true);
              }}
              className={styles.addBtn}
            >
              <Plus size={20} />
              Добавить отзыв
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Загрузка отзывов...</div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageCircle size={48} />
              <h3>Нет отзывов</h3>
              <p>Создайте первый отзыв</p>
            </div>
          ) : (
            <div className={styles.reviewsContainer}>
              <div className={styles.reviewsList}>
                {visibleReviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewAvatar}>
                        <img 
                          src={review.avatar} 
                          alt={review.customer_name}
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGMUY1RjkiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0idHJhbnNmb3JtOiB0cmFuc2xhdGUoMTBweCwgMTBweCk7Ij4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDIxVjE5QTE5IDE5IDAgMCAwIDUgMTlWMjEiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM2NDc0OEIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                          }}
                        />
                      </div>
                      <div className={styles.reviewInfo}>
                        <h3 className={styles.reviewerName}>{review.customer_name}</h3>
                        <p className={styles.reviewerDescription}>{review.description}</p>
                        <div className={styles.reviewMeta}>
                          <div className={styles.reviewRating}>
                            <Star size={14} fill="currentColor" />
                            {formatRating(review.rating)}
                          </div>
                          <div className={styles.reviewDate}>
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.reviewText}>
                      {review.review_text}
                    </div>
                    <div className={styles.reviewActions}>
                      <button
                        onClick={() => handleEdit(review)}
                        className={styles.editBtn}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className={styles.deleteBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <div className={styles.showMoreContainer}>
                  <button
                    onClick={showMore}
                    className={styles.showMoreBtn}
                  >
                    Показать еще ({reviews.length - visibleCount})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingReview ? 'Редактировать отзыв' : 'Новый отзыв'}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                  setForm(initialForm);
                }}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.avatarSection}>
                <label>Аватар</label>
                <div className={styles.avatarUpload}>
                  <div className={styles.avatarPreview}>
                    {form.avatar ? (
                      <img src={form.avatar} alt="Avatar preview" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className={styles.avatarActions}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className={styles.uploadBtn}
                    >
                      <Upload size={16} />
                      {uploadingAvatar ? 'Загрузка...' : 'Выбрать файл'}
                    </button>
                    {form.avatar && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, avatar: '' })}
                        className={styles.removeBtn}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Имя клиента</label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    required
                    placeholder="Введите имя клиента"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Рейтинг</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    required
                    placeholder="4.99"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Описание клиента</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="студент курса, клиент, покупатель и т.д."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Текст отзыва</label>
                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                  placeholder="Введите текст отзыва"
                  required
                  rows={4}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingReview(null);
                    setForm(initialForm);
                  }}
                  className={styles.cancelBtn}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingAvatar}
                  className={styles.saveBtn}
                >
                  {saving ? 'Сохранение...' : editingReview ? 'Обновить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 