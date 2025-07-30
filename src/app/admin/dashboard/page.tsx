'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Star, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Activity,
  Settings,
  LogOut
} from 'lucide-react';
import styles from './page.module.css';
import { AdminSidebar } from '@/components/AdminSidebar';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalMaterials: number;
  totalPayments: number;
  totalReviews: number;
  totalEvents: number;
  activePercentage: number;
}

interface RecentActivity {
  users: Array<{
    telegram_id: number;
    name: string | null;
    status: string | null;
    created_at: string;
  }>;
  payments: Array<{
    telegram_id: string;
    payment_callback: any;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }

    // Загружаем статистику
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка данных...</p>
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
            <h1 className={styles.title}>Панель администратора</h1>
            <p className={styles.subtitle}>Добро пожаловать в систему управления контентом Вера Атара</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.systemStatus}>
              <div className={styles.statusIndicator}></div>
              <span>Система работает</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={20} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FileText className={styles.icon} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats?.totalMaterials || 0}</div>
              <div className={styles.statLabel}>Всего контента</div>
              <div className={styles.statSubtext}>элементов в системе</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CreditCard className={styles.icon} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats?.totalPayments || 0}</div>
              <div className={styles.statLabel}>Разделы</div>
              <div className={styles.statSubtext}>14 подразделов</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Users className={styles.icon} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats?.activeSubscriptions || 0}</div>
              <div className={styles.statLabel}>Пользователи</div>
              <div className={styles.statSubtext}>всего в системе</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <Star className={styles.icon} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats?.totalUsers || 0}</div>
              <div className={styles.statLabel}>Активные подписки</div>
              <div className={styles.statSubtext}>{stats?.activePercentage || 0}% от общего числа</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className={styles.secondaryStats}>
          <div className={styles.statsRow}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatContent}>
                <div className={styles.miniStatHeader}>
                  <span className={styles.miniStatTitle}>Статистика подписок</span>
                </div>
                <div className={styles.miniStatList}>
                  <div className={styles.miniStatItem}>
                    <div className={styles.miniStatDot} style={{ background: '#10b981' }}></div>
                    <span>Активные подписки</span>
                    <span className={styles.miniStatValue}>{stats?.activeSubscriptions || 0}</span>
                  </div>
                  <div className={styles.miniStatItem}>
                    <div className={styles.miniStatDot} style={{ background: '#f59e0b' }}></div>
                    <span>Тестовый период</span>
                    <span className={styles.miniStatValue}>0</span>
                  </div>
                  <div className={styles.miniStatItem}>
                    <div className={styles.miniStatDot} style={{ background: '#ef4444' }}></div>
                    <span>Полные подписки</span>
                    <span className={styles.miniStatValue}>{stats?.activeSubscriptions || 0}</span>
                  </div>
                  <div className={styles.miniStatItem}>
                    <div className={styles.miniStatDot} style={{ background: '#6b7280' }}></div>
                    <span>Без подписки</span>
                    <span className={styles.miniStatValue}>{(stats?.totalUsers || 0) - (stats?.activeSubscriptions || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.miniStat}>
              <div className={styles.miniStatContent}>
                <div className={styles.miniStatHeader}>
                  <span className={styles.miniStatTitle}>Система</span>
                </div>
                <div className={styles.miniStatList}>
                  <div className={styles.miniStatItem}>
                    <div className={styles.miniStatDot} style={{ background: '#10b981' }}></div>
                    <span>Статус системы</span>
                    <span className={styles.miniStatStatus}>Работает</span>
                  </div>
                  <div className={styles.miniStatItem}>
                    <div className={styles.miniStatDot} style={{ background: '#10b981' }}></div>
                    <span>База данных</span>
                    <span className={styles.miniStatStatus}>Подключена</span>
                  </div>
                  <div className={styles.miniStatItem}>
                    <div className={styles.miniStatDot} style={{ background: '#10b981' }}></div>
                    <span>API</span>
                    <span className={styles.miniStatStatus}>Активно</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className={styles.activitySection}>
          <h2 className={styles.sectionTitle}>Последняя активность</h2>
          <div className={styles.activityContent}>
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#10b981' }}></div>
              <span>Система работает стабильно</span>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#3b82f6' }}></div>
              <span>API подключены активны</span>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#f59e0b' }}></div>
              <span>Контент синхронизирован с базой данных</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <a 
            href="https://t.me/brvalentin" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.actionCard}
          >
            <MessageSquare className={styles.actionIcon} />
            <div className={styles.actionContent}>
              <h3>Техническая помощь</h3>
              <p>Свяжитесь с Валентином для технической поддержки</p>
            </div>
          </a>

          <div className={styles.actionCard}>
            <FileText className={styles.actionIcon} />
            <div className={styles.actionContent}>
              <h3>Управление контентом</h3>
              <p>Просмотр и редактирование контента по разделам</p>
            </div>
          </div>

          <div className={styles.actionCard}>
            <Users className={styles.actionIcon} />
            <div className={styles.actionContent}>
              <h3>Пользователи</h3>
              <p>Просмотр статистики пользователей</p>
            </div>
          </div>

          <div className={styles.actionCard}>
            <Calendar className={styles.actionIcon} />
            <div className={styles.actionContent}>
              <h3>Расписание</h3>
              <p>Управление событиями календаря</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 