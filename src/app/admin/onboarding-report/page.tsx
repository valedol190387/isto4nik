'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ClipboardList, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

// Те же вопросы что в онбординге — для отображения ответов
const QUESTIONS = [
  { label: '1/5', title: 'Что для вас сейчас главное?', options: ['Внутренняя опора и состояние', 'Разобраться со сливом денег', 'Отношения', 'Сложный выбор / тупик', 'Пока не могу сформулировать'] },
  { label: '2/5', title: 'Нестабильность?', options: ['Деньги / доход', 'Отношения', 'Я сам(а): тревога, усталость', 'Будущее / неопределённость', 'Всё сразу'] },
  { label: '3/5', title: 'Что хотите получить?', options: ['Понять, что со мной', 'Ответы и ясность', 'Поддержку', 'Структуру и ориентиры', 'Быть в правильном пространстве'] },
  { label: '4/5', title: 'Как комфортнее?', options: ['Читать и смотреть', 'Иногда писать', 'Диалог и обсуждения', 'Пока не знаю'] },
  { label: '5/5', title: 'Какой путь?', options: ['Быстро разобраться', 'Постепенные изменения', 'Долгий путь и глубину'] },
];

// Названия шагов онбординга
const STEP_NAMES: Record<number, string> = {
  0: 'Приветствие',
  1: 'Введение',
  2: 'Вопрос 1/5',
  3: 'Вопрос 2/5',
  4: 'Вопрос 3/5',
  5: 'Вопрос 4/5',
  6: 'Вопрос 5/5',
  7: 'Спасибо',
  8: 'Персональный текст',
  9: 'УМиЧ — 1',
  10: 'УМиЧ — 2',
  11: 'Разборы вопросов',
  12: 'УМиЧ — 3',
  13: 'Подкаст Елены',
  14: 'УМиЧ — 4',
  15: 'УМиЧ — 5',
  16: 'Zoom-эфир',
  17: 'Ветка курса',
  18: 'Финиш',
};

const TOTAL_STEPS = 18;

function getStepName(step: number): string {
  return STEP_NAMES[step] || `Шаг ${step}`;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return '#22c55e';
  if (pct >= 60) return '#3b82f6';
  if (pct >= 30) return '#f59e0b';
  return '#ef4444';
}

interface OnboardingRow {
  id: number;
  telegram_id: number;
  session_id: string;
  current_step: number;
  max_step: number;
  answers: Record<string, number>;
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
  skipped: boolean;
}

