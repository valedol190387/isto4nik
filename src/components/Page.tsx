'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   * @default true
   */
  back?: boolean
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (back) {
      backButton.show();
    } else {
      backButton.hide();
    }
  }, [back]);

  useEffect(() => {
    return backButton.onClick(() => {
      router.back();
    });
  }, [router]);

  // Сброс позиции скролла при загрузке страницы
  useEffect(() => {
    // НЕ сбрасываем скролл для страниц с материалами - там работает восстановление позиции
    if (pathname.startsWith('/courses/')) {
      console.log('[Page] Skipping scroll reset for courses page:', pathname);
      return;
    }

    console.log('[Page] Resetting scroll for:', pathname);

    // Сбрасываем скролл в мобильном контейнере Telegram
    const mobileWrap = document.querySelector('.mobile-wrap');
    if (mobileWrap) {
      mobileWrap.scrollTo(0, 0);
    }

    // Также сбрасываем обычный скролл для совместимости
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [pathname]); // Зависимость от pathname, чтобы реагировать на изменения роута

  return <>{children}</>;
}