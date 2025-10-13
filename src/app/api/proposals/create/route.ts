import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

function generateOtpCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Insert proposal
        const { data: proposal, error: proposalError } = await supabase
            .from("proposals")
            .insert([
                {
                    title: data.title,
                    client_name: data.client_name,
                    overview: data.overview,
                    overview_details: data.overview_details,
                    hero: data.hero,
                    solutions: data.solutions,
                    migration_process: data.migration_process,
                    timelines: data.timelines,
                    logo_base64: data.logo_base64,
                    pricing: data.pricing || [], // New pricing field as JSON array
                }
            ])
            .select()
            .single();

        if (proposalError || !proposal) {
            console.error("Proposal Insert Error:", proposalError);
            return NextResponse.json({ error: "Failed to create proposal." }, { status: 500 });
        }

        // Generate OTP code and expiration
        const otpCode = generateOtpCode();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Insert OTP linked to proposal
        const { data: otp, error: otpError } = await supabase
            .from("otps")
            .insert([
                {
                    code: otpCode,
                    proposal_id: proposal.id,
                    client_name: proposal.client_name,
                    expires_at: expiresAt,
                }
            ])
            .select()
            .single();

        if (otpError || !otp) {
            console.error("OTP Insert Error:", otpError);
            return NextResponse.json({ error: "Failed to create OTP." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            proposal,
            otp,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Server error." }, { status: 500 });
    }
}