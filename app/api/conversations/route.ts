import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Type assertion for session user with id
type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const user = session?.user as SessionUser;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (sessionId) {
      // Get conversations for a specific session
      const conversations = await prisma.conversation.findMany({
        where: {
          chatSessionId: sessionId,
          chatSession: {
            userId: user.id
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return NextResponse.json({ conversations });
    } else {
      // Get all conversations for the user
      const conversations = await prisma.conversation.findMany({
        where: {
          chatSession: {
            userId: user.id
          }
        },
        include: {
          chatSession: {
            select: {
              personName: true,
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return NextResponse.json({ conversations });
    }

  } catch (error) {
    console.error('Conversations GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chatSessionId, userMessage, aiResponse, contextUsed, relevantMessages, processingTime } = await request.json();
    
    if (!chatSessionId || !userMessage || !aiResponse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if chat session exists, if not, try to create it
    let chatSession = await prisma.chatSession.findUnique({
      where: { id: chatSessionId }
    });

    if (!chatSession) {
      console.warn(`Chat session ${chatSessionId} not found`);
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // Save conversation to database
    const conversation = await prisma.conversation.create({
      data: {
        chatSessionId,
        userMessage,
        aiResponse,
        contextUsed: contextUsed || false,
        relevantMessages: relevantMessages || 0,
        processingTime: processingTime || null,
      },
    });

    // Update chat session last activity
    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { 
        lastActivity: new Date(),
        messageCount: {
          increment: 1
        }
      },
    });

    return NextResponse.json({ success: true, conversationId: conversation.id });

  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { conversationId } = await request.json();
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    // Find the conversation and ensure it belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { chatSession: true }
    });
    if (!conversation || conversation.chatSession.userId !== userId) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    await prisma.conversation.delete({ where: { id: conversationId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversation DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 