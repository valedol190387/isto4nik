import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админ-панель - Источник',
  description: 'Панель администратора сообщества Теребениных',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico', 
    apple: '/favicon.ico',
  },
};

export default function AdminLayout({ children }: PropsWithChildren) {
  return children;
}
