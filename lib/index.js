import { NextResponse } from 'next/server'
import { matchesMatchers } from './match';
// import { headers } from 'next/headers';

/**
 * @param {import('./types').Middleware[]} middlewares
 * Each middleware's config should follow same patterns and behavior as official Nextjs middleware
 *   https://nextjs.org/docs/app/api-reference/file-conventions/middleware
 */
export default function nextMiddleMan (middlewares) {

    /**
     * @param {import('./match').MiddlewareRequest} request 
     * @param {import('./types').MiddlewareEvent} event 
     * @returns {Promise<import('./types').MiddlewareResponse>}
     */
    async function handler (request, event) {

        /**
         * @type {import('./types').MiddlewareResponse | undefined}
         */
        let response;

        /**
         * For a "forwarding" middleware chain that ends with NextResponse.next()
         * These items modify the NextRequest that gets sent past middleware into the Next.js route
         * @type {import('./types').MiddlewareRequestMods}
         */
        const requestMods = {
            cookies: [],
            headers: [],
        };

        /**
         * For a "terminating" middleware chain that ends with NextResponse.json/redirect()
         * These items modify the Response that gets returned to the browser
         * @type {import('./types').MiddlewareResponseMods}
         */
        const responseMods = {
            cookies: [],
            headers: [],
        };
    
        let index = -1;
        for await (const { config, middleware } of middlewares) {
            index += 1;
            let { matcher } = config || {};
            if (typeof matcher === 'string') { matcher = [matcher] }
    
            let reqMatches = true;
            if (matcher) {
                const { matchFound, params } = matchesMatchers(request, matcher);
                reqMatches = matchFound;
                request.params = params;
            }

            if (reqMatches && typeof middleware === 'function') {
                let result = null;
                try {
                    result = await middleware.call({ NextResponse }, request, event);
                } catch (err) {
                    let middlewareFilePath = err.stack.match(/absolutePagePath=([^\&]*)/)[1];
                    middlewareFilePath = middlewareFilePath ? `(${decodeURIComponent(middlewareFilePath)})` : '';
                    err.message += [
                        `\nOccurs in middleware[${index}]`,
                        ` passed to 'next-middle-man' ${middlewareFilePath}`,
                        ` at function "${middleware.name}"`,
                    ].join('');
                    throw err;
                }
                if (result instanceof NextResponse) {
                    const headerOverridesStr = result.headers.get('x-middleware-override-headers');
                    const reqHeaderOverrides = headerOverridesStr ? headerOverridesStr.split(',') : [];
                    reqHeaderOverrides.forEach((override) => {
                        const overrideValue = result.headers.get(`x-middleware-request-${override}`);
                        if (overrideValue) {
                            requestMods.headers.push({
                                name: override,
                                value: overrideValue,
                            });
                            request.headers.set(override, overrideValue);
                        }
                    });
                    responseMods.cookies = responseMods.cookies.concat(result.cookies.getAll());
                    for (const [name, value] of result.headers.entries()) {
                        if (!name.startsWith('x-middleware-') && name !== 'set-cookie') {
                            responseMods.headers.push({
                                name,
                                value,
                            });
                        }
                    }

                    if (!result.headers.get('x-middleware-next')) {
                        response = result;
                        break; // exit the chain after first "terminating" response is sent
                    }
                }
            }
        }

        const requestHeaders = new Headers(request.headers);
        requestMods.headers.forEach(({ name, value }) => {
            requestHeaders.set(name, value);
        });

        requestHeaders.set('Cookie', request.cookies.getAll().map((cookie) => {
            return `${cookie.name}=${cookie.value}`;
        }).join('; '));

        if (!response) {
            response = NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }

        responseMods.cookies.forEach((cookie) => {
            response.cookies.set(cookie);
        });

        responseMods.headers.forEach(({ name, value }) => {
            response.headers.set(name, value);
        });

        return response;
    }

    return handler;
}
