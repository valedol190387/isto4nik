'use client';

import { useState, useEffect } from 'react';
import { Search, Users, DollarSign, TrendingUp, BarChart3, Download, Calendar, FileText } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  name_from_ml: string | null;
  mail: string | null;
  phone: string | null;
  status: string | null;
  sum: number | null;
  next_payment_date: string | null;
  created_at: string;
  utm_1: string | null;
  utm_2: string | null;
  utm_3: string | null;
  utm_4: string | null;
  utm_5: string | null;
  total_payments: number;
}

interface Analytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersLast30Days: number;
    registrationChangePercent: number;
    totalRevenue: number;
    payingUsers: number;
    averagePayment: number;
    conversionRate: number;
  };
  registrationsByDay: Array<{
    date: string;
    count: number;
  }>;
  topPayingUsers: Array<{
    telegram_id: string;
    name_from_ml: string;
    total_payments: number;
    last_payment: number;
  }>;
  statusStats: Record<string, number>;
  utmStats: {
    utm_1_stats: Record<string, number>;
    utm_2_stats: Record<string, number>;
    utm_3_stats: Record<string, number>;
    utm_4_stats: Record<string, number>;
    utm_5_stats: Record<string, number>;
    utm_sources_with_payments: Record<string, { count: number; totalRevenue: number; avgPayment: number }>;
    total_users_with_utm: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [utm1Filter, setUtm1Filter] = useState('');
  const [utm2Filter, setUtm2Filter] = useState('');
  const [utm3Filter, setUtm3Filter] = useState('');
  const [utm4Filter, setUtm4Filter] = useState('');
  const [utm5Filter, setUtm5Filter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [maxLinks, setMaxLinks] = useState<Record<number, string>>({});
  const [maxLinkLoading, setMaxLinkLoading] = useState<number | null>(null);

  const usersPerPage = 20;

  useEffect(() => {
    loadAnalytics();
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Сброс на первую страницу при фильтрации
      loadUsers();
    }, 300); // Задержка 300мс для предотвращения слишком частых запросов

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, utm1Filter, utm2Filter, utm3Filter, utm4Filter, utm5Filter, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      
      const response = await fetch(`/api/admin/analytics?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        console.error('Error loading analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * usersPerPage;
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: usersPerPage.toString(),
        offset: offset.toString()
      });
      
      if (utm1Filter) params.append('utm_1', utm1Filter);
      if (utm2Filter) params.append('utm_2', utm2Filter);
      if (utm3Filter) params.append('utm_3', utm3Filter);
      if (utm4Filter) params.append('utm_4', utm4Filter);
      if (utm5Filter) params.append('utm_5', utm5Filter);
      if (paymentFilter !== 'all') params.append('payment_filter', paymentFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setTotalUsers(data.total);
      } else {
        console.error('Error loading users:', data.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const loadAllUsers = async () => {
    try {
      setIsLoadingExport(true);
      // Применяем текущие фильтры к экспорту
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: '10000',
        offset: '0'
      });
      
      if (utm1Filter) params.append('utm_1', utm1Filter);
      if (utm2Filter) params.append('utm_2', utm2Filter);
      if (utm3Filter) params.append('utm_3', utm3Filter);
      if (utm4Filter) params.append('utm_4', utm4Filter);
      if (utm5Filter) params.append('utm_5', utm5Filter);
      if (paymentFilter !== 'all') params.append('payment_filter', paymentFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAllUsers(data.data);
        setShowExportModal(true);
      }
    } catch (error) {
      console.error('Error loading all users:', error);
    } finally {
      setIsLoadingExport(false);
    }
  };

  const exportToExcel = () => {
    const headers = [
      'Telegram ID', 'Имя', 'Username', 'Телефон', 'Email', 
      'Статус', 'Дата регистрации', 'Окончание подписки', 'Общие платежи',
      'UTM 1', 'UTM 2', 'UTM 3', 'UTM 4', 'UTM 5'
    ];
    
    const csvContent = [
      headers.join(','),
      ...allUsers.map(user => {
        return [
          user.telegram_id,
          `"${user.name_from_ml || ''}"`,
          user.username || '',
          user.phone || '',
          user.mail || '',
          user.status || '',
          user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '',
          user.next_payment_date ? new Date(user.next_payment_date).toLocaleDateString('ru-RU') : '',
          user.total_payments || 0,
          user.utm_1 || '',
          user.utm_2 || '',
          user.utm_3 || '',
          user.utm_4 || '',
          user.utm_5 || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateMaxLink = async (telegramId: number) => {
    setMaxLinkLoading(telegramId);
    try {
      const response = await fetch(`/api/users/generate-link-code?telegramId=${telegramId}`);
      const data = await response.json();
      if (data.linking_code) {
        const link = `https://max.ru/id666202944166_bot?startapp=link_${data.linking_code}`;
        setMaxLinks(prev => ({ ...prev, [telegramId]: link }));
        navigator.clipboard.writeText(link);
      }
    } catch (error) {
      console.error('Error generating MAX link:', error);
    } finally {
      setMaxLinkLoading(null);
    }
  };

  if (isLoadingAnalytics) {
    return (
      <div className={styles.dashboard}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка аналитики...</p>
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
            <h1 className={styles.title}>Аналитика пользователей</h1>
            <p className={styles.subtitle}>Полная статистика и управление базой пользователей</p>
          </div>
          <div className={styles.headerRight}>
            <button 
              onClick={loadAllUsers}
              disabled={isLoadingExport}
              className={styles.exportBtn}
            >
              <Download size={20} />
              {isLoadingExport ? 'Загрузка...' : 'Экспорт'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* KPI Metrics */}
        {analytics && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                <Users className={styles.icon} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{analytics.overview.totalUsers}</div>
                <div className={styles.statLabel}>Всего пользователей</div>
                <div className={styles.statSubtext}>+{analytics.overview.newUsersLast30Days} за 30 дней</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <TrendingUp className={styles.icon} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{analytics.overview.activeUsers}</div>
                <div className={styles.statLabel}>Активные</div>
                <div className={styles.statSubtext}>
                  {((analytics.overview.activeUsers / analytics.overview.totalUsers) * 100).toFixed(1)}% от общего числа
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <DollarSign className={styles.icon} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{formatCurrency(analytics.overview.totalRevenue)}</div>
                <div className={styles.statLabel}>Общий доход</div>
                <div className={styles.statSubtext}>{analytics.overview.payingUsers} платящих</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <BarChart3 className={styles.icon} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{analytics.overview.conversionRate.toFixed(1)}%</div>
                <div className={styles.statLabel}>Конверсия в платящих</div>
                <div className={styles.statSubtext}>
                  {analytics.overview.payingUsers} из {analytics.overview.totalUsers} пользователей платят
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Paying Users */}
        {analytics && analytics.topPayingUsers.length > 0 && (
          <div className={styles.topUsersSection}>
            <h3 className={styles.sectionTitle}>🏆 Топ пользователей по платежам</h3>
            <div className={styles.topUsersGrid}>
              {analytics.topPayingUsers.slice(0, 5).map((user, index) => (
                <div key={user.telegram_id} className={styles.topUserCard}>
                  <div className={styles.topUserRank}>#{index + 1}</div>
                  <div className={styles.topUserInfo}>
                    <div className={styles.topUserName}>{user.name_from_ml}</div>
                    <div className={styles.topUserTelegram}>{user.telegram_id}</div>
                  </div>
                  <div className={styles.topUserPayment}>
                    {formatCurrency(user.total_payments)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UTM Analytics */}
        {analytics && analytics.utmStats && (
          <div className={styles.utmSection}>
            <h3 className={styles.sectionTitle}>🎯 UTM Аналитика</h3>
            
            <div className={styles.utmOverview}>
              <div className={styles.utmCard}>
                <div className={styles.utmCardHeader}>С UTM метками</div>
                <div className={styles.utmCardNumber}>{analytics.utmStats.total_users_with_utm}</div>
                <div className={styles.utmCardPercent}>
                  {((analytics.utmStats.total_users_with_utm / analytics.overview.totalUsers) * 100).toFixed(1)}% от общего числа
                </div>
              </div>
              
              <div className={styles.utmCard}>
                <div className={styles.utmCardHeader}>Источников трафика</div>
                <div className={styles.utmCardNumber}>{Object.keys(analytics.utmStats.utm_1_stats).length}</div>
                <div className={styles.utmCardPercent}>уникальных меток</div>
              </div>
            </div>

            <div className={styles.utmDetails}>
              <div className={styles.utmDetailColumn}>
                <h4 className={styles.utmDetailTitle}>📊 Топ UTM источников по регистрациям</h4>
                <p className={styles.utmDescription}>Источники с наибольшим количеством зарегистрированных пользователей</p>
                <div className={styles.utmList}>
                  {Object.entries(analytics.utmStats.utm_1_stats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([source, count]) => (
                      <div key={source} className={styles.utmItem}>
                        <span className={styles.utmSource}>{source}</span>
                        <span className={styles.utmCount}>{count} польз.</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className={styles.utmDetailColumn}>
                <h4 className={styles.utmDetailTitle}>💰 Топ UTM источников по доходам</h4>
                <p className={styles.utmDescription}>Источники с наибольшей суммой платежей от пользователей</p>
                <div className={styles.utmList}>
                  {Object.entries(analytics.utmStats.utm_sources_with_payments)
                    .sort(([,a], [,b]) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 5)
                    .map(([source, data]) => (
                      <div key={source} className={styles.utmItem}>
                        <div className={styles.utmSourceInfo}>
                          <div className={styles.utmSource}>{source}</div>
                          <div className={styles.utmPayingCount}>{data.count} платящих</div>
                        </div>
                        <div className={styles.utmRevenueInfo}>
                          <div className={styles.utmRevenue}>{formatCurrency(data.totalRevenue)}</div>
                          <div className={styles.utmAvgPayment}>{formatCurrency(data.avgPayment)} сред.</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersContent}>
            <div className={styles.searchRow}>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Поиск по имени, username или Telegram ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.statusFilter}
              >
                <option value="all">Все статусы</option>
                <option value="active_users">Активные</option>
                <option value="inactive_users">Неактивные</option>
                <option value="">Без статуса</option>
              </select>
            </div>

            <div className={styles.dateRow}>
              <div className={styles.dateFilters}>
                <div className={styles.dateFilter}>
                  <label className={styles.dateLabel}>Дата от</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
                <div className={styles.dateFilter}>
                  <label className={styles.dateLabel}>Дата до</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
              </div>
            </div>

            {/* UTM Filters */}
            <div className={styles.utmFiltersRow}>
              <div className={styles.utmFilter}>
                <label className={styles.dateLabel}>UTM_1</label>
                <select
                  value={utm1Filter}
                  onChange={(e) => setUtm1Filter(e.target.value)}
                  className={styles.utmSelect}
                >
                  <option value="">Все значения</option>
                  {analytics && Object.keys(analytics.utmStats.utm_1_stats).map(utm => (
                    <option key={utm} value={utm}>{utm}</option>
                  ))}
                </select>
              </div>
                             <div className={styles.utmFilter}>
                 <label className={styles.dateLabel}>UTM_2</label>
                 <select
                   value={utm2Filter}
                   onChange={(e) => setUtm2Filter(e.target.value)}
                   className={styles.utmSelect}
                 >
                   <option value="">Все значения</option>
                   {analytics && Object.keys(analytics.utmStats.utm_2_stats).map(utm => (
                     <option key={utm} value={utm}>{utm}</option>
                   ))}
                 </select>
               </div>
               <div className={styles.utmFilter}>
                 <label className={styles.dateLabel}>UTM_3</label>
                 <select
                   value={utm3Filter}
                   onChange={(e) => setUtm3Filter(e.target.value)}
                   className={styles.utmSelect}
                 >
                   <option value="">Все значения</option>
                   {analytics && Object.keys(analytics.utmStats.utm_3_stats).map(utm => (
                     <option key={utm} value={utm}>{utm}</option>
                   ))}
                 </select>
               </div>
               <div className={styles.utmFilter}>
                 <label className={styles.dateLabel}>UTM_4</label>
                 <select
                   value={utm4Filter}
                   onChange={(e) => setUtm4Filter(e.target.value)}
                   className={styles.utmSelect}
                 >
                   <option value="">Все значения</option>
                   {analytics && Object.keys(analytics.utmStats.utm_4_stats).map(utm => (
                     <option key={utm} value={utm}>{utm}</option>
                   ))}
                 </select>
               </div>
               <div className={styles.utmFilter}>
                 <label className={styles.dateLabel}>UTM_5</label>
                 <select
                   value={utm5Filter}
                   onChange={(e) => setUtm5Filter(e.target.value)}
                   className={styles.utmSelect}
                 >
                   <option value="">Все значения</option>
                   {analytics && Object.keys(analytics.utmStats.utm_5_stats).map(utm => (
                     <option key={utm} value={utm}>{utm}</option>
                   ))}
                 </select>
               </div>
              <div className={styles.utmFilter}>
                <label className={styles.dateLabel}>Платежи</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className={styles.utmSelect}
                >
                  <option value="all">Все пользователи</option>
                  <option value="paying">Только платящие</option>
                  <option value="non_paying">Без платежей</option>
                </select>
              </div>
            </div>

            <div className={styles.clearFiltersRow}>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFrom('');
                  setDateTo('');
                  setUtm1Filter('');
                  setUtm2Filter('');
                  setUtm3Filter('');
                  setUtm4Filter('');
                  setUtm5Filter('');
                  setPaymentFilter('all');
                  setStatusFilter('all');
                }}
                className={styles.clearFiltersBtn}
              >
                Очистить фильтры
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.usersSection}>
          <div className={styles.usersSectionHeader}>
            <h3 className={styles.sectionTitle}>👥 База пользователей ({totalUsers})</h3>
          </div>
          
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Загрузка пользователей...</p>
            </div>
          ) : (
            <div className={styles.usersTable}>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Пользователь</th>
                    <th>Telegram ID</th>
                    <th>MAX</th>
                    <th>Телефон</th>
                    <th>Статус</th>
                    <th>Регистрация</th>
                    <th>Окончание подписки</th>
                    <th>Платежи</th>
                    <th>UTM_1</th>
                    <th>UTM_2</th>
                    <th>UTM_3</th>
                    <th>UTM_4</th>
                    <th>UTM_5</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.telegram_id}>
                      <td style={{ textAlign: 'left' }}>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>
                            {user.name_from_ml || user.username || 'Без имени'}
                          </div>
                          {user.username && (
                            <div className={styles.userUsername}>@{user.username}</div>
                          )}
                          {user.phone && (
                            <div className={styles.userPhone}>{user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className={styles.telegramId}>{user.telegram_id}</td>
                      <td>
                        {maxLinks[user.telegram_id] ? (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(maxLinks[user.telegram_id]);
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                            title={maxLinks[user.telegram_id]}
                          >
                            Скопировать
                          </button>
                        ) : (
                          <button
                            onClick={() => generateMaxLink(user.telegram_id)}
                            disabled={maxLinkLoading === user.telegram_id}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: '#082445',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              opacity: maxLinkLoading === user.telegram_id ? 0.5 : 1,
                            }}
                          >
                            {maxLinkLoading === user.telegram_id ? '...' : 'Ссылка'}
                          </button>
                        )}
                      </td>
                      <td className={styles.phoneCell}>{user.phone || '—'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          user.status === 'Активна' || user.status === 'Активный' || user.status === 'active'
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}>
                          {user.status || 'Без статуса'}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{formatDate(user.created_at)}</td>
                      <td className={styles.dateCell}>{formatDate(user.next_payment_date)}</td>
                      <td>
                        <div className={styles.paymentInfo}>
                          <div className={styles.totalPayment}>
                            {user.total_payments ? formatCurrency(user.total_payments) : '0 ₽'}
                          </div>
                        </div>
                      </td>
                      <td className={styles.utmCell}>{user.utm_1 || '—'}</td>
                      <td className={styles.utmCell}>{user.utm_2 || '—'}</td>
                      <td className={styles.utmCell}>{user.utm_3 || '—'}</td>
                      <td className={styles.utmCell}>{user.utm_4 || '—'}</td>
                      <td className={styles.utmCell}>{user.utm_5 || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Показано {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, totalUsers)} из {totalUsers}
              </div>
              <div className={styles.paginationControls}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationBtn}
                >
                  Назад
                </button>
                <span className={styles.paginationCurrent}>
                  {currentPage} из {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationBtn}
                >
                  Вперед
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await loadAllUsers();
                    setUsers(allUsers);
                    setCurrentPage(1);
                    setIsLoading(false);
                  }}
                  className={`${styles.paginationBtn} ${styles.showAllBtn}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Загрузка...' : 'Все'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>📊 Экспорт пользователей ({allUsers.length})</h3>
              <div className={styles.modalActions}>
                <button onClick={exportToExcel} className={styles.exportModalBtn}>
                  <Download size={16} />
                  Сохранить в Excel
                </button>
                <button onClick={() => setShowExportModal(false)} className={styles.closeBtn}>
                  ✕
                </button>
              </div>
            </div>
            
            <div className={styles.modalBody}>
              <p>Готов экспорт {allUsers.length} пользователей с полной информацией включая UTM метки</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 