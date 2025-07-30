'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  icon: string | null;
  link: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EventForm {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  icon: string;
  link: string;
  tags: string[];
  newTag: string;
}

const initialForm: EventForm = {
  title: '',
  description: '',
  event_date: '',
  event_time: '',
  icon: 'Calendar',
  link: '',
  tags: [],
  newTag: ''
};

const availableTags = [
  'тренировка',
  'питание', 
  'консультация',
  'вебинар',
  'прямой эфир',
  'йога',
  'кардио',
  'силовая',
  'растяжка',
  'медитация',
  'рецепты',
  'мотивация',
  'групповая',
  'индивидуальная',
  'начинающие',
  'продвинутые'
];

// Импортируем общие настройки иконок
import { iconOptions, renderIcon } from '@/utils/iconRenderer';

export default function AdminSchedule() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }

    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoscowDateTime = () => {
    const now = new Date();
    const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
    return {
      date: moscowTime.toISOString().split('T')[0],
      time: moscowTime.toTimeString().slice(0, 5)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';
      const body = editingEvent 
        ? { ...form, id: editingEvent.id }
        : form;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchEvents();
        setShowForm(false);
        setEditingEvent(null);
        setForm(initialForm);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      icon: event.icon || 'Calendar',
      link: event.link || '',
      tags: event.tags || [],
      newTag: ''
    });
    setShowForm(true);
  };

  const handleTagToggle = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddNewTag = () => {
    const newTag = form.newTag.trim();
    if (newTag && !form.tags.includes(newTag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
        newTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };



  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это событие?')) return;

    try {
      const response = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDateTime = (date: string, time: string | null) => {
    const eventDate = new Date(date);
    const dateStr = eventDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return time ? `${dateStr} в ${time} (МСК)` : dateStr;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <AdminSidebar />
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p>Загрузка расписания...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminSidebar />
      
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <Calendar className={styles.titleIcon} />
              Управление расписанием
            </h1>
            <p className={styles.subtitle}>
              Время указывается по Москве (МСК). Всего событий: {events.length}
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingEvent(null);
              setForm(initialForm);
            }}
            className={styles.addBtn}
          >
            <Plus size={20} />
            Добавить событие
          </button>
        </div>

        {/* Events List */}
        <div className={styles.eventsList}>
          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={48} />
              <h3>Пока нет событий</h3>
              <p>Создайте первое событие для календаря</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                                 <div className={styles.eventHeader}>
                   <div className={styles.eventIcon}>
                     {renderIcon(event.icon || 'Calendar', 24)}
                   </div>
                  <div className={styles.eventInfo}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDateTime}>
                      {formatDateTime(event.event_date, event.event_time)}
                    </p>
                    {event.description && (
                      <p className={styles.eventDescription}>{event.description}</p>
                    )}
                                         <div className={styles.eventMeta}>
                       <div className={styles.eventTags}>
                         {event.tags && event.tags.map((tag, index) => (
                           <span key={index} className={styles.eventTag}>
                             {tag}
                           </span>
                         ))}
                       </div>
                       {event.link && (
                         <a href={event.link} target="_blank" rel="noopener noreferrer" className={styles.eventLink}>
                           <LinkIcon size={14} />
                           Ссылка
                         </a>
                       )}
                     </div>
                   </div>
                </div>
                <div className={styles.eventActions}>
                  <button
                    onClick={() => handleEdit(event)}
                    className={styles.editBtn}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingEvent ? 'Редактировать событие' : 'Новое событие'}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  setForm(initialForm);
                }}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Название события *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                    placeholder="Например: Утренняя тренировка"
                  />
                </div>
                                 <div className={styles.formGroup}>
                   <label>Иконка</label>
                   <select
                     value={form.icon}
                     onChange={(e) => setForm({...form, icon: e.target.value})}
                   >
                     {iconOptions.map(icon => (
                       <option key={icon.value} value={icon.value}>{icon.label}</option>
                     ))}
                   </select>
                 </div>
              </div>

              <div className={styles.formGroup}>
                <label>Описание</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Краткое описание события"
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Дата *</label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm({...form, event_date: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Время (МСК)</label>
                  <input
                    type="time"
                    value={form.event_time}
                    onChange={(e) => setForm({...form, event_time: e.target.value})}
                  />
                </div>
              </div>

                             <div className={styles.formGroup}>
                 <label>Теги</label>
                 <div className={styles.tagsContainer}>
                   <div className={styles.availableTags}>
                     <div className={styles.tagsTitle}>Доступные теги:</div>
                     <div className={styles.tagsGrid}>
                       {availableTags.map(tag => (
                         <button
                           key={tag}
                           type="button"
                           className={`${styles.tagButton} ${
                             form.tags.includes(tag) ? styles.tagButtonActive : ''
                           }`}
                           onClick={() => handleTagToggle(tag)}
                         >
                           {tag}
                         </button>
                       ))}
                     </div>
                   </div>
                   
                   <div className={styles.customTag}>
                     <div className={styles.tagsTitle}>Добавить свой тег:</div>
                     <div className={styles.customTagInput}>
                       <input
                         type="text"
                         value={form.newTag}
                         onChange={(e) => setForm({...form, newTag: e.target.value})}
                         placeholder="Введите тег"
                         onKeyPress={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             handleAddNewTag();
                           }
                         }}
                       />
                       <button
                         type="button"
                         onClick={handleAddNewTag}
                         className={styles.addTagBtn}
                       >
                         Добавить
                       </button>
                     </div>
                   </div>

                   {form.tags.length > 0 && (
                     <div className={styles.selectedTags}>
                       <div className={styles.tagsTitle}>Выбранные теги:</div>
                       <div className={styles.selectedTagsList}>
                         {form.tags.map(tag => (
                           <span key={tag} className={styles.selectedTag}>
                             {tag}
                             <button
                               type="button"
                               onClick={() => handleRemoveTag(tag)}
                               className={styles.removeTagBtn}
                             >
                               <X size={12} />
                             </button>
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               </div>

              <div className={styles.formGroup}>
                <label>Ссылка</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({...form, link: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                    setForm(initialForm);
                  }}
                  className={styles.cancelBtn}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.saveBtn}
                >
                  <Save size={16} />
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