import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const chatLink = process.env.CHATLINK || null;
    const channelLink = process.env.CHANNELLINK || null;
    
    return NextResponse.json({
      chatLink,
      channelLink
    });
  } catch (error) {
    console.error('Error loading environment links:', error);
    return NextResponse.json(
      { error: 'Failed to load links' },
      { status: 500 }
    );
  }
}
