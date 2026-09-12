import { NextResponse, NextRequest } from 'next/server';
export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get('refreshToken')?.value;
        const accessToken = request.cookies.get('accessToken')?.value;

        if (refreshToken && accessToken) {
            const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`;
            
            // Attempt to notify the backend to blacklist the token
            await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });
        }

        console.log("Executing logout and clearing local session cookies");

        // Clear local session regardless of backend response
        const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
        
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        return response;
    } catch (error) {
        console.error("Error occurred during logout process:", error);
        
        // Even if the backend fails, we should clear the user's local cookies
        const fallbackResponse = NextResponse.json({ message: "Local session cleared with backend error" }, { status: 200 });
        fallbackResponse.cookies.delete('accessToken');
        fallbackResponse.cookies.delete('refreshToken');
        
        return fallbackResponse;
    }
}