import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json({ valid: false, error: "Missing token." }, { status: 400 });
    }

    const { data: user } = await supabase
        .from("users")
        .select("id, invitation_expires_at, status")
        .eq("invitation_token", token)
        .single();

    if (!user) {
        return NextResponse.json({ valid: false, error: "Invalid or expired token." }, { status:400 });
    }

    if (user.status !== "pending" || !user.invitation_expires_at || new Date(user.invitation_expires_at) < new Date()) {
        return NextResponse.json({ valid: false, error: "This activation link has expired." }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
}