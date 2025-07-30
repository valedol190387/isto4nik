import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { deleteAvatar, isValidAvatarUrl } from '@/lib/s3';

// GET - получить все отзывы для админки
export async function GET() {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - создать новый отзыв
export async function POST(request: Request) {
  try {
    const reviewData = await request.json();
    
    // Добавляем временные метки
    reviewData.created_at = new Date().toISOString();
    reviewData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, review: data[0] });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT - обновить отзыв
export async function PUT(request: Request) {
  try {
    const reviewData = await request.json();
    const { id, oldAvatar } = reviewData;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Если аватар изменился, удаляем старый
    if (oldAvatar && oldAvatar !== reviewData.avatar && isValidAvatarUrl(oldAvatar)) {
      await deleteAvatar(oldAvatar);
    }

    // Удаляем oldAvatar из данных для обновления
    delete reviewData.oldAvatar;

    // Добавляем временную метку обновления
    reviewData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, review: data[0] });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - удалить отзыв
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Сначала получаем данные отзыва для удаления аватара
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('avatar')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Удаляем отзыв из БД
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Удаляем аватар из S3, если он есть
    if (review?.avatar && isValidAvatarUrl(review.avatar)) {
      await deleteAvatar(review.avatar);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete review' },
      { status: 500 }
    );
  }
} 