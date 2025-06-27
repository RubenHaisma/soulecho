interface Params {
  sessionId: string;
}

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { sessionId } = params;
    
    // Forward to backend server
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/session/${sessionId}`);

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return Response.json(error, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return Response.json(data);
    
  } catch (error) {
    console.error('API Session error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}