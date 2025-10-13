import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: fetch a proposal by ID for editing
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

    // Ensure pricing field exists and is properly formatted
    if (!proposal.pricing) {
        proposal.pricing = [];
    }

    return NextResponse.json({ proposal });
}

// PUT: update a proposal by ID
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const body = await request.json();

    // Ensure pricing is properly structured
    if (body.pricing && !Array.isArray(body.pricing)) {
        body.pricing = [];
    }

    const { error } = await supabase
        .from("proposals")
        .update({
            title: body.title,
            client_name: body.client_name,
            overview: body.overview,
            overview_details: body.overview_details,
            hero: body.hero,
            solutions: body.solutions,
            migration_process: body.migration_process,
            timelines: body.timelines,
            logo_base64: body.logo_base64,
            pricing: body.pricing || [], // New pricing field as JSON array
        })
        .eq("id", id);

    if (error) {
        console.error("Proposal update error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}