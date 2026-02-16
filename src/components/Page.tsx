'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   * @default true
   */
  back?: boolean
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [nativeBackAvailable, setNativeBackAvailable] = useState(true);

  // Проверяем доступность нативной кнопки назад (Telegram или Max)
  useEffect(() => {
    const telegramAvailable = backButton.show.isAvailable();
    const maxBackButton = (window as any).__MAX_PLATFORM__ && (window as any).WebApp?.BackButton;
    setNativeBackAvailable(telegramAvailable || !!maxBackButton);
  }, []);

  // Telegram native back button
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

  // Max native back button — window.WebApp.BackButton
  useEffect(() => {
    const maxBackButton = (window as any).__MAX_PLATFORM__ && (window as any).WebApp?.BackButton;
    if (!maxBackButton) return;

    if (back) {
      maxBackButton.show();
    } else {
      maxBackButton.hide();
    }

    const handler = () => router.back();
    maxBackButton.onClick(handler);

    return () => {
      maxBackButton.offClick(handler);
      maxBackButton.hide();
    };
  }, [back, router]);

  // Сброс скролла для всех страниц кроме /courses/* (там работает восстановление позиции)
  useEffect(() => {
    if (pathname.startsWith('/courses/')) return;

    const mobileWrap = document.querySelector('.mobile-wrap');
    if (mobileWrap) mobileWrap.scrollTo(0, 0);

    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [pathname]);

  const showUiBackButton = back && !nativeBackAvailable;

  return (
    <>
      {showUiBackButton && (
        <button
          onClick={() => router.back()}
          className="ui-back-button"
          aria-label="Назад"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
      )}
      {children}
    </>
  );
}
