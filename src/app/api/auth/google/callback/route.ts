import { NextResponse } from 'next/server';
import { findOrCreateGoogleUser, setSession } from '@/lib/marketplace-data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/sign-up-login-screen?error=google_not_configured`);
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenResponse.json();

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileResponse.json();
  const user = await findOrCreateGoogleUser({ email: profile.email, name: profile.name });
  await setSession(user);
  return NextResponse.redirect(`${origin}/product-browsing-screen`);
}
