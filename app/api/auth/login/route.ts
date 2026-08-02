import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. استلام البيانات من واجهة تسجيل الدخول 
    const body = await request.json();

    // 2. إرسال الطلب من سيرفر Next.js إلى سيرفر Django
    const backendResponse = await fetch('https://ahmadghdeeb.pythonanywhere.com/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    // 3. إعادة الرد إلى الواجهة الأمامية
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في الاتصال بالسيرفر' }, { status: 500 });
  }
}