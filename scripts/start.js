#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', 'red');
    log('📝 Creating .env from template...', 'yellow');
    
    const examplePath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log('✅ .env created from template', 'green');
      log('⚠️  Please edit .env with your actual values', 'yellow');
      return false;
    } else {
      log('❌ .env.example not found', 'red');
      return false;
    }
  }
  return true;
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log(`❌ Node.js ${nodeVersion} detected. Please upgrade to Node.js 18+`, 'red');
    return false;
  }
  
  log(`✅ Node.js ${nodeVersion}`, 'green');
  return true;
}

function checkChromaDB() {
  try {
    const response = execSync('curl -s http://localhost:8000/api/v1/heartbeat', { timeout: 3000 });
    log('✅ ChromaDB is running', 'green');
    return true;
  } catch (error) {
    log('❌ ChromaDB not accessible at localhost:8000', 'red');
    log('🔧 To start ChromaDB:', 'yellow');
    log('   pip install chromadb', 'cyan');
    log('   chroma run --host localhost --port 8000', 'cyan');
    log('   OR: docker run -p 8000:8000 ghcr.io/chroma-core/chroma:latest', 'cyan');
    return false;
  }
}

function checkDependencies() {
  try {
    const packageJson = require('../package.json');
    log('✅ Dependencies installed', 'green');
    return true;
  } catch (error) {
    log('❌ Dependencies not installed', 'red');
    log('📦 Run: npm install', 'yellow');
    return false;
  }
}

function checkPrisma() {
  try {
    execSync('npx prisma version', { stdio: 'ignore' });
    log('✅ Prisma available', 'green');
    return true;
  } catch (error) {
    log('❌ Prisma not configured', 'red');
    log('🔧 Run: npx prisma generate && npx prisma migrate dev', 'yellow');
    return false;
  }
}

function startServices() {
  log('\n🚀 Starting EchoSoul services...', 'magenta');
  
  // Start backend
  log('🔧 Starting backend server...', 'blue');
  const backend = spawn('npm', ['run', 'server'], {
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  
  backend.stdout.on('data', (data) => {
    process.stdout.write(`[BACKEND] ${data}`);
  });
  
  backend.stderr.on('data', (data) => {
    process.stderr.write(`[BACKEND] ${colors.red}${data}${colors.reset}`);
  });
  
  // Wait a bit then start frontend
  setTimeout(() => {
    log('🎨 Starting frontend...', 'blue');
    const frontend = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    frontend.stdout.on('data', (data) => {
      process.stdout.write(`[FRONTEND] ${data}`);
    });
    
    frontend.stderr.on('data', (data) => {
      process.stderr.write(`[FRONTEND] ${colors.yellow}${data}${colors.reset}`);
    });
    
    // Show success message
    setTimeout(() => {
      log('\n🎉 EchoSoul is starting up!', 'green');
      log('📱 Frontend: http://localhost:3000', 'cyan');
      log('🔧 Backend API: http://localhost:3001', 'cyan');
      log('🗄️  ChromaDB: http://localhost:8000', 'cyan');
      log('\n💡 Press Ctrl+C to stop all services\n', 'yellow');
    }, 3000);
    
  }, 2000);
  
  // Handle cleanup
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down services...', 'yellow');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}

async function main() {
  log('🌟 EchoSoul Platform Startup Check', 'magenta');
  log('=====================================\n', 'magenta');
  
  const checks = [
    { name: 'Node.js version', fn: checkNodeVersion },
    { name: 'Environment file', fn: checkEnvFile },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Prisma setup', fn: checkPrisma },
    { name: 'ChromaDB connection', fn: checkChromaDB }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    log(`Checking ${check.name}...`, 'blue');
    const passed = check.fn();
    if (!passed) {
      allPassed = false;
    }
    log(''); // Empty line
  }
  
  if (!allPassed) {
    log('❌ Some checks failed. Please fix the issues above before starting.', 'red');
    process.exit(1);
  }
  
  log('✅ All checks passed!', 'green');
  log('🚀 Starting services...', 'blue');
  
  startServices();
}

if (require.main === module) {
  main().catch(console.error);
} 