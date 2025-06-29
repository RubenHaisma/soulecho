import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/notifications/birthday - Trigger birthday notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        preferences: true,
        chatSessions: { where: { isActive: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.preferences?.birthday) {
      return NextResponse.json({ error: 'Birthday not set in preferences' }, { status: 400 });
    }

    // Check if user has disabled birthday notifications
    const notificationPrefs = user.preferences.notificationPreferences as { birthday?: boolean } | null;
    if (notificationPrefs && notificationPrefs.birthday === false) {
      return NextResponse.json({ message: 'Birthday notifications disabled by user' });
    }

    const today = new Date();
    const birthday = new Date(user.preferences.birthday);
    
    // Check if today is the user's birthday
    const isBirthday = today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate();
    
    if (!isBirthday) {
      return NextResponse.json({ message: 'Not birthday today' });
    }

    // Generate birthday memory cards for each active chat session
    const birthdayCards = [];
    
    for (const chatSession of user.chatSessions) {
      try {
        // Create a birthday milestone if it doesn't exist
        const existingMilestone = await prisma.memoryMilestone.findFirst({
          where: {
            userId: user.id,
            type: 'BIRTHDAY',
            title: `Birthday ${today.getFullYear()} - ${chatSession.personName}`
          }
        });

        let milestone;
        if (!existingMilestone) {
          milestone = await prisma.memoryMilestone.create({
            data: {
              userId: user.id,
              chatSessionId: chatSession.id,
              title: `Birthday ${today.getFullYear()} - ${chatSession.personName}`,
              description: `Special birthday message from ${chatSession.personName}`,
              date: today,
              type: 'BIRTHDAY',
              isRecurring: true,
              recurrencePattern: 'yearly',
              tags: ['birthday', 'celebration', chatSession.personName.toLowerCase()]
            }
          });
        } else {
          milestone = existingMilestone;
        }

        // Generate birthday memory card
        const birthdayCard = await prisma.memoryCard.create({
          data: {
            userId: user.id,
            milestoneId: milestone.id,
            title: `Happy Birthday from ${chatSession.personName}! 🎂`,
            content: `Today is your special day! ${chatSession.personName} would want you to know how much you mean to them. Take a moment to celebrate yourself and remember all the beautiful memories you've shared together.`,
            cardType: 'BIRTHDAY',
            isGenerated: true,
            expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
          }
        });

        birthdayCards.push(birthdayCard);

        // Create notification log
        await prisma.notificationLog.create({
          data: {
            userId: user.id,
            type: 'BIRTHDAY_REMINDER',
            title: `Birthday Message from ${chatSession.personName}`,
            message: `A special birthday memory card has been created for you from ${chatSession.personName}.`,
            metadata: {
              chatSessionId: chatSession.id,
              personName: chatSession.personName,
              milestoneId: milestone.id,
              cardId: birthdayCard.id
            }
          }
        });

      } catch (error) {
        console.error(`Error creating birthday card for ${chatSession.personName}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      birthdayCards,
      message: `Created ${birthdayCards.length} birthday memory cards`
    });

  } catch (error) {
    console.error('Birthday notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/notifications/birthday - Check if birthday notifications are due
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

    if (!user.preferences?.birthday) {
      return NextResponse.json({ hasBirthday: false });
    }

    const today = new Date();
    const birthday = new Date(user.preferences.birthday);
    const isBirthday = today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate();

    return NextResponse.json({ 
      hasBirthday: true,
      isBirthdayToday: isBirthday,
      birthday: user.preferences.birthday
    });

  } catch (error) {
    console.error('Birthday check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 