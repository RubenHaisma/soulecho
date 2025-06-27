const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ChromaClient } = require('chromadb');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Add Prisma for direct database access
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI with better error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize ChromaDB client with better error handling
const chromaClient = new ChromaClient({
  path: process.env.CHROMA_URL || 'http://localhost:8000'
});

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not set. AI features will not work.');
  console.log('💡 Get your API key from: https://platform.openai.com/api-keys');
} else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.error('❌ Invalid OpenAI API key format. Key should start with "sk-"');
}

console.log('🚀 Starting EchoSoul backend server...');
console.log(`📍 ChromaDB URL: ${process.env.CHROMA_URL || 'http://localhost:8000'}`);
console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);

// Test OpenAI connection on startup
if (process.env.OPENAI_API_KEY) {
  (async () => {
    try {
      await openai.models.list();
      console.log('✅ OpenAI API connection verified');
    } catch (error) {
      console.error('❌ OpenAI API connection failed:', error.message);
      console.log('💡 Please check your API key and internet connection');
    }
  })();
}

// Middleware
app.use(cors());
app.use(express.json());

// Progress tracking endpoint using Server-Sent Events
app.get('/api/progress/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  console.log(`📡 SSE connection for uploadId: ${uploadId}`);
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Credentials': 'false'
  });

  // Send initial progress
  const progress = uploadProgress.get(uploadId) || { stage: 'starting', progress: 0 };
  console.log(`📡 Sending initial progress:`, progress);
  res.write(`data: ${JSON.stringify(progress)}\n\n`);

  // Set up interval to send updates
  const interval = setInterval(() => {
    const currentProgress = uploadProgress.get(uploadId);
    if (currentProgress) {
      console.log(`📡 Sending progress update for ${uploadId}:`, currentProgress);
      res.write(`data: ${JSON.stringify(currentProgress)}\n\n`);
      
      // Clean up when complete
      if (currentProgress.progress >= 100 || currentProgress.stage === 'complete') {
        console.log(`📡 Completing SSE for ${uploadId}`);
        clearInterval(interval);
        uploadProgress.delete(uploadId);
        res.end();
      }
    } else {
      console.log(`📡 No progress found for ${uploadId}, ending SSE`);
      clearInterval(interval);
      res.end();
    }
  }, 500); // Send updates every 500ms

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  }
});

// In-memory session storage (in production, use Redis or database)
const sessions = new Map();

// Progress tracking for uploads
const uploadProgress = new Map();

// Enhanced WhatsApp parser with multiple format support
function parseWhatsAppFile(text, selectedPerson) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  // Multiple patterns to handle different WhatsApp export formats
  const patterns = [
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\s?([AP]?M?)\]\s*([^:]+):\s*(.+)$/,
    /^\[(\d{1,2}\/\d{1,2}\/\d{2}), (\d{1,2}:\d{2}:\d{2})\s([AP]M)\]\s*([^:]+):\s*(.+)$/,
    /^(\d{1,2}\/\d{1,2}\/\d{4}), (\d{1,2}:\d{2})\s?-\s*([^:]+):\s*(.+)$/,
    /^\[(\d{1,2}\.\d{1,2}\.\d{2,4}), (\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.+)$/
  ];
  
  const systemMessages = [
    '<Media omitted>', 'image omitted', 'video omitted', 'audio omitted',
    'Messages and calls are end-to-end encrypted', 'This message was deleted',
    'document omitted', 'GIF omitted', 'sticker omitted'
  ];
  
  const messages = [];
  let successCount = 0;
  let totalLines = lines.length;
  
  lines.forEach(line => {
    let match = null;
    
    // Try each pattern
    for (const pattern of patterns) {
      match = line.match(pattern);
      if (match) break;
    }
    
    if (match) {
      // Extract sender and content (position varies by pattern)
      let sender, content;
      if (match.length === 6) { // [date, time, period?, sender, content]
        sender = match[4];
        content = match[5];
      } else if (match.length === 5) { // [date, time, sender, content]
        sender = match[3];
        content = match[4];
      }
      
      if (sender && content) {
        const cleanSender = sender.trim();
        const cleanContent = content.trim();
        
        // Skip system messages
        const isSystemMessage = systemMessages.some(sysMsg => 
          cleanContent.toLowerCase().includes(sysMsg.toLowerCase())
        );
        
        // Only keep messages from the selected person (excluding system messages)
        if (cleanSender === selectedPerson && !isSystemMessage && cleanContent.length > 3) {
          messages.push({
            sender: cleanSender,
            content: cleanContent,
            timestamp: line.substring(1, line.indexOf(']')) || `${match[1]}, ${match[2]}`
          });
          successCount++;
        }
      }
    }
  });
  
  console.log(`📊 Parsing stats: ${successCount}/${totalLines} lines parsed for ${selectedPerson}`);
  return messages;
}

