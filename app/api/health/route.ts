import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vectorStore } from '@/lib/vector-store';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      service: 'Talkers - AI Memorial Conversations',
      description: 'Grief support platform with AI-powered conversations',
      responseTime: Date.now() - startTime,
             checks: {
         api: 'operational',
         database: 'operational', // You can add actual DB ping here
         ai_service: 'operational',
         storage: 'operational',
         weaviate: 'checking',
         resend: 'checking'
       } as Record<string, string>,
      endpoints: {
        api: '/api',
        auth: '/api/auth',
        chat: '/api/chat',
        upload: '/api/upload'
      },
      support: {
        email: 'support@talkers.ai',
        docs: 'https://talkers.ai/docs',
        status: 'https://status.talkers.ai'
      }
    };

    // Check Weaviate connection
    const weaviateHealthy = await vectorStore.healthCheck();
    
    health.checks.weaviate = weaviateHealthy ? 'healthy' : 'unhealthy';

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Test Resend configuration
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      health.checks.resend = 'not_configured';
      health.status = 'degraded';
    } else {
      health.checks.resend = 'configured';
    }

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        service: 'Talkers - AI Memorial Conversations'
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 