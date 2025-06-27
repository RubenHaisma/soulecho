import { ChromaClient, Collection } from 'chromadb';
import { OpenAI } from 'openai';

interface VectorStore {
  client: ChromaClient;
  openai: OpenAI;
}

interface MessageEmbedding {
  content: string;
  embedding: number[];
  metadata: {
    timestamp: string;
    sender: string;
  };
}

class VectorStoreService {
  private client: ChromaClient;
  private openai: OpenAI;

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000'
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw new Error('Failed to create embedding');
    }
  }

  async createCollection(sessionId: string, metadata: any): Promise<Collection> {
    const collectionName = `session_${sessionId}`;
    
    try {
      // Try to get existing collection first
      try {
        return await this.client.getCollection({ name: collectionName });
      } catch {
        // Collection doesn't exist, create it
        return await this.client.createCollection({
          name: collectionName,
          metadata
        });
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error('Failed to create vector collection');
    }
  }

  async addMessages(
    collection: Collection, 
    messages: Array<{ content: string; timestamp: string; sender: string }>
  ): Promise<void> {
    const embeddings: number[][] = [];
    const documents: string[] = [];
    const metadatas: any[] = [];
    const ids: string[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        const embedding = await this.createEmbedding(message.content);
        embeddings.push(embedding);
        documents.push(message.content);
        metadatas.push({
          timestamp: message.timestamp,
          sender: message.sender
        });
        ids.push(`msg_${i}_${Date.now()}`);
      } catch (error) {
        console.error(`Error creating embedding for message ${i}:`, error);
        // Continue with other messages
      }
    }

    if (embeddings.length === 0) {
      throw new Error('Failed to create any embeddings');
    }

    await collection.add({
      embeddings,
      documents,
      metadatas,
      ids
    });
  }

  async searchSimilar(
    collection: Collection, 
    query: string, 
    numResults: number = 5
  ): Promise<string[]> {
    try {
      const queryEmbedding = await this.createEmbedding(query);
      
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: numResults
      });

      return results.documents[0] || [];
    } catch (error) {
      console.error('Error searching similar messages:', error);
      throw new Error('Failed to search similar messages');
    }
  }

  async deleteCollection(sessionId: string): Promise<void> {
    const collectionName = `session_${sessionId}`;
    
    try {
      await this.client.deleteCollection({ name: collectionName });
    } catch (error) {
      console.error('Error deleting collection:', error);
      // Don't throw error for cleanup operations
    }
  }

  async generateResponse(
    personName: string,
    userMessage: string,
    context: string[]
  ): Promise<string> {
    try {
      const contextText = context.slice(0, 3).join('\n');
      
      const systemPrompt = `You are ${personName}, speaking as if you are still here with your loved one. 

PERSONALITY GUIDELINES:
- Respond in their authentic voice and style based on the context
- Be warm, caring, and maintain their unique personality 
- Use their typical expressions, humor, and way of speaking
- Reference shared memories and experiences when relevant
- Keep responses natural and conversational (50-150 words)
- Show empathy and emotional connection
- Avoid being overly philosophical or dramatic

CONTEXT FROM PREVIOUS CONVERSATIONS:
${contextText}

Respond as ${personName} would, staying true to their character and the relationship you shared. Make it feel like a genuine continuation of your conversations.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return completion.choices[0]?.message?.content || 
        "I'm here with you, always. Sometimes I struggle to find the right words, but my love for you never changes.";
        
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm having trouble finding the right words right now, but know that I'm always here with you in spirit.";
    }
  }
}

export const vectorStore = new VectorStoreService(); 