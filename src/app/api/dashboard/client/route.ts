import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export async function GET(request: Request) {
  // Extract token from cookies
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Token not found" }, { status: 401 });
  }
  
  let decoded: { email: string } | null = null;
  try {
    decoded = jwt.verify(token, SECRET_KEY) as { email: string };
    console.log("Decoded token:", decoded);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }

  const userEmail = decoded.email;

  // Fetch user profile from users table by email
  const { data, error } = await supabase
    .from("users")
    .select("id, name, comp_email, role, profile_image")
    .eq("comp_email", userEmail)
    .single();

  console.log("Fetched user data:", data);

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (data.role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(data);
}