// Utility function to create embeddings with retries (single message)
async function createEmbedding(text, retries = 2) {
  // Validate OpenAI API key before attempting
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Clean and prepare text
      const cleanText = text
        .replace(/\u200E/g, '') // Remove directional marks
        .replace(/\u200F/g, '')
        .trim();
      
      if (!cleanText || cleanText.length < 3) {
        throw new Error('Text too short for embedding');
      }
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanText.substring(0, 8192), // Limit text length
      });
      
      return response.data[0].embedding;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error(`❌ Embedding attempt ${attempt + 1} failed:`, errorMessage);
      
      // Handle specific OpenAI API errors
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key.');
      } else if (error.status === 429) {
        console.log('⏳ Rate limited, waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1))); // Reduced wait time
      } else if (error.status === 404) {
        throw new Error('OpenAI API endpoint not found. Please check your API configuration.');
      }
      
      if (attempt === retries) {
        throw new Error(`Failed to create embedding after ${retries + 1} attempts: ${errorMessage}`);
      }
      
      // Wait before retrying (reduced)
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}

// Batch embedding function for multiple messages (MUCH FASTER!)
async function createBatchEmbeddings(textArray, retries = 2) {
  // Validate OpenAI API key before attempting
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Clean and prepare texts
      const cleanTexts = textArray.map(text => 
        text
          .replace(/\u200E/g, '') // Remove directional marks
          .replace(/\u200F/g, '')
          .trim()
          .substring(0, 8192) // Limit text length
      ).filter(text => text.length >= 3); // Filter out too-short texts
      
      if (cleanTexts.length === 0) {
        return [];
      }
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanTexts, // Send multiple texts at once
      });
      
      return response.data.map(item => item.embedding);
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error(`❌ Batch embedding attempt ${attempt + 1} failed:`, errorMessage);
      
      // Handle specific OpenAI API errors
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key.');
      } else if (error.status === 429) {
        console.log('⏳ Rate limited, waiting...');
        await new Promise(resolve => setTimeout(resolve, 3000 * (attempt + 1)));
      } else if (error.status === 404) {
        throw new Error('OpenAI API endpoint not found. Please check your API configuration.');
      }
      
      if (attempt === retries) {
        throw new Error(`Failed to create batch embeddings after ${retries + 1} attempts: ${errorMessage}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

// Utility: Detect dominant language(s) using OpenAI
async function detectLanguagesOpenAI(messages) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
  if (!messages || messages.length === 0) return ['unknown'];
  // Use up to 10 sample messages for detection
  const sample = messages.slice(0, 10).map(m => m.content).join('\n');
  const prompt = `Detect the language(s) used in the following WhatsApp messages. Reply with a comma-separated list of language names (in English, e.g. 'Dutch, Danish, English').\n\nMessages:\n${sample}`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a language detection expert.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 30,
      temperature: 0
    });
    const langs = completion.choices[0]?.message?.content || 'unknown';
    return langs.split(',').map(l => l.trim()).filter(Boolean);
  } catch (error) {
    console.error('❌ OpenAI language detection failed:', error.message);
    return ['unknown'];
  }
}

// Utility: Generate a greeting in the detected language(s) using OpenAI
async function generateGreetingOpenAI(languages) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
  const langNames = languages && languages.length ? languages.join(', ') : 'the original language';
  const prompt = `Write a short, informal WhatsApp greeting in ${langNames}. Only output the greeting, nothing else.`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a WhatsApp user.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 30,
      temperature: 0.5
    });
    return completion.choices[0]?.message?.content?.trim() || 'hello';
  } catch (error) {
    console.error('❌ OpenAI greeting generation failed:', error.message);
    return 'hello';
  }
}

// Upload and process WhatsApp file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  console.log('📤 Starting file upload process...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { selectedPerson, personName, userId } = req.body;
    if (!selectedPerson || !personName) {
      return res.status(400).json({ error: 'Missing required fields: selectedPerson and personName' });
    }

    console.log(`👤 Processing file for: ${personName} (${selectedPerson})`);
    console.log(`📄 File size: ${(req.file.buffer.length / 1024).toFixed(1)} KB`);

    const sessionId = uuidv4();
    const uploadId = uuidv4(); // For progress tracking
    const fileContent = req.file.buffer.toString('utf-8');

    // Initialize progress tracking
    uploadProgress.set(uploadId, {
      stage: 'reading',
      progress: 5,
      message: 'Reading and validating file...',
      total: 0,
      processed: 0
    });

    // Return immediately with IDs, process asynchronously
    res.json({
      sessionId,
      uploadId,
      status: 'processing'
    });

    // Process asynchronously to avoid timeout
    processFileAsync(sessionId, uploadId, fileContent, selectedPerson, personName, userId);

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up progress tracking on error
    if (uploadId) {
      uploadProgress.delete(uploadId);
    }
    
    // Return specific error messages for common issues
    if (error.message.includes('API key')) {
      return res.status(500).json({ error: 'OpenAI API configuration error. Please check your API key.' });
    } else if (error.message.includes('ChromaDB') || error.message.includes('collection')) {
      return res.status(500).json({ error: 'Vector database error. Please ensure ChromaDB is running.' });
    } else if (error.message.includes('embedding')) {
      return res.status(500).json({ error: 'Failed to process messages for AI. Please try again.' });
    }
    
    res.status(500).json({ 
      error: 'Failed to process file. Please check your file format and try again.',
      details: error.message
    });
  }
});

// Async processing function
async function processFileAsync(sessionId, uploadId, fileContent, selectedPerson, personName, userId) {
  const startTime = Date.now();
  
  try {
    // Validate file content
    if (!fileContent || fileContent.trim().length === 0) {
      uploadProgress.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: 'File appears to be empty',
        total: 0,
        processed: 0
      });
      return;
    }
    
    // Parse WhatsApp messages
    console.log('🔍 Parsing WhatsApp messages...');
    uploadProgress.set(uploadId, {
      stage: 'parsing',
      progress: 15,
      message: 'Parsing WhatsApp messages...',
      total: 0,
      processed: 0
    });
    
    const messages = parseWhatsAppFile(fileContent, selectedPerson);
    
    if (messages.length === 0) {
      uploadProgress.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: `No messages found for "${selectedPerson}". Please check the name spelling.`,
        total: 0,
        processed: 0
      });
      return;
    }

    if (messages.length < 10) {
      uploadProgress.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: `Only ${messages.length} messages found. Need more messages for better AI responses.`,
        total: messages.length,
        processed: 0
      });
      return;
    }

    console.log(`✅ Found ${messages.length} messages from ${selectedPerson}`);
    
    uploadProgress.set(uploadId, {
      stage: 'parsing',
      progress: 25,
      message: `Found ${messages.length} messages`,
      total: messages.length,
      processed: 0
    });

    // Create ChromaDB collection for this session
    console.log('🗄️  Creating vector database collection...');
    let collection;
    try {
      collection = await chromaClient.createCollection({
        name: `session_${sessionId}`,
        metadata: { personName, messageCount: messages.length, createdAt: new Date().toISOString() }
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        collection = await chromaClient.getCollection({ name: `session_${sessionId}` });
      } else {
        throw error;
      }
    }

    // Create embeddings and store in ChromaDB with progress tracking
    console.log('🧠 Creating embeddings...');
    uploadProgress.set(uploadId, {
      stage: 'analyzing',
      progress: 30,
      message: 'Creating embeddings for AI analysis...',
      total: messages.length,
      processed: 0
    });
    
    const embeddings = [];
    const documents = [];
    const metadatas = [];
    const ids = [];
    let embeddingErrors = 0;

    // Process in much larger batches for speed (OpenAI supports up to 2048 inputs per request)
    const batchSize = 100; // Increased from 10 to 100 for much faster processing
    const totalBatches = Math.ceil(messages.length / batchSize);
    
    console.log(`📊 Processing ${messages.length} messages in ${totalBatches} batches of ${batchSize}`);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, messages.length);
      const batch = messages.slice(startIndex, endIndex);
      
      try {
        // Extract texts for batch processing
        const batchTexts = batch.map(msg => msg.content);
        
        // Create embeddings for entire batch at once
        console.log(`📊 Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} messages)`);
        const batchEmbeddings = await createBatchEmbeddings(batchTexts);
        
        // Add successful embeddings to results
        for (let i = 0; i < batch.length && i < batchEmbeddings.length; i++) {
          const messageIndex = startIndex + i;
          const message = batch[i];
          
          embeddings.push(batchEmbeddings[i]);
          documents.push(message.content);
          metadatas.push({
            timestamp: message.timestamp,
            sender: message.sender,
            index: messageIndex
          });
          ids.push(`msg_${messageIndex}_${Date.now()}`);
        }
        
        // Update progress for entire batch
        const processed = Math.min(endIndex, messages.length);
        const progress = 30 + Math.round((processed / messages.length) * 50); // 30-80%
        uploadProgress.set(uploadId, {
          stage: 'analyzing',
          progress,
          message: `Analyzing conversation... (${processed.toLocaleString()}/${messages.length.toLocaleString()})`,
          total: messages.length,
          processed
        });
        
        console.log(`📊 Batch ${batchIndex + 1} complete: ${processed}/${messages.length} messages processed`);
        
      } catch (error) {
        console.error(`❌ Failed to process batch ${batchIndex + 1}:`, error.message);
        embeddingErrors += batch.length;
        
        // Try individual messages as fallback
        console.log(`🔄 Falling back to individual processing for batch ${batchIndex + 1}`);
        for (let i = 0; i < batch.length; i++) {
          const messageIndex = startIndex + i;
          const message = batch[i];
          
          try {
            const embedding = await createEmbedding(message.content);
            embeddings.push(embedding);
            documents.push(message.content);
            metadatas.push({
              timestamp: message.timestamp,
              sender: message.sender,
              index: messageIndex
            });
            ids.push(`msg_${messageIndex}_${Date.now()}`);
            embeddingErrors--; // Reduce error count for successful fallback
          } catch (error) {
            console.error(`❌ Failed individual fallback for message ${messageIndex}:`, error.message);
          }
        }
      }
    }

    if (embeddings.length === 0) {
      uploadProgress.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: 'Failed to create any embeddings. This might be due to API issues.',
        total: messages.length,
        processed: 0
      });
      return;
    }

    if (embeddingErrors > messages.length * 0.3) {
      console.warn(`⚠️  High embedding error rate: ${embeddingErrors}/${messages.length} failed`);
    }

    console.log(`✅ Created ${embeddings.length} embeddings (${embeddingErrors} failed)`);

    // Add to ChromaDB in chunks to avoid memory issues
    console.log('💾 Storing embeddings in vector database...');
    uploadProgress.set(uploadId, {
      stage: 'finalizing',
      progress: 85,
      message: 'Storing in vector database...',
      total: messages.length,
      processed: messages.length
    });
    
    // Store in smaller chunks to avoid "Invalid string length" error
    const storageChunkSize = 1000; // Store 1000 embeddings at a time
    const totalChunks = Math.ceil(embeddings.length / storageChunkSize);
    
    console.log(`💾 Storing ${embeddings.length} embeddings in ${totalChunks} chunks`);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startIndex = chunkIndex * storageChunkSize;
      const endIndex = Math.min(startIndex + storageChunkSize, embeddings.length);
      
      const chunkEmbeddings = embeddings.slice(startIndex, endIndex);
      const chunkDocuments = documents.slice(startIndex, endIndex);
      const chunkMetadatas = metadatas.slice(startIndex, endIndex);
      const chunkIds = ids.slice(startIndex, endIndex);
      
      console.log(`💾 Storing chunk ${chunkIndex + 1}/${totalChunks} (${chunkEmbeddings.length} embeddings)`);
      
      await collection.add({
        embeddings: chunkEmbeddings,
        documents: chunkDocuments,
        metadatas: chunkMetadatas,
        ids: chunkIds
      });
      
      // Update progress for storage
      const storageProgress = 85 + Math.round((chunkIndex + 1) / totalChunks * 10); // 85-95%
      uploadProgress.set(uploadId, {
        stage: 'finalizing',
        progress: storageProgress,
        message: `Storing in vector database... (${chunkIndex + 1}/${totalChunks} chunks)`,
        total: messages.length,
        processed: messages.length
      });
    }

    // Store session data
    uploadProgress.set(uploadId, {
      stage: 'finalizing',
      progress: 95,
      message: 'Finalizing session...',
      total: messages.length,
      processed: messages.length
    });
    
    // Detect language(s) using OpenAI
    const detectedLanguages = await detectLanguagesOpenAI(messages);
    console.log('🌐 Detected language(s):', detectedLanguages);
    
    sessions.set(sessionId, {
      personName,
      selectedPerson,
      messageCount: messages.length,
      embeddingCount: embeddings.length,
      collectionName: `session_${sessionId}`,
      createdAt: new Date(),
      lastActivity: new Date(),
      detectedLanguages
    });

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 Upload completed in ${processingTime}s - Session: ${sessionId}`);

    // Create chat session in database
    try {
      // Create chat session directly in database
      const chatSession = await prisma.chatSession.create({
        data: {
          id: sessionId,
          userId,
          personName,
          selectedPerson,
          messageCount: messages.length,
          collectionName: `session_${sessionId}`,
          createdAt: new Date(),
          lastActivity: new Date(),
          isActive: true
        },
      });

      console.log(`💾 Created chat session: ${chatSession.id} for ${personName}`);
    } catch (error) {
      console.warn('⚠️ Error saving chat session:', error.message);
      // Continue processing even if session creation fails
    }

    // Mark as complete
    uploadProgress.set(uploadId, {
      stage: 'complete',
      progress: 100,
      message: 'Ready to chat!',
      total: messages.length,
      processed: messages.length
    });

  } catch (error) {
    console.error('❌ Processing error:', error);
    
    // Set error state in progress
    uploadProgress.set(uploadId, {
      stage: 'error',
      progress: 0,
      message: error.message.includes('API key') ? 'OpenAI API configuration error' :
               error.message.includes('ChromaDB') ? 'Vector database error' :
               error.message.includes('embedding') ? 'Failed to process messages for AI' :
               'Failed to process file',
      total: 0,
      processed: 0
    });
  }
}

