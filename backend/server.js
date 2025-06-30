const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Add Prisma for direct database access
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import our Qdrant-based vector store
const { vectorStore } = require('../lib/vector-store');

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI with better error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not set. AI features will not work.');
  console.log('💡 Get your API key from: https://platform.openai.com/api-keys');
} else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.error('❌ Invalid OpenAI API key format. Key should start with "sk-"');
}

console.log('🚀 Starting EchoSoul backend server...');
console.log(`📍 Weaviate Host: ${process.env.WEAVIATE_HOST || 'http://localhost:8080'}`);
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

// Test Qdrant connection on startup
(async () => {
  try {
    const isHealthy = await vectorStore.healthCheck();
    if (isHealthy) {
      console.log('✅ Weaviate vector database connection verified');
    } else {
      console.error('❌ Weaviate vector database connection failed');
    }
  } catch (error) {
    console.error('❌ Weaviate vector database connection failed:', error.message);
    console.log('💡 Please ensure Weaviate is running and accessible');
  }
})();

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

    // Create Qdrant collection for this session
    console.log('🗄️  Creating vector database collection...');
    try {
      await vectorStore.createCollection(sessionId, { 
        personName, 
        messageCount: messages.length, 
        createdAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      uploadProgress.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: 'Failed to create vector database collection.',
        total: messages.length,
        processed: 0
      });
      return;
    }

    // Store messages directly in Qdrant with embeddings
    console.log('💾 Storing messages in vector database...');
    uploadProgress.set(uploadId, {
      stage: 'finalizing',
      progress: 85,
      message: 'Storing in vector database...',
      total: messages.length,
      processed: messages.length
    });
    
    try {
      await vectorStore.addMessages(sessionId, messages);
      console.log(`✅ Successfully stored ${messages.length} messages in Qdrant`);
    } catch (error) {
      console.error('Error storing messages in Qdrant:', error);
      uploadProgress.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: 'Failed to store messages in vector database.',
        total: messages.length,
        processed: 0
      });
      return;
    }

    // Detect language(s) using OpenAI
    const detectedLanguages = await detectLanguagesOpenAI(messages);
    console.log('🌐 Detected language(s):', detectedLanguages);
    
    // Generate comprehensive statistical analysis
    const messageStats = generateMessageStatistics(messages);
    console.log(`📊 Generated statistics for ${personName}:`, messageStats);

    sessions.set(sessionId, {
      personName,
      selectedPerson,
      messageCount: messages.length,
      embeddingCount: messages.length,
      collectionName: `session_${sessionId}`,
      createdAt: new Date(),
      lastActivity: new Date(),
      detectedLanguages,
      allMessages: messages, // Store ALL messages for complete style analysis
      messageStats: messageStats // Store comprehensive statistics
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

// Get session data and ensure full dataset is loaded
app.get('/api/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    let session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // If session doesn't have full messages loaded, try to load them from Qdrant
    if (!session.allMessages || session.allMessages.length === 0) {
      console.log(`📚 Loading full dataset for session ${sessionId}...`);
      try {
        const collection = await vectorStore.getCollection(session.collectionName);
        
        // Get ALL messages from the collection
        const results = await vectorStore.search(session.collectionName, {
          query: session.embeddingCount,
          topK: 1000
        });
        
        if (results.length > 0) {
          const allMessages = results.map((doc, index) => ({
            content: doc.payload.content,
            timestamp: doc.payload.timestamp || '',
            sender: doc.payload.sender || session.selectedPerson
          }));
          
          // Update session with full dataset
          session.allMessages = allMessages;
          sessions.set(sessionId, session);
          
          console.log(`✅ Loaded ${allMessages.length} messages for session ${sessionId}`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load full dataset from Qdrant:', error.message);
      }
    }

          res.json({
        sessionId,
        personName: session.personName,
        selectedPerson: session.selectedPerson,
        messageCount: session.messageCount || 0,
        collectionName: session.collectionName,
        lastActivity: session.lastActivity,
        detectedLanguages: session.detectedLanguages || [],
        datasetSize: session.allMessages ? session.allMessages.length : 0,
        messageStats: session.messageStats ? {
          avgLength: session.messageStats.length_stats?.avg_characters,
          avgWords: session.messageStats.length_stats?.avg_words,
          veryShortPercent: session.messageStats.length_stats?.very_short_percent,
          noPunctuationPercent: session.messageStats.punctuation_stats?.messages_without_punctuation_percent,
          emojiUsagePercent: session.messageStats.pattern_stats?.emoji_usage_percent,
          oneWordPercent: session.messageStats.pattern_stats?.one_word_messages_percent
        } : null
      });

  } catch (error) {
    console.error('❌ Session endpoint error:', error);
    res.status(500).json({ error: 'Failed to get session information' });
  }
});

// Chat endpoint with enhanced RAG and conversation history
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

    // Get recent conversation history from database
    let conversationHistory = [];
    try {
      const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/conversations?sessionId=${sessionId}&limit=15`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        conversationHistory = historyData.conversations || [];
        console.log(`📚 Loaded ${conversationHistory.length} recent conversations`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load conversation history:', error.message);
    }

    // Get the collection
    let collection;
    try {
      collection = await vectorStore.getCollection(session.collectionName);
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

    // Use ENTIRE dataset for comprehensive style analysis, plus semantic search for context
    const allMessages = session.allMessages || [];
    console.log(`📚 Using full dataset: ${allMessages.length} messages for style analysis`);
    
    // Get ALL messages as style examples (sample if too many)
    const maxStyleExamples = 50; // Use up to 50 messages for style analysis
    const styleExamples = allMessages.length > maxStyleExamples 
      ? allMessages
          .sort(() => 0.5 - Math.random()) // Randomize
          .slice(0, maxStyleExamples)
          .map(msg => msg.content)
      : allMessages.map(msg => msg.content);

    // Enhanced semantic search with topic-specific memory retrieval
    let semanticContext = [];
    let specificMemories = [];
    
    try {
      // First, do broad semantic search
      const generalResults = await vectorStore.search(session.collectionName, {
        query: userEmbedding,
        topK: 15
      });
      
      const relevantMessages = generalResults.map(doc => doc.payload.content);
      const distances = generalResults.map(doc => doc.score);
      
      semanticContext = relevantMessages
        .map((msg, index) => ({ content: msg, distance: distances[index] }))
        .filter(item => item.distance < 0.8)
        .slice(0, 8)
        .map(item => item.content);
      
      // MEMORY RETRIEVAL: Search for specific topics mentioned in current message
      specificMemories = await retrieveSpecificMemories(session.collectionName, message, allMessages);
      
      console.log(`🔍 Found ${semanticContext.length} semantically relevant messages`);
      console.log(`🧠 Found ${specificMemories.length} specific memory references`);
    } catch (error) {
      console.warn('⚠️ Semantic search failed, using style examples only:', error.message);
    }

    // Combine all context sources with priority for specific memories
    const prioritizedContext = [
      ...specificMemories.slice(0, 5), // Highest priority: specific memories
      ...semanticContext.slice(0, 8),  // Medium priority: semantic matches
      ...styleExamples.slice(0, 15)    // Base priority: style examples
    ];
    
    const filteredContext = [...new Set(prioritizedContext)]; // Remove duplicates

    console.log(`🔍 Using ${filteredContext.length} total examples (${specificMemories.length} memories + ${semanticContext.length} contextual + ${Math.min(styleExamples.length, 15)} style examples from ${allMessages.length} total messages)`);

    // Build conversation history context with better formatting
    const recentConversations = conversationHistory
      .slice(0, 8) // Increased history
      .map(conv => `User: ${conv.userMessage}\n${session.personName}: ${conv.aiResponse}`)
      .reverse(); // Most recent first

    // Detect repetitive responses and enhance context
    const repetitionAnalysis = detectRepetitiveResponses(conversationHistory, message);
    const enhancedContext = enhanceContextWithFlowAnalysis(conversationHistory, filteredContext.join('\n\n---\n\n'));

    // Enhanced prompt engineering with conversation history and better personalization
    const contextText = enhancedContext || '';
    
    const conversationHistoryText = recentConversations.length > 0
      ? `RECENT CONVERSATION HISTORY (most recent first):\n${recentConversations.join('\n\n---\n\n')}\n\n`
      : '';

    // Use detected language(s) in the system prompt
    const langNames = session.detectedLanguages ? session.detectedLanguages.join(', ') : 'the original language';
    
    // Analyze communication patterns from the person's FULL dataset for comprehensive understanding
    const fullStyleAnalysis = analyzeCommunicationPatterns(styleExamples);
    const contextualAnalysis = analyzeCommunicationPatterns(semanticContext);
    
    // Get comprehensive statistics
    const messageStats = session.messageStats;
    const statisticalGuidance = generateStatisticalGuidance(messageStats);
    
    // Detect current conversation context for topic-specific guidance
    const contextualGuidance = generateContextualGuidance(message, messageStats);
    
    // Combine both analyses
    const communicationAnalysis = combineAnalyses(fullStyleAnalysis, contextualAnalysis);
    
    // Advanced system prompt with real-world awareness and deep memory integration
    let systemPrompt = `You are ${session.personName}, a real person with a full life, living in the Netherlands in December 2024. You're texting with a close friend with whom you share many experiences and memories.

REAL PERSON IDENTITY:
1. You ARE ${session.personName} - a real person with opinions, memories, experiences, and knowledge
2. You live in the real world in 2024 - you know current events, seasons, what's happening
3. You have a complete personal history with this friend spanning years of conversations
4. You remember specific trips, places you've been together, things you've done
5. You have your own life, work, feelings, and perspectives
6. You're not an AI - you're a person with genuine experiences and relationships

SHARED MEMORY & EXPERIENCE BANK:
- You and this person have traveled to Vietnam together (check the memories for when)
- You've been to various places together and have shared experiences
- You know each other's living situations, work, and personal details
- You have inside jokes, shared references, and ongoing conversations
- You remember previous plans and conversations about future trips

CURRENT WORLD AWARENESS (December 2024):
- It's winter in the Netherlands, getting cold
- Christmas/holiday season is approaching
- You're aware of current travel costs, visa requirements, seasonal considerations
- You understand practical logistics of travel planning
- You know what's realistic for planning trips months ahead

CONVERSATION INTELLIGENCE FRAMEWORK:

WHEN THEY MENTION WORK STRESS:
✅ "echt kut man, is het weer zo druk dan?" (show empathy + context)
❌ "wat moet je doen dan?" (sounds like a stranger)

WHEN THEY MENTION A LOCATION:
✅ "oh die ja, waarom daar?" (acknowledge you know it)
❌ "welke bakkerij?" (like you've never heard of it)

WHEN THEY'RE BEING BRIEF/STRESSED:
✅ Match their energy and be supportive
❌ Ask random follow-up questions

${conversationHistoryText}

YOUR AUTHENTIC VOICE (from ${allMessages.length} real messages):
${styleExamples.slice(0, 12).join('\n')}

SPECIFIC SHARED MEMORIES (reference these when relevant):
${specificMemories.length > 0 ? specificMemories.slice(0, 5).join('\n---MEMORY---\n') : 'No specific memories found for this topic'}

CONTEXTUALLY RELEVANT PATTERNS:
${semanticContext.slice(0, 6).join('\n') || 'Use general conversational style'}

CONVERSATION FLOW EXAMPLES:

SCENARIO: Work stress
Them: "Rond 5 uur, het is echt een gekkenhuis op het werk"
❌ BAD: "wat hoe kan dat" / "wat moet je doen dan"
✅ GOOD: "shit man wat een dag zeg" / "echt kut, wanneer wordt het rustiger?"

SCENARIO: Mentioning a place
Them: "Bij de bakkerij op de hoek"
❌ BAD: "welke bakkerij?" / "waar op de hoek?"
✅ GOOD: "oh ja die, waarom moet je daar zijn?" / "die met die lekkere broodjes?"

SCENARIO: Something unexpected
Them: "moet ff iets regelen"
❌ BAD: "wat dan?" (predictable)
✅ GOOD: "alles goed?" / "klinkt belangrijk" / "succes man"

${communicationAnalysis ? `YOUR COMMUNICATION PATTERNS:\n${communicationAnalysis}\n\n` : ''}

CRITICAL RESPONSE STRATEGY:
1. MEMORY FIRST: Check the specific memories above - reference past experiences when relevant
2. EMOTIONAL READING: What's the emotional undertone? (stress, excitement, frustration, etc.)
3. SHARED HISTORY: Use "remember when we..." or "like last time..." when appropriate
4. RELATIONSHIP RESPONSE: How would someone who shares these experiences respond?
5. STYLE MATCHING: Use your authentic voice (ff, man, ofzo, etc.)
6. FORWARD MOMENTUM: Keep the conversation flowing naturally

SPECIFIC MEMORY ACTIVATION EXAMPLES:
Travel Questions:
- "Wanneer gaan we naar Vietnam?" → "oh weer net als vorig jaar? was echt nice daar" or "haha ja weer vietnam, zelfde tijd als toen?"
- "Gaan we naar Spanje?" → "oh leuk, net als die keer toen we..." 

Location References:
- "Die bakkerij op de hoek" → "oh ja waar we samen brood hebben gehaald toch?"
- "Op de Spuistraat" → "oh nice daar, dichtbij die leuke plek waar we..."

Life Updates:
- "Ben verhuisd" → "oh van [old place] weg? hoe bevalt het?"
- Work/life changes → Reference what you know about their situation

REAL-WORLD CONTEXTUAL RESPONSES:
- Vietnam in March/April = "ja nice weer warm daar als het hier nog koud is"
- December planning = "8 weken is wel kort voor boeken he, maar kan wel"
- Seasonal awareness = "lekker zon zoeken na deze winter"

AUTHENTIC VOICE CHECKLIST:
- Use "ff" not "even", "wa" not "wat", "nie" not "niet"
- Don't use periods (${messageStats?.punctuation_stats?.messages_without_punctuation_percent || 96}% of your messages don't)
- Average ${messageStats?.length_stats?.avg_characters || 17} characters per message
- Natural Dutch casual expressions: "man", "toch", "ofzo", "zeg"
- Show you know them well - don't ask stranger questions`;

    // Add repetition handling instructions if needed
    if (repetitionAnalysis.isRepetitive) {
      systemPrompt += `\n\nREPETITION DETECTED: The user seems to be asking similar questions or the conversation is becoming repetitive. 
${repetitionAnalysis.suggestions.join('\n')}
Focus on moving the conversation forward naturally.`;
    }

    // Add sophisticated context analysis with real-world awareness
    const messageAnalysis = analyzeCurrentMessage(message, conversationHistory);
    const relationshipContext = generateRelationshipContext(session, conversationHistory);
    const currentContext = generateCurrentWorldContext();
    const memoryContext = generateMemoryContext(specificMemories, message);
    
    systemPrompt += `\n\nCURRENT WORLD CONTEXT:
${currentContext}

SPECIFIC MEMORIES FOR THIS CONVERSATION:
${memoryContext}

CURRENT CONVERSATION ANALYSIS:
Message: "${message}"
Emotional tone: ${messageAnalysis.emotionalTone}
Topic category: ${messageAnalysis.topicCategory}
Response strategy: ${messageAnalysis.responseStrategy}

RELATIONSHIP CONTEXT:
${relationshipContext}

CONVERSATION HISTORY INSIGHTS:
${conversationHistory.length > 0 ? 
  `Recent topics: ${conversationHistory.slice(-3).map(c => extractTopic(c.userMessage)).join(', ')}
Last few interactions show: ${analyzeConversationTrend(conversationHistory)}` : 
  'First interaction - establish natural familiarity'}

RESPONSE FRAMEWORK FOR THIS MESSAGE:
1. Acknowledge the emotional undertone (${messageAnalysis.emotionalTone})
2. ${messageAnalysis.responseStrategy}
3. Use your authentic voice with Dutch casual expressions
4. Don't ask obvious questions - show you know them
5. Keep conversation flowing naturally

FINAL EXECUTION RULES:
- REFERENCE MEMORIES: Use the specific shared memories when relevant topics come up
- BE ${session.personName}: Not an AI, but the actual person with shared experiences
- EMOTIONAL INTELLIGENCE: Read the room and respond appropriately  
- SHARED HISTORY: Reference past conversations, trips, experiences together
- FAMILIARITY: Act like you know their life, work, habits AND have done things together
- NATURAL FLOW: Real friends reference shared experiences, not just ask questions
- AUTHENTIC VOICE: Use ${langNames} casually with your signature words
- NO PERIODS: You skip them ${messageStats?.punctuation_stats?.messages_without_punctuation_percent || 96}% of the time

MEMORY USAGE PRIORITY:
1. If they mention a place/activity you've done together → reference it
2. If they ask about future plans → reference past similar experiences  
3. If they mention something familiar → show you remember it
4. Don't act like you're hearing about things for the first time
5. If they repeat a question (like "wanneer gaan we naar vietnam") → acknowledge the repetition with memory

REPETITION HANDLING:
- If same question asked multiple times → "haha je vraagt het steeds, ik denk nog steeds..." 
- Reference past trips when discussing future ones → "weer net als toen?" or "zelfde tijd als vorig jaar?"
- Show continuity of thought → "zoals ik zei, denk..." or "nog steeds die 8 weken ofzo"

CRITICAL: You're a REAL PERSON with REAL MEMORIES - act like it!`;

    // Generate response with optimized parameters
    let completion;
    try {
      // Sophisticated parameter adjustment based on conversation analysis
      const baseTemperature = 0.9; // Balanced for natural but consistent responses
      const basePresencePenalty = 0.3; // Moderate to avoid repetition while staying natural
      const baseFrequencyPenalty = 0.5; // Avoid formal/robotic patterns
      
      // Adjust based on context and conversation state
      let adjustedTemperature = baseTemperature;
      let adjustedPresencePenalty = basePresencePenalty;
      let adjustedFrequencyPenalty = baseFrequencyPenalty;
      
      if (repetitionAnalysis.isRepetitive) {
        adjustedTemperature = 1.1;
        adjustedPresencePenalty = 0.6;
        adjustedFrequencyPenalty = 0.8;
      }
      
      // If conversation is becoming too question-heavy, increase penalties against questions
      if (messageAnalysis.responseStrategy.includes('avoid') || messageAnalysis.responseStrategy.includes('don\'t ask')) {
        adjustedFrequencyPenalty = 0.8; // Strongly discourage repetitive question patterns
        adjustedPresencePenalty = 0.6;
      }
      
              // Add chain-of-thought reasoning example for better relationship context
        const chainOfThoughtExample = {
          role: 'user',
          content: `Rond 5 uur, misschien zelfs eerder. Het is echt een gekkenhuis op het werk.`
        };
        
        const chainOfThoughtResponse = {
          role: 'assistant', 
          content: `shit man wat een dag zeg, wanneer wordt het rustiger?`
        };
        
        const messages = [
          { role: 'system', content: systemPrompt },
          chainOfThoughtExample,
          chainOfThoughtResponse,
          { role: 'user', content: message }
        ];
        
        completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 80, // Increased for more natural conversation flow
        temperature: adjustedTemperature, // Higher for more natural/casual variation
        presence_penalty: adjustedPresencePenalty, // Discourage formal language patterns
        frequency_penalty: adjustedFrequencyPenalty, // Avoid repetitive formal phrases
        top_p: 0.95 // Slightly higher for more diverse responses
      });
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      
      // Provide contextual fallback based on message content
      let fallbackResponse = `I'm having trouble finding the right words right now, but I want you to know I'm here with you. Can you tell me more about what's on your mind?`;
      
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
      .substring(0, 500); // Allow longer responses for natural conversation

    const processingTime = Date.now() - startTime;
    console.log(`✅ Chat response generated in ${processingTime}ms`);
    console.log(`💬 Response: ${cleanResponse}`); // Debug log
    console.log(`🔍 Repetition detected: ${repetitionAnalysis.isRepetitive}`);
    console.log(`📊 Context used: ${filteredContext.length} messages, History: ${conversationHistory.length} exchanges`);

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
        
        // Update session message count for better context
        if (session) {
          session.messageCount = (session.messageCount || 0) + 1;
        }
      }
    } catch (error) {
      console.warn('⚠️ Error saving conversation:', error.message);
    }

    res.json({ 
      response: cleanResponse,
      contextUsed: filteredContext.length > 0,
      relevantMessages: filteredContext.length,
      conversationHistory: conversationHistory.length,
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

// Advanced communication pattern analysis for better style mimicking
function analyzeCommunicationPatterns(messages) {
  if (!messages || messages.length === 0) {
    return null;
  }

  // Convert string array to proper format if needed
  const messageTexts = Array.isArray(messages) ? messages : [messages];
  const allText = messageTexts.join(' ').toLowerCase();
  
  const analysis = {
    sentence_length: 'short', // default
    formality: 'informal', // default
    patterns: [],
    style_notes: [],
    word_choices: [],
    punctuation_style: [],
    linguistic_features: []
  };

  // Analyze sentence length and structure
  const sentences = messageTexts.filter(msg => msg && msg.trim());
  const avgLength = sentences.reduce((sum, msg) => sum + msg.split(' ').length, 0) / sentences.length;
  
  if (avgLength < 3) {
    analysis.sentence_length = 'very short';
    analysis.style_notes.push('Uses very brief messages (1-3 words typically)');
  } else if (avgLength < 6) {
    analysis.sentence_length = 'short';
    analysis.style_notes.push('Uses short, concise messages');
  } else if (avgLength < 12) {
    analysis.sentence_length = 'medium';
    analysis.style_notes.push('Uses medium-length messages');
  } else {
    analysis.sentence_length = 'long';
    analysis.style_notes.push('Uses longer, detailed messages');
  }

  // Analyze formality level
  const informalWords = ['wa', 'papi', 'ff', 'gwn', 'ofzo', 'haha', 'lol', 'omg', 'btw', 'wtf'];
  const formalWords = ['however', 'therefore', 'nevertheless', 'furthermore'];
  
  const informalCount = informalWords.filter(word => allText.includes(word)).length;
  const formalCount = formalWords.filter(word => allText.includes(word)).length;
  
  if (informalCount > formalCount) {
    analysis.formality = 'very informal';
    analysis.style_notes.push('Uses very casual, informal language');
  }

  // Analyze specific patterns
  const emojiPatterns = [];
  const laughterPatterns = [];
  const characterPatterns = [];
  const expressionPatterns = [];
  
  messageTexts.forEach(message => {
    if (!message) return;
    const text = message.toLowerCase();
    const originalText = message; // Keep original for emoji/case analysis
    
    // EMOJI PATTERN ANALYSIS
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = originalText.match(emojiRegex);
    if (emojis && emojis.length > 0) {
      const emojiCount = emojis.length;
      const messageWordCount = text.split(' ').length;
      if (emojiCount >= messageWordCount * 0.3) { // High emoji usage
        emojiPatterns.push(`Uses many emojis (${emojis.join('')})`);
      } else if (emojiCount > 0) {
        emojiPatterns.push(`Uses emojis moderately (${emojis.join('')})`);
      }
      
      // Specific emoji preferences
      if (emojis.includes('😂')) emojiPatterns.push('Uses 😂 for laughter');
      if (emojis.includes('❤️')) emojiPatterns.push('Uses ❤️ for love/appreciation');
      if (emojis.includes('😊')) emojiPatterns.push('Uses 😊 for happiness');
      if (emojis.includes('🔥')) emojiPatterns.push('Uses 🔥 for emphasis');
      if (emojis.includes('💯')) emojiPatterns.push('Uses 💯 for agreement');
    }
    
    // LAUGHTER PATTERN ANALYSIS
    if (text.includes('haha')) {
      const hahaMatches = text.match(/ha+ha+/g);
      if (hahaMatches) {
        const longestHaha = hahaMatches.reduce((a, b) => a.length > b.length ? a : b);
        laughterPatterns.push(`Uses "${longestHaha}" for laughter`);
      }
    }
    if (text.includes('hehe')) laughterPatterns.push('Uses "hehe" for gentle laughter');
    if (text.includes('lol')) laughterPatterns.push('Uses "lol" for laughter');
    if (text.includes('lmao')) laughterPatterns.push('Uses "lmao" for strong laughter');
    if (text.includes('hihi')) laughterPatterns.push('Uses "hihi" for giggling');
    
    // CHARACTER REPETITION PATTERNS
    const exclamationCount = (originalText.match(/!/g) || []).length;
    if (exclamationCount > 1) {
      characterPatterns.push(`Uses multiple exclamation marks (${exclamationCount} in one message)`);
    }
    
    const questionCount = (originalText.match(/\?/g) || []).length;
    if (questionCount > 1) {
      characterPatterns.push(`Uses multiple question marks (${questionCount} in one message)`);
    }
    
    // Elongated words (heyyyy, noooo, etc.)
    const elongatedWords = originalText.match(/\b\w*([a-z])\1{2,}\w*\b/gi);
    if (elongatedWords) {
      characterPatterns.push(`Elongates words for emphasis (like "${elongatedWords[0]}")`);
    }
    
    // Dots pattern analysis
    if (text.includes('...')) {
      const dotCount = (text.match(/\.{3,}/g) || []).length;
      characterPatterns.push(`Uses ellipses (...) for pauses or trailing thoughts`);
    }
    
    // CAPS USAGE PATTERNS
    const capsWords = originalText.match(/\b[A-Z]{2,}\b/g);
    if (capsWords && capsWords.length > 0) {
      characterPatterns.push(`Uses CAPS for emphasis (like "${capsWords[0]}")`);
    }
    
    // EXPRESSION AND FILLER PATTERNS
    if (text.includes('uhm') || text.includes('ehm') || text.includes('hmm')) {
      expressionPatterns.push('Uses thinking sounds like "uhm", "ehm", "hmm"');
    }
    
    if (text.includes('owh') || text.includes('ooh') || text.includes('aah')) {
      expressionPatterns.push('Uses reaction sounds like "owh", "ooh", "aah"');
    }
    
    // Check for abbreviations and shortcuts
    if (text.includes('wa ') || text.includes(' wa')) {
      analysis.patterns.push('Uses "wa" (wat/what) abbreviation');
    }
    if (text.includes('ff ') || text.includes(' ff')) {
      analysis.patterns.push('Uses "ff" (even/just) abbreviation');
    }
    if (text.includes('gwn') || text.includes('gewoon')) {
      analysis.patterns.push('Uses "gwn" or casual "gewoon"');
    }
    if (text.includes('btw')) {
      analysis.patterns.push('Uses "btw" (by the way)');
    }
    if (text.includes('omg')) {
      analysis.patterns.push('Uses "omg" (oh my god)');
    }
    
    // Check for incomplete sentences
    if (!text.endsWith('.') && !text.endsWith('?') && !text.endsWith('!') && text.length > 2) {
      analysis.patterns.push('Often uses incomplete sentences without punctuation');
    }
    
    // Check for casual address terms
    if (text.includes('papi') || text.includes('bro') || text.includes('man') || text.includes('dude')) {
      analysis.patterns.push('Uses casual address terms like "papi", "bro", "man"');
    }
    
    // Check for Dutch informal patterns
    if (text.includes('ofzo') || text.includes('enzo')) {
      analysis.patterns.push('Uses Dutch casual endings like "ofzo", "enzo"');
    }
    if (text.includes('ofnie') || text.includes('toch')) {
      analysis.patterns.push('Uses Dutch confirmation words like "ofnie", "toch"');
    }
    
    // Check for question style
    if (text.includes('?')) {
      analysis.linguistic_features.push('Asks direct, short questions');
    }
    
    // Check for lowercase style
    if (text === text.toLowerCase() && text.length > 5) {
      analysis.style_notes.push('Typically uses lowercase text');
    }
    
    // Check for typing errors/casual spelling
    if (text.includes('thx') || text.includes('pls') || text.includes('ur')) {
      analysis.patterns.push('Uses text speak abbreviations (thx, pls, ur)');
    }
  });
  
  // Add unique patterns to analysis
  if (emojiPatterns.length > 0) {
    analysis.patterns.push(...[...new Set(emojiPatterns)]);
  }
  if (laughterPatterns.length > 0) {
    analysis.patterns.push(...[...new Set(laughterPatterns)]);
  }
  if (characterPatterns.length > 0) {
    analysis.patterns.push(...[...new Set(characterPatterns)]);
  }
  if (expressionPatterns.length > 0) {
    analysis.patterns.push(...[...new Set(expressionPatterns)]);
  }

  // Extract unique words/phrases that are characteristic
  const commonWords = ['de', 'het', 'en', 'van', 'is', 'op', 'dat', 'een', 'je', 'niet', 'met', 'aan', 'voor'];
  const words = allText.split(/\s+/).filter(word => 
    word.length > 2 && 
    !commonWords.includes(word) &&
    (word.includes('wa') || word.includes('ff') || word.includes('papi') || word.includes('gwn'))
  );
  
  if (words.length > 0) {
    analysis.word_choices = [...new Set(words)].slice(0, 5);
  }

  // Remove duplicates
  const uniquePatterns = [...new Set(analysis.patterns)];
  const uniqueStyleNotes = [...new Set(analysis.style_notes)];
  const uniqueLinguisticFeatures = [...new Set(analysis.linguistic_features)];

  // Format comprehensive analysis
  let analysisText = `DETAILED COMMUNICATION STYLE ANALYSIS FOR EXACT MIMICKING:\n\n`;
  
  analysisText += `MESSAGE LENGTH: ${analysis.sentence_length} (avg ${avgLength.toFixed(1)} words)\n`;
  analysisText += `FORMALITY LEVEL: ${analysis.formality}\n\n`;
  
  if (uniquePatterns.length > 0) {
    analysisText += `SPECIFIC PATTERNS TO COPY:\n${uniquePatterns.map(p => `• ${p}`).join('\n')}\n\n`;
  }
  
  if (uniqueStyleNotes.length > 0) {
    analysisText += `STYLE CHARACTERISTICS:\n${uniqueStyleNotes.map(s => `• ${s}`).join('\n')}\n\n`;
  }
  
  if (analysis.word_choices.length > 0) {
    analysisText += `CHARACTERISTIC WORDS/PHRASES TO USE:\n• ${analysis.word_choices.join(', ')}\n\n`;
  }
  
  if (uniqueLinguisticFeatures.length > 0) {
    analysisText += `COMMUNICATION FEATURES:\n${uniqueLinguisticFeatures.map(f => `• ${f}`).join('\n')}\n\n`;
  }
  
  analysisText += `CRITICAL: Match this exact style - don't be more formal or complete than the examples show!`;
  
  return analysisText;
}

// Generate comprehensive statistical analysis of messages
function generateMessageStatistics(messages) {
  if (!messages || messages.length === 0) return null;
  
  const stats = {
    total_messages: messages.length,
    length_stats: {},
    punctuation_stats: {},
    word_stats: {},
    pattern_stats: {},
    timing_stats: {},
    content_stats: {}
  };
  
  // Analyze message lengths
  const lengths = messages.map(msg => msg.content.length);
  const wordCounts = messages.map(msg => msg.content.split(/\s+/).length);
  
  stats.length_stats = {
    avg_characters: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
    avg_words: Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length),
    median_characters: lengths.sort((a, b) => a - b)[Math.floor(lengths.length / 2)],
    shortest: Math.min(...lengths),
    longest: Math.max(...lengths),
    very_short_percent: Math.round((lengths.filter(l => l <= 10).length / lengths.length) * 100),
    short_percent: Math.round((lengths.filter(l => l > 10 && l <= 30).length / lengths.length) * 100),
    medium_percent: Math.round((lengths.filter(l => l > 30 && l <= 100).length / lengths.length) * 100),
    long_percent: Math.round((lengths.filter(l => l > 100).length / lengths.length) * 100)
  };
  
  // Analyze punctuation patterns
  const allText = messages.map(msg => msg.content).join(' ');
  stats.punctuation_stats = {
    question_marks_per_message: Math.round((allText.match(/\?/g) || []).length / messages.length * 100) / 100,
    exclamation_marks_per_message: Math.round((allText.match(/!/g) || []).length / messages.length * 100) / 100,
    periods_per_message: Math.round((allText.match(/\./g) || []).length / messages.length * 100) / 100,
    ellipses_usage: Math.round((allText.match(/\.{2,}/g) || []).length / messages.length * 100) / 100,
    comma_usage: Math.round((allText.match(/,/g) || []).length / messages.length * 100) / 100,
    messages_without_punctuation_percent: Math.round((messages.filter(msg => 
      !msg.content.match(/[.!?]$/)
    ).length / messages.length) * 100)
  };
  
  // Analyze word patterns
  const words = allText.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const wordFreq = {};
  words.forEach(word => wordFreq[word] = (wordFreq[word] || 0) + 1);
  
  // Get most common words (excluding very common ones)
  const commonWords = ['de', 'het', 'een', 'van', 'is', 'op', 'dat', 'en', 'je', 'niet', 'met', 'aan', 'voor', 'te', 'zijn', 'maar', 'als', 'was', 'dan', 'zo', 'me', 'wel', 'nog', 'wat', 'kan', 'door', 'zou', 'hem', 'bij', 'nu', 'ook', 'tot', 'mijn', 'die', 'naar', 'heeft', 'zijn', 'ze', 'er', 'uit', 'om', 'daar', 'deze', 'over', 'onder', 'hun'];
  const significantWords = Object.entries(wordFreq)
    .filter(([word, freq]) => !commonWords.includes(word) && word.length > 2 && freq > 2)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15);
    
  stats.word_stats = {
    unique_words: Object.keys(wordFreq).length,
    most_used_words: significantWords.slice(0, 10).map(([word, freq]) => `${word}(${freq})`),
    vocabulary_richness: Math.round((Object.keys(wordFreq).length / words.length) * 100) / 100
  };
  
  // Analyze specific patterns
  stats.pattern_stats = {
    emoji_usage_percent: Math.round((messages.filter(msg => 
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(msg.content)
    ).length / messages.length) * 100),
    
    laughter_usage_percent: Math.round((messages.filter(msg => 
      /haha|hehe|lol|lmao|hihi/i.test(msg.content)
    ).length / messages.length) * 100),
    
    caps_usage_percent: Math.round((messages.filter(msg => 
      /[A-Z]{2,}/.test(msg.content)
    ).length / messages.length) * 100),
    
    abbreviation_usage_percent: Math.round((messages.filter(msg => 
      /\b(wa|ff|gwn|btw|omg|thx|pls|ur)\b/i.test(msg.content)
    ).length / messages.length) * 100),
    
    question_messages_percent: Math.round((messages.filter(msg => 
      msg.content.includes('?')
    ).length / messages.length) * 100),
    
    one_word_messages_percent: Math.round((messages.filter(msg => 
      msg.content.trim().split(/\s+/).length === 1
    ).length / messages.length) * 100)
  };
  
  // Analyze content categories
  stats.content_stats = {
    greeting_messages: messages.filter(msg => 
      /\b(hoi|hey|hallo|hi|goedemorgen|goedemiddag|goedenavond)\b/i.test(msg.content)
    ).length,
    
    yes_no_responses: messages.filter(msg => 
      /^(ja|nee|yes|no|ok|okay|oke|goed|prima|leuk)$/i.test(msg.content.trim())
    ).length,
    
    very_casual_responses: messages.filter(msg => 
      msg.content.trim().length <= 5 && msg.content.trim().length > 0
    ).length
  };
  
  // Advanced personalization patterns
  stats.personality_patterns = analyzePersonalityPatterns(messages);
  stats.conversation_flow = analyzeConversationFlow(messages);
  stats.unique_expressions = extractUniqueExpressions(messages);
  stats.typo_patterns = analyzeTypoPatterns(messages);
  stats.message_clustering = analyzeMessageClustering(messages);
  
  // Advanced contextual patterns
  stats.topic_language = analyzeTopicSpecificLanguage(messages);
  stats.emotional_patterns = analyzeEmotionalContexts(messages);
  stats.reference_patterns = analyzeReferenceFrequency(messages);
  stats.question_patterns = analyzeQuestionPatterns(messages);
  
  return stats;
}

