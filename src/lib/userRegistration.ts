/**
 * Система автоматической регистрации пользователей с UTM отслеживанием
 */

import { supabase } from './supabase';
import { parseUtmParams, formatUserName, type TelegramUserData, type UtmParams } from './utm';

export interface UserRegistrationResult {
  isNewUser: boolean;
  success: boolean;
  error?: string;
  userId?: string;
}

export interface NewUserData {
  telegram_id: string;
  name: string;
  tg_username: string | null;
  utm_1: string | null;
  utm_2: string | null;
  utm_3: string | null;
  utm_4: string | null;
  utm_5: string | null;
}

/**
 * Отправка webhook уведомления о новом пользователе
 * TODO: Настроить webhook URL в переменных окружения
 */
async function sendNewUserWebhook(userData: NewUserData): Promise<void> {
  try {
    // Пока закомментировано, можно настроить позже
    /*
    const webhookUrl = process.env.NEXT_PUBLIC_NEW_USER_WEBHOOK_URL;
    if (!webhookUrl) return;

    const payload = {
      ...userData,
      event_type: 'new_user_registration',
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending webhook to:', webhookUrl);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Webhook sent successfully');
    } else {
      console.error('❌ Webhook failed with status:', response.status);
    }
    */
    
    console.log('📤 Webhook готов к отправке:', userData);
  } catch (error) {
    console.error('❌ Error sending webhook:', error);
  }
}

/**
 * Проверка и создание пользователя через API endpoint
 * Это более надежный способ, так как вся логика централизована в API
 */
async function registerUserViaAPI(
  telegramUser: TelegramUserData,
  startParam: string | null
): Promise<{ success: boolean; isNewUser: boolean; error?: string }> {
  try {
    const response = await fetch('/api/users/auto-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramUser.id.toString(),
        name: formatUserName(telegramUser),
        tg_username: telegramUser.username || null,
        start_param: startParam
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        isNewUser: false, 
        error: errorData.error || 'API request failed' 
      };
    }

    const result = await response.json();
    return {
      success: result.success,
      isNewUser: result.isNewUser
    };

  } catch (error) {
    console.error('❌ Error calling auto-register API:', error);
    return { 
      success: false, 
      isNewUser: false, 
      error: 'Network error' 
    };
  }
}



/**
 * ГЛАВНАЯ ФУНКЦИЯ: Проверка и создание пользователя при первом запуске
 * 
 * ВАЖНО: UTM метки сохраняются ТОЛЬКО при первой регистрации!
 * Для существующих пользователей UTM метки НЕ обновляются!
 */
export async function checkAndCreateUser(
  telegramUser: TelegramUserData,
  startParam?: string | null
): Promise<UserRegistrationResult> {
  const telegramId = telegramUser.id.toString();
  
  try {
    console.log('🔍 Starting user auto-registration for telegram_id:', telegramId);
    console.log('📊 Start param received:', startParam);

    // Используем API endpoint для регистрации (более надежно)
    const { success, isNewUser, error } = await registerUserViaAPI(
      telegramUser, 
      startParam || null
    );

    if (!success) {
      return { 
        isNewUser: false, 
        success: false, 
        error: error || 'Registration failed',
        userId: telegramId 
      };
    }

    // Отправляем webhook только для новых пользователей с UTM
    if (isNewUser && startParam) {
      const utmParams = parseUtmParams(startParam);
      await sendNewUserWebhook({
        telegram_id: telegramId,
        name: formatUserName(telegramUser),
        tg_username: telegramUser.username || null,
        utm_1: utmParams.utm_1,
        utm_2: utmParams.utm_2,
        utm_3: utmParams.utm_3,
        utm_4: utmParams.utm_4,
        utm_5: utmParams.utm_5
      });
    }

    console.log(`✅ Auto-registration completed: ${isNewUser ? 'NEW' : 'EXISTING'} user`);
    return { 
      isNewUser, 
      success: true, 
      userId: telegramId 
    };

  } catch (error) {
    console.error('❌ Unexpected error in checkAndCreateUser:', error);
    return { 
      isNewUser: false, 
      success: false, 
      error: 'Unexpected registration error',
      userId: telegramId 
    };
  }
} 