'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, RefreshCw } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

interface LogEntry {
  id: number;
  event_type: string;
  max_user_id: number | null;
  telegram_id: number | null;
  chat_id: number | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface Stats {
  total: number;
  botStarted: number;
  linkSaved: number;
  userAdded: number;
  userKicked: number;
  accessGranted: number;
  errors: number;
}

const EVENT_BADGE_MAP: Record<string, { label: string; style: string }> = {
  'bot_started': { label: 'Старт бота', style: 'badgeBlue' },
  'link_saved': { label: 'Привязка', style: 'badgeGreen' },
  'link_already_exists': { label: 'Уже привязан', style: 'badgeGray' },
  'user_added': { label: 'Вступил', style: 'badgePurple' },
  'user_kicked': { label: 'Кикнут', style: 'badgeRed' },
  'access_granted': { label: 'Доступ дан', style: 'badgeGreen' },
  'phantom_deleted': { label: 'Фантом удалён', style: 'badgeYellow' },
  'message_created': { label: 'Сообщение', style: 'badgeGray' },
  'error': { label: 'Ошибка', style: 'badgeRed' },
};

function getEventBadge(eventType: string) {
  // Для raw: событий показываем тип без raw: префикса
  if (eventType.startsWith('raw:')) {
    const inner = eventType.replace('raw:', '');
    return { label: `RAW: ${inner}`, style: 'badgeGray' };
  }
  return EVENT_BADGE_MAP[eventType] || { label: eventType, style: 'badgeGray' };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return '';
  // Не показываем raw поле — оно слишком большое
  const filtered = Object.fromEntries(
    Object.entries(details).filter(([key]) => key !== 'raw')
  );
  if (Object.keys(filtered).length === 0) return '';
  return JSON.stringify(filtered, null, 2);
}

export default function MaxBotPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showRaw, setShowRaw] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      let url = '/api/max/logs?limit=200';
      if (filter !== 'all') {
        url += `&event_type=${filter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [filter]);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }
    setIsLoading(false);
    fetchLogs();
  }, [router, fetchLogs]);

  // Авто-обновление каждые 10 сек
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [isLoading, fetchLogs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
  };

  // Фильтруем raw: события если не включён showRaw
  const displayLogs = showRaw ? logs : logs.filter((l) => !l.event_type.startsWith('raw:'));

  const stats: Stats = {
    total: logs.filter((l) => !l.event_type.startsWith('raw:')).length,
    botStarted: logs.filter((l) => l.event_type === 'bot_started').length,
    linkSaved: logs.filter((l) => l.event_type === 'link_saved').length,
    userAdded: logs.filter((l) => l.event_type === 'user_added').length,
    userKicked: logs.filter((l) => l.event_type === 'user_kicked').length,
    accessGranted: logs.filter((l) => l.event_type === 'access_granted').length,
    errors: logs.filter((l) => l.event_type === 'error').length,
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <AdminSidebar />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <Bot size={28} className={styles.titleIcon} />
              Max Bot — Логи
            </h1>
            <p className={styles.subtitle}>
              Мониторинг событий Max бота в реальном времени
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.autoRefresh}>
              <span className={styles.liveDot} />
              Авто-обновление 10с
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={styles.refreshBtn}
            >
              <RefreshCw size={18} className={isRefreshing ? styles.spinning : ''} />
            </button>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Всего событий</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.linkSaved}</div>
            <div className={styles.statLabel}>Привязок</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.accessGranted}</div>
            <div className={styles.statLabel}>Допущено в канал</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.userKicked}</div>
            <div className={styles.statLabel}>Кикнуто</div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Тип события</label>
              <select
                className={styles.selectInput}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Все события</option>
                <option value="bot_started">Старт бота</option>
                <option value="link_saved">Привязка аккаунта</option>
                <option value="user_added">Вступление в канал</option>
                <option value="user_kicked">Кик из канала</option>
                <option value="access_granted">Доступ предоставлен</option>
                <option value="message_created">Сообщения</option>
                <option value="error">Ошибки</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>RAW данные</label>
              <select
                className={styles.selectInput}
                value={showRaw ? 'show' : 'hide'}
                onChange={(e) => setShowRaw(e.target.value === 'show')}
              >
                <option value="hide">Скрыть raw</option>
                <option value="show">Показать raw</option>
              </select>
            </div>
            {filter !== 'all' && (
              <button className={styles.resetBtn} onClick={() => setFilter('all')}>
                Сбросить
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <h3 className={styles.sectionTitle}>
              События ({displayLogs.length})
            </h3>
          </div>
          <div className={styles.tableWrapper}>
            {displayLogs.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Событий пока нет</p>
              </div>
            ) : (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>Событие</th>
                    <th>Max ID</th>
                    <th>Telegram ID</th>
                    <th>Chat ID</th>
                    <th>Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLogs.map((log) => {
                    const badge = getEventBadge(log.event_type);
                    return (
                      <tr key={log.id}>
                        <td className={styles.dateCell}>
                          {formatDate(log.created_at)}
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles[badge.style]}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className={styles.idCell}>
                          {log.max_user_id || '—'}
                        </td>
                        <td className={styles.idCell}>
                          {log.telegram_id || '—'}
                        </td>
                        <td className={styles.idCell}>
                          {log.chat_id || '—'}
                        </td>
                        <td className={styles.detailsCell}>
                          {formatDetails(log.details)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
