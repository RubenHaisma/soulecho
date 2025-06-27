import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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
            userId: session.user.id
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
            userId: session.user.id
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
      console.warn(`Chat session ${chatSessionId} not found, attempting to create from backend data`);
      // Try to get session data from backend
      try {
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/session/${chatSessionId}`);
        if (backendResponse.ok) {
          const sessionData = await backendResponse.json();
          // Create the chat session with minimal data
          chatSession = await prisma.chatSession.create({
            data: {
              id: chatSessionId,
              userId: 'temp-user-id', // Will need to be updated
              personName: sessionData.personName || 'Unknown',
              selectedPerson: sessionData.personName || 'Unknown',
              messageCount: sessionData.messageCount || 0,
              collectionName: `session_${chatSessionId}`,
              createdAt: new Date(),
              lastActivity: new Date(),
              isActive: true
            },
          });
          console.log(`Created missing chat session: ${chatSessionId}`);
        }
      } catch (error) {
        console.error('Failed to create missing chat session:', error);
        return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
      }
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
    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;
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