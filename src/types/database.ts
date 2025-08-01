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
  event_date: string;
  event_time: string | null;
  icon: string | null;
  color_class: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  link: string | null;
  category: string | null;
}

export interface Material {
  id: number;
  title: string;
  description: string | null;
  url: string;
  section_key: string;
  tags: string[];
  is_favorite: boolean;
  display_order: number;
  is_active: boolean;
  is_embedded_video: boolean;          // Новое поле: галочка "встроенное видео"
  video_embed_code: string | null;     // Новое поле: код для вставки видео из Kinescope
  created_at: string;
  updated_at: string;
}

export interface CourseAccess {
  stomach: boolean;       // course_flat_belly
  swelling: boolean;      // course_anti_swelling  
  blossom: boolean;       // course_bloom
  flexibility: boolean;   // useful (Рельеф и гибкость)
  face: boolean;          // workouts (Для лица)
  foot: boolean;          // guides (Стопы)
  bodyflow: boolean;      // motivation (BodyFlow)
  posture: boolean;       // nutrition (Осанка)
  
  // Index signature для совместимости с Record<string, boolean>
  [key: string]: boolean;
}

export interface User {
  id: number;
  telegram_id: number;
  salebot_id: string | null;
  tg_username: string | null;
  name: string | null;
  mail: string | null;
  phone: string | null;
  status: string | null;
  clubtarif: string | null;
  end_sub_club: string | null;
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
  course_access: CourseAccess | null;
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
    TransactionId?: string;
    Amount?: string;
    Currency?: string;
    PaymentAmount?: string;
    PaymentCurrency?: string;
    OperationType?: string;
    InvoiceId?: string;
    AccountId?: string;
    SubscriptionId?: string;
    Name?: string;
    Email?: string;
    DateTime?: string;
    IpAddress?: string;
    IpCountry?: string;
    IpCity?: string;
    CardFirstSix?: string;
    CardLastFour?: string;
    CardType?: string;
    Issuer?: string;
    Description?: string;
    Status?: string;
    GatewayName?: string;
    PaymentMethod?: string;
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
    };
  };
}; 