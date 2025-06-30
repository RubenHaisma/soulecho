import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { parseWhatsAppFile } from '@/lib/whatsapp-parser';
import { createBatchEmbeddings, createEmbedding } from '@/lib/embeddings';
import { weaviateClient } from '@/lib/weaviate-client';
import { progressStore } from '@/lib/progress-store';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic Claude for language detection
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📤 Starting file upload process...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const selectedPerson = formData.get('selectedPerson') as string;
    const personName = formData.get('personName') as string;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!selectedPerson || !personName) {
      return NextResponse.json({ 
        error: 'Missing required fields: selectedPerson and personName' 
      }, { status: 400 });
    }

    console.log(`👤 Processing file for: ${personName} (${selectedPerson})`);
    console.log(`📄 File size: ${(file.size / 1024).toFixed(1)} KB`);

    const sessionId = uuidv4();
    const uploadId = uuidv4();
    const fileContent = await file.text();

    // Initialize progress tracking FIRST
    const initialProgress = {
      stage: 'reading' as const,
      progress: 5,
      message: 'Reading and validating file...',
      total: 0,
      processed: 0
    };
    progressStore.set(uploadId, initialProgress);
    console.log(`📊 Set initial progress for ${uploadId}:`, initialProgress);

    // Process asynchronously to avoid timeout (start immediately)
    processFileAsync(sessionId, uploadId, fileContent, selectedPerson, personName, userId);

    // Return response after starting processing
    return NextResponse.json({
      sessionId,
      uploadId,
      status: 'processing'
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
          return NextResponse.json({ 
        error: 'Backend server unavailable. Please check if the backend server is running.' 
      }, { status: 503 });
  }
}

// Utility: Detect dominant language(s) using Claude
async function detectLanguages(messages: any[]): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Anthropic API key not configured, using default language');
    return ['unknown'];
  }
  if (!messages || messages.length === 0) return ['unknown'];
  
  // Use up to 10 sample messages for detection
  const sample = messages.slice(0, 10).map(m => m.content).join('\n');
  const prompt = `Detect the language(s) used in the following WhatsApp messages. Reply with a comma-separated list of language names (in English, e.g. 'Dutch, Danish, English').\n\nMessages:\n${sample}`;
  
  try {
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 30,
      temperature: 0,
      system: 'You are a language detection expert.',
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    const contentBlock = completion.content[0];
    const langs = (contentBlock && 'text' in contentBlock) ? contentBlock.text : 'unknown';
    return langs.split(',').map((l: string) => l.trim()).filter(Boolean);
  } catch (error) {
    console.error('❌ Claude language detection failed:', error);
    return ['unknown'];
  }
}

// Generate comprehensive statistical analysis of messages
function generateMessageStatistics(messages: any[]) {
  if (!messages || messages.length === 0) return null;
  
  const stats = {
    total_messages: messages.length,
    length_stats: {} as any,
    punctuation_stats: {} as any,
    pattern_stats: {} as any,
  };
  
  // Analyze message lengths
  const lengths = messages.map(msg => msg.content.length);
  const wordCounts = messages.map(msg => msg.content.split(/\s+/).length);
  
  stats.length_stats = {
    avg_characters: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
    avg_words: Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length),
    very_short_percent: Math.round((lengths.filter(l => l <= 10).length / lengths.length) * 100),
  };
  
  // Analyze punctuation patterns
  const allText = messages.map(msg => msg.content).join(' ');
  stats.punctuation_stats = {
    messages_without_punctuation_percent: Math.round((messages.filter(msg => 
      !msg.content.match(/[.!?]$/)
    ).length / messages.length) * 100)
  };
  
  // Analyze specific patterns
  stats.pattern_stats = {
    emoji_usage_percent: Math.round((messages.filter(msg => 
      /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]/.test(msg.content)
    ).length / messages.length) * 100),
    
    one_word_messages_percent: Math.round((messages.filter(msg => 
      msg.content.trim().split(/\s+/).length === 1
    ).length / messages.length) * 100)
  };
  
  return stats;
}

