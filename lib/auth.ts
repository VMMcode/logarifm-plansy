import { timingSafeEqual } from 'crypto';

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// Возвращает имя админа по паролю или null, если пароль не подошёл
export function getAdmin(req: Request): string | null {
  const given = req.headers.get('x-admin-password');
  if (!given) return null;

  let users: Record<string, string> = {};
  try {
    users = JSON.parse(process.env.ADMIN_USERS || '{}');
  } catch {}

  for (const [name, pass] of Object.entries(users)) {
    if (safeEqual(given, pass)) return name;
  }
  return null;
}