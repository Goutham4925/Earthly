import { NextResponse } from 'next/server';
import { clearSession, getSessionUser } from '@/lib/marketplace-data';

export async function GET() {
  return NextResponse.json({ user: await getSessionUser() });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
