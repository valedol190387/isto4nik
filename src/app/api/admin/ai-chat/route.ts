import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxRetries: 1, // minimal retries — we handle fallback ourselves
  timeout: 30000, // 30s per request max
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `Ты — AI-ассистент админ-панели приложения "Источник" (Isto4nik). Это Telegram mini-app для закрытого клуба/сообщества Теребениных (образовательная платформа по красоте и здоровью).

Сегодня: ${new Date().toISOString().split('T')[0]}

У тебя есть доступ к базе данных через инструменты. Ты можешь:
- Выполнять SQL-запросы для анализа данных
- Формировать Excel-отчёты для скачивания
- Давать аналитику по продажам, подпискам, пользователям, контенту

Структура базы данных:

ТАБЛИЦА users (основная таблица пользователей):
- telegram_id (bigint, PK) — ID пользователя в Telegram
- username (text) — юзернейм в Telegram
- name (text) — имя (из Telegram)
- name_from_ml (text) — имя из рассылки
- surname (text) — фамилия
- phone (text), mail (text) — контакты
- status (text) — статус подписки: 'Активна', 'Неактивна', 'Новый пользователь'
- all_payments (numeric) — сумма всех платежей за всё время (рубли)
- last_pay (numeric) — последний платёж
- last_pay_date (timestamp) — дата последнего платежа
- next_payment_date (timestamp) — дата следующего платежа
- paytype (text) — тип оплаты: 'Автомат' (подписка), 'Ручная', 'lavatop', 'zarubezh', 'Наличка'
- reg_date (text) — дата регистрации (текстовое поле, формат может варьироваться)
- created_at (timestamp) — дата создания записи
- updated_at (timestamp)
- clubtime (bigint) — время в клубе
- platform (text) — платформа: 'telegram', 'max'
- max_id (bigint) — ID в Max Messenger
- utm_1..utm_5 (text) — UTM-метки маркетинга
- prodamus_id, subnumber, lava_contractId — ID в платёжных системах

ТАБЛИЦА payments (платежи через Продамус/Salebot, ~6640 записей):
- id (bigint, PK)
- telegram_id (text) — ID плательщика
- payment_callback (jsonb) — JSON с деталями:
  - sum — сумма платежа
  - date — дата
  - order_id, order_num — номер заказа
  - payment_type — тип оплаты
  - customer_email, customer_phone
  - subscription[name], subscription[cost], subscription[active]
  - products[0][name], products[0][price], products[0][quantity]
  - payment_status, payment_status_description
- created_at (timestamp)
- UTM1..UTM5 (text) — UTM-метки

ТАБЛИЦА payments_lavatop (международные платежи через Lava, ~470 записей):
- id (bigint, PK)
- telegram_id (text)
- product_id (text)
- summa (numeric) — сумма
- currency (text) — валюта: EUR, USD, RUB
- status (text) — 'payment.success', 'subscription.recurring.payment.success', 'subscription.recurring.payment.failed'
- contract_id (text)
- email (text)
- created_at (timestamp)
- UTM1..UTM5 (text)

ТАБЛИЦА materials (контент/курсы, ~159 записей):
- id, title, description, section_key, is_active, created_at, display_order

ТАБЛИЦА material_view_logs (просмотры контента):
- telegram_id, material_id, material_title, event_type, created_at, video_index, video_title, username

ТАБЛИЦА reviews, events, faq — вспомогательные.

Правила:
- Отвечай на русском языке
- Будь конкретным, давай точные цифры
- Валюта по умолчанию — рубли (₽)
- Для извлечения данных из JSONB в payments используй: payment_callback->>'sum', payment_callback->>'date' и т.д.
- При формировании Excel — делай понятные заголовки на русском

ВАЖНО — экономия токенов:
- Для аналитики используй агрегатные SQL-запросы (COUNT, SUM, AVG, GROUP BY) вместо выборки сырых строк
- run_sql_query возвращает максимум 50 строк — это для анализа. Для полных выгрузок используй generate_excel_report
- ВСЕГДА ставь LIMIT в запросах. Для анализа — LIMIT 20-30, не больше
- Если нужен Excel — вызывай generate_excel_report СРАЗУ, не запрашивай сначала все данные через run_sql_query
- Минимизируй количество tool вызовов — старайся уложиться в 1-3 запроса
- Для Excel-отчётов можно больше строк (до 10000)`;

