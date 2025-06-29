import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'checking...',
        resend: 'checking...',
        api: 'ok'
      }
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.services.database = 'ok';
    } catch (error) {
      healthCheck.services.database = 'error';
      healthCheck.status = 'degraded';
    }

    // Test Resend configuration
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      healthCheck.services.resend = 'not configured';
      healthCheck.status = 'degraded';
    } else {
      healthCheck.services.resend = 'configured';
    }

    return NextResponse.json(healthCheck);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Internal server error'
    }, { status: 500 });
  }
} 