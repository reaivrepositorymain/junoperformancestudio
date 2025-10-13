import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    if (!id) {
        return NextResponse.json({ error: "Missing proposal id" }, { status: 400 });
    }

    const { data: proposal, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !proposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ proposal });
}