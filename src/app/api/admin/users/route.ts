import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Параметры пагинации
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Параметры фильтрации
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';

    // Начинаем запрос
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Поиск по имени, username или telegram_id
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // Если это число, ищем по telegram_id, иначе по имени и username
      if (/^\d+$/.test(searchTerm)) {
        query = query.eq('telegram_id', parseInt(searchTerm));
      } else {
        query = query.or(`name.ilike.%${searchTerm}%,tg_username.ilike.%${searchTerm}%`);
      }
    }

    // Фильтр по статусу
    if (status && status !== 'all') {
      if (status === 'active_users') {
        query = query.or('status.eq.Активна,status.eq.Активный,status.eq.active');
      } else if (status === 'inactive_users') {
        query = query.not('status', 'in', '(Активна,Активный,active)');
      } else {
        query = query.eq('status', status);
      }
    }

    // Фильтр по дате создания
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59');
    }

    // Фильтры по UTM
    const utm1 = searchParams.get('utm_1') || '';
    const utm2 = searchParams.get('utm_2') || '';
    const utm3 = searchParams.get('utm_3') || '';
    const utm4 = searchParams.get('utm_4') || '';
    const utm5 = searchParams.get('utm_5') || '';
    const paymentFilter = searchParams.get('payment_filter') || '';

    if (utm1) {
      query = query.eq('utm_1', utm1);
    }
    if (utm2) {
      query = query.eq('utm_2', utm2);
    }
    if (utm3) {
      query = query.eq('utm_3', utm3);
    }
    if (utm4) {
      query = query.eq('utm_4', utm4);
    }
    if (utm5) {
      query = query.eq('utm_5', utm5);
    }

    // Сортировка
    query = query.order('created_at', { ascending: false });

    // Пагинация
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Получаем платежи для пользователей
    const { data: payments } = await supabase
      .from('payments')
      .select('telegram_id, payment_callback');

    // Группируем платежи по telegram_id
    const paymentsByUser: Record<string, number> = {};
    (payments || []).forEach((payment: any) => {
      const amount = payment.payment_callback?.Amount || payment.payment_callback?.PaymentAmount;
      const telegramId = payment.telegram_id;
      if (telegramId && amount) {
        paymentsByUser[telegramId] = (paymentsByUser[telegramId] || 0) + parseFloat(amount);
      }
    });

    // Добавляем сумму платежей к каждому пользователю
    let usersWithPayments = (users || []).map(user => ({
      ...user,
      total_payments: paymentsByUser[user.telegram_id.toString()] || 0
    }));

    // Фильтр по платежам (применяем после получения данных о платежах)
    if (paymentFilter === 'paying') {
      usersWithPayments = usersWithPayments.filter(user => user.total_payments > 0);
    } else if (paymentFilter === 'non_paying') {
      usersWithPayments = usersWithPayments.filter(user => user.total_payments === 0);
    }

    return NextResponse.json({
      success: true,
      data: usersWithPayments,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error in /api/admin/users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 