import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Initialize trial dates
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    // Create user with trial settings
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        trialStartDate: now,
        trialEndDate: trialEndDate,
        isTrialActive: true,
        trialChatsUsed: 0
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        trialEndDate: true
      }
    });

    // Generate verification token
    const verificationToken = crypto
      .createHash('sha256')
      .update(`${user.email}${user.id}${process.env.NEXTAUTH_SECRET || 'fallback-secret'}`)
      .digest('hex')
      .substring(0, 16);

    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    // Send confirmation email using Resend
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      console.error('Resend API key not configured');
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const confirmationEmail = {
        from: 'Talkers <noreply@talkers.pro>', // Update with your verified domain
        to: [user.email],
        subject: 'Welcome to Talkers - Confirm Your Email',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Talkers</title>
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
              .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: float 6s ease-in-out infinite;
              }
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
              }
              .logo {
                position: relative;
                z-index: 1;
                display: inline-block;
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                margin-bottom: 20px;
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
              }
              .logo-inner {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              }
              .logo-heart {
                width: 40px;
                height: 40px;
                background: white;
                border-radius: 50%;
                position: relative;
              }
              .logo-heart::before {
                content: '';
                position: absolute;
                top: 8px;
                left: 8px;
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                animation: pulse 2s ease-in-out infinite;
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
              }
              .brand-name {
                color: white;
                font-size: 32px;
                font-weight: 800;
                margin: 0;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .tagline {
                color: rgba(255,255,255,0.9);
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 2px;
                margin: 8px 0 0 0;
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .welcome-text {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 16px;
              }
              .description {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 32px;
                line-height: 1.6;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                text-decoration: none !important;
                padding: 16px 32px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
              }
              .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
              }
              .features {
                background: #f8fafc;
                padding: 30px;
                margin: 30px 0;
                border-radius: 12px;
                text-align: left;
              }
              .feature {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
                font-size: 14px;
                color: #4b5563;
              }
              .feature:last-child {
                margin-bottom: 0;
              }
              .feature-icon {
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                margin-right: 12px;
                flex-shrink: 0;
              }
              .footer {
                background: #f8fafc;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
              }
              .footer-text {
                font-size: 12px;
                color: #9ca3af;
                margin: 0;
              }
              .disclaimer {
                font-size: 12px;
                color: #9ca3af;
                margin-top: 20px;
                padding: 16px;
                background: #f3f4f6;
                border-radius: 8px;
                border-left: 4px solid #e5e7eb;
              }
              @media (max-width: 600px) {
                .container {
                  margin: 10px;
                  border-radius: 12px;
                }
                .header {
                  padding: 30px 20px;
                }
                .content {
                  padding: 30px 20px;
                }
                .brand-name {
                  font-size: 28px;
                }
                .welcome-text {
                  font-size: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <div class="logo-inner">
                    <div class="logo-heart"></div>
                  </div>
                </div>
                <h1 class="brand-name">Talkers</h1>
                <p class="tagline">MEMORIES LIVE ON</p>
              </div>
              
              <div class="content">
                <h2 class="welcome-text">Welcome to Talkers, ${user.name || 'there'}! 👋</h2>
                <p class="description">
                  Thank you for joining us on this beautiful journey of preserving precious memories. 
                  Your account is almost ready - just one more step to activate it.
                </p>
                
                <a href="${verificationUrl}" class="cta-button">
                  ✨ Confirm Your Email
                </a>
                
                <div class="features">
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Transform WhatsApp conversations into meaningful memories</span>
                  </div>
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Keep the connection alive with AI-powered conversations</span>
                  </div>
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Your data stays private and secure</span>
                  </div>
                  <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Start with a free 3-day trial</span>
                  </div>
                </div>
                
                <div class="disclaimer">
                  <strong>Didn't sign up for Talkers?</strong> You can safely ignore this email. 
                  If you have any questions, please contact our support team.
                </div>
              </div>
              
              <div class="footer">
                <p class="footer-text">
                  © 2025 Talkers. All rights reserved.<br>
                  This is an automated email. Please do not reply.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to Talkers, ${user.name || 'there'}!

Thank you for signing up. Please confirm your email address to activate your account.

Confirm your email: ${verificationUrl}

What you can do with Talkers:
• Transform WhatsApp conversations into meaningful memories
• Keep the connection alive with AI-powered conversations
• Your data stays private and secure
• Start with a free 3-day trial

If you did not sign up for Talkers, you can safely ignore this email.

© 2025 Talkers. All rights reserved.`
      };
      try {
        await resend.emails.send(confirmationEmail);
      } catch (e) {
        console.error('Resend error:', e);
      }
    }

    return NextResponse.json({
      message: 'User created successfully. Please check your email to confirm your account.',
      user,
      trial: {
        startsAt: now.toISOString(),
        endsAt: trialEndDate.toISOString(),
        daysRemaining: 3
      },
      emailConfirmation: true
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}