import { NextResponse } from 'next/server';
import { AccountStatus, getSessionUser, listUsers, updateUserStatus, UserRole } from '@/lib/marketplace-data';

export async function GET(request: Request) {
  const current = await getSessionUser();
  if (!current || current.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const url = new URL(request.url);
  const role = url.searchParams.get('role') as UserRole | null;
  const status = url.searchParams.get('status') as AccountStatus | null;
  return NextResponse.json({ users: await listUsers(role ?? undefined, status ?? undefined) });
}

export async function PATCH(request: Request) {
  const current = await getSessionUser();
  if (!current || current.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const { id, status } = await request.json();
  return NextResponse.json(await updateUserStatus(id, status));
}
