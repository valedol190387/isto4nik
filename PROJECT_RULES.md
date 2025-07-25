# 🎯 Правила работы с проектом AyunaBeauty

> Этот проект является частью monorepo и использует **pnpm workspaces**

## 📁 Структура проекта

```
ayuna-beauty/
├── src/
│   ├── app/              # Next.js App Router (TMA страницы)
│   ├── components/       # React компоненты
│   ├── core/            # Основная логика
│   ├── css/             # Стили и утилиты
│   └── hooks/           # Custom React hooks
├── public/              # Статические файлы
├── config/              # Конфигурации
└── PROJECT_RULES.md     # Этот файл
```

## 🚀 Как работать с проектом

### 1. Открытие проекта

**Рекомендуемый способ (Workspace):**
```bash
cd /Users/valentin/Desktop/SnapStart/CursorProjects
cursor ayuna-beauty.code-workspace
```

**Альтернативный способ (только проект):**
```bash
cursor /Users/valentin/Desktop/SnapStart/CursorProjects/ayuna-beauty
```

### 2. Разработка

```bash
# Из корня monorepo
cd /Users/valentin/Desktop/SnapStart/CursorProjects
pnpm dev:ayuna

# Или из папки проекта
cd ayuna-beauty
pnpm dev
```

### 3. Сборка проекта

```bash
# Из корня monorepo
pnpm build:ayuna

# Или из папки проекта  
pnpm build
```

## 📦 Работа с зависимостями

### ⚠️ ВАЖНО: Всегда используйте фильтр workspace!

### Добавление новых библиотек

```bash
# ✅ ПРАВИЛЬНО - из корня monorepo
cd /Users/valentin/Desktop/SnapStart/CursorProjects
pnpm --filter ayuna-beauty add библиотека-название

# ✅ ПРАВИЛЬНО - dev зависимости
pnpm --filter ayuna-beauty add -D @types/библиотека

# ❌ НЕПРАВИЛЬНО - не делайте так!
cd ayuna-beauty
pnpm add библиотека  # Может сломать workspace!
```

### Примеры установки популярных библиотек

```bash
# UI библиотеки
pnpm --filter ayuna-beauty add @radix-ui/react-dialog
pnpm --filter ayuna-beauty add @headlessui/react

# Утилиты
pnpm --filter ayuna-beauty add lodash
pnpm --filter ayuna-beauty add -D @types/lodash

# Состояние
pnpm --filter ayuna-beauty add zustand
pnpm --filter ayuna-beauty add @tanstack/react-query

# Формы
pnpm --filter ayuna-beauty add react-hook-form
pnpm --filter ayuna-beauty add @hookform/resolvers
```

### Удаление зависимостей

```bash
# ✅ ПРАВИЛЬНО
pnpm --filter ayuna-beauty remove библиотека-название

# ❌ НЕПРАВИЛЬНО  
cd ayuna-beauty && pnpm remove библиотека
```

## 🛠️ Полезные команды

### Разработка
```bash
pnpm --filter ayuna-beauty dev          # Запуск dev сервера
pnpm --filter ayuna-beauty build        # Сборка проекта
pnpm --filter ayuna-beauty start        # Запуск production сервера
pnpm --filter ayuna-beauty lint         # Проверка кода
pnpm --filter ayuna-beauty clean        # Очистка cache
```

### Информация о проекте
```bash
pnpm --filter ayuna-beauty list         # Список установленных пакетов
pnpm --filter ayuna-beauty outdated     # Устаревшие пакеты
pnpm --filter ayuna-beauty audit        # Проверка безопасности
```

### Workspace команды
```bash
pnpm -r exec pwd                        # Показать все workspace проекты
pnpm install                            # Установить зависимости всех проектов
```

## 🗄️ Работа с базой данных (Supabase MCP)

Проект использует **централизованный Supabase MCP сервер** для работы с self-hosted Supabase.

### Доступные инструменты через Cursor:

- 🗃️ **Schema & Migrations**: `list_tables`, `list_migrations`, `apply_migration`
- 💾 **Database Operations**: `execute_sql`, `get_database_stats`
- 👥 **Auth Management**: `list_auth_users`, `create_auth_user`, `delete_auth_user`
- 📁 **Storage**: `list_storage_buckets`, `list_storage_objects`
- ⚙️ **Development**: `generate_typescript_types`

### Как использовать:

1. **Откройте workspace**: `cursor ayuna-beauty.code-workspace`
2. **В чате Cursor**: Используйте MCP инструменты для работы с БД
3. **Примеры запросов**:
   - "Покажи все таблицы в базе данных"
   - "Создай пользователя с email test@example.com"
   - "Сгенерируй TypeScript типы для всех таблиц"

### ⚠️ Важно:
- MCP сервер установлен **централизованно** в `/Users/valentin/.mcp-servers/`
- Конфигурация в `.cursor/mcp.json` уже настроена
- Все изменения в БД через MCP применяются **напрямую**

## 📝 Правила разработки

### 1. Структура компонентов
```typescript
// components/ComponentName/
├── ComponentName.tsx      # Основной компонент
├── ComponentName.module.css  # Стили (если нужны)
├── index.ts              # Экспорт
└── types.ts              # TypeScript типы
```

### 2. Именование файлов
- **Компоненты:** `PascalCase.tsx` 
- **Хуки:** `useHookName.ts`
- **Утилиты:** `camelCase.ts`
- **Типы:** `types.ts`

### 3. Импорты
```typescript
// ✅ Используйте абсолютные импорты
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

// ❌ Избегайте относительных
import { Button } from '../../../components/Button'
```

## 🚨 Что НЕ делать

### ❌ Никогда не делайте:

1. **Не создавайте `node_modules` в проекте**
   ```bash
   cd ayuna-beauty
   npm install  # ❌ Сломает workspace!
   ```

2. **Не меняйте имя проекта в `package.json`**
   ```json
   {
     "name": "ayuna-beauty"  // ✅ Оставьте как есть!
   }
   ```

3. **Не устанавливайте зависимости без фильтра**
   ```bash
   pnpm add react  # ❌ Установится в корень!
   ```

4. **Не работайте в других проектах через workspace**
   - Workspace настроен только для `ayuna-beauty`
   - Другие проекты остаются независимыми

## 🔧 Решение проблем

### Проблема: "Module not found"
```bash
# Решение: переустановите зависимости
cd /Users/valentin/Desktop/SnapStart/CursorProjects
pnpm install
```

### Проблема: TypeScript ошибки
```bash
# Решение: очистите cache
pnpm --filter ayuna-beauty clean
pnpm --filter ayuna-beauty build
```

### Проблема: Медленная работа
```bash
# Решение: очистите .next
rm -rf ayuna-beauty/.next
pnpm --filter ayuna-beauty dev
```

## 📞 Быстрая справка

**Главное правило:** Всегда используйте `--filter ayuna-beauty` при работе с зависимостями!

**Основные команды:**
- `pnpm --filter ayuna-beauty add пакет` - установка
- `pnpm --filter ayuna-beauty dev` - разработка  
- `pnpm --filter ayuna-beauty build` - сборка

**Workspace файл:** `/Users/valentin/Desktop/SnapStart/CursorProjects/ayuna-beauty.code-workspace`

---

💡 **Совет:** Добавьте этот файл в закладки Cursor для быстрого доступа к правилам! 