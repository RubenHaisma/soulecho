const { execSync } = require('child_process');
require('dotenv').config();

// Color console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testQdrantConnection() {
  log('🧪 Testing Qdrant connection using curl...', 'yellow');

  const apiKey = process.env.QDRANT_API_KEY;
  const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';

  if (!apiKey) {
    log('❌ QDRANT_API_KEY is not set in the .env file.', 'red');
    process.exit(1);
  }

  try {
    const command = `curl -s -f --header 'api-key: ${apiKey}' ${qdrantUrl}/collections`;
    log(`   Executing: ${command.replace(apiKey, '****')}`, 'yellow');
    execSync(command, { stdio: 'pipe' });
    log('✅ Qdrant connection successful!', 'green');
    process.exit(0);
  } catch (error) {
    log('❌ Failed to connect to Qdrant.', 'red');
    log(`   Error: The curl command failed. This likely means the Qdrant server rejected the connection.`, 'red');
    log('   Please ensure Qdrant is running, accessible, and the API key is correct.', 'yellow');
    process.exit(1);
  }
}

testQdrantConnection(); 