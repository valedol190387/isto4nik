import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    const chatLink = platform === 'max'
      ? (process.env.MAX_CHATLINK || null)
      : (process.env.CHATLINK || null);
    const channelLink = platform === 'max'
      ? (process.env.MAX_CHANNELLINK || null)
      : (process.env.CHANNELLINK || null);

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
