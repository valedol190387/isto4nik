'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, MessageSquare, HelpCircle, Home, Loader2, Calendar, Lock } from 'lucide-react';
import { searchService, type SearchResult } from '@/services/searchService';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { User as DbUser } from '@/types/database';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function SearchModal({ isOpen, onClose, initialQuery = '' }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Состояния для проверки подписки
  const [userData, setUserData] = useState<DbUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Получаем реального пользователя из Telegram
  const user = useSignal(initData.user);

  // Получаем Telegram ID пользователя
  const getTelegramId = () => {
    // Пробуем получить из Telegram WebApp API
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id.toString();
      }
    }
    
    // Fallback - только для разработки
    return '123456789';
  };

  // Функция для загрузки данных пользователя из базы данных
  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      const telegramId = user?.id?.toString() || getTelegramId();
      
      const response = await fetch(`/api/users?telegramId=${telegramId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Пользователь не найден в базе
          setUserData(null);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const data: DbUser = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
      setUserData(null);
    } finally {
      setLoadingUserData(false);
    }
  };

  // Проверяем статус подписки
  const isSubscriptionActive = userData?.status === 'Активна';

  // Загружаем данные пользователя при открытии модала
  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserData();
    }
  }, [isOpen, user?.id]);

  // Инициализация поискового индекса
  useEffect(() => {
    const initializeSearch = async () => {
      if (!searchService.isReady()) {
        setIsIndexing(true);
        await searchService.buildIndex();
        setIsIndexing(false);
      }
    };

    if (isOpen) {
      initializeSearch();
    }
  }, [isOpen]);

  // Фокус на input при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Поиск при изменении запроса
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }

      if (!searchService.isReady()) {
        return;
      }

      setIsLoading(true);
      
      // Небольшая задержка для debouncing
      const timeoutId = setTimeout(() => {
        const searchResults = searchService.search(query, 20);
        setResults(searchResults);
        setSelectedIndex(-1);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    };

    performSearch();
  }, [query]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Прокрутка к выбранному элементу
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    // Проверяем подписку только для материалов
    if (result.type === 'material' && !isSubscriptionActive) {
      setShowSubscriptionModal(true);
      return;
    }
    
    router.push(result.route);
    onClose();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'material':
        return <FileText size={16} className={styles.typeIcon} />;
      case 'review':
        return <MessageSquare size={16} className={styles.typeIcon} />;
      case 'faq':
        return <HelpCircle size={16} className={styles.typeIcon} />;
      case 'page':
        return <Home size={16} className={styles.typeIcon} />;
      case 'event':
        return <Calendar size={16} className={styles.typeIcon} />;
      default:
        return <Search size={16} className={styles.typeIcon} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'material':
        return 'Материалы';
      case 'review':
        return 'Отзывы';
      case 'faq':
        return 'FAQ';
      case 'page':
        return 'Страницы';
      case 'event':
        return 'События';
      default:
        return 'Результат';
    }
  };

  // Группировка результатов по типу
  const groupedResults = searchService.getResultsByType(results);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Поисковая строка */}
        <div className={styles.searchHeader}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по приложению..."
              className={styles.searchInput}
            />
            {query && (
              <button
                onClick={clearSearch}
                className={styles.clearButton}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Контент */}
        <div className={styles.content}>
          {isIndexing ? (
            <div className={styles.indexingState}>
              <Loader2 className={styles.loadingIcon} />
              <p className={styles.indexingText}>Индексируем контент...</p>
            </div>
          ) : !query.trim() ? (
            <div className={styles.emptyState}>
              <Search className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Поиск по приложению</h3>
              <p className={styles.emptyText}>
                Введите запрос для поиска по материалам, отзывам, событиям, FAQ и страницам
              </p>
            </div>
          ) : query.length < 2 ? (
            <div className={styles.emptyState}>
              <Search className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                Введите минимум 2 символа для поиска
              </p>
            </div>
          ) : isLoading ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.loadingIcon} />
              <p className={styles.loadingText}>Поиск...</p>
            </div>
          ) : results.length === 0 ? (
            <div className={styles.noResultsState}>
              <Search className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Ничего не найдено</h3>
              <p className={styles.emptyText}>
                По запросу "{query}" результатов не найдено
              </p>
            </div>
          ) : (
            <div className={styles.results} ref={resultsRef}>
              {Object.entries(groupedResults).map(([type, typeResults]) => {
                if (typeResults.length === 0) return null;

                return (
                  <div key={type} className={styles.resultGroup}>
                    <div className={styles.groupHeader}>
                      {getTypeIcon(type)}
                      <span className={styles.groupTitle}>
                        {getTypeName(type)} ({typeResults.length})
                      </span>
                    </div>
                    <div className={styles.groupResults}>
                      {typeResults.map((result, index) => {
                        const globalIndex = results.indexOf(result);
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`${styles.resultItem} ${
                              globalIndex === selectedIndex ? styles.selected : ''
                            }`}
                          >
                            <div className={styles.resultContent}>
                              <h4 className={styles.resultTitle}>{result.title}</h4>
                              {result.matchedText && (
                                <p className={styles.resultText}>
                                  {result.matchedText}
                                </p>
                              )}
                            </div>
                            <div className={styles.resultMeta}>
                              {getTypeIcon(result.type)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>

      {/* Модальное окно подписки */}
      {showSubscriptionModal && (
        <div className={styles.subscriptionModalOverlay} onClick={() => setShowSubscriptionModal(false)}>
          <div className={styles.subscriptionModalContent} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.subscriptionCloseButton}
              onClick={() => setShowSubscriptionModal(false)}
            >
              <X size={24} />
            </button>
            
            <div className={styles.subscriptionModalHeader}>
              <div className={styles.subscriptionModalIcon}>
                <Lock size={32} />
              </div>
              <h2 className={styles.subscriptionModalTitle}>Требуется подписка</h2>
            </div>
            
            <div className={styles.subscriptionModalBody}>
              <p className={styles.subscriptionModalText}>
                Для доступа к материалам необходима активная подписка. 
                Получите доступ ко всем материалам и функциям приложения.
              </p>
              
              <a
                href="https://t.me/istochnik_clubbot?start=closedclub"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.subscribeButton}
                onClick={() => setShowSubscriptionModal(false)}
              >
                ПОЛУЧИТЬ ДОСТУП
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 