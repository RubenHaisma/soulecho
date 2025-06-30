import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id || (session.user as any).sub;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client inside the function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get the chat session and recent conversations
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
        isActive: true
      },
      include: {
        conversations: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Get last 5 conversations for context
        }
      } as any // bypass Prisma type error
    }) as any as (typeof prisma.chatSession extends { findFirst: (...args: any) => Promise<infer T> } ? T : any) & { conversations: { userMessage: string; aiResponse: string }[] };
    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get detected languages from the chat session
    const detectedLanguages: string[] = chatSession.detectedLanguages || [];
    
    // Use recent conversations as context (we already have this data)
    let contextMessages: string[] = (chatSession.conversations || [])
      .slice(0, 3)
      .map((conv: { userMessage: string; aiResponse: string }) => `${conv.userMessage}\n${conv.aiResponse}`)
      .filter((msg: string) => msg.length > 10);
    // Generate a personalized, fluent, advanced welcome message
    const contextText = contextMessages.length > 0 
      ? `\n\nRECENT CONVERSATION CONTEXT:\n${contextMessages.join('\n\n---\n\n')}`
      : '';
    
    const recentConversationsText = (chatSession.conversations || []).length > 0
      ? `\n\nRECENT CONVERSATION HISTORY:\n${(chatSession.conversations || [])
          .slice(0, 4)
          .map((conv: { userMessage: string; aiResponse: string }) => `You: ${conv.userMessage}\n${chatSession.personName}: ${conv.aiResponse}`)
          .reverse()
          .join('\n\n---\n\n')}`
      : '';
    
    const langNames = detectedLanguages.length > 0 ? detectedLanguages.join(', ') : 'the original language';
    
    const systemPrompt = `You are ${chatSession.personName}.

CRITICAL: You are continuing a real conversation with someone you care about. This is NOT a greeting - it's picking up where you left off.

${recentConversationsText}

${contextText ? `YOUR ACTUAL MESSAGES (study these to understand your communication style):\n${contextText}\n\n` : ''}

INSTRUCTIONS:
1. Study the conversation history above to understand the current context and flow
2. Study your actual messages to understand your exact communication style, language, expressions, and tone
3. Respond as ${chatSession.personName} would - using the same language(s) (${langNames}), expressions, and communication patterns
4. If the conversation switches between languages, do the same
5. Be authentic to your actual communication style from these messages
6. Reference previous parts of the conversation when relevant
7. Ask follow-up questions when appropriate
8. Show genuine interest and engagement
9. Do NOT use generic responses - be specific and personal
10. Keep responses natural and conversational length
11. Make it feel like you're continuing a real conversation, not starting a new one

Remember: You ARE ${chatSession.personName}. Respond exactly as you would in a real conversation, using the same language(s) (${langNames}) as in the examples.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Continue the conversation naturally as if you\'re picking up where you left off.' }
      ],
      max_tokens: 150,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      top_p: 0.9
    });
    const welcomeMessage = completion.choices[0]?.message?.content?.trim() || 
      `Hey! It's so good to hear from you again. What's new with you?`;
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