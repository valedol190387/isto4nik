'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Eye, RefreshCw, Search, X, ChevronDown } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

interface ViewLog {
  id: number;
  telegram_id: number;
  material_id: number;
  material_title: string | null;
  video_index: number | null;
  video_title: string | null;
  event_type: 'lesson_open' | 'video_view';
  username: string | null;
  utm_1: string | null;
  utm_2: string | null;
  utm_3: string | null;
  utm_4: string | null;
  utm_5: string | null;
  created_at: string;
}

interface MaterialOption {
  id: number;
  title: string;
}

interface SummaryByMaterial {
  material_id: number;
  material_title: string;
  unique_users: number;
  total_opens: number;
  video_views: number;
  unique_video_viewers: number;
}

interface UserMaterialDetail {
  material_id: number;
  material_title: string;
  opens: number;
  videos_watched: string[];
}

interface SummaryByUser {
  telegram_id: number;
  username: string | null;
  utm_1: string | null;
  materials_opened: number;
  total_opens: number;
  videos_watched: number;
  last_activity: string;
  details: UserMaterialDetail[];
}

export default function ViewsReportPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ViewLog[]>([]);
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'users' | 'details'>('summary');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }
    loadData();
  }, [dateFrom, dateTo, selectedMaterial]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (selectedMaterial) params.append('material_id', selectedMaterial);

      const response = await fetch(`/api/admin/views-report?${params}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
        setMaterials(result.data.materials);
      }
    } catch (error) {
      console.error('Error loading views data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация логов
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (eventTypeFilter && log.event_type !== eventTypeFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          (log.telegram_id?.toString() || '').includes(search) ||
          (log.username || '').toLowerCase().includes(search) ||
          (log.material_title || '').toLowerCase().includes(search) ||
          (log.video_title || '').toLowerCase().includes(search) ||
          (log.utm_1 || '').toLowerCase().includes(search) ||
          (log.utm_2 || '').toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [logs, eventTypeFilter, searchTerm]);

  // Сводка по материалам
  const summaryByMaterial = useMemo((): SummaryByMaterial[] => {
    const map = new Map<number, {
      material_title: string;
      users_open: Set<number>;
      total_opens: number;
      video_views: number;
      users_video: Set<number>;
    }>();

    filteredLogs.forEach(log => {
      if (!map.has(log.material_id)) {
        map.set(log.material_id, {
          material_title: log.material_title || `ID: ${log.material_id}`,
          users_open: new Set(),
          total_opens: 0,
          video_views: 0,
          users_video: new Set(),
        });
      }
      const entry = map.get(log.material_id)!;
      if (log.event_type === 'lesson_open') {
        entry.users_open.add(log.telegram_id);
        entry.total_opens++;
      }
      if (log.event_type === 'video_view') {
        entry.video_views++;
        entry.users_video.add(log.telegram_id);
      }
    });

    return Array.from(map.entries()).map(([material_id, entry]) => ({
      material_id,
      material_title: entry.material_title,
      unique_users: entry.users_open.size,
      total_opens: entry.total_opens,
      video_views: entry.video_views,
      unique_video_viewers: entry.users_video.size,
    })).sort((a, b) => b.unique_users - a.unique_users);
  }, [filteredLogs]);

  // Сводка по пользователям
  const summaryByUser = useMemo((): SummaryByUser[] => {
    const map = new Map<number, {
      username: string | null;
      utm_1: string | null;
      materials: Map<number, { title: string; opens: number; videos: Set<string> }>;
      total_opens: number;
      videos_watched: number;
      last_activity: string;
    }>();

    filteredLogs.forEach(log => {
      if (!map.has(log.telegram_id)) {
        map.set(log.telegram_id, {
          username: log.username,
          utm_1: log.utm_1,
          materials: new Map(),
          total_opens: 0,
          videos_watched: 0,
          last_activity: log.created_at,
        });
      }
      const entry = map.get(log.telegram_id)!;

      if (log.created_at > entry.last_activity) {
        entry.last_activity = log.created_at;
      }

      if (!entry.materials.has(log.material_id)) {
        entry.materials.set(log.material_id, {
          title: log.material_title || `ID: ${log.material_id}`,
          opens: 0,
          videos: new Set(),
        });
      }
      const mat = entry.materials.get(log.material_id)!;

      if (log.event_type === 'lesson_open') {
        entry.total_opens++;
        mat.opens++;
      }
      if (log.event_type === 'video_view' && log.video_title) {
        entry.videos_watched++;
        mat.videos.add(log.video_title);
      }
    });

    return Array.from(map.entries()).map(([telegram_id, entry]) => ({
      telegram_id,
      username: entry.username,
      utm_1: entry.utm_1,
      materials_opened: entry.materials.size,
      total_opens: entry.total_opens,
      videos_watched: entry.videos_watched,
      last_activity: entry.last_activity,
      details: Array.from(entry.materials.entries()).map(([material_id, mat]) => ({
        material_id,
        material_title: mat.title,
        opens: mat.opens,
        videos_watched: Array.from(mat.videos),
      })),
    })).sort((a, b) => b.total_opens - a.total_opens);
  }, [filteredLogs]);

  // Общие итоги
  const totals = useMemo(() => {
    const uniqueUsers = new Set(filteredLogs.filter(l => l.event_type === 'lesson_open').map(l => l.telegram_id));
    const totalOpens = filteredLogs.filter(l => l.event_type === 'lesson_open').length;
    const totalVideoViews = filteredLogs.filter(l => l.event_type === 'video_view').length;
    const uniqueVideoViewers = new Set(filteredLogs.filter(l => l.event_type === 'video_view').map(l => l.telegram_id));
    const uniqueMaterials = new Set(filteredLogs.map(l => l.material_id));

    return {
      uniqueUsers: uniqueUsers.size,
      totalOpens,
      totalVideoViews,
      uniqueVideoViewers: uniqueVideoViewers.size,
      uniqueMaterials: uniqueMaterials.size,
    };
  }, [filteredLogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) return;

    const headers = [
      'Дата', 'Telegram ID', 'Username', 'Материал', 'Тип', 'Видео',
      'utm_1', 'utm_2', 'utm_3', 'utm_4', 'utm_5'
    ];

    const csvRows = [
      headers.join(';'),
      ...filteredLogs.map(log => [
        formatDate(log.created_at),
        log.telegram_id,
        log.username || '',
        log.material_title || log.material_id,
        log.event_type === 'lesson_open' ? 'Открытие урока' : 'Просмотр видео',
        log.video_title || '',
        log.utm_1 || '',
        log.utm_2 || '',
        log.utm_3 || '',
        log.utm_4 || '',
        log.utm_5 || '',
      ].join(';'))
    ];

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `views_report_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedMaterial('');
    setSearchTerm('');
    setEventTypeFilter('');
  };

  const hasActiveFilters = dateFrom || dateTo || selectedMaterial || searchTerm || eventTypeFilter;

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка отчета...</p>
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
            <h1 className={styles.title}>
              <Eye size={28} className={styles.titleIcon} />
              Просмотры материалов
            </h1>
            <p className={styles.subtitle}>
              Аналитика просмотров уроков и видео пользователями
            </p>
          </div>
          <div className={styles.headerRight}>
            <button
              onClick={loadData}
              className={styles.refreshBtn}
              disabled={isLoading}
            >
              <RefreshCw size={18} className={isLoading ? styles.spinning : ''} />
            </button>
            <button
              onClick={exportToCSV}
              className={styles.exportBtn}
              disabled={!filteredLogs.length}
            >
              <Download size={18} />
              Экспорт CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersContent}>
            <div className={styles.filtersRow}>
              <div className={styles.searchGroup}>
                <label className={styles.filterLabel}>Поиск</label>
                <div className={styles.searchContainer}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="ID, username, название..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className={styles.clearSearchBtn}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Материал</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="">Все материалы</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Тип события</label>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="">Все события</option>
                  <option value="lesson_open">Открытие урока</option>
                  <option value="video_view">Просмотр видео</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Дата от</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Дата до</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              {hasActiveFilters && (
                <button onClick={resetFilters} className={styles.resetBtn}>
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{totals.uniqueUsers}</div>
            <div className={styles.summaryLabel}>Уник. пользователей</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{totals.totalOpens}</div>
            <div className={styles.summaryLabel}>Открытий уроков</div>
          </div>
          <div className={`${styles.summaryCard} ${styles.videoCard}`}>
            <div className={styles.summaryValue}>{totals.totalVideoViews}</div>
            <div className={styles.summaryLabel}>Просмотров видео</div>
            <div className={styles.summarySubtext}>{totals.uniqueVideoViewers} уник. чел.</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{totals.uniqueMaterials}</div>
            <div className={styles.summaryLabel}>Материалов</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'summary' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            По материалам
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            По пользователям ({summaryByUser.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Детальный лог ({filteredLogs.length})
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className={styles.tableSection}>
            <div className={styles.tableSectionHeader}>
              <h3 className={styles.sectionTitle}>
                Сводка по материалам ({summaryByMaterial.length})
              </h3>
            </div>
            {summaryByMaterial.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th className={styles.numericCol}>ID</th>
                      <th>Материал</th>
                      <th className={styles.numericCol}>Уник. пользователей</th>
                      <th className={styles.numericCol}>Всего открытий</th>
                      <th className={styles.numericCol}>Просмотров видео</th>
                      <th className={styles.numericCol}>Смотрели видео (чел)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryByMaterial.map((row) => (
                      <tr key={row.material_id}>
                        <td className={styles.idCell}>{row.material_id}</td>
                        <td className={styles.materialCell}>{row.material_title}</td>
                        <td className={styles.numericCell}>{row.unique_users}</td>
                        <td className={styles.numericCell}>{row.total_opens}</td>
                        <td className={styles.numericCell}>{row.video_views}</td>
                        <td className={styles.numericCell}>{row.unique_video_viewers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Нет данных для отображения</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={styles.tableSection}>
            <div className={styles.tableSectionHeader}>
              <h3 className={styles.sectionTitle}>
                По пользователям ({summaryByUser.length})
              </h3>
            </div>
            {summaryByUser.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Telegram ID</th>
                      <th>Username</th>
                      <th>utm_1</th>
                      <th className={styles.numericCol}>Материалов</th>
                      <th className={styles.numericCol}>Открытий</th>
                      <th className={styles.numericCol}>Видео</th>
                      <th>Посл. активность</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryByUser.map((user) => (
                      <>
                        <tr
                          key={user.telegram_id}
                          className={expandedUser === user.telegram_id ? styles.expandedRow : ''}
                          onClick={() => setExpandedUser(expandedUser === user.telegram_id ? null : user.telegram_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className={styles.idCell}>{user.telegram_id}</td>
                          <td className={styles.usernameCell}>{user.username || '—'}</td>
                          <td className={styles.utmCell}>{user.utm_1 || '—'}</td>
                          <td className={styles.numericCell}>{user.materials_opened}</td>
                          <td className={styles.numericCell}>{user.total_opens}</td>
                          <td className={styles.numericCell}>{user.videos_watched}</td>
                          <td className={styles.dateCell}>{formatDate(user.last_activity)}</td>
                          <td className={styles.expandCell}>
                            <ChevronDown
                              size={16}
                              className={expandedUser === user.telegram_id ? styles.expandedIcon : ''}
                            />
                          </td>
                        </tr>
                        {expandedUser === user.telegram_id && (
                          <tr key={`${user.telegram_id}-details`}>
                            <td colSpan={8} className={styles.expandedContent}>
                              <div className={styles.userDetails}>
                                {user.details.map((det) => (
                                  <div key={det.material_id} className={styles.userDetailItem}>
                                    <div className={styles.userDetailMaterial}>
                                      <span className={styles.userDetailId}>#{det.material_id}</span>
                                      <span className={styles.userDetailTitle}>{det.material_title}</span>
                                      <span className={styles.userDetailOpens}>{det.opens} откр.</span>
                                    </div>
                                    {det.videos_watched.length > 0 && (
                                      <div className={styles.userDetailVideos}>
                                        {det.videos_watched.map((v, i) => (
                                          <span key={i} className={styles.videoTag}>{v}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Нет данных для отображения</p>
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className={styles.tableSection}>
            <div className={styles.tableSectionHeader}>
              <h3 className={styles.sectionTitle}>
                Детальный лог ({filteredLogs.length} записей)
              </h3>
            </div>
            {filteredLogs.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Telegram ID</th>
                      <th>Username</th>
                      <th className={styles.numericCol}>Mat. ID</th>
                      <th>Материал</th>
                      <th>Тип</th>
                      <th>Видео</th>
                      <th>utm_1</th>
                      <th>utm_2</th>
                      <th>utm_3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 500).map((log) => (
                      <tr key={log.id}>
                        <td className={styles.dateCell}>{formatDate(log.created_at)}</td>
                        <td className={styles.idCell}>{log.telegram_id}</td>
                        <td className={styles.usernameCell}>{log.username || '—'}</td>
                        <td className={styles.idCell}>{log.material_id}</td>
                        <td className={styles.materialCell}>{log.material_title || '—'}</td>
                        <td>
                          <span className={`${styles.badge} ${log.event_type === 'lesson_open' ? styles.badgeOpen : styles.badgeVideo}`}>
                            {log.event_type === 'lesson_open' ? 'Урок' : 'Видео'}
                          </span>
                        </td>
                        <td className={styles.videoCell}>{log.video_title || '—'}</td>
                        <td className={styles.utmCell}>{log.utm_1 || '—'}</td>
                        <td className={styles.utmCell}>{log.utm_2 || '—'}</td>
                        <td className={styles.utmCell}>{log.utm_3 || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length > 500 && (
                  <div className={styles.truncatedNote}>
                    Показано 500 из {filteredLogs.length} записей. Используйте фильтры или экспортируйте CSV.
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Нет данных для отображения</p>
                <p className={styles.emptyHint}>Попробуйте изменить фильтры</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
