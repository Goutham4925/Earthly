import { NextResponse } from 'next/server';
import { registerUser, setSession } from '@/lib/marketplace-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerUser(body);
    if (user.role === 'user') await setSession(user);
    return NextResponse.json({
      user,
      message: user.status === 'pending' ? 'Application submitted for admin approval' : 'Account created',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unable to register' }, { status: 500 });
  }
}
