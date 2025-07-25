import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Используем значения из конфигурации MCP
const supabaseUrl = 'https://supabase.ayunabackoffice.ru';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MzA5MzAyMCwiZXhwIjo0OTA4NzY2NjIwLCJyb2xlIjoiYW5vbiJ9.eYGnezoHGSZAfNI3xUr_wMeRjbTlyG9wbd3aGRarNaY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey); 