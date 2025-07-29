'use client';

import { Page } from '@/components/Page';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Home as HomeIcon,
  Calendar,
  User,
  Star,
  MessageSquare,
  FileText
} from 'lucide-react';
import { SearchModal } from '@/components/SearchModal';
import { searchService } from '@/services/searchService';
import styles from './page.module.css';

// Данные для хайлайтов с изображениями
const highlights = [
  { id: 1, image: '/images/starthere.webp', route: '/start-here' },
  { id: 2, image: '/images/about.webp', route: '/about' },
  { id: 3, image: '/images/review.webp', route: '/reviews' },
  { id: 4, image: '/images/faq.webp', route: '/faq' },
];

// Данные курсов с изображениями
const courses = [
  { 
    id: 'intro-training', 
    image: '/images/ploskii.webp',
    type: 'full-width',
    route: '/courses/intro-training'
  },
  { 
    id: 'flat-belly', 
    image: '/images/jivot.webp',
    type: 'square',
    route: '/courses/flat-belly'
  },
  { 
    id: 'anti-swelling', 
    image: '/images/oteki.webp',
    type: 'square',
    route: '/courses/anti-swelling'
  },
  { 
    id: 'author', 
    image: '/images/autor.webp',
    type: 'tall',
    route: '/author'
  },
];

export default function Home() {
  const [currentDot, setCurrentDot] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // 3 точки для навигации
  const dotsCount = 3;

  // Инициализация поискового индекса в фоне
  useEffect(() => {
    // Запускаем индексацию в фоне для быстрого поиска
    searchService.buildIndex().catch(console.error);
  }, []);
  
  const scrollToPosition = (dotIndex: number) => {
    setCurrentDot(dotIndex);
    const container = document.getElementById('highlights-container');
    if (container) {
      const scrollPercentage = dotIndex / (dotsCount - 1);
      const maxScroll = container.scrollWidth - container.clientWidth;
      const scrollAmount = maxScroll * scrollPercentage;
      container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    const currentIndex = Math.round(scrollPercentage * (dotsCount - 1));
    setCurrentDot(currentIndex);
  };

  return (
    <Page back={false}>
      <div className={styles.container}>
        {/* Хайлайты */}
        <div className={styles.highlightsSection}>
          <div 
            id="highlights-container"
            className={styles.highlightsContainer}
            onScroll={handleScroll}
          >
            {highlights.map((highlight) => {
              return (
                <Link key={highlight.id} href={highlight.route} className={styles.highlightCard}>
                  <div className={styles.highlightContent}>
                    <Image
                      src={highlight.image}
                      alt=""
                      fill
                      className={styles.highlightImage}
                      sizes="120px"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Точечная навигация */}
          <div className={styles.highlightsDots}>
            {Array.from({ length: dotsCount }, (_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentDot ? styles.activeDot : ''}`}
                onClick={() => scrollToPosition(index)}
              />
            ))}
          </div>
        </div>

        {/* Поисковая строка */}
        <div className={styles.searchContainer}>
          <button 
            className={styles.searchBox}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className={styles.searchIcon} size={20} />
            <span className={styles.searchPlaceholder}>Поиск...</span>
          </button>
        </div>

        {/* Курсы */}
        <div className={styles.coursesSection}>
          {/* Вводная тренировка - полная ширина */}
          {courses.filter(course => course.type === 'full-width').map((course) => {
            return (
              <Link key={course.id} href={course.route} className={styles.courseCardFullWidth}>
                <div className={styles.courseContent}>
                  <Image
                    src={course.image}
                    alt=""
                    fill
                    className={styles.courseImage}
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </Link>
            );
          })}
          
          {/* Сетка для остальных курсов */}
          <div className={styles.coursesGrid}>
            {/* Левая колонка - два квадратных курса */}
            <div className={styles.leftColumn}>
              {courses.filter(course => course.type === 'square').map((course) => {
                return (
                  <Link key={course.id} href={course.route} className={styles.courseCardSquare}>
                    <div className={styles.courseContent}>
                      <Image
                        src={course.image}
                        alt=""
                        fill
                        className={styles.courseImage}
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Правая колонка - автор программы */}
            <div className={styles.rightColumn}>
              {courses.filter(course => course.type === 'tall').map((course) => {
                return (
                  <Link key={course.id} href={course.route} className={styles.courseCardTall}>
                    <div className={styles.courseContent}>
                      <Image
                        src={course.image}
                        alt=""
                        fill
                        className={styles.courseImage}
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Чат клуба */}
        <div className={styles.clubChatSection}>
          <Link href="/chat" className={styles.clubChatCard}>
            <div className={styles.clubChatContent}>
              <Image
                src="/images/chat.webp"
                alt=""
                fill
                className={styles.clubChatImage}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Поисковая модалка */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </Page>
  );
}