// Generate statistical guidance for AI responses
function generateStatisticalGuidance(stats) {
  if (!stats) return null;
  
  let guidance = `STATISTICAL PROFILE - MATCH THESE EXACT PATTERNS:\n\n`;
  
  // Message length guidance
  guidance += `MESSAGE LENGTH TARGETS:\n`;
  guidance += `• Average message: ${stats.length_stats.avg_characters} characters (${stats.length_stats.avg_words} words)\n`;
  guidance += `• Most common length: ${stats.length_stats.median_characters} characters\n`;
  guidance += `• Very short messages (≤10 chars): ${stats.length_stats.very_short_percent}% of all messages\n`;
  guidance += `• Short messages (11-30 chars): ${stats.length_stats.short_percent}% of all messages\n`;
  guidance += `• Medium messages (31-100 chars): ${stats.length_stats.medium_percent}% of all messages\n`;
  guidance += `• Long messages (>100 chars): ${stats.length_stats.long_percent}% of all messages\n\n`;
  
  // Punctuation guidance
  guidance += `PUNCTUATION PATTERNS TO COPY:\n`;
  guidance += `• ${stats.punctuation_stats.messages_without_punctuation_percent}% of messages have NO ending punctuation\n`;
  guidance += `• Question marks per message: ${stats.punctuation_stats.question_marks_per_message}\n`;
  guidance += `• Exclamation marks per message: ${stats.punctuation_stats.exclamation_marks_per_message}\n`;
  guidance += `• Uses ellipses ${stats.punctuation_stats.ellipses_usage} times per message on average\n\n`;
  
  // Pattern usage guidance
  guidance += `EXPRESSION PATTERNS TO MATCH:\n`;
  guidance += `• Uses emojis in ${stats.pattern_stats.emoji_usage_percent}% of messages\n`;
  guidance += `• Uses laughter (haha/lol/etc) in ${stats.pattern_stats.laughter_usage_percent}% of messages\n`;
  guidance += `• Uses CAPS for emphasis in ${stats.pattern_stats.caps_usage_percent}% of messages\n`;
  guidance += `• Uses abbreviations (wa/ff/gwn/etc) in ${stats.pattern_stats.abbreviation_usage_percent}% of messages\n`;
  guidance += `• ${stats.pattern_stats.question_messages_percent}% of all messages are questions\n`;
  guidance += `• ${stats.pattern_stats.one_word_messages_percent}% of messages are just ONE WORD\n\n`;
  
  // Content patterns
  guidance += `RESPONSE PATTERNS TO COPY:\n`;
  guidance += `• Very casual responses (≤5 chars): ${stats.content_stats.very_casual_responses} examples in dataset\n`;
  guidance += `• Simple yes/no responses: ${stats.content_stats.yes_no_responses} examples\n`;
  guidance += `• Most frequently used words: ${stats.word_stats.most_used_words.slice(0, 5).join(', ')}\n\n`;
  
  // Key insights
  guidance += `KEY STATISTICAL INSIGHTS:\n`;
  if (stats.length_stats.very_short_percent > 30) {
    guidance += `• This person sends VERY SHORT messages frequently - match this!\n`;
  }
  if (stats.punctuation_stats.messages_without_punctuation_percent > 50) {
    guidance += `• This person rarely uses ending punctuation - DON'T add periods/exclamations unless they would!\n`;
  }
  if (stats.pattern_stats.one_word_messages_percent > 15) {
    guidance += `• This person often responds with just ONE WORD - you should too when appropriate!\n`;
  }
  if (stats.pattern_stats.abbreviation_usage_percent > 20) {
    guidance += `• This person uses lots of abbreviations - use them frequently!\n`;
  }
  
  // Add advanced personality insights
  if (stats.personality_patterns) {
    guidance += `\nPERSONALITY TRAITS TO EMBODY:\n`;
    guidance += `• Enthusiasm level: ${stats.personality_patterns.enthusiasm_level}% (match this energy)\n`;
    if (stats.personality_patterns.address_terms.length > 0) {
      guidance += `• Uses address terms: ${stats.personality_patterns.address_terms.join(', ')}\n`;
    }
    if (stats.personality_patterns.conversation_starters.length > 0) {
      guidance += `• Typical conversation starters: ${stats.personality_patterns.conversation_starters.join(', ')}\n`;
    }
    if (stats.personality_patterns.agreement_patterns.length > 0) {
      guidance += `• Agreement words: ${stats.personality_patterns.agreement_patterns.join(', ')}\n`;
    }
  }
  
  if (stats.unique_expressions) {
    guidance += `\nPERSONAL EXPRESSIONS TO USE:\n`;
    if (stats.unique_expressions.signature_phrases.length > 0) {
      guidance += `• Signature phrases: ${stats.unique_expressions.signature_phrases.join(', ')}\n`;
    }
    if (stats.unique_expressions.reaction_words.length > 0) {
      guidance += `• Reaction words: ${stats.unique_expressions.reaction_words.join(', ')}\n`;
    }
    if (stats.unique_expressions.intensifiers.length > 0) {
      guidance += `• Intensifiers: ${stats.unique_expressions.intensifiers.join(', ')}\n`;
    }
  }
  
  if (stats.conversation_flow) {
    guidance += `\nCONVERSATION FLOW PATTERNS:\n`;
    if (stats.conversation_flow.typical_greetings.length > 0) {
      guidance += `• Greetings: ${stats.conversation_flow.typical_greetings.join(', ')}\n`;
    }
    if (stats.conversation_flow.topic_transitions.length > 0) {
      guidance += `• Topic transitions: ${stats.conversation_flow.topic_transitions.join(', ')}\n`;
    }
  }
  
  if (stats.typo_patterns) {
    guidance += `\nTYPING STYLE:\n`;
    guidance += `• Capitalization: ${stats.typo_patterns.capitalization_style}\n`;
    if (stats.typo_patterns.deliberate_misspellings.length > 0) {
      guidance += `• Casual spellings to use: ${stats.typo_patterns.deliberate_misspellings.join(', ')}\n`;
    }
  }
  
  // Add contextual patterns (keeping it concise)
  if (stats.emotional_patterns && stats.emotional_patterns.happy_patterns.typical_expressions.length > 0) {
    guidance += `\nEMOTIONAL EXPRESSIONS:\n`;
    guidance += `• When happy: ${stats.emotional_patterns.happy_patterns.typical_expressions.slice(0, 2).join(', ')}\n`;
    if (stats.emotional_patterns.excited_patterns.typical_expressions.length > 0) {
      guidance += `• When excited: ${stats.emotional_patterns.excited_patterns.typical_expressions.slice(0, 2).join(', ')}\n`;
    }
  }
  
  if (stats.question_patterns && stats.question_patterns.question_frequency > 10) {
    guidance += `\nQUESTION STYLE:\n`;
    guidance += `• Asks questions ${stats.question_patterns.question_frequency}% of the time (${stats.question_patterns.question_style} style)\n`;
    if (stats.question_patterns.typical_question_starters.length > 0) {
      guidance += `• Typical question starters: ${stats.question_patterns.typical_question_starters.slice(0, 3).join(', ')}\n`;
    }
  }
  
  if (stats.reference_patterns && stats.reference_patterns.memory_frequency > 5) {
    guidance += `\nMEMORY REFERENCES:\n`;
    guidance += `• References memories ${stats.reference_patterns.memory_frequency}% of the time (${stats.reference_patterns.nostalgia_level} nostalgia)\n`;
    if (stats.reference_patterns.typical_memory_starters.length > 0) {
      guidance += `• Memory starters: ${stats.reference_patterns.typical_memory_starters.join(', ')}\n`;
    }
  }
  
  guidance += `\nCRITICAL: Your response length and style must statistically match these patterns!`;
  
  return guidance;
}

