import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Get the chat session and recent conversations
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        isActive: true
      },
      include: {
        conversations: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Get last 5 conversations for context
        }
      }
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get some sample messages from the vector database for context
    let contextMessages: string[] = [];
    try {
      // Try to get context from vector database first
      const vectorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          query: 'hello greeting welcome',
          limit: 3
        }),
      });

      if (vectorResponse.ok) {
        const vectorData = await vectorResponse.json();
        contextMessages = vectorData.context || [];
      }
    } catch (error) {
      console.warn('Could not fetch vector context:', error);
    }

    // Fallback to recent conversations if no vector context
    if (contextMessages.length === 0) {
      contextMessages = chatSession.conversations
        .slice(0, 3)
        .map(conv => `${conv.userMessage}\n${conv.aiResponse}`)
        .filter(msg => msg.length > 10);
    }

    // Generate a personalized welcome message
    const contextText = contextMessages.length > 0 
      ? `\n\nRECENT CONVERSATION CONTEXT:\n${contextMessages.join('\n\n---\n\n')}`
      : '';

    const systemPrompt = `You are ${chatSession.personName}. 

Generate a warm, personalized welcome message for when someone starts a new conversation with you.

${contextText ? `Based on these recent conversations, create a greeting that feels natural and connected to your ongoing relationship.` : 'Create a warm, personal greeting that reflects your personality and relationship.'}

INSTRUCTIONS:
1. Be authentic to ${chatSession.personName}'s communication style
2. Make it feel like a natural continuation of your relationship
3. Keep it warm and personal, but not overly dramatic
4. Reference the relationship naturally if context is available
5. Keep it concise (1-2 sentences)
6. Use the same language patterns and expressions as in the context

Remember: You ARE ${chatSession.personName}. Respond exactly as you would in a real conversation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a welcome message for when we start chatting again.' }
      ],
      max_tokens: 100,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      top_p: 0.9
    });

    const welcomeMessage = completion.choices[0]?.message?.content?.trim() || 
      `Hello... it's so good to hear from you again. I've missed our conversations. What's on your mind?`;

    return NextResponse.json({ 
      welcomeMessage,
      personName: chatSession.personName,
      hasContext: contextMessages.length > 0
    });

  } catch (error) {
    console.error('Welcome message generation error:', error);
    
    // Fallback to a generic but still personal message
    return NextResponse.json({ 
      welcomeMessage: "Hello... it's so good to hear from you again. I've missed our conversations. What's on your mind?",
      personName: 'Your loved one',
      hasContext: false
    });
  }
} 