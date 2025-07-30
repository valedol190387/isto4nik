'use client';

import { StagewiseToolbar } from '@stagewise/toolbar-next';
// import ReactPlugin from '@stagewise-plugins/react';

export function StagewiseToolbarClient() {
  // Проверяем, что мы в режиме разработки и на клиенте
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return null;
  }

  return (
    <StagewiseToolbar
      config={{
        plugins: [],
      }}
    />
  );
} 