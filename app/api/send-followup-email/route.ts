import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Authentication check - you might want to add admin authentication here
    const { adminKey } = await request.json();
    
    if (adminKey !== process.env.ADMIN_EMAIL_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      console.error('Resend API key not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Get all users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        emailVerified: true
      },
      where: {
        emailVerified: {
          not: null
        }
      }
    });

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'No verified users found' },
        { status: 200 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const sentEmails = [];
    const failedEmails = [];

    // Send email to each user
    for (const user of users) {
      try {
        const emailData = {
          from: 'Talkers <noreply@talkers.pro>',
          to: [user.email],
          subject: 'How has your Talkers experience been? 💜',
          html: generateFollowUpEmailHTML(user.name || 'there'),
          text: generateFollowUpEmailText(user.name || 'there')
        };

        const result = await resend.emails.send(emailData);
        
        if (result.error) {
          console.error(`Failed to send email to ${user.email}:`, result.error);
          failedEmails.push({ email: user.email, error: result.error });
        } else {
          sentEmails.push({ email: user.email, id: result.data?.id });
        }
      } catch (error) {
        console.error(`Error sending to ${user.email}:`, error);
        failedEmails.push({ email: user.email, error: error });
      }
    }

    return NextResponse.json({
      message: 'Follow-up emails sent',
      results: {
        totalUsers: users.length,
        sent: sentEmails.length,
        failed: failedEmails.length,
        sentEmails,
        failedEmails
      }
    });

  } catch (error) {
    console.error('Follow-up email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFollowUpEmailHTML(userName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>How has your Talkers experience been?</title>
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
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .question-section {
          background: #f8fafc;
          padding: 30px;
          margin: 30px 0;
          border-radius: 12px;
          text-align: left;
        }
        .question {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
          text-align: center;
        }
        .feedback-options {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 24px 0;
        }
        .feedback-btn {
          display: inline-block;
          padding: 12px 24px;
          background: white;
          color: #667eea !important;
          text-decoration: none !important;
          border-radius: 25px;
          font-weight: 600;
          font-size: 14px;
          border: 2px solid #667eea;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .feedback-btn:hover {
          background: #667eea;
          color: white !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
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
          transition: all 0.3s ease;
        }
        .main-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }
        .benefits {
          background: #f0f4ff;
          padding: 24px;
          margin: 30px 0;
          border-radius: 12px;
          text-align: left;
        }
        .benefit {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          color: #4b5563;
        }
        .benefit:last-child {
          margin-bottom: 0;
        }
        .benefit-icon {
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          margin-right: 10px;
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
        .personal-note {
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
          margin-top: 24px;
          padding: 16px;
          background: #fef7ff;
          border-radius: 8px;
          border-left: 4px solid #c084fc;
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
            font-size: 24px;
          }
          .feedback-options {
            flex-direction: column;
            align-items: center;
          }
          .feedback-btn {
            width: 200px;
            text-align: center;
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
          <h2 class="welcome-text">Hi ${userName}! 👋</h2>
          <p class="subtitle">
            We hope you've been enjoying your journey with Talkers. Your experience means the world to us,
            and we'd love to hear how it's been going for you.
          </p>
          
          <div class="question-section">
            <div class="question">How has your Talkers experience been so far?</div>
            
            <div class="feedback-options">
              <a href="mailto:support@talkers.pro?subject=Loving Talkers! 😍&body=Hi! I wanted to share my positive experience with Talkers..." class="feedback-btn">😍 Loving it!</a>
              <a href="mailto:support@talkers.pro?subject=Good experience with Talkers&body=Hi! Here's my feedback about Talkers..." class="feedback-btn">👍 Pretty good</a>
              <a href="mailto:support@talkers.pro?subject=Talkers feedback&body=Hi! I have some thoughts about my Talkers experience..." class="feedback-btn">🤔 Could be better</a>
              <a href="mailto:support@talkers.pro?subject=Issues with Talkers&body=Hi! I'm experiencing some issues with Talkers..." class="feedback-btn">😕 Having issues</a>
            </div>
          </div>

          <p style="font-size: 16px; color: #4b5563; margin: 24px 0;">
            Whether you have suggestions, encountered any challenges, or simply want to share what you love about preserving your memories, 
            we're here to listen and make Talkers even better for you.
          </p>
          
          <a href="mailto:support@talkers.pro?subject=My Talkers Experience - Detailed Feedback&body=Hi Talkers team!%0A%0AI wanted to share my experience with the platform:%0A%0A✨ What I love:%0A%0A🔧 What could be improved:%0A%0A💡 Suggestions:%0A%0A📖 My story (optional):%0A%0AThank you for creating such a meaningful platform!%0A%0ABest regards," class="main-cta">
            💜 Share Your Experience
          </a>
          
          <div class="benefits">
            <div class="benefit">
              <div class="benefit-icon"></div>
              <span>Your feedback directly shapes future updates</span>
            </div>
            <div class="benefit">
              <div class="benefit-icon"></div>
              <span>Help us preserve memories even better</span>
            </div>
            <div class="benefit">
              <div class="benefit-icon"></div>
              <span>Join our community of memory keepers</span>
            </div>
            <div class="benefit">
              <div class="benefit-icon"></div>
              <span>Priority support for active users</span>
            </div>
          </div>

          <div class="personal-note">
            <strong>A personal note:</strong> Every memory shared through Talkers is precious to us. 
            Whether you're reconnecting with a loved one or preserving conversations that matter, 
            your stories inspire us to keep improving this platform. Thank you for trusting us with your memories. 💜
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            © 2025 Talkers. All rights reserved.<br>
            Made with 💜 for preserving what matters most.<br>
            <a href="mailto:support@talkers.pro" style="color: #667eea;">support@talkers.pro</a> | 
            <a href="${process.env.NEXTAUTH_URL || 'https://talkers.pro'}" style="color: #667eea;">Visit Talkers</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateFollowUpEmailText(userName: string): string {
  return `
Hi ${userName}! 

We hope you've been enjoying your journey with Talkers. Your experience means the world to us, and we'd love to hear how it's been going for you.

HOW HAS YOUR TALKERS EXPERIENCE BEEN SO FAR?

Whether you have suggestions, encountered any challenges, or simply want to share what you love about preserving your memories, we're here to listen and make Talkers even better for you.

Share your experience: support@talkers.pro

What your feedback helps us do:
• Your feedback directly shapes future updates
• Help us preserve memories even better  
• Join our community of memory keepers
• Priority support for active users

A personal note: Every memory shared through Talkers is precious to us. Whether you're reconnecting with a loved one or preserving conversations that matter, your stories inspire us to keep improving this platform. Thank you for trusting us with your memories.

Made with 💜 for preserving what matters most.

© 2025 Talkers. All rights reserved.
support@talkers.pro | ${process.env.NEXTAUTH_URL || 'https://talkers.pro'}
  `;
} 