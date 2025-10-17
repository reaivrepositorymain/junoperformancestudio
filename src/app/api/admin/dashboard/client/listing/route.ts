import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from("users")
        .select("id, name, comp_email, cli_email, profile_image, role, created_at, status") 
        .eq("role", "client");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clients: data });
}

export async function PATCH(request: Request) {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
        return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const { error } = await supabase
        .from("users")
        .update({ status })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}