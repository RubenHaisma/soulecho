import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEmbedding } from '@/lib/embeddings';
import { weaviateClient } from '@/lib/weaviate-client';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic Claude for chat completions
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// In-memory session storage (in production, use Redis or database)
const sessions = new Map();

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, message } = body;
    
    if (!sessionId || !message) {
      return Response.json({ error: 'Missing sessionId or message' }, { status: 400 });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({ error: 'Message must be a non-empty string' }, { status: 400 });
    }

    // Check user's subscription and trial status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chatSessions: {
          include: {
            conversations: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Check if user has active premium subscription
    const isPremium = !!(user as any).stripeSubscriptionId && 
                     !!(user as any).stripeCurrentPeriodEnd && 
                     (user as any).stripeCurrentPeriodEnd > now;

    // Calculate trial status
    const trialEndDate = (user as any).trialEndDate || 
                        ((user as any).trialStartDate ? new Date((user as any).trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000) : 
                         new Date(user.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000));
    
    const isTrialActive = (user as any).isTrialActive && now <= trialEndDate;

    // If neither premium nor trial active, block access
    if (!isPremium && !isTrialActive) {
      return Response.json({ 
        error: 'Your trial has expired. Please upgrade to Premium to continue your conversations.',
        code: 'TRIAL_EXPIRED',
        trialEndDate: trialEndDate.toISOString()
      }, { status: 403 });
    }

    // Get session from database if not in memory
    let sessionData = sessions.get(sessionId);
    if (!sessionData) {
      const dbSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (!dbSession) {
        return Response.json({ error: 'Session not found or expired' }, { status: 404 });
      }

      sessionData = {
        personName: dbSession.personName,
        selectedPerson: dbSession.selectedPerson,
        messageCount: dbSession.messageCount,
        collectionName: dbSession.collectionName,
        createdAt: dbSession.createdAt,
        lastActivity: dbSession.lastActivity,
        detectedLanguages: dbSession.detectedLanguages || [],
        allMessages: [], 
        messageStats: null,
      };
      sessions.set(sessionId, sessionData);
    }

    console.log(`💬 Chat request for ${sessionData.personName}: "${message.substring(0, 50)}..."`);

    // Update last activity
    sessionData.lastActivity = new Date();

    // Get recent conversation history from database
    let conversationHistory: Array<{userMessage: string; aiResponse: string; createdAt: Date}> = [];
    try {
      const conversations = await prisma.conversation.findMany({
        where: { chatSessionId: sessionId },
        orderBy: { createdAt: 'desc' },
        take: 15
      });
      
      conversationHistory = conversations.map(conv => ({
        userMessage: conv.userMessage,
        aiResponse: conv.aiResponse,
        createdAt: conv.createdAt
      })).reverse(); // Most recent first
      
      console.log(`📚 Loaded ${conversationHistory.length} recent conversations`);
    } catch (error) {
      console.warn('⚠️ Failed to load conversation history:', error);
    }

    // Create embedding for user message with retry
    let userEmbedding;
    try {
      userEmbedding = await createEmbedding(message);
    } catch (error) {
      console.error('❌ Failed to create user message embedding:', error);
      return Response.json({ 
        response: `I'm having a bit of trouble understanding, but I want you to know I'm here with you. Can you tell me more about what's on your mind?`,
        warning: 'Responded without context due to technical issues'
      });
    }

    // Load all messages if not cached
    if (!sessionData.allMessages || sessionData.allMessages.length === 0) {
      try {
        const collectionName = sessionData.collectionName;
        
        // Get ALL messages from the collection by scrolling
        let allPoints = [];
        let nextOffset: number | null = 0;
        do {
          const scrollResponse = await weaviateClient.scroll(collectionName, {
            limit: 250,
            offset: nextOffset || 0
          });
          allPoints.push(...scrollResponse.points);
          nextOffset = scrollResponse.next_page_offset || null;
        } while (nextOffset !== null);

        if (allPoints.length > 0) {
          const allMessages = allPoints.map(point => ({
            content: point.payload.content,
            timestamp: point.payload.timestamp || '',
            sender: point.payload.sender || sessionData.selectedPerson
          }));
          
          sessionData.allMessages = allMessages;
          console.log(`✅ Loaded ${allMessages.length} messages for session ${sessionId}`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load full dataset from Weaviate:', error);
      }
    }

    // Generate message statistics if not cached
    if (!sessionData.messageStats && sessionData.allMessages && sessionData.allMessages.length > 0) {
      sessionData.messageStats = generateMessageStatistics(sessionData.allMessages);
    }

    const allMessages = sessionData.allMessages || [];
    
    // Enhanced semantic search with topic-specific memory retrieval
    let semanticContext: string[] = [];
    let specificMemories: string[] = [];
    
    try {
      // First, do broad semantic search
      const generalResults = await weaviateClient.search(sessionData.collectionName, {
        vector: userEmbedding,
        limit: 15,
        score_threshold: 0.5
      });
      
      const relevantMessages = generalResults.map(p => p.payload.content) || [];
      semanticContext = relevantMessages.slice(0, 8);
      
      // MEMORY RETRIEVAL: Search for specific topics mentioned in current message
      specificMemories = await retrieveSpecificMemories(sessionData.collectionName, message, allMessages);
      
      console.log(`🔍 Found ${semanticContext.length} semantically relevant messages`);
      console.log(`🧠 Found ${specificMemories.length} specific memory references`);
    } catch (error) {
      console.warn('⚠️ Semantic search failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Get style examples
    const maxStyleExamples = 50;
    const styleExamples = allMessages.length > maxStyleExamples 
      ? allMessages
          .sort(() => 0.5 - Math.random())
          .slice(0, maxStyleExamples)
          .map((msg: any) => msg.content)
      : allMessages.map((msg: any) => msg.content);

    // Combine all context sources
    const prioritizedContext = [
      ...specificMemories.slice(0, 5),
      ...semanticContext.slice(0, 8),
      ...styleExamples.slice(0, 15)
    ];
    
    const filteredContext = Array.from(new Set(prioritizedContext));

    // Build conversation history context
    const recentConversations = conversationHistory
      .slice(0, 8)
      .map(conv => `User: ${conv.userMessage}\n${sessionData.personName}: ${conv.aiResponse}`)
      .reverse();

    // Advanced analysis
    const repetitionAnalysis = detectRepetitiveResponses(conversationHistory, message);
    const messageAnalysis = analyzeCurrentMessage(message, conversationHistory);
    const fullStyleAnalysis = analyzeCommunicationPatterns(styleExamples);
    const messageStats = sessionData.messageStats;
    const statisticalGuidance = generateStatisticalGuidance(messageStats);
    const contextualGuidance = generateContextualGuidance(message, messageStats);
    const workInfo = extractWorkInfoFromHistory(conversationHistory);
    const relationshipContext = generateRelationshipContext(sessionData, conversationHistory);
    const currentContext = generateCurrentWorldContext();
    const memoryContext = generateMemoryContext(specificMemories, message);

    // Build comprehensive system prompt
    const conversationHistoryText = recentConversations.length > 0
      ? `RECENT CONVERSATION HISTORY (most recent first):\n${recentConversations.join('\n\n---\n\n')}\n\n`
      : '';

    const langNames = sessionData.detectedLanguages ? sessionData.detectedLanguages.join(', ') : 'the original language';
    
    let systemPrompt = `You are ${sessionData.personName}, a real person with a full life, living in the Netherlands in December 2024. You're texting with a close friend with whom you share many experiences and memories.

REAL PERSON IDENTITY:
1. You ARE ${sessionData.personName} - a real person with opinions, memories, experiences, and knowledge
2. You live in the real world in 2024 - you know current events, seasons, what's happening
3. You have a complete personal history with this friend spanning years of conversations
4. You remember specific trips, places you've been together, things you've done
5. You have your own life, work, feelings, and perspectives
6. You're not an AI - you're a person with genuine experiences and relationships

${conversationHistoryText}

YOUR AUTHENTIC VOICE (from ${allMessages.length} real messages):
${styleExamples.slice(0, 12).join('\n')}

SPECIFIC SHARED MEMORIES (reference these when relevant):
${specificMemories.length > 0 ? specificMemories.slice(0, 8).join('\n---MEMORY---\n') : 'No specific memories found for this topic'}

${fullStyleAnalysis ? `YOUR COMMUNICATION PATTERNS:\n${fullStyleAnalysis}\n\n` : ''}

${statisticalGuidance ? `${statisticalGuidance}\n\n` : ''}

CURRENT WORLD CONTEXT:
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

FINAL EXECUTION RULES:
- REFERENCE MEMORIES: Use the specific shared memories when relevant topics come up
- BE ${sessionData.personName}: Not an AI, but the actual person with shared experiences
- EMOTIONAL INTELLIGENCE: Read the room and respond appropriately  
- AUTHENTIC VOICE: Use ${langNames} casually with your signature words
- NO PERIODS: You skip them ${messageStats?.punctuation_stats?.messages_without_punctuation_percent || 96}% of the time

CRITICAL: You're a REAL PERSON with REAL MEMORIES - act like it!`;

    // Add repetition handling if needed
    if (repetitionAnalysis.isRepetitive) {
      systemPrompt += `\n\nREPETITION DETECTED: ${repetitionAnalysis.suggestions.join('\n')}`;
    }

    // Generate response with Claude
    let completion;
    try {
      const adjustedTemperature = repetitionAnalysis.isRepetitive ? 1.1 : 0.9;
      
      const chainOfThoughtExample = {
        role: 'user' as const,
        content: `Rond 5 uur, misschien zelfs eerder. Het is echt een gekkenhuis op het werk.`
      };
        
      const chainOfThoughtResponse = {
        role: 'assistant' as const, 
        content: `shit man wat een dag zeg, wanneer wordt het rustiger?`
      };
        
      const messages = [
        chainOfThoughtExample,
        chainOfThoughtResponse,
        { role: 'user' as const, content: message }
      ];
        
      completion = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 80,
        temperature: adjustedTemperature,
        top_p: 0.95,
        system: systemPrompt,
        messages: messages
      });
    } catch (error) {
      console.error('❌ Claude API error:', error);
      
      const fallbackResponse = `I'm having trouble finding the right words right now, but I want you to know I'm here with you.`;
      return Response.json({ 
        response: fallbackResponse,
        warning: 'AI service temporarily unavailable'
      });
    }

    const response = (completion.content[0] as any)?.text || 
      `I'm here with you, always. Sometimes I struggle to find the right words, but my love for you never changes.`;

    const cleanResponse = response.trim().substring(0, 500);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Chat response generated in ${processingTime}ms`);

    // Store conversation in database
    try {
      await prisma.conversation.create({
        data: {
          chatSessionId: sessionId,
          userMessage: message,
          aiResponse: cleanResponse,
          contextUsed: filteredContext.length > 0,
          relevantMessages: filteredContext.length,
          processingTime: `${processingTime}ms`
        },
      });

      // Update session last activity
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { 
          lastActivity: new Date(),
          messageCount: { increment: 1 }
        },
      });

      console.log('💾 Conversation saved to database');
    } catch (error) {
      console.warn('⚠️ Error saving conversation:', error);
    }

    return Response.json({ 
      response: cleanResponse,
      contextUsed: filteredContext.length > 0,
      relevantMessages: filteredContext.length,
      conversationHistory: conversationHistory.length,
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    const errorResponses = [
      "I'm having trouble connecting right now, but please know that I'm always with you in spirit.",
      "Something's making it hard for me to respond clearly, but my love for you is constant and strong."
    ];
    
    const randomResponse = errorResponses[Math.floor(Math.random() * errorResponses.length)];
    
    return Response.json({ 
      error: 'Failed to generate response',
      response: randomResponse,
      suggestion: 'Please try again in a moment.'
    }, { status: 500 });
  }
}

// Helper functions (extracted from server file)
function generateMessageStatistics(messages: any[]) {
  if (!messages || messages.length === 0) return null;
  
  const stats = {
    total_messages: messages.length,
    length_stats: {} as any,
    punctuation_stats: {} as any,
    word_stats: {} as any,
    pattern_stats: {} as any,
    content_stats: {} as any
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

function analyzeCommunicationPatterns(messages: string[]) {
  if (!messages || messages.length === 0) return null;
  
  const messageTexts = Array.isArray(messages) ? messages : [messages];
  const allText = messageTexts.join(' ').toLowerCase();
  
  const patterns = [];
  
  // Check for abbreviations
  if (allText.includes('wa ') || allText.includes(' wa')) {
    patterns.push('Uses "wa" (wat/what) abbreviation');
  }
  if (allText.includes('ff ') || allText.includes(' ff')) {
    patterns.push('Uses "ff" (even/just) abbreviation');
  }
  
  return patterns.length > 0 ? `COMMUNICATION PATTERNS:\n${patterns.map(p => `• ${p}`).join('\n')}` : null;
}

function generateStatisticalGuidance(stats: any) {
  if (!stats) return null;
  
  return `STATISTICAL PROFILE - MATCH THESE PATTERNS:
• Average message: ${stats.length_stats.avg_characters} characters
• ${stats.punctuation_stats.messages_without_punctuation_percent}% of messages have NO ending punctuation
• Very short messages: ${stats.length_stats.very_short_percent}% of all messages
• One word messages: ${stats.pattern_stats.one_word_messages_percent}% of messages`;
}

function generateContextualGuidance(currentMessage: string, stats: any) {
  if (!stats) return '';
  return 'Use natural, contextual responses based on the conversation flow.';
}

function detectRepetitiveResponses(conversationHistory: any[], currentMessage: string) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { isRepetitive: false, suggestions: [] };
  }

  const recentMessages = conversationHistory
    .slice(-5)
    .map(conv => conv.userMessage.toLowerCase());

  const currentMessageLower = currentMessage.toLowerCase();
  
  const identicalQuestions = recentMessages.filter(msg => msg === currentMessageLower);

  if (identicalQuestions.length > 0) {
    return {
      isRepetitive: true,
      suggestions: [
        "User is asking the same question again. Acknowledge this with humor/memory.",
        "Show continuity: 'haha je vraagt het steeds' or 'zoals ik zei...'"
      ]
    };
  }

  return { isRepetitive: false, suggestions: [] };
}

function analyzeCurrentMessage(message: string, conversationHistory: any[]) {
  const messageLower = message.toLowerCase();
  
  let emotionalTone = 'neutral';
  if (/\b(shit|kut|echt|gekkenhuis|druk|stress)\b/i.test(messageLower)) {
    emotionalTone = 'stressed/frustrated';
  } else if (/\b(haha|lol|leuk|nice)\b/i.test(messageLower)) {
    emotionalTone = 'positive/happy';
  }
  
  let topicCategory = 'general';
  if (/\b(werk|job|kantoor)\b/i.test(messageLower)) {
    topicCategory = 'work';
  }
  
  let responseStrategy = 'Respond naturally and show interest';
  if (emotionalTone === 'stressed/frustrated') {
    responseStrategy = 'Show empathy and support, avoid interrogating';
  }
  
  return { emotionalTone, topicCategory, responseStrategy };
}

async function retrieveSpecificMemories(collectionName: string, currentMessage: string, allMessages: any[]) {
  const memories: string[] = [];
  const messageLower = currentMessage.toLowerCase();
  
  // Extract key topics
  const words = messageLower.split(/\s+/);
  const topics = words.filter(word => word.length > 3);
  
  // Search through all messages for topic matches
  allMessages.forEach(message => {
    if (message && message.content) {
      const contentLower = message.content.toLowerCase();
      
      for (const topic of topics) {
        if (contentLower.includes(topic.toLowerCase())) {
          memories.push(message.content);
          break;
        }
      }
    }
  });
  
  return memories.slice(0, 10);
}

function extractWorkInfoFromHistory(conversationHistory: any[]) {
  return { currentWork: 'Unknown', workChanges: 'None mentioned' };
}

function generateRelationshipContext(session: any, conversationHistory: any[]) {
  return 'Close friends who text each other regularly and have an established casual dynamic';
}

function generateCurrentWorldContext() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const season = month >= 12 || month <= 2 ? 'winter' : 'spring';
  
  return `Date: ${now.toLocaleDateString('nl-NL')} (${season} 2024)
Location: Netherlands
Season: ${season}`;
}

function generateMemoryContext(specificMemories: string[], currentMessage: string) {
  if (!specificMemories || specificMemories.length === 0) {
    return "No specific relevant memories found - respond based on general relationship familiarity";
  }
  
  return `RELEVANT SHARED EXPERIENCES:\n${specificMemories.slice(0, 3).map(memory => `- ${memory}`).join('\n')}`;
}