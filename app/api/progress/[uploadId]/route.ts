import { NextRequest } from 'next/server';
import { progressStore } from '@/lib/progress-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const { uploadId } = await params;
  console.log(`📡 SSE connection for uploadId: ${uploadId}`);

  // Create Server-Sent Events response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial progress
      const progress = progressStore.get(uploadId) || { 
        stage: 'starting', 
        progress: 0, 
        message: 'Initializing...', 
        total: 0, 
        processed: 0 
      };
      
      console.log(`📡 Sending initial progress for ${uploadId}:`, progress);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`));

      // Set up interval to send updates
      let noProgressCount = 0;
      const interval = setInterval(() => {
        const currentProgress = progressStore.get(uploadId);
        console.log(`🔍 Checking progress for ${uploadId}:`, currentProgress ? 'Found' : 'Not found');
        if (currentProgress) {
          noProgressCount = 0; // Reset counter
          console.log(`📡 Sending progress update for ${uploadId}:`, currentProgress);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(currentProgress)}\n\n`));
          
          // Clean up when complete
          if (currentProgress.progress >= 100 || currentProgress.stage === 'complete' || currentProgress.stage === 'error') {
            console.log(`📡 Completing SSE for ${uploadId}`);
            clearInterval(interval);
            if (currentProgress.stage === 'complete') {
              progressStore.delete(uploadId);
            }
            controller.close();
          }
        } else {
          noProgressCount++;
          // Only end SSE after multiple failed attempts (give async processing time to start)
          if (noProgressCount > 10) {
            console.log(`📡 No progress found for ${uploadId} after ${noProgressCount} attempts, ending SSE`);
            clearInterval(interval);
            controller.close();
          }
        }
      }, 500); // Send updates every 500ms

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Credentials': 'false'
    },
  });
} 