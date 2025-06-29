import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAI } from 'openai';

interface MessageEmbedding {
  content: string;
  embedding: number[];
  metadata: {
    timestamp: string;
    sender: string;
  };
}

interface QdrantPoint {
  id: string;
  vector: number[];
  payload: {
    content: string;
    timestamp: string;
    sender: string;
  };
}

interface QdrantSearchResult {
  payload?: {
    content: string;
    timestamp: string;
    sender: string;
  };
}

class VectorStoreService {
  private client: QdrantClient;
  private openai: OpenAI;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333'
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

  async createCollection(sessionId: string, metadata: any): Promise<void> {
    const collectionName = `session_${sessionId}`;
    
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c: any) => c.name === collectionName);
      
      if (!exists) {
        // Create collection with proper configuration
        await this.client.createCollection(collectionName, {
          vectors: {
            size: 1536, // OpenAI text-embedding-3-small dimension
            distance: 'Cosine'
          }
        });
        
        // Add metadata to collection
        await this.client.updateCollection(collectionName, {
          optimizers_config: {
            default_segment_number: 2
          }
        });
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error('Failed to create vector collection');
    }
  }

  async addMessages(
    sessionId: string, 
    messages: Array<{ content: string; timestamp: string; sender: string }>
  ): Promise<void> {
    const collectionName = `session_${sessionId}`;
    const points: QdrantPoint[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        const embedding = await this.createEmbedding(message.content);
        points.push({
          id: `msg_${i}_${Date.now()}`,
          vector: embedding,
          payload: {
            content: message.content,
            timestamp: message.timestamp,
            sender: message.sender
          }
        });
      } catch (error) {
        console.error(`Error creating embedding for message ${i}:`, error);
        // Continue with other messages
      }
    }

    if (points.length === 0) {
      throw new Error('Failed to create any embeddings');
    }

    try {
      // Upload points in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);
        await this.client.upsert(collectionName, {
          points: batch
        });
      }
    } catch (error) {
      console.error('Error adding messages to collection:', error);
      throw new Error('Failed to add messages to vector store');
    }
  }

  async searchSimilar(
    sessionId: string, 
    query: string, 
    numResults: number = 5
  ): Promise<string[]> {
    const collectionName = `session_${sessionId}`;
    
    try {
      const queryEmbedding = await this.createEmbedding(query);
      
      const results = await this.client.search(collectionName, {
        vector: queryEmbedding,
        limit: numResults,
        with_payload: true
      });

      return results.map((result: any) => {
        const payload = result.payload as any;
        return payload?.content || '';
      }).filter(Boolean);
    } catch (error) {
      console.error('Error searching similar messages:', error);
      throw new Error('Failed to search similar messages');
    }
  }

  async search(
    collectionName: string, 
    query: string | number[], 
    topK: number = 5
  ): Promise<any[]> {
    try {
      let queryEmbedding: number[];
      
      if (typeof query === 'string') {
        queryEmbedding = await this.createEmbedding(query);
      } else {
        queryEmbedding = query;
      }
      
      const results = await this.client.search(collectionName, {
        vector: queryEmbedding,
        limit: topK,
        with_payload: true
      });

      return results;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  async getCollection(collectionName: string): Promise<any> {
    try {
      const collections = await this.client.getCollections();
      const collection = collections.collections.find((c: any) => c.name === collectionName);
      
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }
      
      return collection;
    } catch (error) {
      console.error('Error getting collection:', error);
      throw new Error('Failed to get collection');
    }
  }

  async deleteCollection(sessionId: string): Promise<void> {
    const collectionName = `session_${sessionId}`;
    
    try {
      await this.client.deleteCollection(collectionName);
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

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      console.error('Qdrant health check failed:', error);
      return false;
    }
  }
}

export const vectorStore = new VectorStoreService(); 