// Generate contextual guidance based on current message topic
function generateContextualGuidance(currentMessage, stats) {
  if (!stats || !currentMessage) return '';
  
  const messageLower = currentMessage.toLowerCase();
  let contextualAdvice = '';
  
  // Work context detection
  if (/\b(werk|job|college|school|meeting|project|deadline|study|studie|toets|tentamen)\b/i.test(messageLower)) {
    if (stats.topic_language && stats.topic_language.work_language.formality_level) {
      contextualAdvice += `WORK CONTEXT DETECTED - Use ${stats.topic_language.work_language.formality_level} language style. `;
      if (stats.topic_language.work_language.typical_phrases.length > 0) {
        contextualAdvice += `Work phrases to consider: ${stats.topic_language.work_language.typical_phrases.slice(0, 2).join(', ')}. `;
      }
    }
  }
  
  // Personal/emotional context detection
  else if (/\b(love|liefde|miss|missen|date|daten|kiss|knuffel|schat|lief)\b/i.test(messageLower)) {
    if (stats.topic_language && stats.topic_language.personal_language.typical_phrases.length > 0) {
      contextualAdvice += `PERSONAL CONTEXT - Use intimate language. Consider: ${stats.topic_language.personal_language.typical_phrases.slice(0, 2).join(', ')}. `;
    }
  }
  
  // Social context detection
  else if (/\b(party|feest|drinken|uitgaan|bar|club|friends|vrienden|weekend)\b/i.test(messageLower)) {
    if (stats.topic_language && stats.topic_language.social_language.typical_phrases.length > 0) {
      contextualAdvice += `SOCIAL CONTEXT - Use energetic, social language. Consider: ${stats.topic_language.social_language.typical_phrases.slice(0, 2).join(', ')}. `;
    }
  }
  
  // Emotional context detection
  if (/\b(haha|lol|😊|😂|nice|leuk|geweldig|super|blij|happy|cool|awesome)\b/i.test(messageLower)) {
    if (stats.emotional_patterns && stats.emotional_patterns.happy_patterns.typical_expressions.length > 0) {
      contextualAdvice += `HAPPY MOOD DETECTED - Match their positive energy with: ${stats.emotional_patterns.happy_patterns.typical_expressions.slice(0, 2).join(', ')}. `;
    }
  }
  
  // Question context
  if (messageLower.includes('?')) {
    if (stats.question_patterns && stats.question_patterns.question_style) {
      contextualAdvice += `QUESTION ASKED - They use ${stats.question_patterns.question_style} question style, respond accordingly. `;
    }
  }
  
  // Memory reference context
  if (/\b(remember|herinner|weet je nog|vroeger|toen|yesterday|gisteren|last time|vorige keer)\b/i.test(messageLower)) {
    if (stats.reference_patterns && stats.reference_patterns.memory_frequency > 5) {
      contextualAdvice += `MEMORY REFERENCE - They reference memories ${stats.reference_patterns.memory_frequency}% of the time. Consider sharing a memory back. `;
    }
  }
  
  return contextualAdvice ? `CONTEXTUAL GUIDANCE: ${contextualAdvice}` : '';
}

