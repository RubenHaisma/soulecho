// Weaviate client wrapper for vector operations
// Provides the same API surface as the backend Qdrant client

const weaviateModule = require('weaviate-ts-client');
const weaviate = weaviateModule.default || weaviateModule;
const ApiKeyCtor = weaviateModule.ApiKey || (weaviate ? weaviate.ApiKey : undefined);

// Initialize Weaviate client
const weaviateHost = process.env.WEAVIATE_HOST || 'http://localhost:8080';
const weaviateUrl = new URL(weaviateHost);

const wvClient = weaviate.client({
  scheme: weaviateUrl.protocol.replace(':', ''),
  host: weaviateUrl.host,
  apiKey: process.env.WEAVIATE_API_KEY && ApiKeyCtor ? new ApiKeyCtor(process.env.WEAVIATE_API_KEY) : undefined,
});

// Helper to convert collection name to a valid Weaviate class name
function toClassName(collectionName: string): string {
  if (collectionName.startsWith('session_')) {
    return 'Session_' + collectionName.replace('session_', '').replace(/[^a-zA-Z0-9]/g, '_');
  }
  // Fallback: ensure capitalised
  const safe = collectionName.replace(/[^a-zA-Z0-9]/g, '_');
  return safe.charAt(0).toUpperCase() + safe.slice(1);
}

export interface VectorPoint {
  id: string;
  vector: number[];
  payload: Record<string, any>;
}

export interface SearchResult {
  payload: Record<string, any>;
  score: number;
}

export interface ScrollResult {
  points: Array<{ payload: Record<string, any> }>;
  next_page_offset: number | null;
}

// Wrapper object exposing the same API surface the backend expects
export const weaviateClient = {
  async getCollection(collectionName: string) {
    const className = toClassName(collectionName);
    const schema = await wvClient.schema.getter().do();
    const cls = (schema.classes || []).find((c: any) => c.class === className);
    if (!cls) throw new Error(`Class ${className} not found`);
    return cls;
  },

  async createCollection(collectionName: string, options: { vectors: { size: number; distance: string } }) {
    const className = toClassName(collectionName);
    const schema = await wvClient.schema.getter().do();
    const exists = (schema.classes || []).some((c: any) => c.class === className);
    if (exists) return;

    await wvClient.schema.classCreator().withClass({
      class: className,
      description: `Chat messages for ${collectionName}`,
      vectorizer: 'none',
      vectorIndexType: 'hnsw',
      vectorIndexConfig: {
        distance: options.vectors.distance.toLowerCase() === 'cosine' ? 'cosine' : 'l2',
      },
      properties: [
        { name: 'content', dataType: ['text'] },
        { name: 'timestamp', dataType: ['text'] },
        { name: 'sender', dataType: ['text'] },
        { name: 'index', dataType: ['int'] },
      ],
    }).do();
  },

  async upsert(collectionName: string, { points }: { points: VectorPoint[] }) {
    if (!points || points.length === 0) return;
    const className = toClassName(collectionName);
    const batcher = wvClient.batch.objectsBatcher();
    points.forEach(pt => {
      batcher.withObject({
        class: className,
        id: pt.id,
        properties: pt.payload,
        vector: pt.vector,
      });
    });
    await batcher.do();
  },

  async search(collectionName: string, { 
    vector, 
    limit = 10, 
    score_threshold = 0.0 
  }: { 
    vector: number[]; 
    limit?: number; 
    score_threshold?: number;
  }): Promise<SearchResult[]> {
    const className = toClassName(collectionName);
    const res = await wvClient.graphql.get()
      .withClassName(className)
      .withFields(`content timestamp sender index _additional { distance }`)
      .withNearVector({ vector })
      .withLimit(limit)
      .do();

    const objs = res?.data?.Get?.[className] || [];
    // Convert to Qdrant-like response shape
    return objs.map((obj: any) => ({
      payload: {
        content: obj.content,
        timestamp: obj.timestamp,
        sender: obj.sender,
        index: obj.index,
      },
      score: 1 - (obj._additional?.distance ?? 1),
    })).filter((p: SearchResult) => p.score >= score_threshold);
  },

  async scroll(collectionName: string, { 
    limit = 250, 
    offset = 0 
  }: { 
    limit?: number; 
    offset?: number;
  }): Promise<ScrollResult> {
    const className = toClassName(collectionName);
    // Weaviate GraphQL doesn't support offset directly; fetch limit + offset by skipping
    const res = await wvClient.graphql.get()
      .withClassName(className)
      .withFields(`content timestamp sender index _additional { id }`)
      .withLimit(limit + offset)
      .do();

    const objs = res?.data?.Get?.[className] || [];
    const sliced = objs.slice(offset, offset + limit);
    const points = sliced.map((obj: any) => ({
      payload: {
        content: obj.content,
        timestamp: obj.timestamp,
        sender: obj.sender,
        index: obj.index,
      },
    }));

    const next_page_offset = objs.length > offset + limit ? offset + limit : null;
    return { points, next_page_offset };
  },

  async deleteCollection(collectionName: string) {
    const className = toClassName(collectionName);
    try {
      await wvClient.schema.classDeleter().withClassName(className).do();
    } catch (err) {
      // ignore if not exist
    }
  }
}; 