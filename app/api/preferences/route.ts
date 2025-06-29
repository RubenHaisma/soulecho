import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ preferences: user.preferences });
  } catch (error) {
    console.error('Preferences GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/preferences - Create or update user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { birthday, timezone, notificationEmail, notificationPreferences } = await request.json();

    // Check if preferences already exist
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id }
    });

    let preferences;
    if (existingPreferences) {
      // Update existing preferences
      preferences = await prisma.userPreferences.update({
        where: { userId: user.id },
        data: {
          birthday: birthday ? new Date(birthday) : undefined,
          timezone: timezone || 'UTC',
          notificationEmail,
          notificationPreferences,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new preferences
      preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          birthday: birthday ? new Date(birthday) : undefined,
          timezone: timezone || 'UTC',
          notificationEmail,
          notificationPreferences
        }
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Preferences POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 