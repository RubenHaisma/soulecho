#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting EchoSoul with Qdrant...');
console.log('📋 This script will:');
console.log('   1. Check if Docker is running');
console.log('   2. Start Qdrant and PostgreSQL services');
console.log('   3. Start the main application');
console.log('');

// Check if docker-compose.yml exists
if (!fs.existsSync(path.join(__dirname, '../docker-compose.yml'))) {
  console.error('❌ docker-compose.yml not found. Please ensure it exists in the project root.');
  process.exit(1);
}

// Check if .env exists
if (!fs.existsSync(path.join(__dirname, '../.env'))) {
  console.warn('⚠️  .env file not found. Creating from .env.example...');
  if (fs.existsSync(path.join(__dirname, '../.env.example'))) {
    fs.copyFileSync(path.join(__dirname, '../.env.example'), path.join(__dirname, '../.env'));
    console.log('✅ Created .env file from .env.example');
  } else {
    console.error('❌ .env.example not found. Please create a .env file with required environment variables.');
    process.exit(1);
  }
}

// Function to run commands
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function startServices() {
  try {
    console.log('🐳 Starting Docker services...');
    await runCommand('docker-compose', ['up', '-d', 'qdrant', 'postgres']);
    
    console.log('⏳ Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔍 Checking Qdrant health...');
    try {
      const { exec } = require('child_process');
      exec('curl -s http://localhost:6333/collections', (error, stdout, stderr) => {
        if (error) {
          console.warn('⚠️  Qdrant health check failed, but continuing...');
        } else {
          console.log('✅ Qdrant is responding');
        }
      });
    } catch (error) {
      console.warn('⚠️  Could not check Qdrant health');
    }
    
    console.log('🚀 Starting main application...');
    await runCommand('npm', ['run', 'start-all']);
    
  } catch (error) {
    console.error('❌ Failed to start services:', error.message);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure Docker is running');
    console.log('   2. Check if ports 3000, 3001, 6333, 5432 are available');
    console.log('   3. Verify your .env file has the correct configuration');
    console.log('   4. Try running: docker-compose logs qdrant');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down services...');
  try {
    await runCommand('docker-compose', ['down']);
    console.log('✅ Services stopped');
  } catch (error) {
    console.error('❌ Error stopping services:', error.message);
  }
  process.exit(0);
});

// Start everything
startServices(); 