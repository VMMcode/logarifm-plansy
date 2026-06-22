import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const employees = await sql`SELECT * FROM employees ORDER BY name ASC`;
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-admin-password');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, username } = await req.json();

  const [employee] = await sql`
    INSERT INTO employees (name, username)
    VALUES (${name}, ${username.replace('@', '')})
    RETURNING *
  `;

  return NextResponse.json(employee);
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('x-admin-password');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  await sql`DELETE FROM employees WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}