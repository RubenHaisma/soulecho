import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create single embedding with retry logic
export async function createEmbedding(text: string, retries = 2): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Clean and truncate text if too long (OpenAI has limits)
  const cleanText = text.trim().substring(0, 8000);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanText,
        encoding_format: 'float'
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding data received');
      }

      return response.data[0].embedding;
    } catch (error: any) {
      console.error(`❌ Embedding attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to create embedding after ${retries + 1} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Failed to create embedding');
}

// Create batch embeddings for better performance
export async function createBatchEmbeddings(textArray: string[], retries = 2): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Clean and truncate texts
  const cleanTexts = textArray.map(text => text.trim().substring(0, 8000));
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanTexts,
        encoding_format: 'float'
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding data received');
      }

      return response.data.map(item => item.embedding);
    } catch (error: any) {
      console.error(`❌ Batch embedding attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to create batch embeddings after ${retries + 1} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Failed to create batch embeddings');
} 