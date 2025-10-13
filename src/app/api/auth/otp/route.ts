import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Missing code." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("otps")
    .select("id, proposal_id, invoice_id, expires_at")
    .eq("code", code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid code." }, { status: 401 });
  }

  // Check if OTP has expired
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  
  if (now > expiresAt) {
    // Delete expired OTP
    await supabase
      .from("otps")
      .delete()
      .eq("id", data.id);
    
    return NextResponse.json({ error: "Code has expired." }, { status: 410 });
  }

  // Determine type and return appropriate response
  if (data.proposal_id) {
    return NextResponse.json({ 
      success: true, 
      type: "proposal",
      id: data.proposal_id 
    });
  } else if (data.invoice_id) {
    return NextResponse.json({ 
      success: true, 
      type: "invoice",
      id: data.invoice_id 
    });
  } else {
    return NextResponse.json({ error: "Invalid OTP data." }, { status: 400 });
  }
}