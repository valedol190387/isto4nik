import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Получить пользователя по telegram_id или max_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const maxId = searchParams.get('maxId');

    if (!telegramId && !maxId) {
      return NextResponse.json({ error: 'Telegram ID or Max ID is required' }, { status: 400 });
    }

    let query = supabase.from('users').select('*');

    if (maxId) {
      query = query.eq('max_id', parseInt(maxId));
    } else {
      query = query.eq('telegram_id', parseInt(telegramId!));
    }

    const { data: user, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Создать или обновить пользователя
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telegram_id, ...userData } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Пытаемся обновить существующего пользователя
    const { data, error } = await supabase
      .from('users')
      .upsert([{
        telegram_id: parseInt(telegram_id),
        ...userData,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'telegram_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating user:', error);
      return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Обновить пользователя
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { telegram_id, ...updateData } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', parseInt(telegram_id))
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 