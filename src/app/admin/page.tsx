'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Отправляем данные на сервер для проверки
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        // Сохраняем состояние авторизации в localStorage
        localStorage.setItem('adminAuth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Неверный логин или пароль');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Ошибка соединения с сервером');
    }
    
    setLoading(false);
  };

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.title}>Админ панель</h1>
          <p className={styles.subtitle}>Вход в систему управления</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Логин
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Введите логин"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
} 