import { OpenAI } from 'openai';
// @ts-ignore - weaviate types may not be available at build time
import weaviate from 'weaviate-ts-client';

interface MessageEmbedding {
  content: string;
  embedding: number[];
  metadata: {
    timestamp: string;
    sender: string;
  };
}

class VectorStoreService {
  private client: any;
  private openai: OpenAI;

  constructor() {
    // Initialize Weaviate client
    const hostEnv = process.env.WEAVIATE_HOST || 'http://localhost:8080';
    const url = new URL(hostEnv);

    const baseConfig: any = {
      scheme: url.protocol.replace(':', ''),
      host: url.host,
    };

    if (process.env.WEAVIATE_API_KEY) {
      // Include API key if provided; avoid hard dependency on ApiKey class
      try {
        const { ApiKey } = require('weaviate-ts-client');
        baseConfig.apiKey = new ApiKey(process.env.WEAVIATE_API_KEY);
      } catch {
        // Fallback: pass raw key string (works in newer client versions)
        baseConfig.apiKey = process.env.WEAVIATE_API_KEY;
      }
    }

    // @ts-ignore – dynamic import may not yield perfect typings
    this.client = weaviate.client(baseConfig);
    
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

  async createCollection(sessionId: string, _metadata: any): Promise<void> {
    // Weaviate class names must start with a capital letter and contain only letters, numbers, and underscore
    const className = `Session_${sessionId.replace(/[^a-zA-Z0-9]/g, '_')}`;

    try {
      const schema = await this.client.schema.getter().do();
      const exists = schema.classes?.some((c: any) => c.class === className);

      if (!exists) {
        await this.client.schema
          .classCreator()
          .withClass({
            class: className,
            description: `Chat messages for session ${sessionId}`,
            vectorizer: 'none',
            vectorIndexType: 'hnsw',
            vectorIndexConfig: {
              distance: 'cosine',
            },
            properties: [
              { name: 'content', dataType: ['text'] },
              { name: 'timestamp', dataType: ['text'] },
              { name: 'sender', dataType: ['text'] },
            ],
          })
          .do();
      }
    } catch (error) {
      console.error('Error creating Weaviate class:', error);
      throw new Error('Failed to create vector class');
    }
  }

  async addMessages(
    sessionId: string, 
    messages: Array<{ content: string; timestamp: string; sender: string }>
  ): Promise<void> {
    const collectionName = `Session_${sessionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const objects: any[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        const embedding = await this.createEmbedding(message.content);
        objects.push({
          class: collectionName,
          id: `msg_${i}_${Date.now()}`,
          properties: {
            content: message.content,
            timestamp: message.timestamp,
            sender: message.sender,
          },
          vector: embedding,
        });
      } catch (error) {
        console.error(`Error creating embedding for message ${i}:`, error);
      }
    }

    if (objects.length === 0) {
      throw new Error('Failed to create any embeddings');
    }

    try {
      const batcher = this.client.batch.objectsBatcher();
      for (const obj of objects) {
        batcher.withObject(obj);
      }
      await batcher.do();
    } catch (error) {
      console.error('Error adding objects to Weaviate:', error);
      throw new Error('Failed to add messages to vector store');
    }
  }

  async searchSimilar(
    sessionId: string, 
    query: string, 
    numResults: number = 5
  ): Promise<string[]> {
    const collectionName = `Session_${sessionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    try {
      const queryEmbedding = await this.createEmbedding(query);
      
      const gqlResult: any = await this.client.graphql.get()
        .withClassName(collectionName)
        .withFields('content timestamp sender')
        .withNearVector({ vector: queryEmbedding })
        .withLimit(numResults)
        .do();

      const data = gqlResult?.data?.Get?.[collectionName] || [];
      return data.map((d: any) => d.content).filter(Boolean);
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
      
      const gqlResult: any = await this.client.graphql.get()
        .withClassName(collectionName)
        .withFields('content timestamp sender')
        .withNearVector({ vector: queryEmbedding })
        .withLimit(topK)
        .do();

      return gqlResult?.data?.Get?.[collectionName] || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  async getCollection(collectionName: string): Promise<any> {
    try {
      const schema = await this.client.schema.getter().do();
      const cls = schema.classes?.find((c: any) => c.class === collectionName);

      if (!cls) {
        throw new Error(`Class ${collectionName} not found`);
      }

      return cls;
    } catch (error) {
      console.error('Error getting collection:', error);
      throw new Error('Failed to get collection');
    }
  }

  async deleteCollection(sessionId: string): Promise<void> {
    const collectionName = `Session_${sessionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    try {
      await this.client.schema.classDeleter().withClassName(collectionName).do();
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
      await this.client.schema.getter().do();
      return true;
    } catch (error) {
      console.error('Weaviate health check failed:', error);
      return false;
    }
  }
}

export const vectorStore = new VectorStoreService(); 