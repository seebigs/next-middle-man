import { NextResponse } from 'next/server';

export const config = {
    matcher: ['/api/simple/content'],
};

export async function middleware(req) {
    return NextResponse.json({ response: `auth ${req.nextUrl.pathname}` }, { status: 401 });
}
