import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const otpId = searchParams.get("id");

  if (!otpId) {
    return NextResponse.json({ error: "Missing OTP id" }, { status: 400 });
  }

  // Get OTP record
  const { data: otp, error: otpError } = await supabase
    .from("otps")
    .select("id, code, client_name, proposal_id, expires_at")
    .eq("id", otpId)
    .single();

  if (otpError || !otp) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 404 });
  }

  // Get proposal record with new pricing field
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", otp.proposal_id)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Merge OTP and proposal data for frontend
  return NextResponse.json({
    otp: {
      id: otp.id,
      code: otp.code,
      client_name: otp.client_name,
      expires_at: otp.expires_at,
    },
    proposal,
  });
}