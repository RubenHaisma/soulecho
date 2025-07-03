#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecureKey() {
  return crypto.randomBytes(32).toString('hex');
}

function addToEnvFile() {
  const adminKey = generateSecureKey();
  const envPath = path.join(process.cwd(), '.env.local');
  const envLine = `\nADMIN_EMAIL_KEY=${adminKey}\n`;

  try {
    // Check if .env.local exists
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if ADMIN_EMAIL_KEY already exists
      if (envContent.includes('ADMIN_EMAIL_KEY=')) {
        console.log('⚠️  ADMIN_EMAIL_KEY already exists in .env.local');
        console.log('   Current key will not be overwritten.');
        console.log('   If you want to replace it, manually edit .env.local');
        return;
      }
      
      // Append to existing file
      fs.appendFileSync(envPath, envLine);
      console.log('✅ Added ADMIN_EMAIL_KEY to existing .env.local file');
    } else {
      // Create new .env.local file
      fs.writeFileSync(envPath, `# Talkers Environment Variables${envLine}`);
      console.log('✅ Created .env.local with ADMIN_EMAIL_KEY');
    }

    console.log('\n🔑 Your secure admin key has been generated:');
    console.log(`   ADMIN_EMAIL_KEY=${adminKey}`);
    console.log('\n📧 You can now run the follow-up email campaign:');
    console.log('   npm run email:followup');
    console.log('\n🔒 Keep this key secret and secure!');
    
  } catch (error) {
    console.error('❌ Error updating .env.local file:', error.message);
    console.log('\n🔑 Here\'s your secure admin key:');
    console.log(`   ADMIN_EMAIL_KEY=${adminKey}`);
    console.log('\n📝 Please add this manually to your .env.local file');
  }
}

console.log('🔐 Generating secure admin key for email campaigns...\n');
addToEnvFile(); 