import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const eventData = await request.json();

  try {
    // Add updated_at timestamp
    eventData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, event: data[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const eventData = await request.json();
  const { id } = eventData;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Event ID is required' },
      { status: 400 }
    );
  }

  try {
    // Add updated_at timestamp
    eventData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, event: data[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Event ID is required' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 