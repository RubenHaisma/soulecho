import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        // @ts-ignore subscriptionStatus
        subscriptionStatus: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Determine subscription status
    const hasActiveSubscription = !!user.stripeSubscriptionId && 
                                !!user.stripeCurrentPeriodEnd && 
                                user.stripeCurrentPeriodEnd > now;
    const hasLifetimeAccess = user.stripePriceId === 'lifetime';
    const isPremium = hasActiveSubscription || hasLifetimeAccess;

    // Ensure DB subscriptionStatus is up-to-date
    const desiredStatus = isPremium ? 'premium' : 'free';
    // @ts-ignore subscriptionStatus type
    if ((user as any).subscriptionStatus !== desiredStatus) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          // @ts-ignore subscriptionStatus field
          subscriptionStatus: desiredStatus 
        }
      });
    }

    // Get Stripe subscription details if exists
    let stripeSubscription = null;
    let stripeCustomer = null;
    
    if (user.stripeCustomerId) {
      try {
        stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
      } catch (error) {
        console.error('Failed to retrieve Stripe customer:', error);
      }
    }

    if (user.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      } catch (error) {
        console.error('Failed to retrieve Stripe subscription:', error);
      }
    }

    // For now, use mock usage data until Prisma client is regenerated
    const totalConversations = 0;
    const totalSessions = 0;
    const totalMemoryCards = 0;

    // Get billing history from Stripe
    let billingHistory: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      date: string;
      description: string;
    }> = [];
    
    if (user.stripeCustomerId) {
      try {
        const invoices = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 10
        });
        
        billingHistory = invoices.data.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status || 'unknown',
          date: new Date(invoice.created * 1000).toISOString(),
          description: invoice.description || `Invoice for ${invoice.period_start ? new Date(invoice.period_start * 1000).toLocaleDateString() : 'subscription'}`
        }));
      } catch (error) {
        console.error('Failed to retrieve billing history:', error);
      }
    }

    // Get upcoming invoice if subscription is active
    let upcomingInvoice = null;
    if (stripeSubscription && stripeSubscription.status === 'active') {
      try {
        const upcoming = await stripe.invoices.retrieveUpcoming({
          customer: user.stripeCustomerId!,
          subscription: user.stripeSubscriptionId!
        });
        
        upcomingInvoice = {
          amount: upcoming.amount_due,
          currency: upcoming.currency,
          date: new Date(upcoming.next_payment_attempt! * 1000).toISOString()
        };
      } catch (error) {
        console.error('Failed to retrieve upcoming invoice:', error);
      }
    }

    // Determine current plan
    let currentPlan = {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      status: 'active' as const,
      currentPeriodEnd: null as string | null,
      cancelAtPeriodEnd: false
    };

    if (hasLifetimeAccess) {
      currentPlan = {
        id: 'lifetime',
        name: 'Lifetime Premium',
        price: 0,
        interval: 'lifetime',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };
    } else if (stripeSubscription) {
      const price = stripeSubscription.items.data[0]?.price;
      currentPlan = {
        id: stripeSubscription.id,
        name: price?.nickname || 'Premium',
        price: (price?.unit_amount || 0) / 100,
        interval: price?.recurring?.interval || 'month',
        status: stripeSubscription.status as any,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      };
    }

    // Calculate limits based on plan
    const limits = {
      conversations: isPremium ? 9999 : 5,
      sessions: isPremium ? 9999 : 3,
      memoryCards: isPremium ? 9999 : 10
    };

    const subscriptionData = {
      currentPlan,
      usage: {
        conversations: totalConversations,
        conversationsLimit: limits.conversations,
        sessions: totalSessions,
        sessionsLimit: limits.sessions,
        memoryCards: totalMemoryCards,
        memoryCardsLimit: limits.memoryCards
      },
      billingHistory,
      upcomingInvoice,
      isPremium,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId
    };

    // ===== Extra safeguard: if we don't have a subscription ID yet, try to fetch it from Stripe (covers missing webhook during local dev) =====
    if (!user.stripeSubscriptionId && user.stripeCustomerId) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'all',
          limit: 1,
        });
        if (subs.data.length > 0) {
          const activeSub = subs.data[0];
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: activeSub.id,
              stripePriceId: activeSub.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(activeSub.current_period_end * 1000),
              // @ts-ignore
              subscriptionStatus: activeSub.cancel_at_period_end ? 'canceled' : 'premium',
              isTrialActive: false,
            },
          });
          // refresh user object locally
          user.stripeSubscriptionId = activeSub.id;
          user.stripePriceId = activeSub.items.data[0].price.id as any;
          user.stripeCurrentPeriodEnd = new Date(activeSub.current_period_end * 1000);
        }
      } catch (err) {
        console.error('Failed to sync subscription from Stripe:', err);
      }
    }

    return NextResponse.json(subscriptionData);

  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 