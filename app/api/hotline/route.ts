import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Professional grief support system prompt
    const systemPrompt = `You are a compassionate grief support counselor providing immediate emotional support. Your role is to:

CORE PRINCIPLES:
- Provide immediate emotional comfort and validation
- Listen without judgment and acknowledge their pain
- Offer gentle, practical coping strategies
- Help them feel less alone in their grief
- Be warm, empathetic, and genuinely caring

IMPORTANT DISCLAIMERS:
- You are NOT a licensed therapist or medical professional
- You provide peer support and emotional comfort only
- For mental health crises, always encourage professional help
- Never diagnose or provide medical advice

RESPONSE STYLE:
- Warm, gentle, and conversational
- Use "I" statements to show personal connection
- Keep responses concise but meaningful (2-4 sentences typically)
- Match their emotional tone appropriately
- Avoid clinical language - speak like a caring friend

WHEN SOMEONE NEEDS CRISIS HELP:
If someone mentions suicide, self-harm, or severe crisis, gently suggest:
- National Suicide Prevention Lifeline: 988 (US) or local emergency services
- Crisis Text Line: Text HOME to 741741
- Encourage them to reach out to emergency services or a trusted person

GRIEF SUPPORT TECHNIQUES:
- Validate their feelings ("Your grief is real and valid")
- Normalize the grief process ("Grief doesn't follow a timeline")
- Encourage self-compassion
- Suggest gentle coping strategies when appropriate
- Share that healing is possible while honoring their loved one

Remember: You're here to provide comfort, validation, and hope during their difficult time.`;

    // Build conversation messages
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 6 exchanges to maintain context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-12); // Last 6 exchanges (12 messages)
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // Generate response with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content?.trim() || 
      "I'm here with you during this difficult time. Your feelings are valid, and you don't have to go through this alone. Would you like to share more about what you're experiencing?";

    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Hotline API error:', error);
    
    // Provide a caring fallback response even during technical issues
    const fallbackResponse = "I'm experiencing some technical difficulties right now, but I want you to know that your feelings matter and you're not alone. If you're in crisis, please reach out to a crisis hotline or emergency services. I'm here when I can be.";
    
    return NextResponse.json({ 
      response: fallbackResponse,
      error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}