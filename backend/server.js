const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ChromaClient } = require('chromadb');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  path: process.env.CHROMA_URL || 'http://localhost:8000'
});

// Middleware
app.use(cors());
app.use(express.json());

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

// Utility function to parse WhatsApp messages
function parseWhatsAppFile(text, selectedPerson) {
  const lines = text.split('\n').filter(line => line.trim());
  const messagePattern = /^\[\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}:\d{2}\s?[AP]?M?\]\s*([^:]+):\s*(.+)$/;
  
  const messages = [];
  
  lines.forEach(line => {
    const match = line.match(messagePattern);
    if (match) {
      const [, sender, content] = match;
      const cleanSender = sender.trim();
      
      // Only keep messages from the selected person
      if (cleanSender === selectedPerson) {
        messages.push({
          sender: cleanSender,
          content: content.trim(),
          timestamp: line.substring(1, line.indexOf(']'))
        });
      }
    }
  });
  
  return messages;
}

// Utility function to create embeddings
async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

// Upload and process WhatsApp file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { selectedPerson, personName } = req.body;
    if (!selectedPerson || !personName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sessionId = uuidv4();
    const fileContent = req.file.buffer.toString('utf-8');
    
    // Parse WhatsApp messages
    const messages = parseWhatsAppFile(fileContent, selectedPerson);
    
    if (messages.length === 0) {
      return res.status(400).json({ error: 'No messages found for the selected person' });
    }

    // Create ChromaDB collection for this session
    const collection = await chromaClient.createCollection({
      name: `session_${sessionId}`,
      metadata: { personName, messageCount: messages.length }
    });

    // Create embeddings and store in ChromaDB
    const embeddings = [];
    const documents = [];
    const metadatas = [];
    const ids = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        const embedding = await createEmbedding(message.content);
        embeddings.push(embedding);
        documents.push(message.content);
        metadatas.push({
          timestamp: message.timestamp,
          sender: message.sender
        });
        ids.push(`msg_${i}`);
      } catch (error) {
        console.error(`Error creating embedding for message ${i}:`, error);
        // Continue with other messages
      }
    }

    if (embeddings.length === 0) {
      return res.status(500).json({ error: 'Failed to create embeddings' });
    }

    // Add to ChromaDB
    await collection.add({
      embeddings,
      documents,
      metadatas,
      ids
    });

    // Store session data
    sessions.set(sessionId, {
      personName,
      selectedPerson,
      messageCount: messages.length,
      collectionName: `session_${sessionId}`,
      createdAt: new Date(),
      lastActivity: new Date()
    });

    res.json({ sessionId, messageCount: messages.length });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

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

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Missing sessionId or message' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update last activity
    session.lastActivity = new Date();

    // Get the collection
    const collection = await chromaClient.getCollection({
      name: session.collectionName
    });

    // Create embedding for user message
    const userEmbedding = await createEmbedding(message);

    // Query similar messages
    const results = await collection.query({
      queryEmbeddings: [userEmbedding],
      nResults: 5
    });

    // Build context from similar messages
    const relevantMessages = results.documents[0] || [];
    const context = relevantMessages.slice(0, 3).join('\n');

    // Generate response using OpenAI
    const systemPrompt = `You are ${session.personName}, speaking as if you are still here with your loved one. Respond in their authentic voice and style based on the context of previous messages. Be warm, caring, and maintain their personality. Keep responses natural and conversational.

Context from previous conversations:
${context}

Respond as ${session.personName} would, staying true to their character and the relationship you shared.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || "I'm here with you, always.";

    res.json({ response });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      response: "I'm having trouble finding the right words right now, but know that I'm always here with you in spirit."
    });
  }
});

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

app.listen(port, () => {
  console.log(`EchoSoul backend server running on port ${port}`);
  console.log('Make sure ChromaDB is running on http://localhost:8000');
});