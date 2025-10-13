import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    try {
        const { data: invoices, error } = await supabase
            .from("invoices")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching invoices:", error);
            return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
        }

        return NextResponse.json({ invoices: invoices || [] });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}