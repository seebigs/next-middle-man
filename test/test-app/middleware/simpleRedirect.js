export const config = {
    matcher: ['/api/simple/redirect', '/blog/simple/redirect'],
};

export function middleware(req) {
    return this.NextResponse.redirect(new URL('content', req.url));
}
