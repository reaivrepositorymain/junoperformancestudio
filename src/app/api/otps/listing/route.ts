import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    try {
        const { data: otps, error } = await supabase
            .from("otps")
            .select("id, code, proposal_id, invoice_id, client_name, expires_at, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching OTPs:", error);
            return NextResponse.json({ error: "Failed to fetch OTPs" }, { status: 500 });
        }

        return NextResponse.json({ otps: otps || [] });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}