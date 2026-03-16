const MAX_BOT_API_BASE = 'https://platform-api.max.ru';

function getToken(): string {
  const token = process.env.MAX_BOT_TOKEN;
  if (!token) {
    throw new Error('MAX_BOT_TOKEN environment variable is not set');
  }
  return token;
}

async function maxBotFetch<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${MAX_BOT_API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: getToken(),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Max Bot API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// Типы

interface MaxUser {
  user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  is_bot: boolean;
}

interface MaxChatMember extends MaxUser {
  is_admin: boolean;
  is_owner: boolean;
  join_time: number;
  permissions?: string[];
}

interface GetMembersResponse {
  members: MaxChatMember[];
  marker?: number;
}

// API методы

/**
 * Получить участников чата (с пагинацией)
 */
export async function getChatMembers(
  chatId: number,
  userIds?: number[]
): Promise<MaxChatMember[]> {
  const allMembers: MaxChatMember[] = [];
  let marker: number | undefined;

  do {
    const params = new URLSearchParams({ count: '100' });
    if (marker) params.set('marker', marker.toString());
    if (userIds) {
      userIds.forEach((id) => params.append('user_ids[]', id.toString()));
    }

    const data = await maxBotFetch<GetMembersResponse>(
      'GET',
      `/chats/${chatId}/members?${params.toString()}`
    );

    allMembers.push(...data.members);
    marker = data.marker;
  } while (marker);

  return allMembers;
}

/**
 * Удалить участника из чата
 */
export async function removeChatMember(
  chatId: number,
  userId: number,
  block = false
): Promise<{ success: boolean; message?: string }> {
  const params = new URLSearchParams({
    user_id: userId.toString(),
  });
  if (block) params.set('block', 'true');

  return maxBotFetch('DELETE', `/chats/${chatId}/members?${params.toString()}`);
}

/**
 * Отправить сообщение пользователю или в чат
 */
export async function sendMessage(params: {
  userId?: number;
  chatId?: number;
  text: string;
  format?: 'markdown' | 'html';
}): Promise<unknown> {
  const query = new URLSearchParams();
  if (params.userId) query.set('user_id', params.userId.toString());
  if (params.chatId) query.set('chat_id', params.chatId.toString());

  return maxBotFetch('POST', `/messages?${query.toString()}`, {
    text: params.text,
    format: params.format,
  });
}

/**
 * Зарегистрировать вебхук
 */
export async function setupWebhook(
  url: string,
  updateTypes?: string[]
): Promise<unknown> {
  return maxBotFetch('POST', '/subscriptions', {
    url,
    update_types: updateTypes,
  });
}

/**
 * Получить информацию о боте
 */
export async function getBotInfo(): Promise<MaxUser> {
  return maxBotFetch<MaxUser>('GET', '/me');
}

export type { MaxUser, MaxChatMember, GetMembersResponse };
