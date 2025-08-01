import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';

    // Базовые метрики пользователей
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 }
      );
    }

    // Фильтрация по датам если указаны
    let filteredUsers: User[] = allUsers || [];
    if (dateFrom) {
      filteredUsers = filteredUsers.filter((user: User) => 
        new Date(user.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredUsers = filteredUsers.filter((user: User) => 
        new Date(user.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }

    // Базовые метрики
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter((user: User) => 
      user.status === 'Активна' || user.status === 'Активный' || user.status === 'active'
    ).length;

    // Новые пользователи за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = filteredUsers.filter((user: User) => 
      new Date(user.created_at) >= thirtyDaysAgo
    ).length;

    // Платежные метрики
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    // Группируем платежи по telegram_id (все платежи с суммой)
    const paymentsByUser: Record<string, number> = {};
    (payments || []).forEach((payment: any) => {
      let amount = 0;
      let status = null;
      const telegramId = payment.telegram_id;
      
      if (payment.payment_callback) {
        // Если payment_callback - это строка, парсим её
        if (typeof payment.payment_callback === 'string') {
          try {
            // Сначала парсим внешний JSON (если есть)
            let parsed = JSON.parse(payment.payment_callback);
            // Если внутри ещё одна JSON строка, парсим её тоже
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
            amount = parseFloat(parsed.Amount || parsed.PaymentAmount || 0);
            status = parsed.Status;
          } catch (e) {
            console.error('Error parsing payment_callback:', e);
          }
        } else {
          // Если это уже объект
          amount = parseFloat(payment.payment_callback.Amount || payment.payment_callback.PaymentAmount || 0);
          status = payment.payment_callback.Status;
        }
      }
      
      // Учитываем все платежи с положительной суммой
      // Исключаем только явно неуспешные статусы
      if (telegramId && amount > 0 && status !== 'Failed' && status !== 'Cancelled') {
        paymentsByUser[telegramId] = (paymentsByUser[telegramId] || 0) + amount;
      }
    });

    const totalRevenue = Object.values(paymentsByUser).reduce((sum: number, amount: number) => sum + amount, 0);

    const payingUsers = filteredUsers.filter((user: User) => {
      const userPayments = paymentsByUser[user.telegram_id.toString()] || 0;
      return userPayments > 0;
    }).length;
    const averagePayment = payingUsers > 0 ? totalRevenue / payingUsers : 0;
    const conversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0;

    // Топ пользователей по платежам
    const topPayingUsers = filteredUsers
      .filter((user: User) => {
        const userPayments = paymentsByUser[user.telegram_id.toString()] || 0;
        return userPayments > 0;
      })
      .sort((a: User, b: User) => {
        const aPayments = paymentsByUser[a.telegram_id.toString()] || 0;
        const bPayments = paymentsByUser[b.telegram_id.toString()] || 0;
        return bPayments - aPayments;
      })
      .slice(0, 10)
      .map((user: User) => {
        const totalPayments = paymentsByUser[user.telegram_id.toString()] || 0;
        return {
          telegram_id: user.telegram_id.toString(),
          name: user.name || user.tg_username || 'Без имени',
          total_payments: totalPayments,
          last_payment: totalPayments // В данной структуре нет отдельного поля для последнего платежа
        };
      });

    // Статистика по статусам
    const statusStats: Record<string, number> = {};
    filteredUsers.forEach((user: User) => {
      const status = user.status || 'Неизвестно';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    // UTM аналитика
    const utm1Stats: Record<string, number> = {};
    const utm2Stats: Record<string, number> = {};
    const utm3Stats: Record<string, number> = {};
    const utm4Stats: Record<string, number> = {};
    const utm5Stats: Record<string, number> = {};
    const utmSourcesWithPayments: Record<string, { count: number, totalRevenue: number, avgPayment: number }> = {};
    
    let totalUsersWithUtm = 0;

    filteredUsers.forEach((user: User) => {
      // UTM статистика для всех меток
      if (user.utm_1) {
        utm1Stats[user.utm_1] = (utm1Stats[user.utm_1] || 0) + 1;
        totalUsersWithUtm++;

        // UTM источники с платежами
        const userPayments = paymentsByUser[user.telegram_id.toString()] || 0;
        if (userPayments > 0) {
          if (!utmSourcesWithPayments[user.utm_1]) {
            utmSourcesWithPayments[user.utm_1] = { count: 0, totalRevenue: 0, avgPayment: 0 };
          }
          utmSourcesWithPayments[user.utm_1].count += 1;
          utmSourcesWithPayments[user.utm_1].totalRevenue += userPayments;
        }
      }
      
      if (user.utm_2) {
        utm2Stats[user.utm_2] = (utm2Stats[user.utm_2] || 0) + 1;
      }
      if (user.utm_3) {
        utm3Stats[user.utm_3] = (utm3Stats[user.utm_3] || 0) + 1;
      }
      if (user.utm_4) {
        utm4Stats[user.utm_4] = (utm4Stats[user.utm_4] || 0) + 1;
      }
      if (user.utm_5) {
        utm5Stats[user.utm_5] = (utm5Stats[user.utm_5] || 0) + 1;
      }
    });

    // Рассчитываем средний платеж для каждого UTM источника
    Object.keys(utmSourcesWithPayments).forEach(source => {
      const data = utmSourcesWithPayments[source];
      data.avgPayment = data.count > 0 ? data.totalRevenue / data.count : 0;
    });

    // Регистрации по дням (последние 30 дней)
    const registrationsByDay = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = filteredUsers.filter((user: User) => {
        const userDate = new Date(user.created_at).toISOString().split('T')[0];
        return userDate === dateStr;
      }).length;

      registrationsByDay.push({
        date: dateStr,
        count
      });
    }

    const analytics = {
      overview: {
        totalUsers,
        activeUsers,
        newUsersLast30Days,
        registrationChangePercent: 0, // Можно добавить расчет изменения
        totalRevenue,
        payingUsers,
        averagePayment,
        conversionRate
      },
      registrationsByDay,
      topPayingUsers,
      statusStats,
      utmStats: {
        utm_1_stats: utm1Stats,
        utm_2_stats: utm2Stats,
        utm_3_stats: utm3Stats,
        utm_4_stats: utm4Stats,
        utm_5_stats: utm5Stats,
        utm_sources_with_payments: utmSourcesWithPayments,
        total_users_with_utm: totalUsersWithUtm
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error in /api/admin/analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 