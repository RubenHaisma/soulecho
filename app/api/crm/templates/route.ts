import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/crm/templates - List all email templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('active');

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crm/templates - Create new email template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      subject,
      htmlContent,
      textContent,
      variables
    } = body;

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        description,
        type,
        subject,
        htmlContent,
        textContent,
        variables: variables || []
      }
    });

    return NextResponse.json({ template });

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Pre-defined email templates for common use cases
export const EMAIL_TEMPLATES = {
  FOLLOW_UP: {
    name: 'User Follow-up',
    type: 'FOLLOW_UP',
    subject: 'How has your {{brandName}} experience been? 💜',
    variables: ['userName', 'brandName', 'supportEmail', 'baseUrl'],
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>How has your {{brandName}} experience been?</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #fdfdfd 0%, #f8f9ff 50%, #f0f4ff 100%);
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .brand-name {
            color: white;
            font-size: 32px;
            font-weight: 800;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .welcome-text {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .main-cta {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none !important;
            padding: 18px 36px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 18px;
            margin: 32px 0 24px 0;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-name">{{brandName}}</h1>
          </div>
          <div class="content">
            <h2 class="welcome-text">Hi {{userName}}! 👋</h2>
            <p>We hope you've been enjoying your journey with {{brandName}}. Your experience means the world to us.</p>
            <a href="mailto:{{supportEmail}}?subject=My Experience&body=Hi! I wanted to share my experience..." class="main-cta">
              💜 Share Your Experience
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Hi {{userName}}!
      
      We hope you've been enjoying your journey with {{brandName}}. Your experience means the world to us.
      
      Share your experience: {{supportEmail}}
      
      © {{brandName}}. All rights reserved.
    `
  },

  TRIAL_REMINDER: {
    name: 'Trial Reminder',
    type: 'TRIAL_REMINDER',
    subject: 'Your {{brandName}} trial expires in {{daysLeft}} days',
    variables: ['userName', 'brandName', 'daysLeft', 'baseUrl'],
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Trial Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{userName}}!</h2>
        <p>Your {{brandName}} trial expires in {{daysLeft}} days.</p>
        <p>Upgrade now to continue enjoying all features:</p>
        <a href="{{baseUrl}}/pricing" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Upgrade Now
        </a>
      </body>
      </html>
    `,
    textContent: `
      Hi {{userName}}!
      
      Your {{brandName}} trial expires in {{daysLeft}} days.
      
      Upgrade now: {{baseUrl}}/pricing
    `
  },

  WELCOME: {
    name: 'Welcome Email',
    type: 'WELCOME',
    subject: 'Welcome to {{brandName}}! 🎉',
    variables: ['userName', 'brandName', 'baseUrl'],
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to {{brandName}}, {{userName}}! 🎉</h2>
        <p>Thank you for joining us. We're excited to help you preserve your precious memories.</p>
        <a href="{{baseUrl}}/dashboard" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Get Started
        </a>
      </body>
      </html>
    `,
    textContent: `
      Welcome to {{brandName}}, {{userName}}!
      
      Thank you for joining us. We're excited to help you preserve your precious memories.
      
      Get started: {{baseUrl}}/dashboard
    `
  }
}; 