export default function OnboardingReportPage() {
  const [data, setData] = useState<OnboardingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [utmFilters, setUtmFilters] = useState<Record<string, string>>({ utm_1: '', utm_2: '', utm_3: '', utm_4: '', utm_5: '' });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const res = await fetch(`/api/admin/onboarding-report?${params}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [dateFrom, dateTo]);

  // Фильтрованные данные
  const filteredData = useMemo(() => {
    return data.filter(row => {
      for (const key of ['utm_1', 'utm_2', 'utm_3', 'utm_4', 'utm_5'] as const) {
        const filter = utmFilters[key];
        if (filter && (row[key] || '') !== filter) return false;
      }
      return true;
    });
  }, [data, utmFilters]);

  // Уникальные UTM значения для фильтров
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
    const skipped = filteredData.filter(r => r.skipped).length;
    const uniqueUsers = new Set(filteredData.map(r => r.telegram_id)).size;
    const avgMaxStep = total > 0 ? Math.round(filteredData.reduce((s, r) => s + r.max_step, 0) / total * 10) / 10 : 0;
    return { total, completed, skipped, uniqueUsers, avgMaxStep };
  }, [filteredData]);

  const exportToExcel = () => {
    const rows = filteredData.map(row => {
      const answersObj = row.answers || {};
      const answersText = Object.entries(answersObj).map(([qIdx, aIdx]) => {
        const q = QUESTIONS[Number(qIdx)];
        return q ? `${q.label}: ${q.options[aIdx as number] || '?'}` : '';
      }).filter(Boolean).join('; ');

      return {
        'Пользователь': row.name_from_ml || row.username || '',
        'Telegram ID': row.telegram_id,
        'UTM_1': row.utm_1 || '',
        'UTM_2': row.utm_2 || '',
        'UTM_3': row.utm_3 || '',
        'UTM_4': row.utm_4 || '',
        'UTM_5': row.utm_5 || '',
        'Прогресс %': Math.round((row.max_step / TOTAL_STEPS) * 100),
        'Макс. шаг': row.max_step,
        'Статус': row.skipped ? 'Пропустил' : row.completed ? 'Завершён' : 'В процессе',
        'Дата': new Date(row.created_at).toLocaleString('ru-RU'),
        'Ответы': answersText,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Онбординг');
    XLSX.writeFile(wb, `onboarding_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
              Онбординг
            </h1>
            <p className={styles.subtitle}>
              Статистика прохождения онбординга
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
            <div className={styles.summaryLabel}>Завершили</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue} style={{ color: '#ef4444' }}>{summary.skipped}</div>
            <div className={styles.summaryLabel}>Пропустили</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{summary.avgMaxStep}</div>
            <div className={styles.summaryLabel}>Ср. макс. шаг</div>
          </div>
        </div>

        {/* Legend */}
        <div className={styles.legendSection}>
          <div className={styles.legendTitle}>Легенда этапов</div>
          <div className={styles.legendGrid}>
            {Object.entries(STEP_NAMES).map(([num, name]) => (
              <div key={num} className={styles.legendItem}>
                <span className={styles.legendNum}>{num}</span>
                <span className={styles.legendName}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableSection}>
          {filteredData.length === 0 ? (
            <div className={styles.emptyState}>Нет данных по онбордингу</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>UTM_1</th>
                  <th>UTM_2</th>
                  <th>UTM_3</th>
                  <th>UTM_4</th>
                  <th>UTM_5</th>
                  <th>Прогресс</th>
                  <th>Этапы</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Ответы</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(row => {
                  const pct = Math.round((row.max_step / TOTAL_STEPS) * 100);
                  const isExpanded = expandedRow === row.session_id;
                  const answersObj = row.answers || {};
                  const hasAnswers = Object.keys(answersObj).length > 0;

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
                      <td className={styles.utmCell}>{row.utm_4 || '—'}</td>
                      <td className={styles.utmCell}>{row.utm_5 || '—'}</td>
                      <td>
                        <div className={styles.progressBarContainer}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${Math.min(pct, 100)}%`, background: getProgressColor(pct) }}
                            />
                          </div>
                          <span className={styles.progressText}>
                            {pct}% ({row.max_step}/{TOTAL_STEPS})
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.stepsDotsRow}>
                          {Array.from({ length: TOTAL_STEPS + 1 }, (_, i) => (
                            <span
                              key={i}
                              className={`${styles.stepDot} ${
                                i <= row.max_step ? styles.stepDotDone : styles.stepDotPending
                              }`}
                              title={getStepName(i)}
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.completedBadge} ${row.skipped ? styles.completedSkipped : row.completed ? styles.completedYes : styles.completedNo}`}>
                          {row.skipped ? 'Пропустил' : row.completed ? 'Завершён' : 'В процессе'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        {new Date(row.created_at).toLocaleDateString('ru-RU')}<br />
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>
                          {new Date(row.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        {hasAnswers ? (
                          <>
                            <button className={styles.expandBtn} onClick={() => setExpandedRow(isExpanded ? null : row.session_id)}>
                              {isExpanded ? 'Скрыть' : 'Показать'}
                            </button>
                            {isExpanded && (
                              <div className={styles.answersList}>
                                {Object.entries(answersObj).map(([qIdx, aIdx]) => {
                                  const q = QUESTIONS[Number(qIdx)];
                                  if (!q) return null;
                                  return (
                                    <div key={qIdx} className={styles.answerItem}>
                                      <span className={styles.answerQuestion}>{q.label} </span>
                                      <span className={styles.answerValue}>{q.options[aIdx as number] || '?'}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
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
