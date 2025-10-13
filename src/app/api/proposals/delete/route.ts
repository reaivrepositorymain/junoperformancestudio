import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(request: Request) {
    const { proposalId, otpId } = await request.json();

    console.log("Deleting proposal:", proposalId, "and OTP:", otpId);

    // Delete proposal
    const { error: proposalError } = await supabase
        .from("proposals")
        .delete()
        .eq("id", proposalId);

    if (proposalError) {
        console.error("Proposal delete error:", proposalError);
    }

    // Delete OTP
    const { error: otpError } = await supabase
        .from("otps")
        .delete()
        .eq("id", otpId);

    if (otpError) {
        console.error("OTP delete error:", otpError);
    }

    if (proposalError || otpError) {
        return NextResponse.json({ error: proposalError?.message || otpError?.message }, { status: 500 });
    }

    console.log("Delete successful");
    return NextResponse.json({ success: true });
}