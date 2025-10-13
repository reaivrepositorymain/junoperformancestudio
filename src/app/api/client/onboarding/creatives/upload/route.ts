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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderPath = formData.get("folder_path") as string | undefined;

    if (!file || typeof file.name !== "string") {
      return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Ensure the "Creatives" folder exists for the user
    const { data: creativesFolder, error: creativesError } = await supabase
      .from("assets")
      .select("id")
      .eq("user_id", userId)
      .eq("name", "Creatives")
      .eq("type", "folder")
      .single();

    if (creativesError || !creativesFolder) {
      return NextResponse.json({ error: "Creatives folder not found" }, { status: 404 });
    }

    let parentId = creativesFolder.id;

    // If folderPath is provided (file is inside a folder), create the folder structure
    if (folderPath) {
      // Split the path to get folder hierarchy
      // e.g., "DM_Sans/DMSans-VariableFont_opsz,wght.ttf" -> ["DM_Sans"]
      const pathParts = folderPath.split("/");
      const fileName = pathParts.pop(); // Remove the file name from the path
      const folders = pathParts; // Remaining parts are folder names

      // Create each folder in the hierarchy
      for (const folderName of folders) {
        // Check if the folder already exists
        const { data: existingFolder, error: folderError } = await supabase
          .from("assets")
          .select("id")
          .eq("user_id", userId)
          .eq("parent_id", parentId)
          .eq("name", folderName)
          .eq("type", "folder")
          .single();

        if (folderError || !existingFolder) {
          // Create the folder if it doesn't exist
          const { data: newFolder, error: createFolderError } = await supabase
            .from("assets")
            .insert({
              user_id: userId,
              parent_id: parentId,
              name: folderName,
              type: "folder",
            })
            .select()
            .single();

          if (createFolderError) {
            console.error("Error creating folder:", createFolderError);
            return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
          }

          parentId = newFolder.id; // Update parentId to the newly created folder
        } else {
          parentId = existingFolder.id; // Update parentId to the existing folder
        }
      }
    }

    // Generate file path for storage
    const storagePath = `assets/${userId}/Creatives/${folderPath || file.name}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-assets")
      .upload(storagePath, file, {
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

    // Save file metadata to database
    const { data: assetData, error: dbError } = await supabase
      .from("assets")
      .insert({
        user_id: userId,
        parent_id: parentId, // This will be Creatives ID for root files, or subfolder ID for nested files
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