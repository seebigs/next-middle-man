import type { NextRequest, NextResponse, NextFetchEvent } from 'next/server'

export interface MiddlewareEvent extends NextFetchEvent {}

export interface MiddlewareRequest extends NextRequest {
    params: Object;
}

export interface MiddlewareRequestMods {
    cookies: { name: string, value: string, path?: string }[]
    headers: { name: string, value: string }[]
}

export interface MiddlewareResponse extends NextResponse {}

export interface MiddlewareResponseMods {
    cookies: { name: string, value: string, path?: string }[]
    headers: { name: string, value: string }[]
}

export interface MiddlewareHandler {
    (request: MiddlewareRequest, event: NextFetchEvent): Promise<NextResponse> | Promise<void>;
}

export type MiddlewareMatcherHasItem = {
    type: string,
    key?: string,
    value?: string,
};

export type MiddlewareMatcher = {
    source?: string,
    has?: MiddlewareMatcherHasItem[]
    missing?: MiddlewareMatcherHasItem[]
};

export interface MiddlewareConfig {
    matcher: string | Array<string | MiddlewareMatcher>;
}

export interface Middleware {
    middleware: MiddlewareHandler;
    config?: MiddlewareConfig;
}
