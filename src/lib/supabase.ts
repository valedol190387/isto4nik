import { createClient } from '@supabase/supabase-js';

// ИСПОЛЬЗУЕМ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ - НЕ ХАРДКОДИМ КЛЮЧИ!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Создаем клиент без строгой типизации - позволяем Supabase инферить типы
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 