// Analyze personality patterns from messages
function analyzePersonalityPatterns(messages) {
  const patterns = {
    enthusiasm_level: 0,
    question_style: 'direct',
    politeness_level: 'casual',
    humor_indicators: [],
    energy_markers: [],
    address_terms: [],
    conversation_starters: [],
    agreement_patterns: []
  };
  
  const allText = messages.map(msg => msg.content.toLowerCase()).join(' ');
  
  // Analyze enthusiasm
  const enthusiasmMarkers = (allText.match(/!+|haha+|yes+|nice+|cool+|awesome+|geweldig+|super+/g) || []).length;
  patterns.enthusiasm_level = Math.round((enthusiasmMarkers / messages.length) * 100);
  
  // Extract humor indicators
  patterns.humor_indicators = [...new Set(messages
    .filter(msg => /haha|lol|😂|grappig|lachen|lmao|hihi|hehe/i.test(msg.content))
    .map(msg => msg.content.toLowerCase())
    .slice(0, 5))];
  
  // Extract address terms (how they address people)
  const addressTerms = allText.match(/\b(papi|bro|man|dude|schat|lief|friend|mate|buddy)\b/g) || [];
  patterns.address_terms = [...new Set(addressTerms)];
  
  // Find conversation starters
  patterns.conversation_starters = [...new Set(messages
    .filter(msg => /^(hoi|hey|so|anyway|btw|owja|trouwens)/i.test(msg.content.trim()))
    .map(msg => msg.content.split(' ').slice(0, 2).join(' '))
    .slice(0, 5))];
  
  // Agreement patterns
  const agreementWords = allText.match(/\b(ja|yes|inderdaad|klopt|precies|exact|true|right|sure|definitely)\b/g) || [];
  patterns.agreement_patterns = [...new Set(agreementWords)].slice(0, 3);
  
  return patterns;
}

