import { NextResponse } from 'next/server';

export async function GET(req) {
    return NextResponse.json({
        pathname: req.nextUrl.pathname,
        async: req.headers.get('x-demo-mw1-req'),
    });
}
