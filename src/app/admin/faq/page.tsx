'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, MessageCircle, HelpCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { FAQ } from '@/types/database';
import styles from './page.module.css';

interface FAQForm {
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

const initialForm: FAQForm = {
  question: '',
  answer: '',
  is_active: true,
  sort_order: 1
};

export default function AdminFAQ() {
  const [faqItems, setFaqItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/faq');
      const data = await response.json();
      
      if (data.success) {
        setFaqItems(data.faq || []);
      }
    } catch (error) {
      console.error('Error loading FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // sort_order уже установлен в форме
      
      const url = editingFaq ? '/api/admin/faq' : '/api/admin/faq';
      const method = editingFaq ? 'PUT' : 'POST';
      
      const payload = editingFaq 
        ? { ...form, id: editingFaq.id }
        : form;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadFAQ();
        resetForm();
      } else {
        alert('Ошибка при сохранении FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Ошибка при сохранении FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот FAQ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/faq?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadFAQ();
      } else {
        alert('Ошибка при удалении FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Ошибка при удалении FAQ');
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
      sort_order: faq.sort_order
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingFaq(null);
    setShowForm(false);
  };

  const getNextSortOrder = () => {
    if (faqItems.length === 0) return 1;
    const maxOrder = Math.max(...faqItems.map(item => item.sort_order));
    return maxOrder + 1;
  };

  const handleAddNew = () => {
    setEditingFaq(null);
    setForm({
      ...initialForm,
      sort_order: getNextSortOrder()
    });
    setShowForm(true);
  };

  const showMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <AdminSidebar />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>FAQ</h1>
            <p className={styles.subtitle}>Управление часто задаваемыми вопросами</p>
          </div>
          <div className={styles.headerRight}>
            <button 
              onClick={handleAddNew}
              className={styles.addBtn}
            >
              <Plus size={20} />
              Добавить FAQ
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* FAQ List */}
        <div className={styles.faqGrid}>
          {faqItems.slice(0, visibleCount).map((faq) => (
            <div key={faq.id} className={styles.faqCard}>
              <div className={styles.faqHeader}>
                <div className={styles.faqIcon}>
                  <HelpCircle size={20} />
                </div>
                <div className={styles.faqActions}>
                  <button
                    onClick={() => startEdit(faq)}
                    className={styles.editBtn}
                    title="Редактировать"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className={styles.deleteBtn}
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className={styles.faqContent}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
              
              <div className={styles.faqFooter}>
                <div className={styles.faqMeta}>
                  <span className={`${styles.statusBadge} ${faq.is_active ? styles.active : styles.inactive}`}>
                    {faq.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                  <span className={styles.sortOrder}>#{faq.sort_order}</span>
                </div>
                <div className={styles.faqDate}>
                  {formatDate(faq.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {visibleCount < faqItems.length && (
          <div className={styles.showMoreContainer}>
            <button onClick={showMore} className={styles.showMoreBtn}>
              Показать еще ({faqItems.length - visibleCount} осталось)
            </button>
          </div>
        )}

        {/* Empty State */}
        {faqItems.length === 0 && (
          <div className={styles.emptyState}>
            <MessageCircle size={48} />
            <h3>Нет FAQ</h3>
            <p>Добавьте первый вопрос и ответ</p>
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingFaq ? 'Редактировать FAQ' : 'Добавить FAQ'}</h2>
              <button 
                onClick={resetForm}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Вопрос*
                  <textarea
                    value={form.question}
                    onChange={(e) => setForm({...form, question: e.target.value})}
                    placeholder="Введите вопрос..."
                    className={styles.textarea}
                    rows={3}
                    required
                  />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Ответ*
                  <textarea
                    value={form.answer}
                    onChange={(e) => setForm({...form, answer: e.target.value})}
                    placeholder="Введите ответ..."
                    className={styles.textarea}
                    rows={5}
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Порядок сортировки
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm({...form, sort_order: parseInt(e.target.value) || 0})}
                      className={styles.input}
                      min="0"
                    />
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({...form, is_active: e.target.checked})}
                    />
                    <span>Активен</span>
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.cancelBtn}
                  disabled={saving}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : editingFaq ? 'Обновить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}