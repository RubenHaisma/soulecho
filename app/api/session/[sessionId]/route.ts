import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { weaviateClient } from '@/lib/weaviate-client';

// In-memory session storage (shared with chat route)
const sessions = new Map();

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ sessionId: string }>   }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sessionData = sessions.get(sessionId);
    if (!sessionData) {
      console.log(`Session not in memory, trying to load from DB: ${sessionId}`);
      const dbSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (dbSession) {
        console.log(`Session found in DB, loading into memory: ${sessionId}`);
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
      } else {
        return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
      }
    }

    // If session doesn't have full messages loaded, try to load them from Weaviate
    if (!sessionData.allMessages || sessionData.allMessages.length === 0) {
      console.log(`📚 Loading full dataset for session ${sessionId}...`);
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
          
          // Update session with full dataset
          sessionData.allMessages = allMessages;
          sessions.set(sessionId, sessionData);
          
          console.log(`✅ Loaded ${allMessages.length} messages for session ${sessionId}`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load full dataset from Weaviate:', (error as Error).message);
      }
    }

    // Generate message statistics if not cached
    if (!sessionData.messageStats && sessionData.allMessages && sessionData.allMessages.length > 0) {
      console.log(`📊 Generating message statistics for session ${sessionId}...`);
      sessionData.messageStats = generateMessageStatistics(sessionData.allMessages);
      sessions.set(sessionId, sessionData);
    }

    return NextResponse.json({
      sessionId,
      personName: sessionData.personName,
      selectedPerson: sessionData.selectedPerson,
      messageCount: sessionData.messageCount || 0,
      collectionName: sessionData.collectionName,
      lastActivity: sessionData.lastActivity,
      detectedLanguages: sessionData.detectedLanguages || [],
      datasetSize: sessionData.allMessages ? sessionData.allMessages.length : 0,
      messageStats: sessionData.messageStats ? {
        avgLength: sessionData.messageStats.length_stats?.avg_characters,
        avgWords: sessionData.messageStats.length_stats?.avg_words,
        veryShortPercent: sessionData.messageStats.length_stats?.very_short_percent,
        noPunctuationPercent: sessionData.messageStats.punctuation_stats?.messages_without_punctuation_percent,
        emojiUsagePercent: sessionData.messageStats.pattern_stats?.emoji_usage_percent,
        oneWordPercent: sessionData.messageStats.pattern_stats?.one_word_messages_percent
      } : null
    });

  } catch (error) {
    console.error('❌ Session endpoint error:', error);
    return NextResponse.json({ error: 'Failed to get session information' }, { status: 500 });
  }
}

// Generate comprehensive message statistics
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
  
  // Analyze specific patterns
  stats.pattern_stats = {
    emoji_usage_percent: Math.round((messages.filter(msg => 
      /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]/.test(msg.content)
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
  
  return stats;
}