import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Cormorant, Montserrat } from 'next/font/google';

import { Root } from '@/components/Root/Root';

// Настройка шрифтов с поддержкой кириллицы
const cormorant = Cormorant({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});
import { I18nProvider } from '@/core/i18n/provider';
import { Navigation } from '@/components/Navigation/Navigation';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';

export const metadata: Metadata = {
  title: 'Источник',
  description: 'Сообщество Теребениных',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${montserrat.variable} ${cormorant.variable}`}>
        <I18nProvider>
          <Root>{children}</Root>
          <Navigation />
        </I18nProvider>
      </body>
    </html>
  );
}
