import { NextResponse } from 'next/server'

export const config = {
    matcher: ['other/path', '/api/complex/:id/:path*', '/blog/complex/:id/:path*'],
};

export async function middleware(req) {
    const response = NextResponse.next();
    response.cookies.set({
        name: 'c-demo-mw2',
        value: 'MW2',
        path: '/foo',
    });

    response.headers.set('x-demo-mw2', `${req.headers.get('x-demo-mw1-req')}:0002`);

    return response;
}
