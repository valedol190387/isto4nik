// config/base.config.ts - Базовый универсальный конфиг для любого клуба
import { AppConfig } from './types'

export const baseConfig: AppConfig = {
  // 🎨 БРЕНДИНГ - базовые цвета, можно легко менять
  branding: {
    colors: {
      primary: '#3B82F6',      // Синий - универсальный
      secondary: '#10B981',    // Зеленый - нейтральный  
      accent: '#F59E0B',       // Желтый - для акцентов
      background: '#FFFFFF',   // Белый фон
      text: '#1F2937',         // Темный текст
      textMuted: '#6B7280'     // Серый для второстепенного
    },
    typography: {
      fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
      headingFont: 'var(--font-cormorant), Cormorant, serif'
    },
    assets: {
      logo: '/logo.png',
      favicon: '/favicon.ico',
      footerImage: '/footer.png'
    }
  },

  // 📝 КОНТЕНТ - универсальные разделы
  content: {
    // Хайлайты - верхние блоки
    highlights: [
      {
        title: 'Начни отсюда',
        color: '#3B82F6',
        enabled: true,
        order: 1,
        link: '/welcome'
      },
      {
        title: 'О клубе',
        color: '#10B981',
        enabled: true,
        order: 2,
        link: '/about'
      },
      {
        title: 'Отзывы',
        color: '#8B5CF6',
        enabled: true,
        order: 3,
        link: '/reviews'
      },
      {
        title: 'FAQ',
        color: '#F59E0B',
        enabled: true,
        order: 4,
        link: '/faq'
      }
    ],
    
    // Вводный блок
    intro: {
      title: 'Большой блок вводный',
      enabled: true,
      color: '#1E40AF',
      gradient: 'from-blue-600 to-purple-600',
      link: '/intro'
    },
    
    // Основные разделы материалов
    sections: {
      section1: {
        title: 'Раздел 1',
        description: 'Основной контент для пользователей',
        icon: 'folder',
        color: '#3B82F6',
        image: '/section1.jpg',
        enabled: true,
        order: 1,
        itemType: 'video',
        fields: ['title', 'description', 'url']
      },
      section2: {
        title: 'Раздел 2',
        description: 'Дополнительные материалы',
        icon: 'document',
        color: '#10B981',
        image: '/section2.jpg',
        enabled: true,
        order: 2,
        itemType: 'article',
        fields: ['title', 'description', 'url']
      },
      section3: {
        title: 'Раздел 3',
        description: 'Специальные ресурсы',
        icon: 'star',
        color: '#EF4444',
        image: '/section3.jpg',
        enabled: true,       // Включен для демонстрации
        order: 3,
        itemType: 'link',
        fields: ['title', 'description', 'url']
      },
      section4: {
        title: 'Раздел 4',
        description: 'Дополнительные ресурсы',
        icon: 'star',
        color: '#EC4899',
        image: '/section4.jpg',
        enabled: true,       // Включен для демонстрации
        order: 4,
        itemType: 'link',
        fields: ['title', 'description', 'url']
      }
    },
    
    // Чат клуба
    chat: {
      title: 'Чат клуба',
      enabled: true,
      color: '#374151',
      link: '/chat'
    },
    
    // 🧭 НАВИГАЦИЯ - что показывать в меню
    navigation: {
      showWelcome: true,       // Показывать приветственный раздел
      showSchedule: true,      // Показывать расписание
      showChats: false,        // Чаты отключены по умолчанию
      showProfiles: true,      // Показывать профили/экспертов
      customItems: []          // Кастомные пункты меню
    }
  },

  // 🔌 ИНТЕГРАЦИИ - подключения к внешним сервисам
  integrations: {
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      botUsername: process.env.TELEGRAM_BOT_USERNAME || '',
      welcomeMessage: 'Добро пожаловать! 👋'
    },
    supabase: {
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
      serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
    },
    notifications: {
      enabled: true,
      webhookUrl: process.env.WEBHOOK_URL
    }
  },

  // 👨‍💼 АДМИНКА - настройки администрирования
  admin: {
    title: 'Админ-панель',
    credentials: {
      login: process.env.ADMIN_LOGIN || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    },
    allowedTelegramIds: process.env.ADMIN_TELEGRAM_IDS?.split(',') || []
  }
}

// 🎨 ГОТОВЫЕ ЦВЕТОВЫЕ СХЕМЫ для быстрого переключения
export const colorPresets = {
  blue: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B'
  },
  green: {
    primary: '#10B981',
    secondary: '#3B82F6',
    accent: '#F59E0B'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    accent: '#F59E0B'
  },
  red: {
    primary: '#EF4444',
    secondary: '#10B981',
    accent: '#F59E0B'
  }
}

// 🏗️ ГОТОВЫЕ НАБОРЫ РАЗДЕЛОВ для разных типов клубов
export const sectionPresets = {
  // Стандартный набор - 2 основных раздела
  standard: ['section1', 'section2'],
  
  // Расширенный набор - все разделы
  extended: ['section1', 'section2', 'section3'],
  
  // Минимальный набор - только основной контент
  minimal: ['section1']
} 