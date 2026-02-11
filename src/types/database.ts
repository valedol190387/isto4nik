export interface Review {
  id: number;
  customer_name: string;
  description: string | null;
  review_text: string;
  rating: number;
  created_at: string;
  updated_at: string;
  avatar: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string | null;  // nullable в БД
  event_time: string | null;
  icon: string | null;
  is_active: boolean | null;  // nullable в БД, но имеет default: true
  created_at: string | null;  // nullable в БД, но имеет default: now()
  updated_at: string | null;  // nullable в БД, но имеет default: now()
  link: string | null;
  tags: string[] | null;
}

// Интерфейс для видео в материале
export interface MaterialVideo {
  title: string;                       // Название видео (например "Часть 1")
  embed_code: string;                  // HTML код для встраивания видео
}

export interface Material {
  id: number;
  title: string;
  description: string | null;
  url: string;
  group: string;                       // Обязательное поле: группа материала
  section_key: string;
  tags: string[];
  is_favorite: boolean;
  display_order: number;
  is_active: boolean;
  is_embedded_video: boolean;          // Галочка "встроенное видео"
  video_embed_code: string | null;     // Устаревшее: код для вставки видео (для обратной совместимости)
  videos: MaterialVideo[];             // Новое: массив видео [{title, embed_code}]
  pic_url: string | null;              // URL изображения для превью
  share_uuid?: string;                 // UUID для безопасных ссылок
  created_at: string;
  updated_at: string;
}


export interface User {
  id: number;
  telegram_id: number;
  salebot_id: string | null;
  username: string | null;
  name_from_ml: string | null;
  mail: string | null;
  phone: string | null;
  status: string | null;
  clubtarif: string | null;
  next_payment_date: string | null;
  forma_opl: string | null;
  metka: string | null;
  periodtarif: string | null;
  srok: string | null;
  start_sub_club: string | null;
  subscr_id: string | null;
  sum: number | null;
  delete_club: boolean;
  first_monthdate: string | null;
  sub_club_stop: string | null;
  amo_lead_id: string | null;
  amo_client_id: string | null;
  utm_1: string | null;
  utm_2: string | null;
  utm_3: string | null;
  utm_4: string | null;
  utm_5: string | null;
  testing: boolean;
  istochnik: string | null;
  forma_oplaty: string | null;
  total_payments: number;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: number;
  telegram_id: number;
  material_id: number;
  created_at: string;
}

export interface Payment {
  id: number;
  telegram_id: string;
  payment_callback: {
    // Основные поля из реальной структуры данных
    sum?: string;                    // Сумма платежа (основное поле)
    payment_status?: string;         // Статус платежа (success, failed, etc.)
    currency?: string;               // Валюта
    date?: string;                   // Дата платежа
    order_id?: string;              // ID заказа
    order_num?: string;             // Номер заказа
    payment_type?: string;          // Тип платежа
    customer_email?: string;        // Email клиента
    customer_phone?: string;        // Телефон клиента
    customer_extra?: string;        // Дополнительная информация
    commission?: string;            // Комиссия
    commission_sum?: string;        // Сумма комиссии
    
    // Поля подписки
    'subscription[id]'?: string;
    'subscription[cost]'?: string;
    'subscription[name]'?: string;
    'subscription[type]'?: string;
    'subscription[active]'?: string;
    
    // Поля продуктов
    'products[0][sum]'?: string;
    'products[0][name]'?: string;
    'products[0][price]'?: string;
    'products[0][quantity]'?: string;
    
    // Наследованные поля для совместимости
    TransactionId?: string;
    Amount?: string;                 // Для обратной совместимости
    PaymentAmount?: string;          // Для обратной совместимости
    Status?: string;                 // Для обратной совместимости
    
    // Универсальное поле для любых дополнительных данных
    [key: string]: any;
  };
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PopupSettings {
  id: number;
  title: string;
  subtitle: string | null;
  price_text: string;
  button_text: string;
  button_link: string;
  image_url: string;
  frequency: 'daily' | 'weekly' | 'once' | 'always' | 'disabled';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialViewLog {
  id: number;
  telegram_id: number;
  material_id: number;
  video_index: number | null;
  video_title: string | null;
  event_type: 'lesson_open' | 'video_view';
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id'>>;
      };
      materials: {
        Row: Material;
        Insert: Omit<Material, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Material, 'id'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'telegram_id'>>;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: Omit<UserFavorite, 'id' | 'created_at'>;
        Update: Partial<Omit<UserFavorite, 'id'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'>;
        Update: Partial<Omit<Payment, 'id'>>;
      };
      faq: {
        Row: FAQ;
        Insert: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FAQ, 'id'>>;
      };
      popup_settings: {
        Row: PopupSettings;
        Insert: Omit<PopupSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PopupSettings, 'id'>>;
      };
      material_view_logs: {
        Row: MaterialViewLog;
        Insert: Omit<MaterialViewLog, 'id' | 'created_at'>;
        Update: Partial<Omit<MaterialViewLog, 'id'>>;
      };
    };
  };
}; 