import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export async function POST(request: Request) {
  // Parse form data
  const formData = await request.formData();
  const file = formData.get("image") as File;

  if (!file) {
    console.log("No image provided");
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Get token from cookies
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    console.log("Unauthorized: No token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded: { email: string } | null = null;
  try {
    decoded = jwt.verify(token, SECRET_KEY) as { email: string };
    console.log("Decoded token:", decoded);
  } catch (err) {
    console.log("Invalid token:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userEmail = decoded.email;

  // Upload image to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${userEmail}-${Date.now()}.${fileExt}`;
  const filePath = `profile-images/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.log("Upload failed:", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("assets")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  console.log("Public URL:", publicUrl);

  // Update user profile_image in DB
  const { error: updateError } = await supabase
    .from("users")
    .update({ profile_image: publicUrl })
    .eq("comp_email", userEmail);

  if (updateError) {
    console.log("Failed to update user:", updateError);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  console.log("Profile image updated for:", userEmail);
  return NextResponse.json({ success: true, url: publicUrl });
}