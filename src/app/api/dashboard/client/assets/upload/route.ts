import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export async function POST(request: Request) {
  try {
    // Extract token from cookies
    const token = request.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Token not found" }, { status: 401 });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, SECRET_KEY) as { id?: string; email: string };
    
    // Fetch user from database using email to get the actual user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("comp_email", decoded.email)
      .single();

    if (userError || !userData) {
      console.error("User lookup error:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.id;
    console.log("Found user ID:", userId);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const parentIdRaw = formData.get("parent_id") as string;

    // Handle parent_id properly
    let parent_id: string | null = null;
    if (parentIdRaw && parentIdRaw !== "null" && parentIdRaw !== "undefined" && parentIdRaw.trim() !== "") {
      parent_id = parentIdRaw;
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `assets/${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Determine file type based on mimetype
    let assetType = "file";
    if (file.type.startsWith("image/")) {
      assetType = "image";
    } else if (file.type === "application/pdf") {
      assetType = "document";
    }

    // Save file metadata to database using the fetched user ID
    const { data: assetData, error: dbError } = await supabase
      .from("assets")
      .insert({
        user_id: userId, // Use the ID from the users table
        parent_id: parent_id,
        name: file.name,
        type: assetType,
        mimetype: file.type,
        size: file.size,
        storage_path: uploadData.path,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("user-assets").remove([uploadData.path]);
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 });
    }

    return NextResponse.json(assetData);
  } catch (error) {
    console.error("Error uploading file:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}