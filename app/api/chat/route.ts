import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    // Read the body once at the beginning
    const body = await request.json();

    // Check user's subscription and trial status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chatSessions: {
          include: {
            conversations: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Check if user has active premium subscription
    const isPremium = !!(user as any).stripeSubscriptionId && 
                     !!(user as any).stripeCurrentPeriodEnd && 
                     (user as any).stripeCurrentPeriodEnd > now;

    // Calculate trial status
    const trialEndDate = (user as any).trialEndDate || 
                        ((user as any).trialStartDate ? new Date((user as any).trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000) : 
                         new Date(user.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000));
    
    const isTrialActive = (user as any).isTrialActive && now <= trialEndDate;

    // If neither premium nor trial active, block access
    if (!isPremium && !isTrialActive) {
      return Response.json({ 
        error: 'Your trial has expired. Please upgrade to Premium to continue your conversations.',
        code: 'TRIAL_EXPIRED',
        trialEndDate: trialEndDate.toISOString()
      }, { status: 403 });
    }

    // For trial users, check conversation limit
    if (!isPremium && isTrialActive) {
             const totalConversations = (user as any).chatSessions.reduce((sum: number, chatSession: any) => sum + chatSession.conversations.length, 0);
      
      if (totalConversations >= 1) {
        // Check if this is the same session continuing
        const sessionId = body.sessionId;
        
                 if (sessionId) {
           const existingSession = (user as any).chatSessions.find((s: any) => s.id === sessionId);
          if (!existingSession) {
            return Response.json({ 
              error: 'Trial users can only have 1 conversation. Upgrade to Premium for unlimited conversations.',
              code: 'TRIAL_LIMIT_REACHED'
            }, { status: 403 });
          }
        } else {
          return Response.json({ 
            error: 'Trial users can only have 1 conversation. Upgrade to Premium for unlimited conversations.',
            code: 'TRIAL_LIMIT_REACHED'
          }, { status: 403 });
        }
      }
    }

    console.log('🔍 Environment check:');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('🔗 Forwarding to backend:', `${backendUrl}/api/chat`);
    
    // Forward to backend server
    const backendResponse = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      console.error('❌ Backend error:', error);
      return Response.json(error, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    console.log('✅ Backend response successful');
    
    return Response.json(data);
    
  } catch (error) {
    console.error('❌ API Chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}