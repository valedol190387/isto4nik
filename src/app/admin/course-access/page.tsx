'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Lock, Unlock, Edit, Save, X } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { User, CourseAccess } from '@/types/database';
import styles from './page.module.css';

interface UserWithAccess extends User {
  course_access: CourseAccess;
}

// Описания разделов для админки (новые ключи БД)
const SECTION_LABELS = {
  stomach: 'Курс: Плоский живот',        // course_flat_belly
  swelling: 'Курс: Отёки',              // course_anti_swelling
  blossom: 'Курс: Расцветай',           // course_bloom
  flexibility: 'Рельеф и гибкость',     // useful
  face: 'Для лица',                     // workouts
  foot: 'Стопы',                        // guides
  bodyflow: 'BodyFlow',                 // motivation
  posture: 'Осанка'                     // nutrition
};

export default function CourseAccessPage() {
  const [users, setUsers] = useState<UserWithAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editAccess, setEditAccess] = useState<CourseAccess | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const usersPerPage = 20;
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        limit: usersPerPage.toString(),
        offset: ((currentPage - 1) * usersPerPage).toString()
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Добавляем дефолтные доступы если их нет
        const usersWithAccess = data.data.map((user: User) => ({
          ...user,
          course_access: user.course_access || {
            stomach: true,        // course_flat_belly
            swelling: false,      // course_anti_swelling
            blossom: false,       // course_bloom
            flexibility: false,   // useful
            face: false,          // workouts
            foot: false,          // guides
            bodyflow: false,      // motivation
            posture: false        // nutrition
          }
        }));
        
        setUsers(usersWithAccess);
        setTotalUsers(data.count || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение изменений доступа
  const saveAccess = async (telegramId: string, newAccess: CourseAccess) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/users/course-access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          course_access: newAccess
        })
      });

      if (response.ok) {
        // Обновляем локальные данные
        setUsers(prev => prev.map(user => 
          user.telegram_id.toString() === telegramId
            ? { ...user, course_access: newAccess }
            : user
        ));
        
        setEditingUser(null);
        setEditAccess(null);
      } else {
        alert('Ошибка при сохранении доступов');
      }
    } catch (error) {
      console.error('Error saving access:', error);
      alert('Ошибка при сохранении доступов');
    } finally {
      setSaving(false);
    }
  };

  // Начать редактирование
  const startEditing = (user: UserWithAccess) => {
    setEditingUser(user.telegram_id.toString());
    setEditAccess({ ...user.course_access });
  };

  // Отменить редактирование
  const cancelEditing = () => {
    setEditingUser(null);
    setEditAccess(null);
  };

  // Переключить доступ к разделу
  const toggleSectionAccess = (sectionKey: keyof CourseAccess) => {
    if (!editAccess) return;
    
    setEditAccess(prev => ({
      ...prev!,
      [sectionKey]: !prev![sectionKey]
    }));
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <AdminSidebar />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка пользователей...</p>
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
            <h1 className={styles.title}>Доступы к курсам</h1>
            <p className={styles.subtitle}>Управление доступами пользователей к разделам курсов</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Search */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по имени, username или Telegram ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <h3 className={styles.sectionTitle}>👥 Пользователи с доступами ({totalUsers})</h3>
          </div>
          
          <div className={styles.usersTable}>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Пользователь</th>
                  <th>Telegram ID</th>
                  <th>Доступные разделы</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.telegram_id}>
                    <td style={{ textAlign: 'left' }}>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>
                          {user.name || user.tg_username || 'Без имени'}
                        </div>
                        {user.tg_username && (
                          <div className={styles.userUsername}>@{user.tg_username}</div>
                        )}
                      </div>
                    </td>
                    <td className={styles.telegramId}>{user.telegram_id}</td>
                    <td>
                      {editingUser === user.telegram_id.toString() ? (
                        <div className={styles.accessEditor}>
                          {Object.entries(SECTION_LABELS).map(([key, label]) => (
                            <label key={key} className={styles.accessCheckbox}>
                              <input
                                type="checkbox"
                                checked={editAccess?.[key as keyof CourseAccess] || false}
                                onChange={() => toggleSectionAccess(key as keyof CourseAccess)}
                              />
                              <span className={styles.checkboxText}>{label}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.accessList}>
                          {Object.entries(user.course_access)
                            .filter(([_, hasAccess]) => hasAccess)
                            .map(([key, _]) => (
                              <span key={key} className={styles.accessBadge}>
                                <Unlock size={12} />
                                {SECTION_LABELS[key as keyof typeof SECTION_LABELS]}
                              </span>
                            ))}
                          {Object.values(user.course_access).every(access => !access) && (
                            <span className={styles.noAccess}>
                              <Lock size={12} />
                              Нет доступов
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingUser === user.telegram_id.toString() ? (
                        <div className={styles.editActions}>
                          <button
                            onClick={() => saveAccess(user.telegram_id.toString(), editAccess!)}
                            disabled={saving}
                            className={styles.saveBtn}
                          >
                            <Save size={16} />
                            Сохранить
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className={styles.cancelBtn}
                          >
                            <X size={16} />
                            Отмена
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(user)}
                          className={styles.editBtn}
                        >
                          <Edit size={16} />
                          Редактировать
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
              </div>
            </div>
          )}

          {users.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <Users size={48} />
              <h3>Пользователи не найдены</h3>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}