import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Получаем общее количество пользователей
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Получаем количество активных подписок
    const { count: activeSubscriptions } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Активна');

    // Получаем общее количество материалов
    const { count: totalMaterials } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Получаем общее количество платежей
    const { count: totalPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    // Получаем количество отзывов
    const { count: totalReviews } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    // Получаем количество событий
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Получаем последние 5 пользователей
    const { data: recentUsers } = await supabase
      .from('users')
      .select('telegram_id, name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Получаем последние 5 платежей
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('telegram_id, payment_callback, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Считаем процент активных подписок
    const activePercentage = totalUsers ? Math.round((activeSubscriptions || 0) / totalUsers * 100) : 0;

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalMaterials: totalMaterials || 0,
        totalPayments: totalPayments || 0,
        totalReviews: totalReviews || 0,
        totalEvents: totalEvents || 0,
        activePercentage
      },
      recentActivity: {
        users: recentUsers || [],
        payments: recentPayments || []
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
} 