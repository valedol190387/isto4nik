'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { messengerExpand } from '@/lib/platform';

interface TelegramStickyAppProps {
  children: ReactNode;
}

/**
 * Компонент TelegramStickyApp блокирует закрытие приложения свайпом вниз
 */
export default function TelegramStickyApp({ 
  children
}: TelegramStickyAppProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
    // Применение "липкости" для всего приложения (ВОССТАНОВЛЕННАЯ ОРИГИНАЛЬНАЯ ЛОГИКА)
    const applyStickyApp = () => {
      if (!wrapRef.current || !contentRef.current) return;
      
      try {
        // Раскрываем приложение на весь экран (Telegram или Max)
        messengerExpand();
        
        // Применяем CSS классы для "липкого" приложения
        document.body.classList.add('mobile-body');
        wrapRef.current.classList.add('mobile-wrap');
        contentRef.current.classList.add('mobile-content');
        
        console.log('Sticky режим применен успешно');
      } catch (error) {
        console.error('Ошибка при применении липкого режима:', error);
      }
    };
    
    // Применяем липкость
      applyStickyApp();
    
  }, []);
  
  return (
    <div id="wrap" ref={wrapRef} style={{ height: '100%', position: 'relative' }}>
      <div id="content" ref={contentRef} style={{ height: '100%' }}>
        {children}
      </div>
    </div>
  );
} 