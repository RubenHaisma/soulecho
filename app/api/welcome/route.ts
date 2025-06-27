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

    // Get some sample messages from the vector database for context
    let contextMessages: string[] = [];
    let detectedLanguages: string[] = [];
    try {
      // Fetch session info from backend to get detectedLanguages
      const backendSessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/session/${sessionId}`);
      if (backendSessionRes.ok) {
        const backendSession = await backendSessionRes.json();
        detectedLanguages = backendSession.detectedLanguages || [];
      }
      // Generate a greeting in the correct language(s)
      let greeting = 'hello';
      if (detectedLanguages.length > 0) {
        const greetingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/generate-greeting`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ languages: detectedLanguages })
        });
        if (greetingRes.ok) {
          const greetingData = await greetingRes.json();
          greeting = greetingData.greeting || 'hello';
        }
      }
      // Try to get context from vector database using the language-appropriate greeting
      const vectorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          query: greeting,
          limit: 3
        }),
      });
      if (vectorResponse.ok) {
        const vectorData = await vectorResponse.json();
        contextMessages = vectorData.context || [];
      }
    } catch (error) {
      console.warn('Could not fetch vector context or greeting:', error);
    }
    // Fallback to recent conversations if no vector context
    if (contextMessages.length === 0) {
      contextMessages = (chatSession.conversations || [])
        .slice(0, 3)
        .map((conv: { userMessage: string; aiResponse: string }) => `${conv.userMessage}\n${conv.aiResponse}`)
        .filter((msg: string) => msg.length > 10);
    }
    // Generate a personalized, fluent, advanced welcome message
    const contextText = contextMessages.length > 0 
      ? `\n\nRECENT CONVERSATION CONTEXT:\n${contextMessages.join('\n\n---\n\n')}`
      : '';
    const langNames = detectedLanguages.length > 0 ? detectedLanguages.join(', ') : 'the original language';
    const systemPrompt = `You are ${chatSession.personName}.\n\nGenerate a fluent, natural, advanced first message for a real WhatsApp conversation, in the same language(s) as the training data (${langNames}).\n\n${contextText ? `Based on these real messages, continue the conversation as if you are picking up right where you left off. Do NOT just greet, but make it a real, flowing, personal message that fits the style and language(s) in the context.` : 'Create a warm, personal, and natural first message that fits the relationship and language.'}\n\nINSTRUCTIONS:\n1. Be authentic to ${chatSession.personName}'s communication style\n2. Use the same language(s) (${langNames}) and code-switch if needed\n3. Make it feel like a real, ongoing conversation, not just a greeting\n4. Reference the relationship or recent topics if context is available\n5. Keep it concise (1-2 sentences)\n6. Use the same language patterns and expressions as in the context\n\nRemember: You ARE ${chatSession.personName}. Respond exactly as you would in a real conversation, in the correct language(s).`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Continue the conversation naturally as the first message.' }
      ],
      max_tokens: 100,
      temperature: 0.8,
      presence_penalty: 0.2,
      frequency_penalty: 0.1,
      top_p: 0.95
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