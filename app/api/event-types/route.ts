import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAdmin } from '@/lib/auth';

export async function GET() {
  const types = await sql`SELECT * FROM event_types ORDER BY name ASC`;
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  if (!getAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, color } = await req.json();
  const [type] = await sql`
    INSERT INTO event_types (name, color)
    VALUES (${name}, ${color})
    RETURNING *
  `;
  return NextResponse.json(type);
}

export async function DELETE(req: NextRequest) {
  if (!getAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  await sql`DELETE FROM event_types WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}