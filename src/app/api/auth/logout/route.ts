import { NextResponse } from "next/server";

export async function POST(request: Request) {
    // Clear the "token" cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", "", { httpOnly: true, secure: false, path: "/", maxAge: 0 });
    return response;
}