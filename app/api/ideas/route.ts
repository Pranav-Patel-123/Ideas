/* eslint-disable @typescript-eslint/no-require-imports */
import { NextResponse } from 'next/server';

const connect = require('../../../api/db');
const Idea = require('../../../models/idea');

function parseCookies(cookieHeader: string | null) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((c: string) => {
    const [k, ...v] = c.split('=');
    out[k.trim()] = decodeURIComponent((v || []).join('=').trim());
  });
  return out;
}

export async function GET() {
  try {
    await connect();
    const ideas = await Idea.find().populate('author', 'email').sort({ createdAt: -1 });
    return NextResponse.json({ ideas }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Error fetching ideas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description } = body;
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

    const cookieHeader = (req as any).headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const authorId = cookies['userId'];
    if (!authorId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connect();
  const idea = await Idea.create({ description: description || '', author: authorId });
    return NextResponse.json({ idea }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Error creating idea' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const cookieHeader = (req as any).headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const authorId = cookies['userId'];
    if (!authorId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connect();
    const idea = await Idea.findById(id);
    if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    if (!idea.author) return NextResponse.json({ error: 'Idea has no author' }, { status: 400 });
    if (String(idea.author) !== String(authorId)) {
      return NextResponse.json({ error: 'Not allowed to delete this idea' }, { status: 403 });
    }

    await Idea.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Error deleting idea' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
  const { id, description } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const cookieHeader = (req as any).headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const authorId = cookies['userId'];
    if (!authorId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connect();
    const idea = await Idea.findById(id);
    if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    if (!idea.author) return NextResponse.json({ error: 'Idea has no author' }, { status: 400 });
    if (String(idea.author) !== String(authorId)) {
      return NextResponse.json({ error: 'Not allowed to edit this idea' }, { status: 403 });
    }

  const update: any = {};
  if (typeof description === 'string') update.description = description;

  // set updatedAt via mongoose
  const updated = await Idea.findByIdAndUpdate(id, update, { new: true }).populate('author', 'email');
    return NextResponse.json({ idea: updated }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || 'Error updating idea' }, { status: 500 });
  }
}
