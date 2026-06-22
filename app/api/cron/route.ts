import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { Bot } from 'grammy';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bot = new Bot(process.env.BOT_TOKEN!);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // события завтра
  const tomorrowEvents = await sql`
    SELECT e.*, emp.telegram_id, emp.name as emp_name
    FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    JOIN employees emp ON ep.employee_id = emp.id
    WHERE DATE(e.date) = DATE(${tomorrow.toISOString()})
    AND emp.telegram_id IS NOT NULL
  `;

  // события сегодня
  const todayEvents = await sql`
    SELECT e.*, emp.telegram_id, emp.name as emp_name
    FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    JOIN employees emp ON ep.employee_id = emp.id
    WHERE DATE(e.date) = DATE(${now.toISOString()})
    AND emp.telegram_id IS NOT NULL
  `;

  for (const event of tomorrowEvents) {
    await bot.api.sendMessage(
      event.telegram_id,
      `⏰ Завтра: *${event.title}*\n📅 ${new Date(event.date).toLocaleString('ru-RU')}\n${event.description ? `📝 ${event.description}` : ''}`,
      { parse_mode: 'Markdown' }
    );
  }

  for (const event of todayEvents) {
    await bot.api.sendMessage(
      event.telegram_id,
      `🔔 Сегодня: *${event.title}*\n📅 ${new Date(event.date).toLocaleString('ru-RU')}\n${event.description ? `📝 ${event.description}` : ''}`,
      { parse_mode: 'Markdown' }
    );
  }

  return NextResponse.json({ ok: true, sent: tomorrowEvents.length + todayEvents.length });
}