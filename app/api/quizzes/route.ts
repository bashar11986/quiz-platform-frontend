import { NextResponse, NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ahmadghdeeb.pythonanywhere.com';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        
        const response = await fetch(`${API_BASE_URL}/api/quizzes/`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader })
            }
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const body = await request.json();
        
        const response = await fetch(`${API_BASE_URL}/api/quizzes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader })
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}