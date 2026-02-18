'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Trash2, Download, Bot, User, Loader2, Sparkles } from 'lucide-react';
import styles from './page.module.css';

interface GeneratedFile {
  name: string;
  data: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: GeneratedFile[];
  timestamp: Date;
}

function parseMarkdownTable(tableLines: string[]): string {
  const rows = tableLines
    .filter(line => !line.match(/^\|[\s\-:|]+\|$/)) // skip separator row
    .map(line =>
      line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim())
    );

  if (rows.length === 0) return '';

  const headerCells = rows[0].map(c => `<th>${applyInlineFormatting(c)}</th>`).join('');
  const bodyRows = rows.slice(1).map(row => {
    const cells = row.map(c => `<td>${applyInlineFormatting(c)}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<div class="${styles.tableWrap}"><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
}

function applyInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function formatMessageContent(text: string): string {
  // First, extract and convert markdown tables
  const lines = text.split('\n');
  const result: string[] = [];
  let tableBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableLine = line.trimStart().startsWith('|') && line.trimEnd().endsWith('|');

    if (isTableLine) {
      tableBuffer.push(line);
    } else {
      if (tableBuffer.length >= 2) {
        result.push(parseMarkdownTable(tableBuffer));
        tableBuffer = [];
      } else if (tableBuffer.length > 0) {
        result.push(...tableBuffer);
        tableBuffer = [];
      }
      result.push(line);
    }
  }
  // flush remaining table
  if (tableBuffer.length >= 2) {
    result.push(parseMarkdownTable(tableBuffer));
  } else {
    result.push(...tableBuffer);
  }

  return result.join('\n')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Horizontal rule (only plain ---, not inside tables)
    .replace(/^---$/gm, '<hr/>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Line breaks (but not after block elements or inside tables)
    .replace(/\n(?!<[hul\/td])/g, '<br/>');
}

function downloadFile(file: GeneratedFile) {
  const byteCharacters = atob(file.data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SecretApiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
    }
  }, [router]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Resize textarea back
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // Build messages for API (only role + content)
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch('/api/admin/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        files: data.files?.length > 0 ? data.files : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorText = err instanceof Error
        ? err.name === 'AbortError'
          ? 'Запрос превысил время ожидания (2 минуты). Попробуй более конкретный вопрос.'
          : err.message
        : 'Неизвестная ошибка';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Ошибка: ${errorText}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className={styles.title}>AI Ассистент</h1>
            <p className={styles.subtitle}>Аналитика и отчёты по базе данных</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className={styles.clearBtn} title="Очистить чат">
            <Trash2 size={18} />
            Очистить
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        /* Empty state — input centered */
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Bot size={40} />
          </div>
          <h2 className={styles.emptyTitle}>AI Аналитика</h2>
          <p className={styles.emptySubtitle}>
            Спроси о пользователях, платежах, подписках или попроси Excel-отчёт
          </p>
          <div className={styles.centerInputWrapper}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Напиши запрос..."
              className={styles.centerInput}
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              className={styles.centerSendBtn}
              disabled={!input.trim() || isLoading}
            >
              <Send size={18} />
              <span>Отправить</span>
            </button>
          </div>
          <div className={styles.inputHint}>
            Enter — отправить, Shift+Enter — новая строка
          </div>
        </div>
      ) : (
        /* Chat mode — messages + bottom input */
        <>
          <div className={styles.messagesArea}>
            <div className={styles.messagesList}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                >
                  <div className={styles.messageAvatar}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={styles.messageContent}>
                    <div
                      className={styles.messageText}
                      dangerouslySetInnerHTML={{
                        __html: formatMessageContent(msg.content)
                      }}
                    />
                    {msg.files && msg.files.length > 0 && (
                      <div className={styles.filesArea}>
                        {msg.files.map((file, fi) => (
                          <button
                            key={fi}
                            className={styles.fileBtn}
                            onClick={() => downloadFile(file)}
                          >
                            <Download size={16} />
                            <span>{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className={styles.messageTime}>
                      {msg.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.messageAvatar}>
                    <Bot size={18} />
                  </div>
                  <div className={styles.messageContent}>
                    <div className={styles.loadingIndicator}>
                      <Loader2 size={18} className={styles.spinner} />
                      <span>Анализирую данные...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Следующий вопрос..."
                className={styles.input}
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                className={styles.sendBtn}
                disabled={!input.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
