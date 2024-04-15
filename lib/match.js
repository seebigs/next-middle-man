import { match as pathToRegexp } from 'path-to-regexp';

/**
 * @typedef {import('./types').MiddlewareRequest} MiddlewareRequest
 * @typedef {import('./types').MiddlewareMatcher} MiddlewareMatcher
 */

/**
 * Adapted from vercel/next.js/packages/next/src/shared/lib/router/utils/prepare-destination.ts
 * @param {MiddlewareRequest} req 
 * @param {import('./types').MiddlewareMatcherHasItem} hasItem
 */
function matchConstraint (req, hasItem) {
    let value;
    let key = hasItem.key;

    switch (hasItem.type) {
        case 'method': {
            value = req.method;
            break;
        }
        case 'header': {
            key = (key || '').toLowerCase();
            value = `${req.headers[key]}`;
            break;
        }
        case 'cookie': {
            if ('cookies' in req) {
                if (key) {
                    value = req.cookies[key];
                }
            }
            break;
        }
        case 'query': {
            value = req.nextUrl.searchParams.get(key || '');
            break;
        }
        case 'host': {
            const host = req.headers.get('host');
            if (host) {
                const hostname = host.split(':', 1)[0].toLowerCase();
                value = hostname;
            }
            break;
        }
        default: {
            break;
        }
    }

    if (hasItem.value) {
        const matcher = new RegExp(`^${hasItem.value}$`);
        const matches = Array.isArray(value)
            ? value.slice(-1)[0].match(matcher)
            : value.match(matcher);
        return !!matches;
    }

    return !!value;
}

/**
 * 
 * @param {MiddlewareRequest} req 
 * @param {MiddlewareMatcher} matcher 
 * @returns {boolean}
 */
function matchesConstraints (req, matcher) {
    const matchHasOK = Array.isArray(matcher.has) ?
            matcher.has.every((item) => matchConstraint(req, item)) : true;
    const matchMissingOK = Array.isArray(matcher.missing) ?
            !matcher.missing.some((item) => matchConstraint(req, item)) : true;

    return matchHasOK && matchMissingOK;
}

/**
 * Determines if a request matches all of the provided matchers
 * @param {MiddlewareRequest} req 
 * @param {Array<string | MiddlewareMatcher>} matchers 
 * @returns {{ matchFound: boolean, params: {} }}
 */
export function matchesMatchers (req, matchers) {
    let matchFound = false;
    let params = {};

    matchers.some((m) => {
        if (typeof m === 'string') { m = { source: m }; }

        /**
         * A request matches all paths by default if no path matcher is specified
         * @type {import('path-to-regexp').Match | { params: {} }}
         */
        let pathMatchFound = { params: {} };

        const pathToMatch = m.source;
        if (pathToMatch) {
            try {
                const pathMatchFn = pathToRegexp(pathToMatch, { decode: decodeURIComponent });
                pathMatchFound = pathMatchFn(req.nextUrl.pathname);
            } catch (err) {
                err.message = `${err.message} in "${pathToMatch}" [check syntax at https://github.com/pillarjs/path-to-regexp]`;
                throw err;
            }
        }

        if (pathMatchFound && matchesConstraints(req, m)) {
            params = pathMatchFound.params;
            matchFound = true;
            return true; // exit loop after first match    
        }
    });

    return {
        matchFound,
        params,
    };
}
