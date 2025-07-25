// config/types.ts - Универсальные типы для любого клуба
export interface AppConfig {
  branding: BrandingConfig
  content: ContentConfig
  integrations: IntegrationsConfig
  admin: AdminConfig
}

export interface BrandingConfig {
  colors: {
    primary: string      // Основной цвет бренда
    secondary: string    // Вторичный цвет
    accent: string       // Акцентный цвет
    background: string   // Фон
    text: string         // Основной текст
    textMuted: string    // Приглушенный текст
  }
  typography: {
    fontFamily: string
    headingFont: string
  }
  assets: {
    logo: string
    favicon: string
    footerImage: string
  }
}

export interface ContentConfig {
  highlights: Array<{
    title: string
    color: string
    enabled: boolean
    order: number
    link: string
  }>
  intro: {
    title: string
    enabled: boolean
    color: string
    gradient: string
    link: string
  }
  sections: Record<string, SectionConfig>
  chat: {
    title: string
    enabled: boolean
    color: string
    link: string
  }
  navigation: NavigationConfig
}

export interface SectionConfig {
  title: string
  description: string
  icon: string
  color: string
  image: string
  enabled: boolean
  order: number
  itemType: 'video' | 'article' | 'link' | 'file'
  fields: string[]
}

export interface NavigationConfig {
  showWelcome: boolean
  showSchedule: boolean
  showChats: boolean
  showProfiles: boolean
  customItems?: Array<{
    title: string
    icon: string
    url: string
    order: number
  }>
}

export interface IntegrationsConfig {
  telegram: {
    botToken: string
    botUsername: string
    welcomeMessage: string
  }
  supabase: {
    url: string
    anonKey: string
    serviceKey: string
  }
  notifications: {
    enabled: boolean
    webhookUrl?: string
  }
}

export interface AdminConfig {
  title: string
  credentials: {
    login: string
    password: string
  }
  allowedTelegramIds: string[]
} 