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
    console.log("Creating folder for user ID:", userId);

    // Parse request body
    const { name, parent_id } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    // Handle parent_id properly - convert string "null" to actual null
    let cleanParentId: string | null = null;
    if (parent_id && parent_id !== "null" && parent_id !== "undefined" && parent_id.trim() !== "") {
      cleanParentId = parent_id;
    }

    console.log("Clean parent ID:", cleanParentId); // Debug log

    // Check if folder with same name exists in the same parent directory
    // Use different query methods for null vs non-null parent_id
    let existingFolderQuery = supabase
      .from("assets")
      .select("id")
      .eq("user_id", userId)
      .eq("name", name.trim())
      .eq("type", "folder");

    // Handle null parent_id properly with is() method
    if (cleanParentId === null) {
      existingFolderQuery = existingFolderQuery.is("parent_id", null);
    } else {
      existingFolderQuery = existingFolderQuery.eq("parent_id", cleanParentId);
    }

    const { data: existingFolder, error: checkError } = await existingFolderQuery.single();

    if (existingFolder) {
      return NextResponse.json({ error: "A folder with this name already exists" }, { status: 409 });
    }

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Check error:", checkError);
      return NextResponse.json({ error: "Failed to check existing folders" }, { status: 500 });
    }

    // Create folder in database
    const { data: folderData, error: createError } = await supabase
      .from("assets")
      .insert({
        user_id: userId,
        parent_id: cleanParentId, // This will now be null instead of "null"
        name: name.trim(),
        type: "folder",
        mimetype: null,
        size: null,
        storage_path: null,
      })
      .select()
      .single();

    if (createError) {
      console.error("Create folder error:", createError);
      return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
    }

    // Add items count (0 for new folder)
    const folderWithItems = { ...folderData, items: 0 };

    return NextResponse.json(folderWithItems);
  } catch (error) {
    console.error("Error creating folder:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}