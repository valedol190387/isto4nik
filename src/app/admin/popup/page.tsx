'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Bell, Image as ImageIcon } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { PopupSettings } from '@/types/database';
import styles from './page.module.css';

interface PopupForm {
  title: string;
  subtitle: string;
  price_text: string;
  button_text: string;
  button_link: string;
  image_url: string;
  frequency: 'daily' | 'once' | 'always' | 'disabled';
  is_active: boolean;
}

const initialForm: PopupForm = {
  title: '',
  subtitle: '',
  price_text: '',
  button_text: '',
  button_link: '',
  image_url: '',
  frequency: 'daily',
  is_active: true
};

const frequencyOptions = [
  { value: 'daily', label: 'Раз в день' },
  { value: 'once', label: 'Один раз за всё время' },
  { value: 'always', label: 'Всегда' },
  { value: 'disabled', label: 'Отключен' }
];

export default function AdminPopup() {
  const [popups, setPopups] = useState<PopupSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupSettings | null>(null);
  const [form, setForm] = useState<PopupForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/popup');
      const data = await response.json();

      if (data.success) {
        setPopups(data.popups || []);
      }
    } catch (error) {
      console.error('Error loading popups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем наличие изображения
    if (!form.image_url) {
      alert('Пожалуйста, загрузите изображение для попапа');
      return;
    }

    try {
      setSaving(true);

      const url = '/api/admin/popup';
      const method = editingPopup ? 'PUT' : 'POST';

      const payload = editingPopup
        ? { ...form, id: editingPopup.id }
        : form;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        await loadPopups();
        resetForm();
      } else {
        alert('Ошибка при сохранении попапа');
      }
    } catch (error) {
      console.error('Error saving popup:', error);
      alert('Ошибка при сохранении попапа');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот попап?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/popup?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await loadPopups();
      } else {
        alert('Ошибка при удалении попапа');
      }
    } catch (error) {
      console.error('Error deleting popup:', error);
      alert('Ошибка при удалении попапа');
    }
  };

  const startEdit = (popup: PopupSettings) => {
    setEditingPopup(popup);
    setForm({
      title: popup.title,
      subtitle: popup.subtitle || '',
      price_text: popup.price_text,
      button_text: popup.button_text,
      button_link: popup.button_link,
      image_url: popup.image_url,
      frequency: popup.frequency,
      is_active: popup.is_active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingPopup(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditingPopup(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('popupImage', file);

      const response = await fetch('/api/upload/popup', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setForm({ ...form, image_url: data.imageUrl });
      } else {
        alert(`Ошибка загрузки: ${data.message}`);
      }
    } catch (error) {
      console.error('Error uploading popup image:', error);
      alert('Ошибка загрузки файла');
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option ? option.label : frequency;
  };

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Управление попапом</h1>
            <p className={styles.subtitle}>
              Настройте попап для главной страницы
            </p>
          </div>

          <button
            className={styles.addButton}
            onClick={handleAddNew}
          >
            <Plus size={20} />
            <span>Добавить попап</span>
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <div className={styles.popupsList}>
            {popups.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={48} />
                <p>Нет настроенных попапов</p>
                <button className={styles.emptyButton} onClick={handleAddNew}>
                  Создать первый попап
                </button>
              </div>
            ) : (
              popups.map((popup) => (
                <div key={popup.id} className={styles.popupCard}>
                  <div className={styles.popupImage}>
                    {popup.image_url && (
                      <img src={popup.image_url} alt={popup.title} />
                    )}
                  </div>

                  <div className={styles.popupInfo}>
                    <div className={styles.popupHeader}>
                      <h3 className={styles.popupTitle}>{popup.title}</h3>
                      <div className={styles.popupBadges}>
                        <span className={popup.is_active ? styles.badgeActive : styles.badgeInactive}>
                          {popup.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                        <span className={styles.badgeFrequency}>
                          {getFrequencyLabel(popup.frequency)}
                        </span>
                      </div>
                    </div>

                    {popup.subtitle && (
                      <p className={styles.popupSubtitle}>{popup.subtitle}</p>
                    )}

                    <p className={styles.popupPrice}>{popup.price_text}</p>

                    <div className={styles.popupButton}>
                      <strong>{popup.button_text}</strong> → {popup.button_link}
                    </div>

                    <div className={styles.popupMeta}>
                      Обновлен: {formatDate(popup.updated_at)}
                    </div>
                  </div>

                  <div className={styles.popupActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => startEdit(popup)}
                      title="Редактировать"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(popup.id)}
                      title="Удалить"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingPopup ? 'Редактировать попап' : 'Создать попап'}</h2>
              <button className={styles.closeButton} onClick={resetForm}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Заголовок *
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  required
                  placeholder="Онлайн-обучение методу «Терапия Души»"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Подзаголовок (даты, время и т.д.)
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.subtitle}
                  onChange={(e) => setForm({...form, subtitle: e.target.value})}
                  placeholder="28-30 ноября"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Триггерный текст (скидка, бонус и т.д.) *
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.price_text}
                  onChange={(e) => setForm({...form, price_text: e.target.value})}
                  required
                  placeholder="Получите инструменты для работы с психикой человека"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Текст на кнопке *
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.button_text}
                  onChange={(e) => setForm({...form, button_text: e.target.value})}
                  required
                  placeholder="Подробнее"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Ссылка кнопки *
                </label>
                <input
                  type="url"
                  className={styles.input}
                  value={form.button_link}
                  onChange={(e) => setForm({...form, button_link: e.target.value})}
                  required
                  placeholder="https://example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Изображение попапа *
                </label>
                <div className={styles.imageUploadContainer}>
                  {form.image_url && (
                    <div className={styles.imagePreview}>
                      <img src={form.image_url} alt="Превью попапа" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className={styles.fileInput}
                  />
                  {uploadingImage && (
                    <p className={styles.uploadingText}>Загрузка изображения...</p>
                  )}
                </div>
                <small className={styles.hint}>
                  Загрузите изображение для попапа. Форматы: JPEG, PNG, WebP. Максимум 5MB.
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Частота показа *
                </label>
                <select
                  className={styles.select}
                  value={form.frequency}
                  onChange={(e) => setForm({...form, frequency: e.target.value as any})}
                  required
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                  />
                  <span>Попап активен</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={resetForm}
                  disabled={saving}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
