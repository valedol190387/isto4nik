import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST /api/users/link-accounts
// Body: { linking_code: "uuid", max_id: 123456 }
// Привязывает max_id к пользователю по linking_code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { linking_code, max_id } = body;

    if (!linking_code || !max_id) {
      return NextResponse.json(
        { error: 'linking_code and max_id are required' },
        { status: 400 }
      );
    }

    // Находим пользователя по linking_code
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, telegram_id, max_id')
      .eq('linking_code', linking_code)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Invalid linking code' },
        { status: 404 }
      );
    }

    // Если max_id уже привязан к этому юзеру — просто возвращаем успех
    if (user.max_id === parseInt(max_id.toString())) {
      return NextResponse.json({
        success: true,
        message: 'Already linked',
        telegram_id: user.telegram_id,
      });
    }

    // Проверяем не привязан ли этот max_id к другому аккаунту
    const { data: existing } = await supabase
      .from('users')
      .select('id, telegram_id')
      .eq('max_id', parseInt(max_id.toString()))
      .single();

    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        { error: 'This Max account is already linked to another user' },
        { status: 409 }
      );
    }

    // Привязываем max_id
    const { error: updateError } = await supabase
      .from('users')
      .update({
        max_id: parseInt(max_id.toString()),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error linking accounts:', updateError);
      return NextResponse.json(
        { error: 'Failed to link accounts' },
        { status: 500 }
      );
    }

    console.log(`✅ Linked max_id=${max_id} to telegram_id=${user.telegram_id}`);

    return NextResponse.json({
      success: true,
      message: 'Accounts linked successfully',
      telegram_id: user.telegram_id,
    });
  } catch (error) {
    console.error('Error in link-accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
