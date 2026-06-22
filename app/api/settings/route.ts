import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const rows = await sql`SELECT * FROM settings`;
  const result: Record<string, string> = {};
  rows.forEach(r => result[r.key] = r.value);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-admin-password');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key, value } = await req.json();
  await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}
  `;
  return NextResponse.json({ ok: true });
}