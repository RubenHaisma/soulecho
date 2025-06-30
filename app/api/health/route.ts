import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vectorStore } from '@/lib/vector-store';

export async function GET(request: NextRequest) {
  try {
    // Check Weaviate connection
    const weaviateHealthy = await vectorStore.healthCheck();
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        weaviate: weaviateHealthy ? 'healthy' : 'unhealthy',
        database: 'checking...',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
        resend: 'checking...'
      }
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.services.database = 'healthy';
    } catch (error) {
      healthCheck.services.database = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Test Resend configuration
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      healthCheck.services.resend = 'not_configured';
      healthCheck.status = 'degraded';
    } else {
      healthCheck.services.resend = 'configured';
    }

    return NextResponse.json(healthCheck);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 