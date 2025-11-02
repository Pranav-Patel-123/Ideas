/* eslint-disable @typescript-eslint/no-require-imports */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const { signup } = require('../../../../api/auth');
    const user = await signup(email, password);
    const res = NextResponse.json({ user }, { status: 201 });
    // set cookie with user id on signup as well
    res.cookies.set('userId', String(user.id), { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Error' }, { status: 400 });
  }
}
