'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, BarChart3, RefreshCw, ChevronDown, X, Search } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

interface TrafficRow {
  utm_1: string;
  utm_2: string;
  utm_3: string;
  utm_4: string;
  utm_5: string;
  total_users: number;
  registered_count: number;
  paying_users: number;
  total_revenue: number;
  prodamus_users: number;
  prodamus_revenue: number;
  lava_users: number;
  lava_revenue: number;
}

interface TrafficData {
  rows: TrafficRow[];
  totals: {
    total_users: number;
    registered_count: number;
    paying_users: number;
    total_revenue: number;
    prodamus_users: number;
    prodamus_revenue: number;
    lava_users: number;
    lava_revenue: number;
  };
  sources: string[];
}

type UtmKey = 'utm_1' | 'utm_2' | 'utm_3' | 'utm_4' | 'utm_5';

export default function TrafficReportPage() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Column filters
  const [filters, setFilters] = useState<Record<UtmKey, string>>({
    utm_1: '',
    utm_2: '',
    utm_3: '',
    utm_4: '',
    utm_5: ''
  });

  // Which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<UtmKey | null>(null);

  useEffect(() => {
    loadData();
  }, [dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(`/api/admin/traffic-report?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Error loading traffic data:', result.error);
      }
    } catch (error) {
      console.error('Error loading traffic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on column filters and search
  const filteredRows = useMemo(() => {
    if (!data) return [];

    return data.rows.filter(row => {
      // Search filter - check all UTM fields
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          (row.utm_1 || '').toLowerCase().includes(search) ||
          (row.utm_2 || '').toLowerCase().includes(search) ||
          (row.utm_3 || '').toLowerCase().includes(search) ||
          (row.utm_4 || '').toLowerCase().includes(search) ||
          (row.utm_5 || '').toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Column filters
      if (filters.utm_1 && row.utm_1 !== filters.utm_1) return false;
      if (filters.utm_2 && row.utm_2 !== filters.utm_2) return false;
      if (filters.utm_3 && row.utm_3 !== filters.utm_3) return false;
      if (filters.utm_4 && row.utm_4 !== filters.utm_4) return false;
      if (filters.utm_5 && row.utm_5 !== filters.utm_5) return false;
      return true;
    });
  }, [data, filters, searchTerm]);

  // Calculate totals for filtered data
  const filteredTotals = useMemo(() => {
    const totals = {
      total_users: 0,
      registered_count: 0,
      paying_users: 0,
      total_revenue: 0,
      prodamus_users: 0,
      prodamus_revenue: 0,
      lava_users: 0,
      lava_revenue: 0
    };

    filteredRows.forEach(row => {
      totals.total_users += row.total_users;
      totals.registered_count += row.registered_count;
      totals.paying_users += row.paying_users;
      totals.total_revenue += row.total_revenue;
      totals.prodamus_users += row.prodamus_users || 0;
      totals.prodamus_revenue += row.prodamus_revenue || 0;
      totals.lava_users += row.lava_users || 0;
      totals.lava_revenue += row.lava_revenue || 0;
    });

    return totals;
  }, [filteredRows]);

  // Get unique values for each column based on currently filtered data
  const getUniqueValues = (column: UtmKey): string[] => {
    if (!data) return [];

    // Apply all filters EXCEPT the current column to get available options
    const relevantRows = data.rows.filter(row => {
      if (column !== 'utm_1' && filters.utm_1 && row.utm_1 !== filters.utm_1) return false;
      if (column !== 'utm_2' && filters.utm_2 && row.utm_2 !== filters.utm_2) return false;
      if (column !== 'utm_3' && filters.utm_3 && row.utm_3 !== filters.utm_3) return false;
      if (column !== 'utm_4' && filters.utm_4 && row.utm_4 !== filters.utm_4) return false;
      if (column !== 'utm_5' && filters.utm_5 && row.utm_5 !== filters.utm_5) return false;
      return true;
    });

    const values = new Set<string>();
    relevantRows.forEach(row => {
      values.add(row[column] || '');
    });

    return Array.from(values).sort((a, b) => {
      if (a === '' && b !== '') return 1;
      if (a !== '' && b === '') return -1;
      return a.localeCompare(b);
    });
  };

  const setFilter = (column: UtmKey, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setOpenDropdown(null);
  };

  const clearFilter = (column: UtmKey) => {
    setFilters(prev => ({ ...prev, [column]: '' }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportToCSV = () => {
    if (!filteredRows.length) return;

    const headers = [
      'utm_1',
      'utm_2',
      'utm_3',
      'utm_4',
      'utm_5',
      'Входов',
      'Зарег.',
      'Оплаты (users)',
      'Сумма (users)',
      'Prodamus чел',
      'Prodamus сумма',
      'Lava чел',
      'Lava сумма'
    ];

    const csvRows = [
      headers.join(';'),
      ...filteredRows.map(row => [
        row.utm_1 || '(пусто)',
        row.utm_2 || '',
        row.utm_3 || '',
        row.utm_4 || '',
        row.utm_5 || '',
        row.total_users,
        row.registered_count,
        row.paying_users,
        row.total_revenue,
        row.prodamus_users || 0,
        row.prodamus_revenue || 0,
        row.lava_users || 0,
        row.lava_revenue || 0
      ].join(';')),
      '',
      [
        'ИТОГО',
        '',
        '',
        '',
        '',
        filteredTotals.total_users,
        filteredTotals.registered_count,
        filteredTotals.paying_users,
        filteredTotals.total_revenue,
        filteredTotals.prodamus_users,
        filteredTotals.prodamus_revenue,
        filteredTotals.lava_users,
        filteredTotals.lava_revenue
      ].join(';')
    ];

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    let filename = `traffic_report_${dateStr}`;
    if (dateFrom || dateTo) {
      filename += `_${dateFrom || 'start'}_${dateTo || 'end'}`;
    }
    filename += '.csv';

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setFilters({
      utm_1: '',
      utm_2: '',
      utm_3: '',
      utm_4: '',
      utm_5: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || searchTerm !== '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && !(e.target as Element).closest(`.${styles.filterHeader}`)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

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

  const renderFilterHeader = (column: UtmKey, label: string) => {
    const uniqueValues = getUniqueValues(column);
    const isOpen = openDropdown === column;
    const hasFilter = filters[column] !== '';

    return (
      <th className={styles.filterHeader}>
        <div
          className={`${styles.filterHeaderContent} ${hasFilter ? styles.hasFilter : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : column);
          }}
        >
          <span>{label}</span>
          {hasFilter ? (
            <button
              className={styles.clearFilterBtn}
              onClick={(e) => {
                e.stopPropagation();
                clearFilter(column);
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <ChevronDown size={14} className={styles.filterIcon} />
          )}
        </div>
        {hasFilter && (
          <div className={styles.activeFilterBadge}>{filters[column] || '(пусто)'}</div>
        )}
        {isOpen && (
          <div className={styles.filterDropdown}>
            <div
              className={`${styles.filterOption} ${filters[column] === '' ? styles.selected : ''}`}
              onClick={() => setFilter(column, '')}
            >
              Все значения
            </div>
            {uniqueValues.map((value) => (
              <div
                key={value}
                className={`${styles.filterOption} ${filters[column] === value ? styles.selected : ''}`}
                onClick={() => setFilter(column, value)}
              >
                {value || '(пусто)'}
              </div>
            ))}
          </div>
        )}
      </th>
    );
  };

  return (
    <div className={styles.dashboard}>
      <AdminSidebar />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <BarChart3 size={28} className={styles.titleIcon} />
              Отчет по трафику
            </h1>
            <p className={styles.subtitle}>
              Детальный анализ источников трафика по UTM меткам
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
              disabled={!filteredRows.length}
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
                <label className={styles.filterLabel}>Поиск по UTM</label>
                <div className={styles.searchContainer}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Поиск по всем UTM..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={styles.clearSearchBtn}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
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
              {(dateFrom || dateTo || hasActiveFilters) && (
                <button onClick={resetFilters} className={styles.resetBtn}>
                  Сбросить все
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{filteredTotals.total_users.toLocaleString('ru-RU')}</div>
            <div className={styles.summaryLabel}>Всего входов</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{filteredTotals.registered_count.toLocaleString('ru-RU')}</div>
            <div className={styles.summaryLabel}>Зарегистрировались</div>
            <div className={styles.summaryPercent}>
              {filteredTotals.total_users > 0
                ? ((filteredTotals.registered_count / filteredTotals.total_users) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{formatCurrency(filteredTotals.total_revenue)}</div>
            <div className={styles.summaryLabel}>users.all_payments</div>
          </div>
          <div className={`${styles.summaryCard} ${styles.prodamusCard}`}>
            <div className={styles.summaryValue}>{formatCurrency(filteredTotals.prodamus_revenue)}</div>
            <div className={styles.summaryLabel}>Prodamus</div>
            <div className={styles.summarySubtext}>{filteredTotals.prodamus_users} чел.</div>
          </div>
          <div className={`${styles.summaryCard} ${styles.lavaCard}`}>
            <div className={styles.summaryValue}>{formatCurrency(filteredTotals.lava_revenue)}</div>
            <div className={styles.summaryLabel}>Lava</div>
            <div className={styles.summarySubtext}>{filteredTotals.lava_users} чел.</div>
          </div>
        </div>

        {/* Data Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <h3 className={styles.sectionTitle}>
              Детализация по UTM комбинациям ({filteredRows.length} строк)
            </h3>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ utm_1: '', utm_2: '', utm_3: '', utm_4: '', utm_5: '' })}
                className={styles.clearAllFiltersBtn}
              >
                Сбросить фильтры таблицы
              </button>
            )}
          </div>

          {filteredRows.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    {renderFilterHeader('utm_1', 'utm_1')}
                    {renderFilterHeader('utm_2', 'utm_2')}
                    {renderFilterHeader('utm_3', 'utm_3')}
                    {renderFilterHeader('utm_4', 'utm_4')}
                    {renderFilterHeader('utm_5', 'utm_5')}
                    <th className={styles.numericCol}>Входов</th>
                    <th className={styles.numericCol}>Зарег.</th>
                    <th className={`${styles.numericCol} ${styles.usersColHeader}`}>
                      <div>users</div>
                      <div className={styles.subHeader}>чел / сумма</div>
                    </th>
                    <th className={`${styles.numericCol} ${styles.prodamusColHeader}`}>
                      <div>Prodamus</div>
                      <div className={styles.subHeader}>чел / сумма</div>
                    </th>
                    <th className={`${styles.numericCol} ${styles.lavaColHeader}`}>
                      <div>Lava</div>
                      <div className={styles.subHeader}>чел / сумма</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={index}>
                      <td className={styles.sourceCell}>
                        {row.utm_1 || <span className={styles.emptyValue}>(пусто)</span>}
                      </td>
                      <td className={styles.utmCell}>{row.utm_2 || '—'}</td>
                      <td className={styles.utmCell}>{row.utm_3 || '—'}</td>
                      <td className={styles.utmCell}>{row.utm_4 || '—'}</td>
                      <td className={styles.utmCell}>{row.utm_5 || '—'}</td>
                      <td className={styles.numericCell}>{row.total_users.toLocaleString('ru-RU')}</td>
                      <td className={styles.numericCell}>{row.registered_count.toLocaleString('ru-RU')}</td>
                      <td className={styles.paymentCell}>
                        <span className={styles.paymentCount}>{row.paying_users}</span>
                        <span className={styles.paymentDivider}>/</span>
                        <span className={styles.paymentAmount}>{formatCurrency(row.total_revenue)}</span>
                      </td>
                      <td className={`${styles.paymentCell} ${styles.prodamusCell}`}>
                        <span className={styles.paymentCount}>{row.prodamus_users || 0}</span>
                        <span className={styles.paymentDivider}>/</span>
                        <span className={styles.paymentAmount}>{formatCurrency(row.prodamus_revenue || 0)}</span>
                      </td>
                      <td className={`${styles.paymentCell} ${styles.lavaCell}`}>
                        <span className={styles.paymentCount}>{row.lava_users || 0}</span>
                        <span className={styles.paymentDivider}>/</span>
                        <span className={styles.paymentAmount}>{formatCurrency(row.lava_revenue || 0)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={styles.totalsRow}>
                    <td colSpan={5} className={styles.totalsLabel}>ИТОГО</td>
                    <td className={styles.numericCell}>{filteredTotals.total_users.toLocaleString('ru-RU')}</td>
                    <td className={styles.numericCell}>{filteredTotals.registered_count.toLocaleString('ru-RU')}</td>
                    <td className={styles.paymentCell}>
                      <span className={styles.paymentCount}>{filteredTotals.paying_users}</span>
                      <span className={styles.paymentDivider}>/</span>
                      <span className={styles.paymentAmount}>{formatCurrency(filteredTotals.total_revenue)}</span>
                    </td>
                    <td className={`${styles.paymentCell} ${styles.prodamusCell}`}>
                      <span className={styles.paymentCount}>{filteredTotals.prodamus_users}</span>
                      <span className={styles.paymentDivider}>/</span>
                      <span className={styles.paymentAmount}>{formatCurrency(filteredTotals.prodamus_revenue)}</span>
                    </td>
                    <td className={`${styles.paymentCell} ${styles.lavaCell}`}>
                      <span className={styles.paymentCount}>{filteredTotals.lava_users}</span>
                      <span className={styles.paymentDivider}>/</span>
                      <span className={styles.paymentAmount}>{formatCurrency(filteredTotals.lava_revenue)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Нет данных для отображения</p>
              <p className={styles.emptyHint}>Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
