import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Receive data from the login form
    const body = await request.json();

    // 2. Forward the request from the Next.js server to the Django server
    const backendResponse = await fetch('https://ahmadghdeeb.pythonanywhere.com/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    // 3. Return the response to the frontend
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في الاتصال بالسيرفر' }, { status: 500 });
  }
}