const tools: Anthropic.Tool[] = [
  {
    name: 'run_sql_query',
    description: 'Выполнить SQL SELECT запрос к базе данных. Возвращает результат в виде JSON-массива. Только SELECT и WITH запросы разрешены.',
    input_schema: {
      type: 'object' as const,
      properties: {
        sql: {
          type: 'string',
          description: 'SQL SELECT запрос для выполнения'
        },
        description: {
          type: 'string',
          description: 'Краткое описание что делает этот запрос'
        }
      },
      required: ['sql']
    }
  },
  {
    name: 'generate_excel_report',
    description: 'Сгенерировать Excel-файл с отчётом. Выполняет SQL-запрос и форматирует результат в Excel для скачивания. Используй для создания отчётов по запросу пользователя.',
    input_schema: {
      type: 'object' as const,
      properties: {
        sql: {
          type: 'string',
          description: 'SQL SELECT запрос для данных отчёта'
        },
        filename: {
          type: 'string',
          description: 'Имя файла (без расширения .xlsx)'
        },
        sheet_name: {
          type: 'string',
          description: 'Название листа в Excel. По умолчанию "Отчёт"'
        },
        column_headers: {
          type: 'object' as const,
          description: 'Маппинг названий столбцов БД → человекочитаемые заголовки. Например: {"telegram_id": "ID пользователя", "all_payments": "Сумма платежей ₽"}',
          additionalProperties: { type: 'string' }
        }
      },
      required: ['sql', 'filename']
    }
  }
];

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  generatedFiles: Array<{ name: string; data: string }>
): Promise<string> {
  switch (name) {
    case 'run_sql_query': {
      const sql = input.sql as string;
      const { data, error } = await supabaseAdmin.rpc('execute_readonly_query', {
        query_text: sql
      });

      if (error) {
        return JSON.stringify({ error: error.message });
      }

      const rows = Array.isArray(data) ? data : [];
      const total = rows.length;

      // Limit rows to keep context small — Claude only needs a sample for analysis
      const MAX_ROWS = 50;
      const preview = rows.slice(0, MAX_ROWS);

      // Truncate long string values in each row to save tokens
      const cleanPreview = preview.map(row => {
        const clean: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(row as Record<string, unknown>)) {
          if (typeof val === 'string' && val.length > 200) {
            clean[key] = val.slice(0, 200) + '...';
          } else {
            clean[key] = val;
          }
        }
        return clean;
      });

      return JSON.stringify({
        rows: cleanPreview,
        total_rows: total,
        showing: Math.min(MAX_ROWS, total),
        ...(total > MAX_ROWS ? { note: `Показано ${MAX_ROWS} из ${total}. Для полных данных используй generate_excel_report.` } : {})
      });
    }

    case 'generate_excel_report': {
      const sql = input.sql as string;
      const filename = (input.filename as string) || 'report';
      const sheetName = (input.sheet_name as string) || 'Отчёт';
      const columnHeaders = (input.column_headers as Record<string, string>) || {};

      const { data, error } = await supabaseAdmin.rpc('execute_readonly_query', {
        query_text: sql
      });

      if (error) {
        return JSON.stringify({ error: 'Ошибка запроса: ' + error.message });
      }

      const rows = Array.isArray(data) ? data : [];
      if (rows.length === 0) {
        return JSON.stringify({ error: 'Запрос не вернул данных. Проверь условия.' });
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Isto4nik AI Assistant';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(sheetName);

      // Determine columns from first row
      const dbColumns = Object.keys(rows[0]);
      worksheet.columns = dbColumns.map(col => ({
        header: columnHeaders[col] || col,
        key: col,
        width: Math.max(
          (columnHeaders[col] || col).length + 4,
          15
        )
      }));

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 30;

      // Add data rows
      for (const row of rows) {
        const dataRow = worksheet.addRow(row);
        dataRow.alignment = { vertical: 'middle' };
      }

      // Auto-filter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: dbColumns.length }
      };

      // Alternate row colors
      for (let i = 2; i <= rows.length + 1; i++) {
        if (i % 2 === 0) {
          const row = worksheet.getRow(i);
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
      }

      // Borders for all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer as ArrayBuffer).toString('base64');

      generatedFiles.push({
        name: `${filename}.xlsx`,
        data: base64
      });

      return JSON.stringify({
        success: true,
        filename: `${filename}.xlsx`,
        rows_count: rows.length,
        columns: dbColumns.map(c => columnHeaders[c] || c)
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Build Anthropic message format from chat history (user text messages only)
    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })
    );

    // Compress old conversation: keep only last 6 messages in full,
    // summarize older ones to save tokens
    if (anthropicMessages.length > 6) {
      const oldMessages = anthropicMessages.slice(0, -6);
      const recentMessages = anthropicMessages.slice(-6);

      // Compress old messages into a single summary
      const summary = oldMessages
        .map(m => {
          const text = typeof m.content === 'string' ? m.content : '[данные]';
          const truncated = text.length > 150 ? text.slice(0, 150) + '...' : text;
          return `${m.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${truncated}`;
        })
        .join('\n');

      anthropicMessages.length = 0;
      anthropicMessages.push(
        { role: 'user', content: `[Краткая история предыдущего диалога:\n${summary}\n]\n\nПродолжаем разговор.` },
        { role: 'assistant', content: 'Понял, продолжаем. Я помню контекст нашего разговора.' },
        ...recentMessages
      );
    }

    const generatedFiles: Array<{ name: string; data: string }> = [];
    let iterations = 0;
    const MAX_ITERATIONS = 10;

    // Models to try in order: fast/cheap first, then fallback
    const MODELS = [
      'claude-haiku-4-5-20251001',
      'claude-sonnet-4-5-20241022',
    ];

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      // Try models in order until one works
      let response: Anthropic.Message | null = null;
      for (const model of MODELS) {
        try {
          response = await anthropic.messages.create({
            model,
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools,
            messages: anthropicMessages
          });
          break; // success — stop trying other models
        } catch (err) {
          const isOverloaded = err instanceof Anthropic.APIError && (err.status === 529 || err.status === 429);
          if (isOverloaded && model !== MODELS[MODELS.length - 1]) {
            console.log(`Model ${model} overloaded, trying next...`);
            continue; // try next model
          }
          throw err; // not recoverable or last model — rethrow
        }
      }

      if (!response) {
        throw new Error('All models failed');
      }

      // Check for tool use
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');

      if (toolUseBlocks.length === 0) {
        // Final text response
        const textBlocks = response.content.filter(b => b.type === 'text');
        const message = textBlocks
          .map(b => ('text' in b ? b.text : ''))
          .join('\n');

        return NextResponse.json({
          message,
          files: generatedFiles
        });
      }

      // Execute tools and continue loop
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      anthropicMessages.push({
        role: 'assistant',
        content: response.content as any
      });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        // Type narrowing - we know these are tool_use blocks
        const toolUse = block as { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> };
        try {
          const result = await executeTool(
            toolUse.name,
            toolUse.input,
            generatedFiles
          );
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: result
          });
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Error: ${err instanceof Error ? err.message : String(err)}`,
            is_error: true
          });
        }
      }

      anthropicMessages.push({
        role: 'user',
        content: toolResults
      });
    }

    return NextResponse.json({
      message: 'Превышен лимит итераций обработки. Попробуй переформулировать запрос.',
      files: generatedFiles
    });
  } catch (err) {
    console.error('AI Chat error:', err);

    // Human-readable error messages
    let userMessage = 'Произошла неизвестная ошибка. Попробуй ещё раз.';

    if (err instanceof Anthropic.APIError) {
      switch (err.status) {
        case 429:
          userMessage = 'Слишком много запросов. Подожди минуту и попробуй снова.';
          break;
        case 529:
          userMessage = 'Сервер AI временно перегружен. Подожди 30 секунд и попробуй снова.';
          break;
        case 401:
          userMessage = 'Ошибка авторизации API. Проверь ключ ANTHROPIC_API_KEY.';
          break;
        case 400:
          userMessage = 'Ошибка в запросе к AI. Попробуй переформулировать вопрос.';
          break;
        default:
          userMessage = `Ошибка API (${err.status}). Попробуй ещё раз через минуту.`;
      }
    } else if (err instanceof Error && err.message.includes('timeout')) {
      userMessage = 'Запрос занял слишком долго. Попробуй более простой вопрос.';
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
