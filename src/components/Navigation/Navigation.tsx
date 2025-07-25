'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home as HomeIcon,
  Calendar,
  User,
  Star,
  FileText
} from 'lucide-react';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className={styles.navigationMenu}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <HomeIcon className={styles.navIcon} size={20} />
        <span className={styles.navText}>Главная</span>
      </Link>
      <Link href="/materials" className={`${styles.navItem} ${pathname === '/materials' ? styles.active : ''}`}>
        <FileText className={styles.navIcon} size={20} />
        <span className={styles.navText}>Материалы</span>
      </Link>
      <Link href="/calendar" className={`${styles.navItem} ${pathname === '/calendar' ? styles.active : ''}`}>
        <Calendar className={styles.navIcon} size={20} />
        <span className={styles.navText}>Календарь</span>
      </Link>
      <Link href="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`}>
        <User className={styles.navIcon} size={20} />
        <span className={styles.navText}>Профиль</span>
      </Link>
      <Link href="/favorites" className={`${styles.navItem} ${pathname === '/favorites' ? styles.active : ''}`}>
        <Star className={styles.navIcon} size={20} />
        <span className={styles.navText}>Избранное</span>
      </Link>
    </div>
  );
} 