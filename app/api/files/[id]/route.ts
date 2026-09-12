import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ahmadghdeeb.pythonanywhere.com';

async function proxy(request: NextRequest, id: string, method: string) {
  const token = request.headers.get('Authorization') || '';
  try {
    const res = await fetch(`${BACKEND_URL}/api/files/${id}/`, {
      method,
      headers: { Authorization: token, Accept: 'application/json' },
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxy(request, id, 'GET');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxy(request, id, 'DELETE');
}
