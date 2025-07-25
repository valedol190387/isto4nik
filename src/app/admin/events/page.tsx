'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Calendar, Clock, Palette, Tag } from 'lucide-react'
import styles from './page.module.css'

interface Event {
  id?: number
  title: string
  description: string
  event_date: string
  event_time: string
  icon: string
  color_class: string
  category: string
  link?: string
  is_active: boolean
}

const iconOptions = [
  { value: 'calendar', label: '📅 Календарь' },
  { value: 'heart', label: '❤️ Сердце' },
  { value: 'zap', label: '⚡ Молния' },
  { value: 'sun', label: '☀️ Солнце' },
  { value: 'star', label: '⭐ Звезда' },
  { value: 'sparkles', label: '✨ Искры' }
]

const colorOptions = [
  { value: 'green', label: 'Зеленый' },
  { value: 'orange', label: 'Оранжевый' },
  { value: 'red', label: 'Красный' }
]

const categoryOptions = [
  { value: 'практика', label: 'Практика' },
  { value: 'лекция', label: 'Лекция' },
  { value: 'активация', label: 'Активация' },
  { value: 'медитация', label: 'Медитация' },
  { value: 'встреча', label: 'Встреча' },
  { value: 'энергия', label: 'Энергия' }
]

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)

  const emptyEvent: Event = {
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '12:00',
    icon: 'calendar',
    color_class: 'green',
    category: 'практика',
    link: '',
    is_active: true
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      if (data.success) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Ошибка загрузки событий:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (event: Event) => {
    try {
      const method = event.id ? 'PUT' : 'POST'
      const response = await fetch('/api/events', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      const data = await response.json()
      if (data.success) {
        await fetchEvents() // Перезагружаем список
        setEditingEvent(null)
        setShowForm(false)
      }
    } catch (error) {
      console.error('Ошибка сохранения события:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это событие?')) return

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        await fetchEvents()
      }
    } catch (error) {
      console.error('Ошибка удаления события:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/calendar">
            <button className={styles.backButton}>
              <ArrowLeft size={24} />
            </button>
          </Link>
          <h1 className={styles.title}>Управление событиями</h1>
          <button
            onClick={() => {
              setEditingEvent(emptyEvent)
              setShowForm(true)
            }}
            className={styles.addButton}
          >
            <Plus size={20} />
            Добавить
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {(showForm || editingEvent) && (
          <div className={styles.formOverlay}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h3>{editingEvent?.id ? 'Редактировать событие' : 'Новое событие'}</h3>
                <button
                  onClick={() => {
                    setEditingEvent(null)
                    setShowForm(false)
                  }}
                  className={styles.closeButton}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.formFields}>
                <div className={styles.field}>
                  <label>Название события</label>
                  <input
                    type="text"
                    value={editingEvent?.title || ''}
                    onChange={(e) => editingEvent && setEditingEvent({...editingEvent, title: e.target.value})}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label>Описание</label>
                  <textarea
                    value={editingEvent?.description || ''}
                    onChange={(e) => editingEvent && setEditingEvent({...editingEvent, description: e.target.value})}
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label>Дата</label>
                    <input
                      type="date"
                      value={editingEvent?.event_date || ''}
                      onChange={(e) => editingEvent && setEditingEvent({...editingEvent, event_date: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Время</label>
                    <input
                      type="time"
                      value={editingEvent?.event_time || ''}
                      onChange={(e) => editingEvent && setEditingEvent({...editingEvent, event_time: e.target.value})}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label>Иконка</label>
                    <select
                      value={editingEvent?.icon || ''}
                      onChange={(e) => editingEvent && setEditingEvent({...editingEvent, icon: e.target.value})}
                      className={styles.select}
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Цвет</label>
                    <select
                      value={editingEvent?.color_class || ''}
                      onChange={(e) => editingEvent && setEditingEvent({...editingEvent, color_class: e.target.value})}
                      className={styles.select}
                    >
                      {colorOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Категория</label>
                  <select
                    value={editingEvent?.category || ''}
                    onChange={(e) => editingEvent && setEditingEvent({...editingEvent, category: e.target.value})}
                    className={styles.select}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Ссылка (необязательно)</label>
                  <input
                    type="url"
                    value={editingEvent?.link || ''}
                    onChange={(e) => editingEvent && setEditingEvent({...editingEvent, link: e.target.value})}
                    className={styles.input}
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editingEvent?.is_active || false}
                      onChange={(e) => editingEvent && setEditingEvent({...editingEvent, is_active: e.target.checked})}
                    />
                    Активное событие
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  onClick={() => editingEvent && handleSave(editingEvent)}
                  className={styles.saveButton}
                >
                  <Save size={16} />
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.eventsList}>
          {events.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>
                    <Calendar size={14} />
                    {formatDate(event.event_date)}
                  </span>
                  <span className={styles.eventTime}>
                    <Clock size={14} />
                    {event.event_time}
                  </span>
                  <span className={styles.eventCategory}>
                    <Tag size={14} />
                    {categoryOptions.find(c => c.value === event.category)?.label || event.category}
                  </span>
                </div>
                <div className={styles.eventSettings}>
                  <span className={`${styles.eventStatus} ${event.is_active ? styles.active : styles.inactive}`}>
                    {event.is_active ? 'Активно' : 'Неактивно'}
                  </span>
                  <span className={styles.eventColor}>
                    <Palette size={14} />
                    {colorOptions.find(c => c.value === event.color_class)?.label}
                  </span>
                </div>
              </div>
              <div className={styles.eventActions}>
                <button
                  onClick={() => {
                    setEditingEvent(event)
                    setShowForm(true)
                  }}
                  className={styles.editButton}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => event.id && handleDelete(event.id)}
                  className={styles.deleteButton}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className={styles.emptyState}>
            <p>Пока нет созданных событий</p>
            <button
              onClick={() => {
                setEditingEvent(emptyEvent)
                setShowForm(true)
              }}
              className={styles.addFirstButton}
            >
              <Plus size={20} />
              Создать первое событие
            </button>
          </div>
        )}
      </main>
    </div>
  )
} 