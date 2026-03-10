'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ClipboardList, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

// Названия экранов воронки
const SCREEN_NAMES: Record<string, string> = {
  'screen-1': 'Вступление',
  'screen-2': 'Самотерапия (видео)',
  'screen-3': 'Выбор ситуации',
  'category-money': 'Деньги и фин. потолки',
  'category-husband': 'Отношения с мужем',
  'category-parents': 'Напряжение с родителями',
  'category-ceiling': 'Пробить фин. потолок',
  'category-children': 'Отношения с детьми',
  'category-longterm': 'Долгие отношения',
  'about': 'Про Источник',
};

const ALL_SCREENS = Object.keys(SCREEN_NAMES);

function getScreenName(screen: string): string {
  return SCREEN_NAMES[screen] || screen;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return '#22c55e';
  if (pct >= 60) return '#3b82f6';
  if (pct >= 30) return '#f59e0b';
  return '#ef4444';
}

interface FunnelRow {
  id: number;
  telegram_id: number;
  session_id: string;
  current_screen: string;
  max_screen: string;
  screens_visited: string[];
  videos_watched: string[];
  videos_watched_count: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  username: string | null;
  name_from_ml: string | null;
  user_status: string | null;
  utm_1: string | null;
  utm_2: string | null;
  utm_3: string | null;
  utm_4: string | null;
  utm_5: string | null;
  user_created_at: string | null;
}