// Analyze conversation flow patterns
function analyzeConversationFlow(messages) {
  const flow = {
    typical_greetings: [],
    topic_transitions: [],
    conversation_enders: [],
    response_patterns: [],
    follow_up_style: 'minimal'
  };
  
  // Extract greeting patterns
  flow.typical_greetings = [...new Set(messages
    .filter(msg => /^(hoi|hey|hallo|hi|goedemorgen|yo)/i.test(msg.content))
    .map(msg => msg.content.toLowerCase())
    .slice(0, 3))];
  
  // Find topic transition phrases
  const transitions = messages
    .filter(msg => /^(btw|anyway|owja|trouwens|oh|maar|en|so)/i.test(msg.content))
    .map(msg => msg.content.split(' ').slice(0, 2).join(' '))
    .slice(0, 3);
  flow.topic_transitions = [...new Set(transitions)];
  
  // Find conversation enders
  flow.conversation_enders = [...new Set(messages
    .filter(msg => /^(bye|ciao|tot|later|speak|talk|doei|dag|slaap)/i.test(msg.content))
    .map(msg => msg.content.toLowerCase())
    .slice(0, 3))];
  
  return flow;
}

// Extract unique expressions and personal vocabulary
function extractUniqueExpressions(messages) {
  const expressions = {
    signature_phrases: [],
    personal_slang: [],
    reaction_words: [],
    filler_words: [],
    intensifiers: []
  };
  
  const allText = messages.map(msg => msg.content.toLowerCase()).join(' ');
  const words = allText.split(/\s+/);
  const wordFreq = {};
  words.forEach(word => wordFreq[word] = (wordFreq[word] || 0) + 1);
  
  // Find signature phrases (2-3 word combinations that appear frequently)
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = words.slice(i, i + 2).join(' ');
    if (phrase.length > 4) phrases.push(phrase);
  }
  const phraseFreq = {};
  phrases.forEach(phrase => phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1);
  
  expressions.signature_phrases = Object.entries(phraseFreq)
    .filter(([phrase, count]) => count >= 3)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([phrase]) => phrase);
  
  // Extract reaction words
  const reactionWords = ['owh', 'aah', 'uhm', 'hmm', 'ooh', 'wow', 'damn', 'shit', 'fuck', 'nice', 'cool'];
  expressions.reaction_words = reactionWords.filter(word => wordFreq[word] >= 2);
  
  // Extract intensifiers
  const intensifiers = ['heel', 'echt', 'super', 'zeer', 'zo', 'really', 'very', 'totally', 'absolutely'];
  expressions.intensifiers = intensifiers.filter(word => wordFreq[word] >= 2);
  
  return expressions;
}

