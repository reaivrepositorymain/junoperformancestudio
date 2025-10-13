// filepath: d:\reaiv-proposal\src\app\api\proposals\listing\route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    // Fetch all proposals
    const { data: proposals, error: proposalsError } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });

    // Fetch all OTPs
    const { data: otps, error: otpsError } = await supabase
        .from("otps")
        .select("*")
        .order("created_at", { ascending: false });

    if (proposalsError || otpsError) {
        return NextResponse.json(
            { error: proposalsError?.message || otpsError?.message },
            { status: 500 }
        );
    }

    // Attach OTPs to proposals manually
    const proposalsWithOtps = proposals.map(proposal => ({
        ...proposal,
        otps: otps.find(o => o.proposal_id === proposal.id) || null,
    }));

    return NextResponse.json({ proposals: proposalsWithOtps, otps });
}