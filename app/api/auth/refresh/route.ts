import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Get the refresh token from cookies
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            console.warn("No refresh token found in cookies");
            return NextResponse.json({ error: "No refresh token available" }, { status: 401 });
        }

        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh/`;

        // Forward request to the Django backend
        const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!backendResponse.ok) {
            console.error("Token refresh failed at backend API");
            return NextResponse.json({ error: "Session expired, please login again" }, { status: 401 });
        }

        const data = await backendResponse.json();
        console.log("Access token refreshed successfully");

        const response = NextResponse.json({ message: "Token refreshed successfully" }, { status: 200 });

        // Update the access token cookie securely
        response.cookies.set({
            name: 'accessToken',
            value: data.access,
            httpOnly: true,
            path: '/',
            sameSite: 'strict'
        });

        // Update refresh token if Django rotates it automatically
        if (data.refresh) {
            response.cookies.set({
                name: 'refreshToken',
                value: data.refresh,
                httpOnly: true,
                path: '/',
                sameSite: 'strict'
            });
        }

        return response;
    } catch (error) {
        console.error("Internal error during token refresh:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}