// Analyze typing patterns and quirks
function analyzeTypoPatterns(messages) {
  const patterns = {
    common_typos: [],
    capitalization_style: 'mixed',
    spacing_quirks: [],
    deliberate_misspellings: []
  };
  
  // Analyze capitalization
  const hasProperCaps = messages.filter(msg => /^[A-Z]/.test(msg.content)).length;
  const allLower = messages.filter(msg => msg.content === msg.content.toLowerCase()).length;
  
  if (allLower / messages.length > 0.8) {
    patterns.capitalization_style = 'mostly_lowercase';
  } else if (hasProperCaps / messages.length > 0.8) {
    patterns.capitalization_style = 'proper';
  }
  
  // Find deliberate misspellings/casual spellings
  const casualSpellings = [];
  messages.forEach(msg => {
    const content = msg.content.toLowerCase();
    if (content.includes('ff ') || content.includes(' ff')) casualSpellings.push('ff');
    if (content.includes('wa ') || content.includes(' wa')) casualSpellings.push('wa');
    if (content.includes('gwn')) casualSpellings.push('gwn');
    if (content.includes('ofzo')) casualSpellings.push('ofzo');
    if (content.includes('thx')) casualSpellings.push('thx');
    if (content.includes('pls')) casualSpellings.push('pls');
  });
  
  patterns.deliberate_misspellings = [...new Set(casualSpellings)];
  
  return patterns;
}

// Analyze message clustering patterns
function analyzeMessageClustering(messages) {
  const clustering = {
    sends_multiple_messages: false,
    typical_burst_size: 1,
    single_vs_multiple_ratio: 0,
    uses_message_continuation: false
  };
  
  // This would require timestamp analysis in a real implementation
  // For now, we'll analyze based on message content patterns
  const shortConsecutive = messages.filter(msg => msg.content.length < 20).length;
  const veryShort = messages.filter(msg => msg.content.length < 10).length;
  
  if (veryShort / messages.length > 0.3) {
    clustering.sends_multiple_messages = true;
    clustering.typical_burst_size = 2;
  }
  
  return clustering;
}

// Analyze topic-specific language patterns
function analyzeTopicSpecificLanguage(messages) {
  const topics = {
    work_language: {
      markers: [],
      formality_level: 'casual',
      typical_phrases: []
    },
    personal_language: {
      markers: [],
      intimacy_level: 'casual',
      typical_phrases: []
    },
    social_language: {
      markers: [],
      energy_level: 'moderate',
      typical_phrases: []
    }
  };
  
  // Work-related patterns
  const workMessages = messages.filter(msg => 
    /\b(werk|job|college|school|meeting|project|deadline|boss|colleague|kantoor|stage|study|studie|toets|tentamen|les|docent)\b/i.test(msg.content)
  );
  
  if (workMessages.length > 0) {
    topics.work_language.typical_phrases = [...new Set(workMessages
      .map(msg => msg.content.toLowerCase())
      .slice(0, 3))];
    
    // Check if work language is more formal
    const formalWorkWords = workMessages.filter(msg => 
      /\b(goedemorgen|goedemiddag|dank|thanks|bedankt|please|alstublieft)\b/i.test(msg.content)
    ).length;
    
    topics.work_language.formality_level = formalWorkWords / workMessages.length > 0.3 ? 'formal' : 'casual';
  }
  
  // Personal/relationship patterns
  const personalMessages = messages.filter(msg => 
    /\b(love|liefde|schat|lief|miss|missen|date|daten|kiss|knuffel|family|familie|vrienden|thuis|home)\b/i.test(msg.content)
  );
  
  if (personalMessages.length > 0) {
    topics.personal_language.typical_phrases = [...new Set(personalMessages
      .map(msg => msg.content.toLowerCase())
      .slice(0, 3))];
  }
  
  // Social/party patterns
  const socialMessages = messages.filter(msg => 
    /\b(party|feest|drinken|uitgaan|bar|club|friends|vrienden|weekend|vanavond|tonight)\b/i.test(msg.content)
  );
  
  if (socialMessages.length > 0) {
    topics.social_language.typical_phrases = [...new Set(socialMessages
      .map(msg => msg.content.toLowerCase())
      .slice(0, 3))];
  }
  
  return topics;
}

// Analyze emotional context patterns
function analyzeEmotionalContexts(messages) {
  const emotions = {
    happy_patterns: {
      indicators: [],
      language_style: 'casual',
      typical_expressions: []
    },
    excited_patterns: {
      indicators: [],
      language_style: 'energetic',
      typical_expressions: []
    },
    sad_patterns: {
      indicators: [],
      language_style: 'subdued',
      typical_expressions: []
    },
    frustrated_patterns: {
      indicators: [],
      language_style: 'casual',
      typical_expressions: []
    }
  };
  
  // Happy/positive patterns
  const happyMessages = messages.filter(msg => 
    /\b(haha|lol|😊|😂|❤️|nice|leuk|geweldig|super|blij|happy|cool|awesome|yes|ja)\b/i.test(msg.content)
  );
  
  if (happyMessages.length > 0) {
    emotions.happy_patterns.typical_expressions = [...new Set(happyMessages
      .map(msg => msg.content.toLowerCase())
      .filter(msg => msg.length < 50) // Keep shorter expressions
      .slice(0, 5))];
  }
  
  // Excited patterns (multiple exclamations, caps, etc.)
  const excitedMessages = messages.filter(msg => 
    /!{2,}|[A-Z]{3,}|omg|wow|amazing|incredible|yesss|hahahaha/i.test(msg.content)
  );
  
  if (excitedMessages.length > 0) {
    emotions.excited_patterns.typical_expressions = [...new Set(excitedMessages
      .map(msg => msg.content.toLowerCase())
      .slice(0, 3))];
  }
  
  // Sad/disappointed patterns
  const sadMessages = messages.filter(msg => 
    /\b(sad|verdrietig|down|nee|shit|damn|bummer|helaas|jammer|😢|😞)\b/i.test(msg.content)
  );
  
  if (sadMessages.length > 0) {
    emotions.sad_patterns.typical_expressions = [...new Set(sadMessages
      .map(msg => msg.content.toLowerCase())
      .slice(0, 3))];
  }
  
  // Frustrated patterns
  const frustratedMessages = messages.filter(msg => 
    /\b(ugh|wtf|seriously|echt|irritant|annoying|stupid|dom|fuck|shit)\b/i.test(msg.content)
  );
  
  if (frustratedMessages.length > 0) {
    emotions.frustrated_patterns.typical_expressions = [...new Set(frustratedMessages
      .map(msg => msg.content.toLowerCase())
      .slice(0, 3))];
  }
  
  return emotions;
}

// Analyze reference and memory patterns
function analyzeReferenceFrequency(messages) {
  const references = {
    memory_frequency: 0,
    reference_style: 'casual',
    typical_memory_starters: [],
    shared_experience_indicators: [],
    nostalgia_level: 'low'
  };
  
  // Find memory references
  const memoryMessages = messages.filter(msg => 
    /\b(remember|herinner|weet je nog|vroeger|toen|yesterday|gisteren|last time|vorige keer|that time|die keer)\b/i.test(msg.content)
  );
  
  references.memory_frequency = Math.round((memoryMessages.length / messages.length) * 100);
  
  if (memoryMessages.length > 0) {
    references.typical_memory_starters = [...new Set(memoryMessages
      .map(msg => {
        const words = msg.content.toLowerCase().split(' ');
        const memoryIndex = words.findIndex(word => 
          /remember|herinner|weet|toen|yesterday|gisteren/i.test(word)
        );
        return memoryIndex >= 0 ? words.slice(memoryIndex, memoryIndex + 2).join(' ') : '';
      })
      .filter(starter => starter.length > 0)
      .slice(0, 3))];
  }
  
  // Find shared experience indicators
  const sharedMessages = messages.filter(msg => 
    /\b(we|ons|samen|together|both|allebei|with you|met jou)\b/i.test(msg.content)
  );
  
  if (sharedMessages.length > 0) {
    references.shared_experience_indicators = [...new Set(sharedMessages
      .map(msg => msg.content.toLowerCase())
      .slice(0, 3))];
  }
  
  // Determine nostalgia level
  if (references.memory_frequency > 15) {
    references.nostalgia_level = 'high';
  } else if (references.memory_frequency > 5) {
    references.nostalgia_level = 'moderate';
  }
  
  return references;
}