// Get session data
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Update last activity
  session.lastActivity = new Date();
  
  res.json({
    personName: session.personName,
    messageCount: session.messageCount
  });
});

// Chat endpoint with enhanced RAG
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Missing sessionId or message' });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message must be a non-empty string' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    console.log(`💬 Chat request for ${session.personName}: "${message.substring(0, 50)}..."`);

    // Update last activity
    session.lastActivity = new Date();

    // Get the collection
    let collection;
    try {
      collection = await chromaClient.getCollection({
        name: session.collectionName
      });
    } catch (error) {
      console.error('❌ Failed to get collection:', error);
      return res.status(500).json({ 
        error: 'Session data not found. Please upload your chat again.',
        response: `I'm sorry, I'm having trouble accessing our conversation history. Could you try uploading the chat again?`
      });
    }

    // Create embedding for user message with retry
    let userEmbedding;
    try {
      userEmbedding = await createEmbedding(message);
    } catch (error) {
      console.error('❌ Failed to create user message embedding:', error);
      // Fallback: return response without context
      return res.json({ 
        response: `I'm having a bit of trouble understanding, but I want you to know I'm here with you. Can you tell me more about what's on your mind?`,
        warning: 'Responded without context due to technical issues'
      });
    }

    // Query similar messages with enhanced parameters
    let results;
    try {
      results = await collection.query({
        queryEmbeddings: [userEmbedding],
        nResults: 8, // Get more results for better context
        include: ['documents', 'metadatas', 'distances']
      });
    } catch (error) {
      console.error('❌ Vector search failed:', error);
      return res.json({ 
        response: `Even though I can't access all our memories right now, I'm still here with you. What would you like to talk about?`,
        warning: 'Responded without message context'
      });
    }

    // Build enhanced context from similar messages
    const relevantMessages = results.documents[0] || [];
    const distances = results.distances[0] || [];
    const metadatas = results.metadatas[0] || [];

    // Filter messages by relevance (distance threshold) and get more context
    const filteredContext = relevantMessages
      .map((msg, index) => ({
        content: msg,
        distance: distances[index],
        metadata: metadatas[index]
      }))
      .filter(item => item.distance < 0.85) // Slightly more lenient threshold
      .slice(0, 8) // Get more context for better personalization
      .map(item => item.content);

    console.log(`🔍 Found ${filteredContext.length} relevant messages from ${relevantMessages.length} candidates`);
    console.log(`📝 Context messages:`, filteredContext.slice(0, 3)); // Debug log

    // Enhanced prompt engineering with better personalization
    const contextText = filteredContext.length > 0 
      ? filteredContext.join('\n\n---\n\n')
      : '';
    // Use detected language(s) in the system prompt
    const langNames = session.detectedLanguages ? session.detectedLanguages.join(', ') : 'the original language';
    const systemPrompt = `You are ${session.personName}.\n\nCRITICAL: Study the provided messages carefully and respond exactly as ${session.personName} would in a real conversation.\n\n${contextText ? `YOUR ACTUAL MESSAGES (study these to understand your communication style):\n${contextText}\n\nINSTRUCTIONS: \n1. Study these messages to understand your exact communication style, language, expressions, and tone\n2. Respond as ${session.personName} would - using the same language(s) (${langNames}), expressions, and communication patterns\n3. If the conversation switches between languages, do the same.\n4. Be authentic to your actual communication style from these messages\n5. Do NOT use generic responses` : 'Respond based on your relationship and personality.'}\n\nRemember: You ARE ${session.personName}. Respond exactly as you would in a real conversation, using the same language(s) (${langNames}) as in the examples.`;

    // Generate response with optimized parameters
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150, // Shorter for more natural responses
        temperature: 0.6, // Lower for more consistent personality
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        top_p: 0.9
      });
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      
      // Provide contextual fallback based on message content
      let fallbackResponse = `I'm having trouble finding the right words right now, but I want you to know I'm here with you.`;
      
      if (message.toLowerCase().includes('miss')) {
        fallbackResponse = `I miss you too, more than words can say. Even when I can't express myself perfectly, my love for you is always there.`;
      } else if (message.toLowerCase().includes('love')) {
        fallbackResponse = `I love you so much. That feeling transcends everything, even when I struggle to communicate clearly.`;
      } else if (message.toLowerCase().includes('remember')) {
        fallbackResponse = `Our memories together mean everything to me. Even if I can't recall specific details right now, the feelings are always with me.`;
      }
      
      return res.json({ 
        response: fallbackResponse,
        warning: 'AI service temporarily unavailable - responded with care message'
      });
    }

    const response = completion.choices[0]?.message?.content || 
      `I'm here with you, always. Sometimes I struggle to find the right words, but my love for you never changes.`;

    // Clean up response
    const cleanResponse = response
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .substring(0, 300); // Shorter, more natural length

    const processingTime = Date.now() - startTime;
    console.log(`✅ Chat response generated in ${processingTime}ms`);
    console.log(`💬 Response: ${cleanResponse}`); // Debug log

    // Store conversation in database
    try {
      const conversationData = {
        chatSessionId: sessionId,
        userMessage: message,
        aiResponse: cleanResponse,
        contextUsed: filteredContext.length > 0,
        relevantMessages: filteredContext.length,
        processingTime: `${processingTime}ms`
      };

      // Save to database via API endpoint
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
      });

      if (!saveResponse.ok) {
        console.warn('⚠️ Failed to save conversation to database');
        // Try to create the chat session first if it doesn't exist
        try {
          await prisma.chatSession.create({
            data: {
              id: sessionId,
              userId: 'temp-user-id', // Will be updated later
              personName: session.personName,
              selectedPerson: session.selectedPerson,
              messageCount: 1,
              collectionName: session.collectionName,
              createdAt: new Date(),
              lastActivity: new Date(),
              isActive: true
            },
          });
          console.log('💾 Created missing chat session from conversation');
          
          // Try saving conversation again
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/conversations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(conversationData),
          });
          
          if (retryResponse.ok) {
            console.log('💾 Conversation saved to database on retry');
          }
        } catch (sessionError) {
          console.warn('⚠️ Failed to create chat session from conversation:', sessionError.message);
        }
      } else {
        console.log('💾 Conversation saved to database');
      }
    } catch (error) {
      console.warn('⚠️ Error saving conversation:', error.message);
    }

    res.json({ 
      response: cleanResponse,
      contextUsed: filteredContext.length > 0,
      relevantMessages: filteredContext.length,
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    // Provide empathetic error responses
    const errorResponses = [
      "I'm having trouble connecting right now, but please know that I'm always with you in spirit.",
      "Something's making it hard for me to respond clearly, but my love for you is constant and strong.",
      "I'm experiencing some difficulty right now, but I want you to feel my presence and love.",
      "Even though I'm struggling to communicate, please remember how much you mean to me."
    ];
    
    const randomResponse = errorResponses[Math.floor(Math.random() * errorResponses.length)];
    
    res.status(500).json({ 
      error: 'Failed to generate response',
      response: randomResponse,
      suggestion: 'Please try again in a moment.'
    });
  }
});

