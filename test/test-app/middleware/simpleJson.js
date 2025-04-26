export const config = {
    matcher: ['/api/simple/content'],
};

export function middleware(req) {
    return this.NextResponse.json({ response: `auth ${req.nextUrl.pathname}` }, { status: 401 });
}
