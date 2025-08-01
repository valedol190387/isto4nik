import { useState, useEffect } from 'react';
import { useSignal } from '@telegram-apps/sdk-react';
import { initData } from '@telegram-apps/sdk-react';
import { CourseAccess } from '@/types/database';

interface CourseAccessResult {
  access: CourseAccess | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Хук для получения доступов пользователя к разделам курсов
 */
export function useCourseAccess(): CourseAccessResult {
  const [access, setAccess] = useState<CourseAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем пользователя из Telegram
  const user = useSignal(initData.user);

  // Функция для получения Telegram ID
  const getTelegramId = (): string | null => {
    // Сначала пробуем получить из Telegram SDK
    if (user?.id) {
      return user.id.toString();
    }

    // Fallback - из Telegram WebApp API
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id.toString();
      }
    }

    return null;
  };

  // Функция для загрузки доступов
  const fetchAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const telegramId = getTelegramId();
      if (!telegramId) {
        console.log('⚠️ No telegram ID found, using default access');
        // Дефолтные доступы если нет ID
        setAccess({
          stomach: true,        // course_flat_belly
          swelling: false,      // course_anti_swelling
          blossom: false,       // course_bloom
          flexibility: false,   // useful
          face: false,          // workouts
          foot: false,          // guides
          bodyflow: false,      // motivation
          posture: false        // nutrition
        });
        return;
      }

      console.log('🔍 Fetching course access for telegram_id:', telegramId);

      const response = await fetch(`/api/users/course-access?telegram_id=${telegramId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('👤 User not found, using default access');
          setAccess({
            stomach: true,        // course_flat_belly
            swelling: false,      // course_anti_swelling
            blossom: false,       // course_bloom
            flexibility: false,   // useful
            face: false,          // workouts
            foot: false,          // guides
            bodyflow: false,      // motivation
            posture: false        // nutrition
          });
          return;
        }
        throw new Error(`Failed to fetch course access: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.course_access) {
        console.log('✅ Course access loaded:', data.course_access);
        setAccess(data.course_access);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('❌ Error fetching course access:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course access');
      
      // В случае ошибки устанавливаем дефолтные доступы
      setAccess({
        stomach: true,        // course_flat_belly
        swelling: false,      // course_anti_swelling
        blossom: false,       // course_bloom
        flexibility: false,   // useful
        face: false,          // workouts
        foot: false,          // guides
        bodyflow: false,      // motivation
        posture: false        // nutrition
      });
    } finally {
      setLoading(false);
    }
  };

  // Загружаем доступы при монтировании компонента или изменении пользователя
  useEffect(() => {
    fetchAccess();
  }, [user?.id]);

  return {
    access,
    loading,
    error,
    refetch: fetchAccess
  };
}

// Функция hasAccessToSection перенесена в src/utils/courseAccessMapping.ts