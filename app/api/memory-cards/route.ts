import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/memory-cards - Get all memory cards for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        memoryCards: { 
          orderBy: { createdAt: 'desc' },
          include: { milestone: true }
        } 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ memoryCards: user.memoryCards });
  } catch (error) {
    console.error('Memory cards GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/memory-cards - Create a new memory card
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

    const { title, content, imageUrl, cardType, milestoneId, expiresAt } = await request.json();

    if (!title || !content || !cardType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const memoryCard = await prisma.memoryCard.create({
      data: {
        userId: user.id,
        title,
        content,
        imageUrl,
        cardType,
        milestoneId,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: { milestone: true }
    });

    return NextResponse.json({ memoryCard });
  } catch (error) {
    console.error('Memory cards POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/memory-cards - Delete a memory card
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory card ID required' }, { status: 400 });
    }

    // Verify the memory card belongs to the user
    const existingCard = await prisma.memoryCard.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Memory card not found' }, { status: 404 });
    }

    await prisma.memoryCard.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Memory cards DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 