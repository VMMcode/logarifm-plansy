import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAdmin } from '@/lib/auth';

export async function GET() {
  const rows = await sql`SELECT * FROM settings`;
  const result: Record<string, string> = {};
  rows.forEach(r => result[r.key] = r.value);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!getAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key, value } = await req.json();
  await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}
  `;
  return NextResponse.json({ ok: true });
}