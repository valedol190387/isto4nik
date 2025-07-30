'use client';

import { usePathname } from 'next/navigation';
import type React from 'react';
import { RootWithTelegram } from './RootWithTelegram';
import { AdminRoot } from './AdminRoot';


/**
 * Главный Root компонент с условным рендерингом
 * Для админки (/admin/*) - используем упрощенную версию без Telegram SDK
 * Для пользовательской части - полная версия с Telegram
 */
export function Root({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Для админки используем упрощенную версию без Telegram SDK
  if (pathname.startsWith('/admin')) {
    return <AdminRoot>{children}</AdminRoot>;
  }
  
  // Для пользовательской части используем полную версию с Telegram
  return <RootWithTelegram>{children}</RootWithTelegram>;
}
