/* eslint-disable @typescript-eslint/no-require-imports */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const { login } = require('../../../../api/auth');
    const user = await login(email, password);
    const res = NextResponse.json({ user }, { status: 200 });
    // set a simple HttpOnly cookie with the user id for demo sessions
    res.cookies.set('userId', String(user.id), { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Error' }, { status: 400 });
  }
}