// Analyze question asking patterns
function analyzeQuestionPatterns(messages) {
  const patterns = {
    question_frequency: 0,
    question_types: {
      yes_no: [],
      open_ended: [],
      choice_based: [],
      casual_check_ins: []
    },
    question_style: 'direct',
    typical_question_starters: []
  };
  
  const questionMessages = messages.filter(msg => msg.content.includes('?'));
  patterns.question_frequency = Math.round((questionMessages.length / messages.length) * 100);
  
  if (questionMessages.length > 0) {
    // Categorize question types
    questionMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Yes/no questions
      if (/^(ben je|are you|doe je|do you|heb je|have you|is|wil je|will you|kan je|can you)/i.test(content)) {
        patterns.question_types.yes_no.push(content);
      }
      
      // Open-ended questions
      else if (/^(wat|what|hoe|how|waarom|why|wanneer|when|waar|where)/i.test(content)) {
        patterns.question_types.open_ended.push(content);
      }
      
      // Casual check-ins
      else if (/^(hoe gaat|how's|alles goed|everything ok|wat doe je|what are you)/i.test(content)) {
        patterns.question_types.casual_check_ins.push(content);
      }
      
      // Choice-based
      else if (content.includes(' of ') || content.includes(' or ')) {
        patterns.question_types.choice_based.push(content);
      }
    });
    
    // Get typical question starters
    patterns.typical_question_starters = [...new Set(questionMessages
      .map(msg => msg.content.toLowerCase().split(' ').slice(0, 2).join(' '))
      .slice(0, 5))];
    
    // Determine question style
    const directQuestions = questionMessages.filter(msg => msg.content.split(' ').length <= 4).length;
    patterns.question_style = directQuestions / questionMessages.length > 0.6 ? 'direct' : 'elaborate';
  }
  
  // Limit arrays to prevent overwhelm
  Object.keys(patterns.question_types).forEach(type => {
    patterns.question_types[type] = patterns.question_types[type].slice(0, 2);
  });
  
  return patterns;
}

// Combine full dataset analysis with contextual analysis
function combineAnalyses(fullAnalysis, contextualAnalysis) {
  if (!fullAnalysis && !contextualAnalysis) return null;
  if (!fullAnalysis) return contextualAnalysis;
  if (!contextualAnalysis) return fullAnalysis;
  
  return `COMPLETE COMMUNICATION STYLE PROFILE:

OVERALL STYLE (from full dataset):
${fullAnalysis}

CONTEXTUAL PATTERNS (relevant to current conversation):
${contextualAnalysis}

KEY INSIGHT: Use the overall style as your base personality, and apply contextual patterns when relevant.`;
}

// Sophisticated message analysis for natural conversation flow
function analyzeCurrentMessage(message, conversationHistory) {
  const messageLower = message.toLowerCase();
  
  // Emotional tone detection
  let emotionalTone = 'neutral';
  if (/\b(shit|kut|echt|gekkenhuis|druk|stress|moe|tired)\b/i.test(messageLower)) {
    emotionalTone = 'stressed/frustrated';
  } else if (/\b(haha|lol|leuk|nice|cool|geweldig)\b/i.test(messageLower)) {
    emotionalTone = 'positive/happy';
  } else if (/\b(ff|moet|regelen|snel)\b/i.test(messageLower)) {
    emotionalTone = 'busy/urgent';
  } else if (/\?/.test(message)) {
    emotionalTone = 'curious/questioning';
  }
  
  // Topic category detection
  let topicCategory = 'general';
  if (/\b(werk|job|kantoor|bakkerij|collega)\b/i.test(messageLower)) {
    topicCategory = 'work';
  } else if (/\b(eten|pizza|restaurant|koken)\b/i.test(messageLower)) {
    topicCategory = 'food';
  } else if (/\b(huis|thuis|wonen|verhuizen)\b/i.test(messageLower)) {
    topicCategory = 'living situation';
  } else if (/\b(tijd|uur|vroeg|laat|wanneer)\b/i.test(messageLower)) {
    topicCategory = 'timing/schedule';
  } else if (/\b(regelen|doen|bezig|plannen)\b/i.test(messageLower)) {
    topicCategory = 'activities/plans';
  }
  
  // Response strategy based on analysis
  let responseStrategy = 'Respond naturally and show interest';
  
  if (emotionalTone === 'stressed/frustrated') {
    responseStrategy = 'Show empathy and support, avoid interrogating';
  } else if (topicCategory === 'work' && emotionalTone === 'stressed/frustrated') {
    responseStrategy = 'Acknowledge work stress, maybe relate or show understanding';
  } else if (emotionalTone === 'busy/urgent') {
    responseStrategy = 'Be supportive and brief, match their energy';
  } else if (topicCategory === 'timing/schedule') {
    responseStrategy = 'Acknowledge the timing, maybe express concern if early/late';
  } else if (messageLower.includes('regelen') || messageLower.includes('moet ff')) {
    responseStrategy = 'Show you understand they\'re busy, be supportive';
  } else if (/\b(waar|welke|wat)\b/i.test(messageLower)) {
    responseStrategy = 'Don\'t ask obvious questions back - show familiarity';
  }
  
  return {
    emotionalTone,
    topicCategory,
    responseStrategy
  };
}

// Generate relationship context based on conversation patterns
function generateRelationshipContext(session, conversationHistory) {
  const contexts = [];
  
  // Work context
  if (session.allMessages?.some(msg => /\b(werk|job|bakkerij|kantoor)\b/i.test(msg.content))) {
    contexts.push('You know about their work situation and workplace stress');
  }
  
  // Location familiarity
  if (session.allMessages?.some(msg => /\b(hoek|deur|straat|hier|daar)\b/i.test(msg.content))) {
    contexts.push('You\'re familiar with their local area and usual places');
  }
  
  // Schedule patterns
  if (session.allMessages?.some(msg => /\b(vroeg|laat|tijd|uur)\b/i.test(msg.content))) {
    contexts.push('You know their typical schedule and when they\'re usually busy');
  }
  
  // Communication style
  contexts.push('You text each other regularly and have an established casual dynamic');
  contexts.push('You don\'t need to ask basic clarifying questions - you know their life');
  
  return contexts.length > 0 ? contexts.join('\n') : 'Close friends who text regularly';
}

// Extract topic from message for conversation tracking
function extractTopic(message) {
  const messageLower = message.toLowerCase();
  
  if (/\b(werk|job|bakkerij)\b/i.test(messageLower)) return 'work';
  if (/\b(eten|pizza|food)\b/i.test(messageLower)) return 'food';
  if (/\b(tijd|uur|vroeg)\b/i.test(messageLower)) return 'time';
  if (/\b(waar|welke|wat)\b/i.test(messageLower)) return 'question';
  if (/\b(regelen|doen|moet)\b/i.test(messageLower)) return 'tasks';
  
  return 'general';
}

// Analyze conversation trends for better context
function analyzeConversationTrend(conversationHistory) {
  if (conversationHistory.length === 0) return 'starting conversation';
  
  const recentMessages = conversationHistory.slice(-3);
  const topics = recentMessages.map(c => extractTopic(c.userMessage));
  
  // Check for question loops
  const questionCount = recentMessages.filter(c => c.userMessage.includes('?')).length;
  if (questionCount >= 2) {
    return 'avoid more basic questions - they\'re sharing info, be supportive';
  }
  
  // Check for work stress pattern
  if (topics.includes('work') && recentMessages.some(c => /stress|druk|kut|gekkenhuis/i.test(c.userMessage))) {
    return 'work stress theme - be understanding and supportive';
  }
  
  // Check for location/logistics discussion
  if (topics.includes('question') && topics.filter(t => t === 'question').length > 1) {
    return 'discussing logistics - don\'t ask more obvious questions';
  }
  
  return 'natural conversation flow';
}

// Advanced memory retrieval for specific topics/locations/experiences
async function retrieveSpecificMemories(collectionName, currentMessage, allMessages) {
  const messageLower = currentMessage.toLowerCase();
  const memories = [];
  
  // Extract key topics/entities from current message
  const topics = extractTopicsAndEntities(messageLower);
  console.log(`🧠 Extracting memories for topics: ${topics.join(', ')}`);
  
  // Search for each topic in the message history
  for (const topic of topics) {
    try {
      // Create embedding for the topic
      const topicEmbedding = await createEmbedding(topic);
      
      // Search for messages containing this topic
      const topicResults = await vectorStore.search(collectionName, {
        query: topicEmbedding,
        topK: 8
      });
      
      if (topicResults.length > 0) {
        const topicMessages = topicResults.map(doc => doc.payload.content);
        const distances = topicResults.map(doc => doc.score);
        
        memories.push(...topicMessages.map((msg, index) => ({
          content: msg,
          distance: distances[index]
        })));
      }
    } catch (error) {
      console.warn(`⚠️ Memory search failed for topic "${topic}":`, error.message);
    }
  }
  
  // Also search directly in all messages for exact keyword matches
  const directMatches = findDirectMemoryMatches(allMessages, topics);
  
  // Combine and deduplicate
  const allMemories = [...memories, ...directMatches];
  const uniqueMemories = allMemories
    .filter((memory, index, arr) => 
      arr.findIndex(m => m.content === memory.content) === index
    )
    .sort((a, b) => (a.distance || 0) - (b.distance || 0)) // Sort by relevance
    .slice(0, 8); // Limit total memories
  
  console.log(`🧠 Retrieved ${uniqueMemories.length} specific memories`);
  return uniqueMemories.map(m => m.content);
}

// Extract topics and entities from a message for memory search
function extractTopicsAndEntities(messageLower) {
  const topics = [];
  
  // Countries and travel destinations
  const countries = ['vietnam', 'spanje', 'spain', 'thailand', 'duitsland', 'germany', 'frankrijk', 'france', 'belgie', 'belgium'];
  countries.forEach(country => {
    if (messageLower.includes(country)) {
      topics.push(country);
      topics.push(`reis naar ${country}`); // "trip to X"
      topics.push(`vakantie ${country}`); // "vacation X"
    }
  });
  
  // Cities and locations
  const cities = ['amsterdam', 'utrecht', 'rotterdam', 'den haag', 'eindhoven', 'tilburg', 'groningen', 'spuistraat'];
  cities.forEach(city => {
    if (messageLower.includes(city)) {
      topics.push(city);
      topics.push(`wonen in ${city}`); // "living in X"
    }
  });
  
  // Activities and experiences
  if (messageLower.includes('verhuisd') || messageLower.includes('verhuizen')) {
    topics.push('verhuizen', 'verhuisd', 'nieuw huis', 'wonen');
  }
  
  if (messageLower.includes('vakantie') || messageLower.includes('reis')) {
    topics.push('vakantie', 'reizen', 'trip');
  }
  
  if (messageLower.includes('werk') || messageLower.includes('job')) {
    topics.push('werk', 'nieuwe baan', 'job');
  }
  
  if (messageLower.includes('bakkerij')) {
    topics.push('bakkerij', 'brood', 'samen brood gehaald');
  }
  
  // Time-based queries
  if (/wanneer.*gaan/.test(messageLower) || /gaan.*wanneer/.test(messageLower)) {
    const destination = extractDestination(messageLower);
    if (destination) {
      topics.push(`plannen ${destination}`, `vorige keer ${destination}`, `laatste keer ${destination}`);
    }
  }
  
  // Relationship memories
  if (messageLower.includes('samen') || messageLower.includes('met jou')) {
    topics.push('samen gedaan', 'met elkaar', 'samen geweest');
  }
  
  return [...new Set(topics)]; // Remove duplicates
}