// Async processing function
async function processFileAsync(
  sessionId: string, 
  uploadId: string, 
  fileContent: string, 
  selectedPerson: string, 
  personName: string, 
  userId: string
) {
  const startTime = Date.now();
  
  try {
    // Immediately update progress to show processing has started
    const startProgress = {
      stage: 'reading' as const,
      progress: 10,
      message: 'Starting file analysis...',
      total: 0,
      processed: 0
    };
    progressStore.set(uploadId, startProgress);
    console.log(`📊 Set start progress for ${uploadId}:`, startProgress);
    // Validate file content
    if (!fileContent || fileContent.trim().length === 0) {
      progressStore.set(uploadId, {
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
    progressStore.set(uploadId, {
      stage: 'parsing',
      progress: 15,
      message: 'Parsing WhatsApp messages...',
      total: 0,
      processed: 0
    });
    
    const messages = parseWhatsAppFile(fileContent, selectedPerson);
    
    if (messages.length === 0) {
      progressStore.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: `No messages found for "${selectedPerson}". Please check the name spelling.`,
        total: 0,
        processed: 0
      });
      return;
    }

    if (messages.length < 10) {
      progressStore.set(uploadId, {
        stage: 'error',
        progress: 0,
        message: `Only ${messages.length} messages found. Need more messages for better AI responses.`,
        total: messages.length,
        processed: 0
      });
      return;
    }

    console.log(`✅ Found ${messages.length} messages from ${selectedPerson}`);
    
    progressStore.set(uploadId, {
      stage: 'parsing',
      progress: 25,
      message: `Found ${messages.length} messages`,
      total: messages.length,
      processed: 0
    });

    // Create Weaviate collection for this session
    console.log('🗄️  Creating vector database collection...');
    const collectionName = `session_${sessionId}`;
    try {
      // Check if collection exists
      try {
        await weaviateClient.getCollection(collectionName);
        console.log(`🗄️  Collection "${collectionName}" already exists.`);
      } catch (error) {
        // If not, create it
        console.log(`🗄️  Collection "${collectionName}" not found, creating...`);
        await weaviateClient.createCollection(collectionName, {
          vectors: {
            size: 1536, // for text-embedding-3-small
            distance: 'Cosine'
          }
        });
        console.log(`🗄️  Collection "${collectionName}" created.`);
      }
    } catch (error) {
      throw error;
    }

    // Create embeddings and store in Weaviate with progress tracking
    console.log('🧠 Creating embeddings...');
    progressStore.set(uploadId, {
      stage: 'analyzing',
      progress: 30,
      message: 'Creating embeddings for AI analysis...',
      total: messages.length,
      processed: 0
    });
    
    const embeddings: number[][] = [];
    const metadatas: any[] = [];
    const ids: string[] = [];
    let embeddingErrors = 0;

    // Process in batches for better performance
    const batchSize = 100;
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
          metadatas.push({
            timestamp: message.timestamp,
            sender: message.sender,
            index: messageIndex,
            content: message.content
          });
          ids.push(uuidv4());
        }
        
        // Update progress for entire batch
        const processed = Math.min(endIndex, messages.length);
        const progress = 30 + Math.round((processed / messages.length) * 50); // 30-80%
        const batchProgress = {
          stage: 'analyzing' as const,
          progress,
          message: `Analyzing conversation... (${processed.toLocaleString()}/${messages.length.toLocaleString()})`,
          total: messages.length,
          processed
        };
        progressStore.set(uploadId, batchProgress);
        console.log(`📊 Set batch progress for ${uploadId}:`, batchProgress);
        
        console.log(`📊 Batch ${batchIndex + 1} complete: ${processed}/${messages.length} messages processed`);
        
      } catch (error: any) {
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
            metadatas.push({
              timestamp: message.timestamp,
              sender: message.sender,
              index: messageIndex,
              content: message.content
            });
            ids.push(uuidv4());
            embeddingErrors--; // Reduce error count for successful fallback
          } catch (error) {
            console.error(`❌ Failed individual fallback for message ${messageIndex}:`, error);
          }
        }
      }
    }

    if (embeddings.length === 0) {
      progressStore.set(uploadId, {
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

    // Store embeddings in Weaviate
    console.log('💾 Storing embeddings in vector database...');
    progressStore.set(uploadId, {
      stage: 'finalizing',
      progress: 85,
      message: 'Storing in vector database...',
      total: messages.length,
      processed: messages.length
    });
    
    // Store in smaller chunks to avoid memory issues
    const storageChunkSize = 100;
    const totalChunks = Math.ceil(embeddings.length / storageChunkSize);
    
    console.log(`💾 Storing ${embeddings.length} embeddings in ${totalChunks} chunks`);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startIndex = chunkIndex * storageChunkSize;
      const endIndex = Math.min(startIndex + storageChunkSize, embeddings.length);
      
      const chunkEmbeddings = embeddings.slice(startIndex, endIndex);
      const chunkMetadatas = metadatas.slice(startIndex, endIndex);
      const chunkIds = ids.slice(startIndex, endIndex);
      
      console.log(`💾 Storing chunk ${chunkIndex + 1}/${totalChunks} (${chunkEmbeddings.length} embeddings)`);
      
      await weaviateClient.upsert(collectionName, {
        points: chunkEmbeddings.map((vector, i) => ({
          id: chunkIds[i],
          vector: vector,
          payload: chunkMetadatas[i]
        }))
      });
      
      // Update progress for storage
      const storageProgress = 85 + Math.round((chunkIndex + 1) / totalChunks * 10); // 85-95%
      progressStore.set(uploadId, {
        stage: 'finalizing',
        progress: storageProgress,
        message: `Storing in vector database... (${chunkIndex + 1}/${totalChunks} chunks)`,
        total: messages.length,
        processed: messages.length
      });
    }

    // Detect language(s) and generate statistics
    progressStore.set(uploadId, {
      stage: 'finalizing',
      progress: 92,
      message: 'Detecting languages and generating statistics...',
      total: messages.length,
      processed: messages.length
    });

    const detectedLanguages = await detectLanguages(messages);
    console.log('🌐 Detected language(s):', detectedLanguages);

    // Generate comprehensive statistical analysis
    const messageStats = generateMessageStatistics(messages);
    console.log(`📊 Generated statistics for ${personName}:`, messageStats);

    // Create chat session in database
    progressStore.set(uploadId, {
      stage: 'finalizing',
      progress: 95,
      message: 'Finalizing session...',
      total: messages.length,
      processed: messages.length
    });

    try {
      if (userId) {
        // Create chat session in database
        const chatSession = await prisma.chatSession.create({
          data: {
            id: sessionId,
            userId,
            personName,
            selectedPerson,
            messageCount: messages.length,
            collectionName: `session_${sessionId}`,
            detectedLanguages: detectedLanguages,
            createdAt: new Date(),
            lastActivity: new Date(),
            isActive: true,
          },
        });

        console.log(`💾 Created chat session: ${chatSession.id} for ${personName}`);
      }
    } catch (error: any) {
      console.warn('⚠️ Error saving chat session:', error.message);
      // Continue processing even if session creation fails
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 Upload completed in ${processingTime}s - Session: ${sessionId}`);

    // Mark as complete
    progressStore.set(uploadId, {
      stage: 'complete',
      progress: 100,
      message: 'Ready to chat!',
      total: messages.length,
      processed: messages.length
    });

  } catch (error: any) {
    console.error('❌ Processing error:', error);
    
    // Set error state in progress
    progressStore.set(uploadId, {
      stage: 'error',
      progress: 0,
      message: error.message.includes('API key') ? 'OpenAI API configuration error' :
               error.message.includes('Weaviate') ? 'Vector database error' :
               error.message.includes('embedding') ? 'Failed to process messages for AI' :
               'Failed to process file',
      total: 0,
      processed: 0
    });
  }
}