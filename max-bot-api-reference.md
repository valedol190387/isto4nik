# Max Bot API — Справочник

## Общая информация

- **Base URL**: `https://platform-api.max.ru`
- **Авторизация**: Header `Authorization: {access_token}` (токен из MAX > Чат-боты > Интеграция)
- **Rate limit**: 30 запросов/сек
- **Формат**: JSON

---

## Управление участниками чата

### GET /chats/{chatId}/members — Список участников

```
GET /chats/{chatId}/members?user_ids[]=123&user_ids[]=456&count=100&marker=0
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| chatId | int64 | ID чата (path) |
| user_ids[] | int64[] | Фильтр по конкретным user_id (query, опционально) |
| marker | int64 | Курсор пагинации (query) |
| count | int (1-100) | Кол-во результатов, по умолч. 20 |

**Ответ:**
```json
{
  "members": [
    {
      "user_id": 123,
      "first_name": "Иван",
      "last_name": "Иванов",
      "username": "ivan",
      "is_bot": false,
      "is_admin": false,
      "is_owner": false,
      "join_time": 1700000000000,
      "permissions": ["read_all_messages", "write"]
    }
  ],
  "marker": 456
}
```

### GET /chats/{chatId}/members/me — Проверка бота в чате

```
GET /chats/{chatId}/members/me
```

Возвращает ChatMember объект бота.

### POST /chats/{chatId}/members — Добавить участников

```json
POST /chats/{chatId}/members
{
  "user_ids": [123, 456]
}
```

**Ответ:**
```json
{
  "success": true,
  "failed_user_ids": [],
  "failed_user_details": []
}
```

### DELETE /chats/{chatId}/members — Удалить участника

```
DELETE /chats/{chatId}/members?user_id=123&block=false
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| chatId | int64 | ID чата (path) |
| user_id | int64 | ID пользователя (query) |
| block | boolean | Заблокировать (для публичных чатов, опционально) |

**Ответ:**
```json
{
  "success": true,
  "message": ""
}
```

### GET /chats/{chatId}/members/admins — Список админов

```
GET /chats/{chatId}/members/admins
```

Бот должен быть админом.

### POST /chats/{chatId}/members/admins — Назначить админа

```json
POST /chats/{chatId}/members/admins
{
  "admins": [
    {
      "user_id": 123,
      "permissions": ["read_all_messages", "add_remove_members", "write"],
      "alias": "Модератор"
    }
  ]
}
```

**Доступные permissions:**
`read_all_messages`, `add_remove_members`, `add_admins`, `change_chat_info`, `pin_message`, `write`, `can_call`, `edit_link`, `post_edit_delete_message`, `edit_message`, `delete_message`

### DELETE /chats/{chatId}/members/admins/{userId} — Снять админа

```
DELETE /chats/{chatId}/members/admins/{userId}
```

---

## Сообщения

### POST /messages — Отправить сообщение

```
POST /messages?user_id=123&disable_link_preview=false
```

Или `chat_id=456` вместо `user_id`.

**Body (NewMessageBody):**
```json
{
  "text": "Привет! Максимум 4000 символов",
  "format": "markdown",
  "notify": true,
  "attachments": []
}
```

**format**: `"markdown"` или `"html"` (опционально)

**Ответ:** Message object с деталями отправленного сообщения.

---

## Вебхуки и обновления

### POST /subscriptions — Настройка вебхука

```json
POST /subscriptions
{
  "url": "https://example.com/webhook",
  "update_types": ["bot_started", "user_added", "message_created"],
  "secret": "my-secret-key"
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| url | string | HTTPS URL (порт 443, доверенный CA) |
| update_types | string[] | Типы событий (опционально — все если не указано) |
| secret | string (5-256) | Секрет для верификации (A-Z, a-z, 0-9, -) |

**Требования:**
- Только HTTPS на порту 443
- Доверенный CA (не self-signed)
- Ответ HTTP 200 в течение 30 сек
- Retry: до 10 попыток с экспоненциальным backoff (60с, 150с, 375с...)
- Auto-unsubscribe: если нет 200 ответа 8 часов

### GET /updates — Long polling (для разработки)

```
GET /updates?limit=100&timeout=30&marker=0&types[]=bot_started
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| limit | int (1-1000) | Макс. кол-во, по умолч. 100 |
| timeout | int (0-90) | Timeout в секундах, по умолч. 30 |
| marker | int64 | Курсор |
| types[] | string[] | Фильтр по типам |

### POST /answers — Ответ на callback кнопок

```
POST /answers?callback_id=abc123
```

```json
{
  "message": { "text": "Обновлённое сообщение" },
  "notification": "Одноразовое уведомление"
}
```

---

## Типы событий (update_types)

| Тип | Описание |
|-----|----------|
| `message_created` | Новое сообщение |
| `message_callback` | Нажатие кнопки |
| `message_edited` | Сообщение отредактировано |
| `message_removed` | Сообщение удалено |
| `bot_added` | Бот добавлен в чат |
| `bot_removed` | Бот удалён из чата |
| `bot_started` | Пользователь запустил бота |
| `bot_stopped` | Пользователь остановил бота |
| `user_added` | Пользователь добавлен в чат |
| `user_removed` | Пользователь удалён из чата |
| `chat_title_changed` | Название чата изменено |
| `dialog_muted` / `dialog_unmuted` | Диалог замьючен/размьючен |
| `dialog_cleared` / `dialog_removed` | Диалог очищен/удалён |

---

## Информация

### GET /me — Информация о боте

```
GET /me
```

**Ответ:** User object + BotInfo (до 32 команд).

### GET /chats — Все чаты бота

```
GET /chats?count=50&marker=0
```

---

## Объекты

### User
```json
{
  "user_id": 123,
  "first_name": "Иван",
  "last_name": "Иванов",
  "username": "ivan",
  "is_bot": false,
  "last_activity_time": 1700000000000,
  "description": "...",
  "avatar_url": "...",
  "full_avatar_url": "..."
}
```

### ChatMember
```json
{
  "user_id": 123,
  "first_name": "Иван",
  "is_bot": false,
  "is_admin": false,
  "is_owner": false,
  "join_time": 1700000000000,
  "permissions": ["read_all_messages", "write"]
}
```

---

## HTTP коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успех |
| 400 | Невалидный запрос |
| 401 | Ошибка авторизации |
| 404 | Ресурс не найден |
| 429 | Rate limit |
| 503 | Сервис недоступен |

---

## Примеры curl

### Проверить бота
```bash
curl -H "Authorization: TOKEN" https://platform-api.max.ru/me
```

### Получить участников группы
```bash
curl -H "Authorization: TOKEN" "https://platform-api.max.ru/chats/123/members?count=100"
```

### Кикнуть пользователя
```bash
curl -X DELETE -H "Authorization: TOKEN" "https://platform-api.max.ru/chats/123/members?user_id=456"
```

### Отправить сообщение пользователю
```bash
curl -X POST -H "Authorization: TOKEN" -H "Content-Type: application/json" \
  "https://platform-api.max.ru/messages?user_id=123" \
  -d '{"text": "Привет!"}'
```

### Настроить вебхук
```bash
curl -X POST -H "Authorization: TOKEN" -H "Content-Type: application/json" \
  https://platform-api.max.ru/subscriptions \
  -d '{"url": "https://example.com/api/max/webhook", "update_types": ["bot_started", "user_added"]}'
```