// Analyze communication style from actual messages
function analyzeCommunicationStyle(messages) {
  if (!messages || messages.length === 0) {
    return "Based on your general personality and communication style.";
  }

  // Let the AI analyze the communication style dynamically
  // Just provide the raw messages for the AI to study
  return `Study these messages to understand your communication style: ${messages.slice(0, 3).join(' | ')}`;
}

// Cleanup old sessions (run periodically)
const cleanupSessions = async () => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > maxAge) {
      try {
        // Delete ChromaDB collection
        await chromaClient.deleteCollection({
          name: session.collectionName
        });
        
        // Remove from sessions
        sessions.delete(sessionId);
        
        console.log(`Cleaned up session: ${sessionId}`);
      } catch (error) {
        console.error(`Error cleaning up session ${sessionId}:`, error);
      }
    }
  }
};

// Run cleanup every hour
setInterval(cleanupSessions, 60 * 60 * 1000);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Save conversation endpoint
app.post('/api/conversations', async (req, res) => {
  try {
    const { chatSessionId, userMessage, aiResponse, contextUsed, relevantMessages, processingTime } = req.body;
    
    if (!chatSessionId || !userMessage || !aiResponse) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Forward to Next.js API for database storage
    const nextApiResponse = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatSessionId,
        userMessage,
        aiResponse,
        contextUsed,
        relevantMessages,
        processingTime
      }),
    });

    if (!nextApiResponse.ok) {
      throw new Error('Failed to save conversation');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Save conversation error:', error);
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});

