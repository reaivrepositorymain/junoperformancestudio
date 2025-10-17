import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

// Rename asset
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params; // Add await here
        const { name } = await request.json();

        // Extract token from cookies
        const token = request.headers
            .get("cookie")
            ?.split("; ")
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ error: "Unauthorized: Token not found" }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY) as { email: string };

        // Get user ID from email
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("comp_email", decoded.email)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get asset info
        const { data: asset, error: assetError } = await supabase
            .from("assets")
            .select("*")
            .eq("id", id)
            .eq("user_id", userData.id)
            .single();

        if (assetError || !asset) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        // If it's a file, rename in storage bucket as well
        if (asset.type === "file" && asset.storage_path) {
            const bucket = "user-assets"; // Change if your bucket name is different
            const oldPath = asset.storage_path;
            const pathParts = oldPath.split("/");
            pathParts[pathParts.length - 1] = name; // Replace filename
            const newPath = pathParts.join("/");

            // Move file in storage: copy then delete
            const { error: copyError } = await supabase.storage
                .from(bucket)
                .copy(oldPath, newPath);

            if (copyError) {
                return NextResponse.json({ error: "Failed to copy file in storage" }, { status: 500 });
            }

            const { error: deleteError } = await supabase.storage
                .from(bucket)
                .remove([oldPath]);

            if (deleteError) {
                return NextResponse.json({ error: "Failed to remove old file in storage" }, { status: 500 });
            }

            // Update asset name and storage_path in DB
            const { error: updateError } = await supabase
                .from("assets")
                .update({ name, storage_path: newPath })
                .eq("id", id)
                .eq("user_id", userData.id);

            if (updateError) {
                return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
            }

            return NextResponse.json({ success: true });
        }

        // If not a file, just update the name
        const { error: updateError } = await supabase
            .from("assets")
            .update({ name })
            .eq("id", id)
            .eq("user_id", userData.id);

        if (updateError) {
            return NextResponse.json({ error: "Failed to rename asset" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Rename asset error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Delete asset
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        // Extract token from cookies
        const token = request.headers
            .get("cookie")
            ?.split("; ")
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ error: "Unauthorized: Token not found" }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY) as { email: string };

        // Get user ID from email (use comp_email for consistency)
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("comp_email", decoded.email)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get asset info
        const { data: asset, error: assetError } = await supabase
            .from("assets")
            .select("*")
            .eq("id", id)
            .eq("user_id", userData.id)
            .single();

        if (assetError || !asset) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        // If it's a file, delete from storage bucket
        if (asset.type === "file" && asset.storage_path) {
            const bucket = "user-assets";
            const { error: storageError } = await supabase.storage
                .from(bucket)
                .remove([asset.storage_path]);
            if (storageError) {
                return NextResponse.json({ error: "Failed to delete file from storage" }, { status: 500 });
            }
        }

        // Delete asset from database
        const { error: deleteError } = await supabase
            .from("assets")
            .delete()
            .eq("id", id)
            .eq("user_id", userData.id);

        if (deleteError) {
            return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete asset error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}