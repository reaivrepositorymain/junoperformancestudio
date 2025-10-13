import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export async function GET(request: Request) {
    // Authenticate user (similar to your other routes)
    const token = request.headers
        .get("cookie")
        ?.split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    if (!token) return new Response("Unauthorized", { status: 401 });

    let decoded: { email: string } | null = null;
    try {
        decoded = jwt.verify(token, SECRET_KEY) as { email: string };
    } catch {
        return new Response("Unauthorized", { status: 401 });
    }

    // Get user profile image path from DB
    const { data, error } = await supabase
        .from("users")
        .select("profile_image")
        .eq("email", decoded.email)
        .single();

    if (error || !data?.profile_image) {
        return new Response("Not found", { status: 404 });
    }

    // Download image from Supabase Storage
    // Extract path from public URL
    const publicUrl = data.profile_image;
    const pathMatch = publicUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/);
    if (!pathMatch) return new Response("Invalid image path", { status: 400 });

    const bucket = pathMatch[1];
    const filePath = pathMatch[2];

    const { data: fileData, error: fileError } = await supabase.storage
        .from(bucket)
        .download(filePath);

    if (fileError || !fileData) {
        return new Response("Image not found", { status: 404 });
    }

    // Return the image as a stream
    return new Response(fileData, {
        headers: { "Content-Type": "image/jpeg" }, // or detect type
    });
}