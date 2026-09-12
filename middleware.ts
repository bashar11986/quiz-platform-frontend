import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Auth protection is handled client-side in each page via localStorage
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
