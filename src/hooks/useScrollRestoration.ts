'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Хук для сохранения и восстановления позиции скролла при навигации
 * Работает только для страниц с материалами (courses/[category])
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    // Проверяем, что мы на странице с материалами
    if (!pathname.startsWith('/courses/')) {
      return;
    }

    // Отключаем автоматическое восстановление скролла браузером
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Восстанавливаем позицию скролла при монтировании компонента
    const restoreScroll = () => {
      if (hasRestoredRef.current) return;

      const savedPosition = sessionStorage.getItem(`scroll:${pathname}`);

      if (savedPosition && !isRestoringRef.current) {
        isRestoringRef.current = true;
        const position = parseInt(savedPosition, 10);

        // Множественные попытки восстановления для надежности
        const attemptRestore = (attempt = 0) => {
          if (attempt > 5) {
            isRestoringRef.current = false;
            hasRestoredRef.current = true;
            return;
          }

          requestAnimationFrame(() => {
            window.scrollTo(0, position);

            // Проверяем, удалось ли прокрутить
            setTimeout(() => {
              if (Math.abs(window.scrollY - position) > 10 && attempt < 5) {
                attemptRestore(attempt + 1);
              } else {
                isRestoringRef.current = false;
                hasRestoredRef.current = true;
              }
            }, 50);
          });
        };

        attemptRestore();
      }
    };

    // Множественные попытки восстановления
    restoreScroll();
    const timeoutIds = [
      setTimeout(restoreScroll, 100),
      setTimeout(restoreScroll, 300),
      setTimeout(restoreScroll, 500)
    ];

    // Сохраняем позицию скролла
    const saveScroll = () => {
      if (!isRestoringRef.current) {
        sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
      }
    };

    // Сохраняем позицию при скролле (с дебаунсом)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(saveScroll, 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Сохраняем при уходе со страницы
    const handleBeforeUnload = () => {
      saveScroll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  // Сбрасываем флаг при смене роута
  useEffect(() => {
    hasRestoredRef.current = false;
  }, [pathname]);
}
