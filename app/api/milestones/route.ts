import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/milestones - Get all milestones for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { milestones: { orderBy: { date: 'desc' } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ milestones: user.milestones });
  } catch (error) {
    console.error('Milestones GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/milestones - Create a new milestone
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

    const { title, description, date, type, isRecurring, recurrencePattern, imageUrl, tags, chatSessionId } = await request.json();

    if (!title || !date || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const milestone = await prisma.memoryMilestone.create({
      data: {
        userId: user.id,
        title,
        description,
        date: new Date(date),
        type,
        isRecurring: isRecurring || false,
        recurrencePattern,
        imageUrl,
        tags: tags || [],
        chatSessionId
      }
    });

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('Milestones POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/milestones - Update a milestone
export async function PUT(request: NextRequest) {
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

    const { id, title, description, date, type, isRecurring, recurrencePattern, imageUrl, tags } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Milestone ID required' }, { status: 400 });
    }

    // Verify the milestone belongs to the user
    const existingMilestone = await prisma.memoryMilestone.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestone = await prisma.memoryMilestone.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        type,
        isRecurring,
        recurrencePattern,
        imageUrl,
        tags,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('Milestones PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/milestones - Delete a milestone
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
      return NextResponse.json({ error: 'Milestone ID required' }, { status: 400 });
    }

    // Verify the milestone belongs to the user
    const existingMilestone = await prisma.memoryMilestone.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    await prisma.memoryMilestone.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Milestones DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 