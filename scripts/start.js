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

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    log('✅ Docker is available', 'green');
    return true;
  } catch (error) {
    log('❌ Docker not found', 'red');
    log('🔧 Please install Docker Desktop or Docker CLI', 'yellow');
    return false;
  }
}

function checkDockerCompose() {
  try {
    execSync('docker-compose --version', { stdio: 'ignore' });
    log('✅ Docker Compose is available', 'green');
    return true;
  } catch (error) {
    log('❌ Docker Compose not found', 'red');
    log('🔧 Please install Docker Compose', 'yellow');
    return false;
  }
}

function checkDockerComposeFile() {
  const composePath = path.join(__dirname, '..', 'docker-compose.yml');
  if (!fs.existsSync(composePath)) {
    log('❌ docker-compose.yml not found', 'red');
    log('🔧 Please ensure docker-compose.yml exists in the project root', 'yellow');
    return false;
  }
  log('✅ docker-compose.yml found', 'green');
  return true;
}

function startQdrantServices() {
  log('🐳 Starting Qdrant and PostgreSQL services...', 'blue');
  try {
    execSync('docker-compose up -d qdrant postgres', {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    log('✅ Docker services started', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to start Docker services', 'red');
    log('🔧 Check if Docker is running and ports are available', 'yellow');
    return false;
  }
}

function waitForQdrant() {
  log('⏳ Waiting for Qdrant to be ready...', 'yellow');
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds
    
    const checkQdrant = () => {
      attempts++;
      try {
        execSync('curl -s http://localhost:6333/collections', { timeout: 2000 });
        log('✅ Qdrant is ready', 'green');
        resolve(true);
      } catch (error) {
        if (attempts >= maxAttempts) {
          log('❌ Qdrant failed to start within 30 seconds', 'red');
          resolve(false);
        } else {
          setTimeout(checkQdrant, 1000);
        }
      }
    };
    
    checkQdrant();
  });
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

async function testQdrant() {
  log('🧪 Testing Qdrant connection...', 'blue');
  try {
    execSync('npm run test:qdrant', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    return true;
  } catch (error) {
    log('❌ Qdrant connection test failed', 'red');
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
      log('🗄️  Qdrant: http://localhost:6333', 'cyan');
      log('🐘 PostgreSQL: localhost:5432', 'cyan');
      log('\n💡 Press Ctrl+C to stop all services\n', 'yellow');
    }, 3000);
    
  }, 2000);
  
  // Handle cleanup
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down services...', 'yellow');
    backend.kill();
    frontend.kill();
    
    // Stop Docker services
    try {
      execSync('docker-compose down', {
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      log('✅ Docker services stopped', 'green');
    } catch (error) {
      log('⚠️  Could not stop Docker services', 'yellow');
    }
    
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
    { name: 'Docker', fn: checkDocker },
    { name: 'Docker Compose', fn: checkDockerCompose },
    { name: 'Docker Compose file', fn: checkDockerComposeFile }
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
  
  if (allPassed) {
    log('\n✅ All checks passed!', 'green');
    
    // Start Docker services
    if (!startQdrantServices()) {
      process.exit(1);
    }
    
    // Wait for Qdrant and test connection
    if (await waitForQdrant()) {
      if (!(await testQdrant())) {
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
    
    // Start main services
    startServices();
    
  } else {
    log('❌ Some checks failed. Please fix the issues above before starting.', 'red');
    process.exit(1);
  }
}

main();