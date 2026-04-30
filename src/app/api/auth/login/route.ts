import { NextResponse } from 'next/server';
import { authenticateUser, setSession, UserRole } from '@/lib/marketplace-data';

const dashboardByRole: Record<UserRole, string> = {
  user: '/product-browsing-screen',
  vendor: '/vendor-dashboard',
  employee: '/delivery-dashboard',
  admin: '/admin-dashboard',
};

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();
    const user = await authenticateUser(email, password, role);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials for selected role' }, { status: 401 });
    }

    await setSession(user);
    return NextResponse.json({ user, redirectTo: dashboardByRole[role as UserRole] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unable to sign in' }, { status: 401 });
  }
}
