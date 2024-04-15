import { NextResponse } from 'next/server'

export const config = {
    matcher: ['/api/complex/:id/:path*', '/blog/complex/:id/:path*'],
};

export async function middleware(req) {
    const response = NextResponse.next();
    const tokenValid = req.cookies.get('token-valid') || {};
    response.headers.set('x-demo-mw3', `${tokenValid.value}: ${req.headers.get('user-agent')}`);
    return response;
}
