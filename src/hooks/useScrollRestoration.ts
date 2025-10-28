'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Хук для сохранения и восстановления позиции скролла при навигации
 * Работает только для страниц с материалами (courses/[category])
 * Специально оптимизирован для Telegram Mini App
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const isRestoringRef = useRef(false);

  useEffect(() => {
    // Проверяем, что мы на странице с материалами
    if (!pathname.startsWith('/courses/')) {
      return;
    }

    // Отключаем автоматическое восстановление скролла браузером
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Ключ для сохранения
    const scrollKey = `scroll:${pathname}`;

    // Восстанавливаем позицию скролла при монтировании компонента
    const restoreScroll = () => {
      const savedPosition = sessionStorage.getItem(scrollKey);

      if (savedPosition && !isRestoringRef.current) {
        isRestoringRef.current = true;
        const position = parseInt(savedPosition, 10);

        console.log('[ScrollRestore] Restoring scroll to:', position, 'for path:', pathname);

        // Используем несколько попыток восстановления
        let attempts = 0;
        const maxAttempts = 10;

        const attemptRestore = () => {
          attempts++;

          requestAnimationFrame(() => {
            window.scrollTo({
              top: position,
              behavior: 'auto'
            });

            // Проверяем успешность через небольшую задержку
            setTimeout(() => {
              const currentScroll = window.scrollY;
              const diff = Math.abs(currentScroll - position);

              if (diff > 50 && attempts < maxAttempts) {
                console.log(`[ScrollRestore] Attempt ${attempts}: current=${currentScroll}, target=${position}, diff=${diff}`);
                attemptRestore();
              } else {
                console.log('[ScrollRestore] Completed after', attempts, 'attempts. Final position:', window.scrollY);
                isRestoringRef.current = false;
              }
            }, 100);
          });
        };

        attemptRestore();
      } else {
        console.log('[ScrollRestore] No saved position for:', pathname);
      }
    };

    // Запускаем восстановление с разными задержками для надежности
    const timeouts = [
      setTimeout(restoreScroll, 0),
      setTimeout(restoreScroll, 100),
      setTimeout(restoreScroll, 300),
      setTimeout(restoreScroll, 500),
      setTimeout(restoreScroll, 1000)
    ];

    // Сохраняем позицию скролла
    const saveScroll = () => {
      if (!isRestoringRef.current && window.scrollY > 0) {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
        console.log('[ScrollRestore] Saved scroll position:', window.scrollY, 'for path:', pathname);
      }
    };

    // Сохраняем позицию при скролле (с дебаунсом)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(saveScroll, 150);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Сохраняем при уходе со страницы
    const handleBeforeUnload = () => {
      saveScroll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Сохраняем перед скрытием страницы (важно для TMA)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScroll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      timeouts.forEach(id => clearTimeout(id));
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);
}