export default function FunnelReportPage() {
  const [data, setData] = useState<FunnelRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [utmFilters, setUtmFilters] = useState<Record<string, string>>({ utm_1: '', utm_2: '', utm_3: '', utm_4: '', utm_5: '' });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const res = await fetch(`/api/admin/funnel-report?${params}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading funnel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [dateFrom, dateTo]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      for (const key of ['utm_1', 'utm_2', 'utm_3', 'utm_4', 'utm_5'] as const) {
        const filter = utmFilters[key];
        if (filter && (row[key] || '') !== filter) return false;
      }
      return true;
    });
  }, [data, utmFilters]);

  const utmOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    for (const key of ['utm_1', 'utm_2', 'utm_3', 'utm_4', 'utm_5']) {
      const vals = new Set(data.map(r => (r as any)[key]).filter(Boolean));
      opts[key] = [...vals].sort();
    }
    return opts;
  }, [data]);

  const summary = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(r => r.completed).length;
    const uniqueUsers = new Set(filteredData.map(r => r.telegram_id)).size;
    const totalVideos = filteredData.reduce((s, r) => s + (r.videos_watched_count || 0), 0);
    const avgVideos = total > 0 ? Math.round(totalVideos / total * 10) / 10 : 0;

    // Воронка по экранам
    const screenCounts: Record<string, number> = {};
    ALL_SCREENS.forEach(s => { screenCounts[s] = 0; });
    filteredData.forEach(row => {
      (row.screens_visited || []).forEach(s => {
        if (s in screenCounts) screenCounts[s]++;
      });
    });

    return { total, completed, uniqueUsers, totalVideos, avgVideos, screenCounts };
  }, [filteredData]);

  const exportToExcel = () => {
    const rows = filteredData.map(row => ({
      'Пользователь': row.name_from_ml || row.username || '',
      'Telegram ID': row.telegram_id,
      'UTM_1': row.utm_1 || '',
      'UTM_2': row.utm_2 || '',
      'UTM_3': row.utm_3 || '',
      'Текущий экран': getScreenName(row.current_screen),
      'Макс. экран': getScreenName(row.max_screen),
      'Видео просмотрено': row.videos_watched_count || 0,
      'Экраны': (row.screens_visited || []).map(getScreenName).join(', '),
      'Видео': (row.videos_watched || []).join(', '),
      'Завершил': row.completed ? 'Да' : 'Нет',
      'Дата': new Date(row.created_at).toLocaleString('ru-RU'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Воронка');
    XLSX.writeFile(wb, `funnel_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Загрузка данных...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <AdminSidebar />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <ClipboardList className={styles.titleIcon} size={28} />
              Онбординг New
            </h1>
            <p className={styles.subtitle}>
              Статистика прохождения воронки «Начни отсюда»
            </p>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.exportBtn} onClick={exportToExcel} disabled={filteredData.length === 0}>
              <Download size={16} />
              Excel
            </button>
            <button className={styles.refreshBtn} onClick={loadData}>
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Дата от</label>
              <input type="date" className={styles.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Дата до</label>
              <input type="date" className={styles.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            {(['utm_1', 'utm_2', 'utm_3', 'utm_4', 'utm_5'] as const).map(key => (
              <div className={styles.filterGroup} key={key}>
                <label className={styles.filterLabel}>{key.toUpperCase()}</label>
                <select
                  className={styles.dateInput}
                  value={utmFilters[key]}
                  onChange={e => setUtmFilters(prev => ({ ...prev, [key]: e.target.value }))}
                >
                  <option value="">Все</option>
                  {utmOptions[key]?.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{summary.total}</div>
            <div className={styles.summaryLabel}>Всего сессий</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{summary.uniqueUsers}</div>
            <div className={styles.summaryLabel}>Уник. пользователей</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{summary.completed}</div>
            <div className={styles.summaryLabel}>Дошли до «Про Источник»</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{summary.totalVideos}</div>
            <div className={styles.summaryLabel}>Всего просмотров видео</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{summary.avgVideos}</div>
            <div className={styles.summaryLabel}>Ср. видео на юзера</div>
          </div>
        </div>

        {/* Воронка по экранам */}
        <div className={styles.funnelSection}>
          <div className={styles.funnelTitle}>Воронка по экранам</div>
          <div className={styles.funnelBars}>
            {ALL_SCREENS.map(screenKey => {
              const count = summary.screenCounts[screenKey] || 0;
              const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
              return (
                <div key={screenKey} className={styles.funnelRow}>
                  <div className={styles.funnelLabel}>{getScreenName(screenKey)}</div>
                  <div className={styles.funnelBarTrack}>
                    <div
                      className={styles.funnelBarFill}
                      style={{ width: `${pct}%`, background: getProgressColor(pct) }}
                    />
                  </div>
                  <div className={styles.funnelCount}>{count} ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableSection}>
          {filteredData.length === 0 ? (
            <div className={styles.emptyState}>Нет данных по воронке</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>UTM_1</th>
                  <th>UTM_2</th>
                  <th>UTM_3</th>
                  <th>Текущий экран</th>
                  <th>Экраны</th>
                  <th>Видео</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(row => {
                  const screensCount = (row.screens_visited || []).length;
                  return (
                    <tr key={row.session_id}>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.userName}>
                            {row.name_from_ml || row.username || '—'}
                          </span>
                          <span className={styles.userId}>{row.telegram_id}</span>
                        </div>
                      </td>
                      <td className={styles.utmCell}>{row.utm_1 || '—'}</td>
                      <td className={styles.utmCell}>{row.utm_2 || '—'}</td>
                      <td className={styles.utmCell}>{row.utm_3 || '—'}</td>
                      <td>
                        <span className={styles.screenBadge}>
                          {getScreenName(row.current_screen)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.screensDotsRow}>
                          {ALL_SCREENS.map(s => (
                            <span
                              key={s}
                              className={`${styles.screenDot} ${
                                (row.screens_visited || []).includes(s) ? styles.screenDotDone : styles.screenDotPending
                              }`}
                              title={getScreenName(s)}
                            />
                          ))}
                          <span className={styles.screensCountText}>{screensCount}/{ALL_SCREENS.length}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.videosCount}>
                          {row.videos_watched_count || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.completedBadge} ${row.completed ? styles.completedYes : styles.completedNo}`}>
                          {row.completed ? 'Дошёл' : 'В процессе'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        {new Date(row.created_at).toLocaleDateString('ru-RU')}<br />
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>
                          {new Date(row.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
