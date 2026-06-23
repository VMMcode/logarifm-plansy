const { Bot } = require('grammy');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '../.env.local' });

const bot = new Bot(process.env.BOT_TOKEN);
const sql = neon(process.env.DATABASE_URL);

// Регистрация при /start
bot.command('start', async (ctx) => {
  const username = ctx.from?.username;
  if (!username) {
    return ctx.reply('У тебя не установлен username в Telegram. Установи его в настройках и попробуй снова.');
  }

  const [employee] = await sql`
    SELECT * FROM employees WHERE username = ${username.toLowerCase()}
  `;

  if (!employee) {
    return ctx.reply('Тебя нет в списке команды. Обратись к руководителю.');
  }

  await sql`
    UPDATE employees SET telegram_id = ${ctx.from.id} WHERE id = ${employee.id}
  `;

  await ctx.reply(
    `Привет, ${employee.name}! 👋\n\nТы подключён к календарю команды.\n\n` +
    `Команды:\n/today — события на сегодня\n/week — события на эту неделю`
  );
});

// События на сегодня
bot.command('today', async (ctx) => {
  const telegramId = ctx.from?.id;

  const events = await sql`
    SELECT e.title, e.date, e.description, et.name as type_name
    FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    JOIN employees emp ON ep.employee_id = emp.id
    LEFT JOIN event_types et ON e.type_id = et.id
    WHERE emp.telegram_id = ${telegramId}
    AND DATE(e.date) = CURRENT_DATE
    ORDER BY e.date ASC
  `;

  if (!events.length) {
    return ctx.reply('На сегодня событий нет 🎉');
  }

  const text = events.map(e =>
    `📌 *${e.title}*\n` +
    `🕐 ${new Date(e.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n` +
    (e.type_name ? `📂 ${e.type_name}\n` : '') +
    (e.description ? `📝 ${e.description}` : '')
  ).join('\n\n');

  await ctx.reply(`*События на сегодня:*\n\n${text}`, { parse_mode: 'Markdown' });
});

// События на неделю
bot.command('week', async (ctx) => {
  const telegramId = ctx.from?.id;

  const events = await sql`
    SELECT e.title, e.date, e.description, et.name as type_name
    FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    JOIN employees emp ON ep.employee_id = emp.id
    LEFT JOIN event_types et ON e.type_id = et.id
    WHERE emp.telegram_id = ${telegramId}
    AND e.date >= CURRENT_DATE
    AND e.date < CURRENT_DATE + INTERVAL '7 days'
    ORDER BY e.date ASC
  `;

  if (!events.length) {
    return ctx.reply('На эту неделю событий нет 🎉');
  }

  const text = events.map(e => {
    const d = new Date(e.date);
    const dateStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', weekday: 'short' });
    const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `📌 *${e.title}*\n` +
      `📅 ${dateStr} в ${timeStr}\n` +
      (e.type_name ? `📂 ${e.type_name}\n` : '') +
      (e.description ? `📝 ${e.description}` : '');
  }).join('\n\n');

  await ctx.reply(`*События на неделю:*\n\n${text}`, { parse_mode: 'Markdown' });
});

bot.on('message', (ctx) => {
  console.log('Получено сообщение от:', ctx.from?.username, ctx.message?.text);
});
bot.start();
console.log('Бот запущен');