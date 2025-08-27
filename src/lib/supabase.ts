import { createClient } from '@supabase/supabase-js';

// Используем значения из конфигурации MCP
const supabaseUrl = 'https://supabase.istochnikbackoffice.ru';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1NDEzNTgyMCwiZXhwIjo0OTA5ODA5NDIwLCJyb2xlIjoiYW5vbiJ9.wMRiOXMk23wfbDJr3y4DcWlTzG2PEc1v3UlX6_VrzbU';

// Создаем клиент без строгой типизации - позволяем Supabase инферить типы
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 