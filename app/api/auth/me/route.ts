/* eslint-disable @typescript-eslint/no-require-imports */
import { NextResponse } from 'next/server';

const connect = require('../../../../api/db');
const User = require('../../../../models/user');

function parseCookies(cookieHeader: string | null) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((c: string) => {
    const [k, ...v] = c.split('=');
    out[k.trim()] = decodeURIComponent((v || []).join('=').trim());
  });
  return out;
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const userId = cookies['userId'];
    if (!userId) return NextResponse.json({ user: null }, { status: 200 });

    await connect();
    const user = await User.findById(userId).select('email');
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({ user: { id: user._id, email: user.email } }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Error' }, { status: 500 });
  }
}
