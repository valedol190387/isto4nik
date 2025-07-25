'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Zap, Heart, Sun, Loader2, Star, Sparkles } from "lucide-react"
import { Page } from '@/components/Page'
import styles from './page.module.css'

// Типы данных для событий из базы
interface DBEvent {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  event_time?: string;
  icon: string | null;
  color_class: string | null;
  is_active: boolean;
  link: string | null;
  category: string | null;
}

// Получаем текущую дату для генерации событий
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()

const months = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
]

const categoryNames: Record<string, string> = {
  'практика': 'Практика',
  'лекция': 'Лекция',
  'активация': 'Активация',
  'медитация': 'Медитация',
  'встреча': 'Встреча',
  'энергия': 'Энергия'
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentViewMonth, setCurrentViewMonth] = useState(currentMonth)
  const [currentViewYear, setCurrentViewYear] = useState(currentYear)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()

        if (data.success) {
          // Фильтруем только активные события
          const activeEvents = data.events.filter((event: DBEvent) => event.is_active)
          
          // Трансформируем данные в формат, ожидаемый UI
          const formattedEvents = activeEvents.map((event: DBEvent) => {
            // Получаем дату события
            const eventDate = new Date(event.event_date)
            
            // Получаем иконку в зависимости от значения из БД
            let icon = Star
            if (event.icon === 'calendar') icon = CalendarIcon
            else if (event.icon === 'zap') icon = Zap
            else if (event.icon === 'heart') icon = Heart
            else if (event.icon === 'sun') icon = Sun
            else if (event.icon === 'sparkles') icon = Sparkles
            
            // Получаем цвет в зависимости от значения из БД (используем палитру Ayuna)
            let color = "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
            if (event.color_class === 'orange') 
              color = "bg-orange-100 text-orange-600"
            else if (event.color_class === 'red') 
              color = "bg-pink-100 text-pink-600"
            else if (event.color_class === 'green') 
              color = "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
            
            return {
              id: event.id,
              date: eventDate,
              title: event.title,
              category: event.category || "событие",
              time: event.event_time ? `${event.event_time} МСК` : "12:00 МСК",
              description: event.description || "",
              icon: icon,
              color: color,
              link: event.link
            }
          })
          
          setEvents(formattedEvents)
        }
      } catch (err) {
        console.error("Ошибка загрузки событий:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [])
  
  // Проверяем, является ли текущий просматриваемый месяц текущим
  const isCurrentMonth = currentViewMonth === currentMonth && currentViewYear === currentYear
  
  // Получаем события для просматриваемого месяца
  const viewMonthEvents = events.filter(event => 
    event.date.getMonth() === currentViewMonth && 
    event.date.getFullYear() === currentViewYear
  )
  
  // Фильтруем события по выбранной дате и категории
  const filteredEvents = events.filter(event => {
    const dateMatch = selectedDate
      ? event.date.toDateString() === selectedDate.toDateString()
      : event.date.getMonth() === currentViewMonth && event.date.getFullYear() === currentViewYear
    
    const categoryMatch = !selectedCategory || event.category === selectedCategory
    
    return dateMatch && categoryMatch
  })
  
  // Получаем уникальные категории для фильтров
  const categories = Array.from(new Set(events.map(event => event.category)))
  
  // Получаем даты с событиями для подсветки в календаре (для просматриваемого месяца)
  const eventDates = viewMonthEvents.map(event => event.date.getDate())

  // Генерируем дни для календаря
  const firstDay = new Date(currentViewYear, currentViewMonth, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const calendarDays = []
  const current = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // Функции для навигации по месяцам
  const goToPreviousMonth = () => {
    if (currentViewMonth === 0) {
      setCurrentViewMonth(11)
      setCurrentViewYear(currentViewYear - 1)
    } else {
      setCurrentViewMonth(currentViewMonth - 1)
    }
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    if (currentViewMonth === 11) {
      setCurrentViewMonth(0)
      setCurrentViewYear(currentViewYear + 1)
    } else {
      setCurrentViewMonth(currentViewMonth + 1)
    }
    setSelectedDate(null)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    })
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.loadingIcon} />
          <p>Загрузка календаря...</p>
        </div>
      </div>
    )
  }

  return (
    <Page>
      <div className={styles.container}>
        {/* Заголовок страницы */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <CalendarIcon className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>Календарь</h1>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          
          {/* Month Navigation */}
          <div className={styles.monthCard}>
            <div className={styles.monthHeader}>
              <button 
                onClick={goToPreviousMonth}
                className={styles.monthButton}
              >
                <ChevronLeft className={styles.monthIcon} />
              </button>
              <h2 className={styles.monthTitle}>
                {months[currentViewMonth]} {currentViewYear}
              </h2>
              <button 
                onClick={goToNextMonth}
                className={styles.monthButton}
              >
                <ChevronRight className={styles.monthIcon} />
              </button>
            </div>
            <p className={styles.monthDescription}>
              {selectedDate
                ? `События на ${formatDate(selectedDate)}`
                : viewMonthEvents.length > 0 
                  ? `В этом месяце у нас запланировано ${viewMonthEvents.length} событий` 
                  : "В этом месяце пока нет запланированных событий"
              }
            </p>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                className={styles.showAllButton}
              >
                Показать все события
              </button>
            )}
          </div>
          
          {/* Category Filters */}
          {categories.length > 0 && (
            <div className={styles.filtersCard}>
              <h3 className={styles.filtersTitle}>Фильтры</h3>
              <div className={styles.filterButtons}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`${styles.filterButton} ${!selectedCategory ? styles.filterButtonActive : ''}`}
                >
                  Все
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`${styles.filterButton} ${selectedCategory === category ? styles.filterButtonActive : ''}`}
                  >
                    {categoryNames[category] || category}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Calendar Grid */}
          <div className={styles.calendarCard}>
            <div className={`${styles.calendarGrid} ${viewMonthEvents.length === 0 ? styles.calendarDisabled : ''}`}>
              <div className={styles.weekDays}>
                {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
                  <div key={day} className={styles.weekDay}>
                    {day}
                  </div>
                ))}
              </div>
              <div className={styles.calendarDays}>
                {calendarDays.map((day, index) => {
                  const isCurrentMonthDay = day.getMonth() === currentViewMonth
                  const isToday = day.toDateString() === currentDate.toDateString()
                  const hasEvent = isCurrentMonthDay && eventDates.includes(day.getDate())
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()
                  const hasEventsInMonth = viewMonthEvents.length > 0
                  
                  return (
                    <button
                      key={index}
                      onClick={() => hasEventsInMonth && setSelectedDate(day)}
                      disabled={!hasEventsInMonth}
                      className={`
                        ${styles.calendarDay}
                        ${isCurrentMonthDay ? styles.currentMonth : styles.otherMonth}
                        ${isToday ? styles.today : ''}
                        ${isSelected && !isToday ? styles.selected : ''}
                        ${hasEvent && !isToday && !isSelected ? styles.hasEvent : ''}
                        ${!hasEventsInMonth ? styles.disabled : ''}
                      `}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
            {viewMonthEvents.length === 0 && (
              <div className={styles.calendarOverlay}>
                <p>В этом месяце пока нет запланированных событий</p>
              </div>
            )}
          </div>

          {/* Events List */}
          <div className={styles.eventsSection}>
            <h3 className={styles.eventsTitle}>События</h3>
            {filteredEvents.length > 0 ? (
              <div className={styles.eventsList}>
                {filteredEvents.map((event) => {
                  const IconComponent = event.icon
                  
                  return (
                    <div key={event.id} className={styles.eventCard}>
                      <div className={styles.eventContent}>
                        <div className={`${styles.eventIcon} ${event.color}`}>
                          <IconComponent className={styles.eventIconSvg} />
                        </div>
                        <div className={styles.eventDetails}>
                          <div className={styles.eventHeader}>
                            <h4 className={styles.eventTitle}>
                              {event.title}
                            </h4>
                            <span className={styles.eventCategory}>
                              {categoryNames[event.category] || event.category}
                            </span>
                          </div>
                          <div className={styles.eventMeta}>
                            <span>{formatDate(event.date)}</span>
                            <div className={styles.eventTime}>
                              <Clock className={styles.eventTimeIcon} />
                              <span>{event.time}</span>
                            </div>
                          </div>
                          <p className={styles.eventDescription}>
                            {event.description}
                          </p>
                          {event.link && (
                            <div className={styles.eventLink}>
                              <Link 
                                href={event.link} 
                                target="_blank"
                                className={styles.eventLinkButton}
                              >
                                Подробнее
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>
                  {selectedDate ? "На выбранную дату событий нет" : "В этом месяце пока нет запланированных событий"}
                </p>
              </div>
            )}
          </div>

          {/* Bottom spacing */}
          <div className={styles.bottomSpacing}></div>
        </div>
      </div>
    </Page>
  )
} 