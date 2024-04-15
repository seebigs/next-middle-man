import { NextResponse } from 'next/server';

export const config = {
    matcher: ['/api/simple/redirect', '/blog/simple/redirect'],
};

export async function middleware(req) {
    return NextResponse.redirect(new URL('content', req.url));
}
