# Security Environment Variables for Coolify

## Обязательные переменные окружения для безопасности:

### Database (уже настроены)
```
NEXT_PUBLIC_SUPABASE_URL=https://supabase.istochnikbackoffice.ru
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1NDEzNTgyMCwiZXhwIjo0OTA5ODA5NDIwLCJyb2xlIjoiYW5vbiJ9.wMRiOXMk23wfbDJr3y4DcWlTzG2PEc1v3UlX6_VrzbU
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1NDEzNTgyMCwiZXhwIjo0OTA5ODA5NDIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.5wZYu52nx53Y4mLNSL4maX0AgpKxYCeViZkscoHEL8Y
```

### Telegram Security Links (НОВЫЕ - нужно добавить)
```
TELEGRAM_CHAT_LINK=https://t.me/c/2770943577/3/564
TELEGRAM_COURSE_FLAT_BELLY_LINK=https://t.me/c/2770943577/3/564
TELEGRAM_COURSE_ANTI_SWELLING_LINK=https://t.me/c/2770943577/3/564
```

### Bot Link (публичная)
```
NEXT_PUBLIC_BOT_LINK=https://t.me/Ploskiy_zhivot_s_Ayunoy_bot
```

## Как это работает:

1. **Серверная проверка**: Middleware проверяет подписку на сервере перед доступом к страницам
2. **Защищенные ссылки**: Реальные ссылки на чаты скрыты в environment variables
3. **API endpoint**: `/api/secure-links` проверяет подписку перед выдачей ссылки
4. **Временные ссылки**: Каждая ссылка действительна только 30 секунд

## Безопасность:

- ✅ Нельзя обойти проверку через инструменты разработчика
- ✅ Ссылки на чаты скрыты от фронтенда
- ✅ Двойная проверка: middleware + API
- ✅ Временные токены для ссылок

## Настройка в Coolify:

Добавьте эти переменные в Environment Variables вашего приложения в Coolify. 