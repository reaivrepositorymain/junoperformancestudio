import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing code parameter' }, { status: 400 });
  }

  // Exchange the code for an access token
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    code,
  });

  const tokenUrl = `https://graph.facebook.com/v24.0/oauth/access_token?${params.toString()}`;

  try {
    const fbRes = await fetch(tokenUrl, { method: 'GET' });
    const fbData = await fbRes.json();

    if (fbData.error) {
      return NextResponse.json({ success: false, error: fbData.error.message }, { status: 400 });
    }

    // fbData contains access_token, token_type, expires_in
    return NextResponse.json({ success: true, access_token: fbData.access_token, data: fbData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unknown error' }, { status: 500 });
  }
}