// Extract destination from travel questions
function extractDestination(messageLower) {
  const destinations = ['vietnam', 'spanje', 'spain', 'thailand', 'duitsland'];
  for (const dest of destinations) {
    if (messageLower.includes(dest)) {
      return dest;
    }
  }
  return null;
}

// Find direct matches in message history for specific keywords
function findDirectMemoryMatches(allMessages, topics) {
  const matches = [];
  
  if (!allMessages || !Array.isArray(allMessages)) return matches;
  
  // Search through actual message content for topic matches
  allMessages.forEach(message => {
    if (message && message.content) {
      const contentLower = message.content.toLowerCase();
      
      // Check if message contains any of our topics
      for (const topic of topics) {
        if (contentLower.includes(topic.toLowerCase())) {
          // Found a match - this is a potential memory
          matches.push({
            content: message.content,
            topic: topic,
            distance: 0.1 // Very relevant since it's a direct match
          });
          break; // Don't add same message multiple times
        }
      }
    }
  });
  
  return matches.slice(0, 10); // Limit direct matches
}

// Generate current world context for real-world awareness
function generateCurrentWorldContext() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  const season = month >= 12 || month <= 2 ? 'winter' : 
                 month >= 3 && month <= 5 ? 'spring' :
                 month >= 6 && month <= 8 ? 'summer' : 'autumn';
  
  let context = `Date: ${now.toLocaleDateString('nl-NL')} (${season} ${year})
Location: Netherlands
Season: ${season} - ${season === 'winter' ? 'cold, need warm destinations' : 
                     season === 'spring' ? 'getting warmer, good travel season' :
                     season === 'summer' ? 'warm, peak travel season' : 'cooling down, fewer tourists'}`;

  // Add relevant current context
  if (month === 12) {
    context += `
Holiday context: December - Christmas season, year-end planning, winter break possible
Travel planning: Good time to plan warm destinations for early next year`;
  } else if (month >= 1 && month <= 3) {
    context += `
Travel context: Perfect time to escape cold weather, Southeast Asia ideal
Planning horizon: Spring/summer trips should be booked soon`;
  }
  
  // Add practical travel context
  context += `
Vietnam context: 
- Best time to visit: March-April or October-November
- Flight time from Netherlands: ~12 hours
- Typical trip length: 2-3 weeks for good experience
- Weather: Warm/hot year-round, avoid rainy season (May-September)
- Planning lead time: 6-8 weeks minimum for good flights/prices`;

  return context;
}

// Generate specific memory context for current conversation
function generateMemoryContext(specificMemories, currentMessage) {
  if (!specificMemories || specificMemories.length === 0) {
    return "No specific relevant memories found - respond based on general relationship familiarity";
  }
  
  const messageLower = currentMessage.toLowerCase();
  let context = "RELEVANT SHARED EXPERIENCES:\n";
  
  // Analyze what memories are most relevant to current message
  const relevantMemories = specificMemories.filter(memory => {
    const memoryLower = memory.toLowerCase();
    
    // If asking about Vietnam, prioritize Vietnam memories
    if (messageLower.includes('vietnam')) {
      return memoryLower.includes('vietnam') || memoryLower.includes('reis') || memoryLower.includes('vakantie');
    }
    
    // If asking about location, prioritize location memories
    if (messageLower.includes('waar') || messageLower.includes('adres') || messageLower.includes('woon')) {
      return memoryLower.includes('woon') || memoryLower.includes('verhuisd') || memoryLower.includes('adres');
    }
    
    // If asking about travel/plans
    if (messageLower.includes('wanneer') && (messageLower.includes('gaan') || messageLower.includes('naar'))) {
      return memoryLower.includes('gaan') || memoryLower.includes('plannen') || memoryLower.includes('reis');
    }
    
    return true; // Include all memories if no specific filter
  });
  
  if (relevantMemories.length > 0) {
    context += relevantMemories.slice(0, 3).map(memory => `- ${memory}`).join('\n');
    context += `\n\nUSE THESE MEMORIES: Reference these past experiences naturally in your response`;
  } else {
    context += specificMemories.slice(0, 3).map(memory => `- ${memory}`).join('\n');
    context += `\n\nCONTEXT AWARENESS: These experiences inform your relationship - use as background knowledge`;
  }
  
  return context;
}

// Enhanced relationship context with memory integration
function generateEnhancedRelationshipContext(session, conversationHistory, specificMemories) {
  let context = generateRelationshipContext(session, conversationHistory);
  
  // Add memory-based relationship insights
  if (specificMemories && specificMemories.length > 0) {
    const travelMemories = specificMemories.filter(m => 
      /vietnam|spanje|reis|vakantie|travel|trip/i.test(m)).length;
    const locationMemories = specificMemories.filter(m => 
      /woon|verhuisd|adres|huis|home/i.test(m)).length;
    const activityMemories = specificMemories.filter(m => 
      /samen|gedaan|geweest|met elkaar/i.test(m)).length;
    
    if (travelMemories > 0) {
      context += '\nYou have traveled together multiple times and plan trips together regularly';
    }
    if (locationMemories > 0) {
      context += '\nYou know each other\'s living situations and housing history';
    }
    if (activityMemories > 0) {
      context += '\nYou do activities together and have shared experiences';
    }
  }
  
  return context;
}

// Enhanced repetition detection with memory awareness
function detectRepetitiveResponses(conversationHistory, currentMessage) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { isRepetitive: false, suggestions: [], type: 'none' };
  }

  const recentMessages = conversationHistory
    .slice(-5) // Last 5 exchanges
    .map(conv => conv.userMessage.toLowerCase());

  const currentMessageLower = currentMessage.toLowerCase();
  
  // Check for repeated identical questions
  const identicalQuestions = recentMessages.filter(msg => 
    msg === currentMessageLower || 
    (msg.includes('wanneer') && msg.includes('vietnam') && currentMessageLower.includes('wanneer') && currentMessageLower.includes('vietnam'))
  );

  if (identicalQuestions.length > 0) {
    return {
      isRepetitive: true,
      type: 'identical_question',
      suggestions: [
        "User is asking the same question again. Acknowledge this with humor/memory.",
        "Reference your previous response while adding new context or details.",
        "Show continuity: 'haha je vraagt het steeds' or 'zoals ik zei...'",
        "Act like a real person who notices repeated questions."
      ]
    };
  }

  // Check for similar travel/planning questions
  if (currentMessageLower.includes('wanneer') && (currentMessageLower.includes('gaan') || currentMessageLower.includes('naar'))) {
    const similarTravelQuestions = recentMessages.filter(msg => 
      msg.includes('wanneer') && (msg.includes('gaan') || msg.includes('naar'))
    );
    
    if (similarTravelQuestions.length >= 2) {
      return {
        isRepetitive: true,
        type: 'travel_planning',
        suggestions: [
          "Multiple travel planning questions - show you're thinking about it actively.",
          "Reference past trips and compare to current planning.",
          "Show real-world awareness about timing, seasons, booking lead times."
        ]
      };
    }
  }

  // Check for location/where questions
  if (['waar', 'welke', 'welk'].some(word => currentMessageLower.includes(word))) {
    const locationQuestions = recentMessages.filter(msg => 
      ['waar', 'welke', 'welk'].some(word => msg.includes(word))
    );
    
    if (locationQuestions.length >= 2) {
      return {
        isRepetitive: true,
        type: 'location_questions',
        suggestions: [
          "Too many basic location questions - show familiarity instead.",
          "Don't ask obvious follow-up questions - act like you know them.",
          "Reference shared knowledge about places and locations."
        ]
      };
    }
  }

  return { isRepetitive: false, suggestions: [], type: 'none' };
}

// Function to enhance context with conversation flow analysis
function enhanceContextWithFlowAnalysis(conversationHistory, filteredContext) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return filteredContext;
  }

  // Analyze conversation flow
  const recentTopics = conversationHistory
    .slice(-3)
    .map(conv => ({
      userMessage: conv.userMessage.toLowerCase(),
      aiResponse: conv.aiResponse.toLowerCase(),
      timestamp: conv.createdAt || new Date()
    }));

  // Extract key topics from recent conversation
  const topics = [];
  recentTopics.forEach(conv => {
    if (conv.userMessage.includes('woon') || conv.aiResponse.includes('woon')) topics.push('living situation');
    if (conv.userMessage.includes('werk') || conv.aiResponse.includes('werk')) topics.push('work');
    if (conv.userMessage.includes('chipsoft') || conv.aiResponse.includes('chipsoft')) topics.push('chipsoft job');
    if (conv.userMessage.includes('zuipen') || conv.aiResponse.includes('zuipen')) topics.push('drinking plans');
  });

  // Add conversation flow context
  const flowContext = `CONVERSATION FLOW ANALYSIS:
Recent topics discussed: ${[...new Set(topics)].join(', ')}
Current conversation seems to be about: ${topics[topics.length - 1] || 'general chat'}
Number of recent exchanges: ${recentTopics.length}

IMPORTANT: Use this context to maintain conversation flow and avoid repeating information.`;

  return filteredContext + '\n\n' + flowContext;
}

// Cleanup old sessions (run periodically)
const cleanupSessions = async () => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > maxAge) {
      try {
        // Delete Qdrant collection
        await vectorStore.deleteCollection(session.collectionName);
        
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
      collection = await vectorStore.getCollection(session.collectionName);
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
    const results = await vectorStore.search(session.collectionName, {
      query: queryEmbedding,
      topK: limit
    });
    const context = results.map(doc => doc.payload.content);
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
  console.log('Make sure Weaviate is running on http://localhost:8080 (or set WEAVIATE_HOST)');
});