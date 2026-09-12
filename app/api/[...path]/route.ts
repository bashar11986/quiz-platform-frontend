import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ahmadghdeeb.pythonanywhere.com';

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] }
) {
  // Build Django URL with trailing slash
  let djangoPath = params.path.join('/');
  if (!djangoPath.endsWith('/')) djangoPath += '/';

  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/api/${djangoPath}${search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const auth = request.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  const fetchOptions: RequestInit = { method: request.method, headers };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.text();
    if (body) fetchOptions.body = body;
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Backend connection failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await context.params);
}
