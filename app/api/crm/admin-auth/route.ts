import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json();

    // Check if admin key matches the environment variable
    if (!process.env.ADMIN_EMAIL_KEY) {
      return NextResponse.json(
        { error: 'Admin key not configured' },
        { status: 500 }
      );
    }

    if (adminKey !== process.env.ADMIN_EMAIL_KEY) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 401 }
      );
    }

    // Admin authenticated successfully
    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully'
    });

  } catch (error) {
    console.error('Error in admin authentication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 