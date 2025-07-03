#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupCRMSystem() {
  try {
    console.log('🚀 Setting up CRM System...\n');

    // 1. Create sample email templates
    console.log('📧 Creating sample email templates...');
    
    const followUpTemplate = await prisma.emailTemplate.create({
      data: {
        name: 'User Follow-up',
        description: 'Follow-up email asking for user experience',
        type: 'FOLLOW_UP',
        subject: 'How has your {{brandName}} experience been? 💜',
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
        `,
        variables: ['userName', 'brandName', 'supportEmail', 'baseUrl']
      }
    });

    const welcomeTemplate = await prisma.emailTemplate.create({
      data: {
        name: 'Welcome Email',
        description: 'Welcome new users to the platform',
        type: 'WELCOME',
        subject: 'Welcome to {{brandName}}! 🎉',
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
        `,
        variables: ['userName', 'brandName', 'baseUrl']
      }
    });

    console.log('✅ Created email templates');

    // 2. Create a sample campaign
    console.log('📊 Creating sample campaign...');
    
    const sampleCampaign = await prisma.emailCampaign.create({
      data: {
        name: 'User Follow-up Campaign',
        description: 'Automated follow-up campaign asking users about their experience',
        subject: 'How has your Talkers experience been? 💜',
        emailTemplate: JSON.stringify({
          html: followUpTemplate.htmlContent,
          text: followUpTemplate.textContent
        }),
        targetType: 'VERIFIED_USERS',
        status: 'DRAFT',
        createdBy: 'system'
      }
    });

    // 3. Create sample email sequence
    console.log('🔄 Creating sample email sequence...');
    
    await prisma.emailSequence.create({
      data: {
        campaignId: sampleCampaign.id,
        name: 'Follow-up Reminder',
        description: 'Reminder if user hasn\'t responded to first follow-up',
        order: 1,
        delayDays: 7,
        delayHours: 0,
        subject: 'We\'d still love to hear from you 💙',
        emailTemplate: JSON.stringify({
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hi {{userName}}!</h2>
              <p>We noticed you haven't had a chance to share your experience with us yet.</p>
              <p>Your feedback is incredibly valuable and helps us improve {{brandName}} for everyone.</p>
              <a href="mailto:support@talkers.pro?subject=My Experience" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Share Your Thoughts
              </a>
            </div>
          `,
          text: `
            Hi {{userName}}!
            
            We noticed you haven't had a chance to share your experience with us yet.
            
            Your feedback is incredibly valuable and helps us improve {{brandName}} for everyone.
            
            Share your thoughts: support@talkers.pro
          `
        })
      }
    });

    console.log('✅ Created sample campaign and sequence');

    // 4. Display setup summary
    console.log('\n🎉 CRM System Setup Complete!\n');
    console.log('📋 What was created:');
    console.log('   ✓ Email templates (Follow-up, Welcome)');
    console.log('   ✓ Sample campaign with sequences');
    console.log('   ✓ Database schema with all CRM tables');
    console.log('\n🔗 Access your CRM:');
    console.log('   Dashboard: /crm');
    console.log('   Create campaigns, manage templates, view analytics');
    console.log('\n🛠 Available APIs:');
    console.log('   POST /api/crm/campaigns - Create campaigns');
    console.log('   POST /api/crm/campaigns/[id]/launch - Launch campaigns');
    console.log('   GET /api/crm/analytics - View analytics');
    console.log('   POST /api/crm/automation/process-sequences - Process scheduled emails');
    console.log('\n🔐 Environment Variables Needed:');
    console.log('   AUTOMATION_KEY=your-automation-secret-key');
    console.log('   ADMIN_EMAIL_KEY=your-admin-secret-key');
    console.log('   RESEND_API_KEY=your-resend-api-key');

  } catch (error) {
    console.error('❌ Error setting up CRM system:', error);
    
    if (error.code === 'P2002') {
      console.log('⚠️  Some data already exists. This is normal if you\'ve run the setup before.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupCRMSystem(); 