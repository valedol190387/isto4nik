'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Страница-редирект с /materials на /courses/mini-courses
// Детальные страницы материалов /materials/[id] остаются рабочими
export default function MaterialsRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Перенаправляем на новую страницу каталога материалов
    router.replace('/courses/mini-courses');
  }, [router]);

  // Показываем загрузку во время редиректа
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#6b7280'
    }}>
      Перенаправление...
      </div>
  );
} 
