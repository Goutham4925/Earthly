import { NextResponse } from 'next/server';
import { getOrderById, getSessionUser } from '@/lib/marketplace-data';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (user.role === 'user' && order.customerId !== user.id) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  return NextResponse.json({ order });
}
