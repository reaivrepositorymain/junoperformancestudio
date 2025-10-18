import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, userId, password } = await request.json();

  if (!token || !userId || !password) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Find user by id and token
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, invitation_token, invitation_expires_at")
    .eq("id", userId)
    .eq("invitation_token", token)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  // Check if token is expired
  const now = new Date();
  const expiresAt = user.invitation_expires_at ? new Date(user.invitation_expires_at) : null;
  if (!expiresAt || now > expiresAt) {
    return NextResponse.json({ error: "Reset link has expired." }, { status: 400 });
  }

  // Hash new password
  const password_hash = await bcrypt.hash(password, 10);

  // Update user password and clear token/expiry
  const { error: updateError } = await supabase
    .from("users")
    .update({
      password_hash,
      invitation_token: null,
      invitation_expires_at: null
    })
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}