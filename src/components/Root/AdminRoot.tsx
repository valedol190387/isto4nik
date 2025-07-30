'use client';

import type React from 'react';

interface AdminRootProps {
  children: React.ReactNode;
}

/**
 * Упрощенная версия Root компонента для админки
 * Не использует Telegram SDK чтобы работать вне Telegram
 */
export function AdminRoot({ children }: AdminRootProps) {
  return (
    <div className="admin-root" style={{ 
      minHeight: '100vh',
      width: '100%',
      background: '#f8fafc',
      fontFamily: 'var(--font-montserrat)'
    }}>
      {children}
    </div>
  );
} 