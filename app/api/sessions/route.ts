import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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
        userId: session.user.id,
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