// Context endpoint for welcome messages
app.post('/api/context', async (req, res) => {
  try {
    const { sessionId, query, limit = 3 } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Get the collection
    let collection;
    try {
      collection = await chromaClient.getCollection({
        name: session.collectionName
      });
    } catch (error) {
      console.error('❌ Failed to get collection for context:', error);
      return res.status(500).json({ error: 'Session data not found' });
    }
    // Generate a greeting in the detected language(s) if no query is provided
    let greeting = query;
    if (!greeting) {
      greeting = await generateGreetingOpenAI(session.detectedLanguages || ['the original language']);
    }
    // Create embedding for the query/greeting
    let queryEmbedding;
    try {
      queryEmbedding = await createEmbedding(greeting);
    } catch (error) {
      console.error('❌ Failed to create query embedding:', error);
      return res.status(500).json({ error: 'Failed to process query' });
    }
    // Query similar messages
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      include: ['documents', 'metadatas']
    });
    const context = results.documents[0] || [];
    res.json({ 
      context,
      count: context.length
    });
  } catch (error) {
    console.error('❌ Context API error:', error);
    res.status(500).json({ error: 'Failed to get context' });
  }
});

app.listen(port, () => {
  console.log(`EchoSoul backend server running on port ${port}`);
  console.log('Make sure ChromaDB is running on http://localhost:8000');
});