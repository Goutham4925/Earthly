import { NextResponse } from 'next/server';
import { getSessionUser, listProducts, upsertProduct } from '@/lib/marketplace-data';

export async function GET() {
  try {
    return NextResponse.json({ products: await listProducts() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unable to load products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const user = await getSessionUser();
    if (!user || !['admin', 'vendor'].includes(user.role)) {
      return NextResponse.json({ error: 'Vendor or admin access required' }, { status: 403 });
    }
    if (user.role === 'vendor' && product.vendor !== user.vendor) {
      return NextResponse.json({ error: 'You can only update your own products' }, { status: 403 });
    }
    return NextResponse.json({ product: await upsertProduct(product) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unable to save product' }, { status: 500 });
  }
}
