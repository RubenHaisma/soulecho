import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and their progress
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chatSessions: {
          include: {
            conversations: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate progress based on user actions
    const progress = {
      hasUploadedFile: user.chatSessions.length > 0,
      hasCreatedSession: user.chatSessions.length > 0,
      hasStartedChat: user.chatSessions.some(session => session.conversations.length > 0),
      hasExploredFeatures: false // This could be tracked separately
    };

    return NextResponse.json({ progress });

  } catch (error) {
    console.error('Onboarding progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}