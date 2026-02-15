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
    if (backButton.show.isAvailable()) {
      if (back) {
        backButton.show();
      } else {
        backButton.hide();
      }
    }
  }, [back]);

  useEffect(() => {
    if (backButton.onClick.isAvailable()) {
      return backButton.onClick(() => {
        router.back();
      });
    }
  }, [router]);

  // Сброс скролла для всех страниц кроме /courses/* (там работает восстановление позиции)
  useEffect(() => {
    if (pathname.startsWith('/courses/')) return;

    const mobileWrap = document.querySelector('.mobile-wrap');
    if (mobileWrap) mobileWrap.scrollTo(0, 0);

    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}