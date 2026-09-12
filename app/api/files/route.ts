import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ahmadghdeeb.pythonanywhere.com';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization') || '';
  try {
    const res = await fetch(`${BACKEND_URL}/api/files/`, {
      headers: { Authorization: token, Accept: 'application/json' },
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 });
  }
}

// Multipart file upload — must NOT stringify body or set Content-Type manually
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization') || '';
  const contentType = request.headers.get('Content-Type') || '';
  try {
    const body = await request.arrayBuffer();
    const res = await fetch(`${BACKEND_URL}/api/files/`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': contentType, // forward multipart boundary as-is
      },
      body,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 });
  }
}
