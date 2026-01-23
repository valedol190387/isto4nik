import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface TrafficRow {
  utm_1: string | null;
  utm_2: string | null;
  utm_3: string | null;
  utm_4: string | null;
  utm_5: string | null;
  total_users: number;
  registered_count: number;
  paying_users: number;
  total_revenue: number;
  prodamus_users: number;
  prodamus_revenue: number;
  lava_users: number;
  lava_revenue: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';

    // Get all users with filters
    let usersQuery = supabase
      .from('users')
      .select('telegram_id, utm_1, utm_2, utm_3, utm_4, utm_5, registered, all_payments, created_at');

    if (dateFrom) {
      usersQuery = usersQuery.gte('created_at', dateFrom);
    }
    if (dateTo) {
      usersQuery = usersQuery.lte('created_at', dateTo + 'T23:59:59');
    }

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 }
      );
    }

    // Get Prodamus payments
    const { data: prodamusPayments, error: prodamusError } = await supabase
      .from('payments')
      .select('telegram_id, payment_callback');

    if (prodamusError) {
      console.error('Error fetching Prodamus payments:', prodamusError);
    }

    // Get Lava payments
    const { data: lavaPayments, error: lavaError } = await supabase
      .from('payments_lavatop')
      .select('telegram_id, summa, status');

    if (lavaError) {
      console.error('Error fetching Lava payments:', lavaError);
    }

    // Process Prodamus payments - group by telegram_id
    const prodamusByUser: Record<string, number> = {};
    (prodamusPayments || []).forEach((payment: any) => {
      if (!payment.telegram_id || !payment.payment_callback) return;

      const callback = payment.payment_callback;
      const status = callback.payment_status;
      const sum = parseFloat(callback.sum || '0');

      // Only count successful payments
      if (sum > 0 && status === 'success') {
        const tgId = payment.telegram_id.toString();
        prodamusByUser[tgId] = (prodamusByUser[tgId] || 0) + sum;
      }
    });

    // Process Lava payments - group by telegram_id
    const lavaByUser: Record<string, number> = {};
    (lavaPayments || []).forEach((payment: any) => {
      if (!payment.telegram_id) return;

      const status = payment.status || '';
      const sum = parseFloat(payment.summa || '0');

      // Only count successful payments
      if (sum > 0 && status.includes('success')) {
        const tgId = payment.telegram_id.toString();
        lavaByUser[tgId] = (lavaByUser[tgId] || 0) + sum;
      }
    });

    // Aggregate data by UTM combinations
    const aggregatedMap = new Map<string, TrafficRow>();

    (users || []).forEach((user: any) => {
      const key = `${user.utm_1 || ''}|${user.utm_2 || ''}|${user.utm_3 || ''}|${user.utm_4 || ''}|${user.utm_5 || ''}`;
      const tgId = user.telegram_id?.toString() || '';

      if (!aggregatedMap.has(key)) {
        aggregatedMap.set(key, {
          utm_1: user.utm_1 || '',
          utm_2: user.utm_2 || '',
          utm_3: user.utm_3 || '',
          utm_4: user.utm_4 || '',
          utm_5: user.utm_5 || '',
          total_users: 0,
          registered_count: 0,
          paying_users: 0,
          total_revenue: 0,
          prodamus_users: 0,
          prodamus_revenue: 0,
          lava_users: 0,
          lava_revenue: 0
        });
      }

      const row = aggregatedMap.get(key)!;
      row.total_users++;

      if (user.registered === true) {
        row.registered_count++;
      }

      // all_payments from users table
      const allPayments = parseFloat(user.all_payments) || 0;
      if (allPayments > 0) {
        row.paying_users++;
        row.total_revenue += allPayments;
      }

      // Prodamus payments
      const prodamusAmount = prodamusByUser[tgId] || 0;
      if (prodamusAmount > 0) {
        row.prodamus_users++;
        row.prodamus_revenue += prodamusAmount;
      }

      // Lava payments
      const lavaAmount = lavaByUser[tgId] || 0;
      if (lavaAmount > 0) {
        row.lava_users++;
        row.lava_revenue += lavaAmount;
      }
    });

    const aggregatedRows = Array.from(aggregatedMap.values()).sort((a, b) => {
      if ((a.utm_1 || '') !== (b.utm_1 || '')) return (a.utm_1 || '').localeCompare(b.utm_1 || '');
      if ((a.utm_2 || '') !== (b.utm_2 || '')) return (a.utm_2 || '').localeCompare(b.utm_2 || '');
      if ((a.utm_3 || '') !== (b.utm_3 || '')) return (a.utm_3 || '').localeCompare(b.utm_3 || '');
      if ((a.utm_4 || '') !== (b.utm_4 || '')) return (a.utm_4 || '').localeCompare(b.utm_4 || '');
      return (a.utm_5 || '').localeCompare(b.utm_5 || '');
    });

    // Calculate totals
    const totals = {
      total_users: 0,
      registered_count: 0,
      paying_users: 0,
      total_revenue: 0,
      prodamus_users: 0,
      prodamus_revenue: 0,
      lava_users: 0,
      lava_revenue: 0
    };

    aggregatedRows.forEach(row => {
      totals.total_users += row.total_users;
      totals.registered_count += row.registered_count;
      totals.paying_users += row.paying_users;
      totals.total_revenue += row.total_revenue;
      totals.prodamus_users += row.prodamus_users;
      totals.prodamus_revenue += row.prodamus_revenue;
      totals.lava_users += row.lava_users;
      totals.lava_revenue += row.lava_revenue;
    });

    // Get unique sources for filter dropdown
    const { data: sourcesData } = await supabase
      .from('users')
      .select('utm_1')
      .not('utm_1', 'is', null)
      .not('utm_1', 'eq', '');

    const sources = [...new Set((sourcesData || []).map((s: any) => s.utm_1).filter(Boolean))].sort();

    return NextResponse.json({
      success: true,
      data: {
        rows: aggregatedRows,
        totals,
        sources
      }
    });

  } catch (error) {
    console.error('Error in /api/admin/traffic-report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
