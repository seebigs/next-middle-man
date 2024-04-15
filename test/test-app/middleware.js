import nextMiddleMan from '../../index.js';
import * as simpleJson from './middleware/simpleJson.js';
import * as simpleRedirect from './middleware/simpleRedirect.js';
import * as complex1 from './middleware/complex1.js';
import * as complex2 from './middleware/complex2.js';
import * as complex3 from './middleware/complex3.js';

import { NextResponse } from 'next/server'

export const middleware = nextMiddleMan([
    simpleJson,
    simpleRedirect,
    complex1,
    complex2,
    complex3,
]);

export const config = {
    matcher: [
        '/((?!_next|favicon.ico).*)',
    ],
};
