import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { Bot } from 'grammy';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get('type');
  const bot = new Bot(process.env.BOT_TOKEN!);

  if (type === 'today') {
    const events = await sql`
      SELECT e.title, e.date, e.description, et.name as type_name, emp.telegram_id
      FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      JOIN employees emp ON ep.employee_id = emp.id
      LEFT JOIN event_types et ON e.type_id = et.id
      WHERE (e.date AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'Europe/Moscow')::date
      AND emp.telegram_id IS NOT NULL
    `;

    for (const e of events) {
      const timeStr = new Date(e.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
      await bot.api.sendMessage(
        e.telegram_id,
        `☀️ *Доброе утро! События на сегодня:*\n\n` +
        `📌 *${e.title}*\n` +
        `🕐 ${timeStr}\n` +
        (e.type_name ? `📂 ${e.type_name}\n` : '') +
        (e.description ? `📝 ${e.description}` : ''),
        { parse_mode: 'Markdown' }
      );
    }
    return NextResponse.json({ ok: true, type: 'today', sent: events.length });
  }

  if (type === 'tomorrow') {
    const events = await sql`
      SELECT e.title, e.date, e.description, et.name as type_name, emp.telegram_id
      FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      JOIN employees emp ON ep.employee_id = emp.id
      LEFT JOIN event_types et ON e.type_id = et.id
      WHERE (e.date AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'Europe/Moscow')::date + 1
      AND emp.telegram_id IS NOT NULL
    `;

    for (const e of events) {
      const timeStr = new Date(e.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
      await bot.api.sendMessage(
        e.telegram_id,
        `🌙 *Завтра:*\n\n` +
        `📌 *${e.title}*\n` +
        `🕐 ${timeStr}\n` +
        (e.type_name ? `📂 ${e.type_name}\n` : '') +
        (e.description ? `📝 ${e.description}` : ''),
        { parse_mode: 'Markdown' }
      );
    }
    return NextResponse.json({ ok: true, type: 'tomorrow', sent: events.length });
  }

  if (type === 'week') {
    const events = await sql`
      SELECT e.title, e.date, e.description, et.name as type_name, emp.telegram_id, emp.id as emp_id
      FROM events e
      JOIN event_participants ep ON e.id = ep.event_id
      JOIN employees emp ON ep.employee_id = emp.id
      LEFT JOIN event_types et ON e.type_id = et.id
      WHERE (e.date AT TIME ZONE 'UTC')::date > (now() AT TIME ZONE 'Europe/Moscow')::date
      AND (e.date AT TIME ZONE 'UTC')::date <= (now() AT TIME ZONE 'Europe/Moscow')::date + 7
      AND emp.telegram_id IS NOT NULL
      ORDER BY emp.id, e.date ASC
    `;

    const byEmployee: Record<number, typeof events> = {};
    for (const e of events) {
      if (!byEmployee[e.emp_id]) byEmployee[e.emp_id] = [];
      byEmployee[e.emp_id].push(e);
    }

    for (const [, empEvents] of Object.entries(byEmployee)) {
      const text = empEvents.map(e => {
        const d = new Date(e.date);
        const dateStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', weekday: 'short', timeZone: 'UTC' });
        const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        return `📌 *${e.title}*\n📅 ${dateStr} в ${timeStr}\n` +
          (e.type_name ? `📂 ${e.type_name}\n` : '') +
          (e.description ? `📝 ${e.description}` : '');
      }).join('\n\n');

      await bot.api.sendMessage(
        empEvents[0].telegram_id,
        `📆 *События на следующую неделю:*\n\n${text}`,
        { parse_mode: 'Markdown' }
      );
    }
    return NextResponse.json({ ok: true, type: 'week', sent: Object.keys(byEmployee).length });
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
}