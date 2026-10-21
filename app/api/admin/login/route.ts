import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const name = getAdmin(req);
  if (!name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ name });
}