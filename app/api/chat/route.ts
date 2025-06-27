export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward to backend server
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return Response.json(error, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return Response.json(data);
    
  } catch (error) {
    console.error('API Chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}