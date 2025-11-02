/* eslint-disable @typescript-eslint/no-require-imports */
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true }, { status: 200 });
  // clear demo cookie
  res.cookies.set('userId', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
