'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Хук для сохранения и восстановления позиции скролла при навигации
 * Работает только для страниц с материалами (courses/[category])
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const scrollPositions = useRef<{ [key: string]: number }>({});
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

    // Восстанавливаем позицию скролла при монтировании компонента
    const restoreScroll = () => {
      const savedPosition = sessionStorage.getItem(`scroll:${pathname}`);

      if (savedPosition && !isRestoringRef.current) {
        isRestoringRef.current = true;
        const position = parseInt(savedPosition, 10);

        // Используем requestAnimationFrame для гарантии, что DOM отрендерился
        requestAnimationFrame(() => {
          window.scrollTo(0, position);
          isRestoringRef.current = false;
        });
      }
    };

    // Пытаемся восстановить скролл сразу и после небольшой задержки
    // (на случай если контент еще загружается)
    restoreScroll();
    const timeoutId = setTimeout(restoreScroll, 100);

    // Сохраняем позицию скролла при уходе со страницы
    const saveScroll = () => {
      if (!isRestoringRef.current) {
        scrollPositions.current[pathname] = window.scrollY;
        sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
      }
    };

    // Сохраняем позицию при скролле (с дебаунсом)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScroll, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Сохраняем при уходе со страницы
    const handleBeforeUnload = () => {
      saveScroll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Сохраняем при переходе по ссылке (для TMA)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href.includes('/materials/')) {
        saveScroll();
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);

      // Возвращаем автоматическое восстановление скролла для других страниц
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, [pathname]);
}
