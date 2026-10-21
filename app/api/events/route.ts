import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAdmin } from '@/lib/auth';

export async function GET() {
  const events = await sql`
    SELECT e.id, e.title, e.type_id, e.description, e.created_by,
      to_char(e.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS') as date,
      et.name as type_name,
      et.color as type_color,
      json_agg(json_build_object('id', emp.id, 'name', emp.name, 'username', emp.username)) as participants
    FROM events e
    LEFT JOIN event_types et ON e.type_id = et.id
    LEFT JOIN event_participants ep ON e.id = ep.event_id
    LEFT JOIN employees emp ON ep.employee_id = emp.id
    GROUP BY e.id, et.name, et.color
    ORDER BY e.date ASC
  `;
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, type_id, date, description, participant_ids } = await req.json();

  const [event] = await sql`
    INSERT INTO events (title, type_id, date, description, created_by)
    VALUES (${title}, ${type_id}, ${date}, ${description}, ${admin})
    RETURNING *
  `;

  if (participant_ids?.length) {
    await sql`
      INSERT INTO event_participants (event_id, employee_id)
      SELECT ${event.id}, unnest(${participant_ids}::int[])
    `;
  }

  return NextResponse.json(event);
}

export async function PUT(req: NextRequest) {
  if (!getAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, title, type_id, date, description, participant_ids } = await req.json();

  const [event] = await sql`
    UPDATE events
    SET title = ${title}, type_id = ${type_id}, date = ${date}, description = ${description}
    WHERE id = ${id}
    RETURNING *
  `;

  await sql`DELETE FROM event_participants WHERE event_id = ${id}`;

  if (participant_ids?.length) {
    await sql`
      INSERT INTO event_participants (event_id, employee_id)
      SELECT ${id}, unnest(${participant_ids}::int[])
    `;
  }

  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest) {
  if (!getAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  await sql`DELETE FROM events WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}