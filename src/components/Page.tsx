'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   * @default true
   */
  back?: boolean
}>) {
  const router = useRouter();

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
    // Сбрасываем скролл в мобильном контейнере Telegram
    const mobileWrap = document.querySelector('.mobile-wrap');
    if (mobileWrap) {
      mobileWrap.scrollTo(0, 0);
    }
    
    // Также сбрасываем обычный скролл для совместимости
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, []); // Выполняется только при монтировании компонента (т.е. при переходе на страницу)

  return <>{children}</>;
}