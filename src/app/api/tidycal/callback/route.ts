import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing." }, { status: 400 });
  }

  try {
    const response = await fetch("https://tidycal.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.TIDYCAL_CLIENT_ID,
        client_secret: process.env.TIDYCAL_CLIENT_SECRET,
        redirect_uri: process.env.TIDYCAL_REDIRECT_URL,
        grant_type: "authorization_code",
        code, // The authorization code received in the callback
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to exchange authorization code.", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Access Token Response:", data);

    // Return the access token and other data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error during token exchange:", error);
    return NextResponse.json(
      { error: "An error occurred during token exchange.", details: String(error) },
      { status: 500 }
    );
  }
}