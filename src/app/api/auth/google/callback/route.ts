import { NextResponse } from 'next/server';
import { findOrCreateGoogleUser, setSession } from '@/lib/marketplace-data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Use the actual incoming origin to avoid redirect_uri mismatches during local dev.
  const origin = url.origin;

  try {
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

    const tokenData: unknown = await tokenResponse.json();
    const accessToken =
      typeof tokenData === 'object' && tokenData && 'access_token' in tokenData
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (tokenData as any).access_token
        : null;

    if (!tokenResponse.ok || !accessToken) {
      console.error('Google token exchange failed:', tokenData);
      return NextResponse.redirect(`${origin}/sign-up-login-screen?error=google_token_failed`);
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile: unknown = await profileResponse.json();

    const email =
      typeof profile === 'object' && profile && 'email' in profile ? (profile as any).email : null;
    const name =
      typeof profile === 'object' && profile && 'name' in profile ? (profile as any).name : null;

    if (!profileResponse.ok || !email || !name) {
      console.error('Google profile fetch failed:', profile);
      return NextResponse.redirect(`${origin}/sign-up-login-screen?error=google_profile_failed`);
    }

    const user = await findOrCreateGoogleUser({ email, name });
    await setSession(user);
    return NextResponse.redirect(`${origin}/product-browsing-screen`);
  } catch (err) {
    console.error('Google callback error:', err);
    // Never throw here; redirect so user doesn't see HTTP 500.
    return NextResponse.redirect(`${origin}/sign-up-login-screen?error=google_callback_error`);
  }
}
