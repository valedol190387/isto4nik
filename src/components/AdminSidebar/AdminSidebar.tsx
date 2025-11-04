'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Star,
  MessageCircle,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import styles from './AdminSidebar.module.css';

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    title: 'Дашборд',
    icon: <LayoutDashboard size={20} />,
    path: '/admin/dashboard'
  },
  {
    id: 'schedule',
    title: 'Расписание',
    icon: <Calendar size={20} />,
    path: '/admin/schedule'
  },
  {
    id: 'users',
    title: 'Пользователи',
    icon: <Users size={20} />,
    path: '/admin/users'
  },
  {
    id: 'content',
    title: 'Контент',
    icon: <FileText size={20} />,
    path: '/admin/content'
  },
  {
    id: 'reviews',
    title: 'Отзывы',
    icon: <Star size={20} />,
    path: '/admin/reviews'
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: <MessageCircle size={20} />,
    path: '/admin/faq'
  },
  {
    id: 'popup',
    title: 'Попап',
    icon: <Bell size={20} />,
    path: '/admin/popup'
  },
  {
    id: 'utm-generator',
    title: 'UTM-генератор',
    icon: <ExternalLink size={20} />,
    path: '/admin/utm-generator'
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          {!isCollapsed && (
            <>
              <div className={styles.logoIcon}>A</div>
              <span className={styles.logoText}>Isto4nik Admin</span>
            </>
          )}
          {isCollapsed && (
            <div className={styles.logoIcon}>A</div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseBtn}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          {!isCollapsed && (
            <div className={styles.sectionTitle}>Основное</div>
          )}
          <ul className={styles.navList}>
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={`${styles.navItem} ${
                    pathname === item.path ? styles.active : ''
                  }`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className={styles.navText}>{item.title}</span>
                      {item.badge && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {!isCollapsed && (
          <div className={styles.footerContent}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>Администратор</div>
              <div className={styles.userRole}>Система управления</div>
            </div>
            <a 
              href="https://t.me/brvalentin" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.supportLink}
            >
              Связаться с Валентином
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 