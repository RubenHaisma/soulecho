import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, personName, selectedPerson, messageCount, collectionName, embeddingCount, processingTime } = await request.json();
    
    if (!sessionId || !personName || !selectedPerson) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create chat session in database
    const chatSession = await prisma.chatSession.create({
      data: {
        id: sessionId,
        userId: userId,
        personName,
        selectedPerson,
        messageCount,
        collectionName,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      },
    });

    console.log(`💾 Created chat session: ${chatSession.id} for ${personName}`);

    return NextResponse.json({ 
      success: true, 
      sessionId: chatSession.id,
      message: `Successfully created chat session for ${personName}`
    });

  } catch (error) {
    console.error('Sessions API error:', error);
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
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }
    // Find the session and ensure it belongs to the user
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });
    if (!chatSession || chatSession.userId !== userId) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    await prisma.chatSession.delete({ where: { id: sessionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 