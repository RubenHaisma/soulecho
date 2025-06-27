export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Forward to backend server
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return Response.json(error, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return Response.json(data);
    
  } catch (error) {
    console.error('API Upload error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}