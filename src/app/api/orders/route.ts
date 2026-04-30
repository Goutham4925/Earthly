import { NextResponse } from 'next/server';
import { createOrder, getSessionUser, listOrders, updateOrder } from '@/lib/marketplace-data';

export async function GET() {
  try {
    const user = await getSessionUser();
    const orders = await listOrders();
    if (!user) return NextResponse.json({ orders: [] });
    if (user.role === 'user') return NextResponse.json({ orders: orders.filter((order) => order.customerId === user.id) });
    if (user.role === 'vendor') return NextResponse.json({ orders: orders.filter((order) => order.vendor === user.vendor) });
    if (user.role === 'employee') return NextResponse.json({ orders: orders.filter((order) => order.assignedAgentId === user.id) });
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const order = await request.json();
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    return NextResponse.json({ order: await createOrder({ ...order, customerId: user.id, customerName: user.name }) });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !['admin', 'employee'].includes(user.role)) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }
    const { id, status, assignedAgentId, assignedAgent } = await request.json();
    return NextResponse.json(await updateOrder(id, { status, assignedAgentId, assignedAgent }));
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update order' }, { status: 500 });
  }
}
