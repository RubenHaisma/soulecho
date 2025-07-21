import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.client_reference_id) {
          const userId = session.client_reference_id;
          
          if (session.mode === 'subscription') {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeCustomerId: (subscription as any).customer as string,
                stripeSubscriptionId: (subscription as any).id,
                stripePriceId: (subscription as any).items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(((subscription as any).current_period_end) * 1000),
                subscriptionStatus: 'premium',
                isTrialActive: false
              },
            });
          } else if (session.mode === 'payment') {
            // Handle lifetime purchase
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeCustomerId: session.customer as string,
                stripePriceId: 'lifetime',
                stripeCurrentPeriodEnd: new Date('2099-12-31'), // Far future date for lifetime
                subscriptionStatus: 'premium',
                isTrialActive: false
              },
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          );
          
          await prisma.user.update({
            where: { stripeCustomerId: (subscription as any).customer as string },
            data: {
              stripeCurrentPeriodEnd: new Date(((subscription as any).current_period_end) * 1000),
              subscriptionStatus: (subscription as any).cancel_at_period_end ? 'canceled' : 'premium'
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.user.update({
          where: { stripeCustomerId: (subscription as any).customer as string },
          data: {
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            subscriptionStatus: 'free'
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}