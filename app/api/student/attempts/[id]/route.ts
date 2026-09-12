import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ahmadghdeeb.pythonanywhere.com';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const auth = request.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  try {
    // Django endpoint for attempt detail has no trailing slash
    const res = await fetch(`${BACKEND_URL}/api/student/attempts/${id}`, { headers });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 });
  }
}
