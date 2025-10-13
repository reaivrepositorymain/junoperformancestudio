import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export async function POST(request: Request) {
  const { email, password, isAdmin } = await request.json();

  // Fetch user by email, including role
  const { data: user, error } = await supabase
    .from("users")
    .select("id, comp_email, password_hash, role")
    .eq("comp_email", email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // If admin login, but user is not admin, reject and do NOT set cookie
  if (isAdmin && user.role !== "admin") {
    return NextResponse.json({ error: "You do not have admin access." }, { status: 403 });
  }

  // Compare password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // Generate a JWT token for this user, including role
  const token = jwt.sign(
    { userId: user.id, email: user.comp_email, role: user.role },
    SECRET_KEY,
    { expiresIn: "48h" }
  );

  // Only set cookie if login is valid (including admin check)
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.comp_email, role: user.role },
    token,
  });
  response.cookies.set("token", token, { httpOnly: true, secure: false, path: "/" });

  return response;
}