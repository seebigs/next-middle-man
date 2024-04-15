import { NextResponse } from 'next/server';

export async function POST(req) {
    const json = await req.json();
    if (json.uid === '12345' && json.utm === 'campaign') {
        return NextResponse.json({ message: 'data received' }, { status: 418 });
    }
    return NextResponse.json({ message: 'failure' }, { status: 500 });
}
