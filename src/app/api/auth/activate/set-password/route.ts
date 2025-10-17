import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export async function POST(request: Request) {
    const { token, password } = await request.json();

    if (!token || !password) {
        return NextResponse.json({ error: "Missing token or password." }, { status: 400 });
    }

    // Find the user with the token and check expiry/status
    const { data: user } = await supabase
        .from("users")
        .select("id, comp_email, invitation_expires_at, status, role")
        .eq("invitation_token", token)
        .single();

    if (!user) {
        return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    if (user.status !== "pending" || !user.invitation_expires_at || new Date(user.invitation_expires_at) < new Date()) {
        // Optionally, delete the user if expired
        await supabase.from("users").delete().eq("id", user.id);
        return NextResponse.json({ error: "This activation link has expired." }, { status: 400 });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Update user: set password, status active, remove invitation token/expiry
    const { error } = await supabase
        .from("users")
        .update({
            password_hash,
            status: "active",
            invitation_token: null,
            invitation_expires_at: null,
        })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json({ error: "Failed to activate account." }, { status: 500 });
    }

    // Generate JWT token for auto-login
    const authToken = jwt.sign(
        { userId: user.id, email: user.comp_email, role: user.role },
        SECRET_KEY,
        { expiresIn: "48h" }
    );

    const response = NextResponse.json({
        success: true,
        email: user.comp_email,
        token: authToken,
    });

    // Set the token in cookies
    response.cookies.set("token", authToken, { httpOnly: true, secure: false, path: "/" });

    return response;
}