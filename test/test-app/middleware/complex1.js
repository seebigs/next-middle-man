import { NextResponse } from 'next/server';

export const config = {
    matcher: ['/api/complex/:id/*path', '/blog/complex/:id/*path'],
};

export async function middleware(req) {
    const fetchResponse = await fetch('http://localhost:3333/analytics', {
        method: 'POST',
        body: JSON.stringify({
            uid: req.params.id,
            utm: req.nextUrl.searchParams.get('utm'),
        }),
    });

    const reqHeads = new Headers(req.headers);
    reqHeads.set('x-demo-mw1-req', `async:${fetchResponse.status}`);
    const response = NextResponse.next({ request: { headers: reqHeads } });
    response.headers.set('x-demo-mw1', req.params.path);

    const cookieToken = req.cookies.get('token') || {};
    if (cookieToken.value === '98765') {
        req.cookies.delete('token');
        req.cookies.set('token-valid', 'ok');
    }
    response.cookies.set('c-demo-mw1', 'MW1');

    return response;
}
