import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export async function GET(request: Request) {
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
    console.log("Fetching assets for user ID:", userId);

    // Fetch assets for the user using the fetched user ID
    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId) // Use the fetched user ID instead of decoded.id
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
    }

    // Calculate items count for folders
    const assetsWithItemCount = await Promise.all(
      assets.map(async (asset) => {
        if (asset.type === "folder") {
          const { count } = await supabase
            .from("assets")
            .select("*", { count: "exact", head: true })
            .eq("parent_id", asset.id);
          
          return { ...asset, items: count || 0 };
        }
        return asset;
      })
    );

    return NextResponse.json(assetsWithItemCount);
  } catch (error) {
    console.error("Error fetching assets:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}