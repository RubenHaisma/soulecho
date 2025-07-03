#!/usr/bin/env node

// Since node-fetch v3 is ES module only, we need to use dynamic import
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function sendFollowUpEmails() {
  try {
    console.log('🚀 Starting follow-up email campaign...\n');

    // Check if we have the required environment variables
    if (!process.env.ADMIN_EMAIL_KEY) {
      console.error('❌ ADMIN_EMAIL_KEY environment variable is required');
      console.log('   Add this to your .env.local file: ADMIN_EMAIL_KEY=your-secret-admin-key');
      process.exit(1);
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error('❌ NEXTAUTH_URL environment variable is required');
      process.exit(1);
    }

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/send-followup-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminKey: process.env.ADMIN_EMAIL_KEY
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send emails:', result.error);
      process.exit(1);
    }

    console.log('✅ Follow-up email campaign completed!\n');
    console.log('📊 Results:');
    console.log(`   Total users: ${result.results.totalUsers}`);
    console.log(`   Emails sent: ${result.results.sent}`);
    console.log(`   Failed: ${result.results.failed}`);

    if (result.results.sent > 0) {
      console.log('\n📧 Successfully sent emails to:');
      result.results.sentEmails.forEach(email => {
        console.log(`   ✓ ${email.email}`);
      });
    }

    if (result.results.failed > 0) {
      console.log('\n❌ Failed to send emails to:');
      result.results.failedEmails.forEach(email => {
        console.log(`   ✗ ${email.email}: ${email.error}`);
      });
    }

    console.log('\n💌 Email campaign stats:');
    console.log(`   Subject: "How has your Talkers experience been? 💜"`);
    console.log(`   From: Talkers <noreply@talkers.pro>`);
    console.log(`   Type: Follow-up feedback request with beautiful HTML design`);
    console.log('\n🎉 All done! Users will receive a beautiful follow-up email asking for their experience and feedback.');

  } catch (error) {
    console.error('❌ Error sending follow-up emails:', error.message);
    process.exit(1);
  }
}

// Run the script
sendFollowUpEmails(); 