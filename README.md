# next-middle-man
A better Middleware Manager for Next.js

- Structure your modules however you want
- Includes ALL middleware functionality in each module (headers, cookies, redirects, async actions, and more)

## Install
```sh
$ npm install next-middle-man
```

## Set-up the Middleware Entry Point
Create a `middleware.js` file in the root of your project (see [Next.js File Conventions](https://nextjs.org/docs/app/api-reference/file-conventions/middleware)) and import as many middleware modules as you want. Modules will be executed in the order that you place them into the array.
```js
import nextMiddleMan from 'next-middle-man';

import * as authMiddleware from './my-middleware/auth.js';
import * as redirectMiddleware from './my-middleware/redirect.js';
import * as loggerMiddleware from './my-middleware/logger.js';

export const middleware = nextMiddleMan([
    authMiddleware,
    redirectMiddleware,
    loggerMiddleware,
]);

// Optionally add matchers here if you want them to affect ALL middleware
export const config = {
    matcher: [
        '/((?!_next|favicon.ico).*)',
    ],
};
```

## Create Your Middleware Modules
Each module should follow all of the same rules and behaviors as specified in the [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

All middleware files should export a `middleware` function and an optional `config` object.

The `middleware` function takes a `NextRequest` instance and should always return a `NextResponse` instance. For convenience you can use `this.NextResponse` to create a response instance.

```js
export const config = { // Optional
    matcher: ['/api/*path'],
};

/**
 * @param {NextRequest} request
 * @param {NextFetchEvent} event
 * @returns {Promise<NextResponse>}
 */
export function middleware(request, event) {
    return this.NextResponse.next(); // Do nothing, just continue to next handler
}
```

## Middleware Examples
Some examples to get you started...

### Read request data
```js
export const config = {
    matcher: ['/api/users/:id/*path'],
};

export function middleware(req) {
    console.log(req.method); // GET
    console.log(req.mode); // cors
    console.log(req.cache); // default
    console.log(req.credentials); // same-origin
    console.log(req.referrer); // about:client
    console.log(req.url); // http://localhost:3000/api/users/123/account/upgrade?utm=campaign
    console.log(req.nextUrl.hostname); // localhost
    console.log(req.nextUrl.pathname); // /api/users/123/account/upgrade
    console.log(req.nextUrl.searchParams.get('utm')); // campaign
    console.log(req.headers.get('user-agent')); // Mozilla/5.0 ...
    console.log(req.cookies.get('token')); // { name: 'token', value: '98765' }
    console.log(req.params); // { id: '123', path: ['account', 'upgrade'] }

    return this.NextResponse.next();
}
```

### Set a response header
```js
export function middleware(req) {
    const response = this.NextResponse.next();
    response.headers.set('x-demo-token', 'abc123');
    return response;
}
```

### Set a response cookie
```js
export function middleware(req) {
    const response = this.NextResponse.next();
    response.cookies.set('demo-cookie', 'foo');
    return response;
}
```

### Override a request header
```js
export function middleware(req) {
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('user-agent', 'Mobile iOS 17.4.1 (normalized)');
    const response = NextResponse.next({ request: { headers: reqHeaders } });
    return response;
}
```

### Override a request cookie
```js
export function middleware(req) {
    const cookieToken = req.cookies.get('token') || {};
    if (cookieToken.value === '98765') {
        req.cookies.delete('token');
        req.cookies.set('token-valid', 'ok');
    }
    return this.NextResponse.next();
}
```

### Log to external analytics and continue
```js
export function middleware(req) {
    await fetch('http://analytics.com/hit', {
        method: 'POST',
        body: JSON.stringify({
            utm: req.nextUrl.searchParams.get('utm'),
        }),
    });
    return this.NextResponse.next();
}
```

### Send a simple JSON Response
```js
export async function middleware(req) {
    if (authorized) {
        return this.NextResponse.next();
    }
    return this.NextResponse.json({ response: 'auth failed' }, { status: 401 });
}
```

### Redirect a request to a different path
```js
export async function middleware(req) {
    return this.NextResponse.redirect(new URL('/alternate/path', req.url));
}
```
