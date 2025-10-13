import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(request: Request) {
  try {
    const { invoiceId, otpId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // First check if the invoice exists
    const { data: invoice, error: findError } = await supabase
      .from("invoices")
      .select("id, invoice_number")
      .eq("id", invoiceId)
      .single();

    if (findError || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Delete the OTP if an OTP ID was provided
    if (otpId) {
      const { error: otpDeleteError } = await supabase
        .from("otps")
        .delete()
        .eq("id", otpId);

      if (otpDeleteError) {
        console.error("Failed to delete OTP:", otpDeleteError);
        // We'll continue with invoice deletion even if OTP deletion fails
      }
    }

    // Delete the invoice - invoice_items will be deleted automatically due to ON DELETE CASCADE
    const { error: invoiceDeleteError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);

    if (invoiceDeleteError) {
      return NextResponse.json(
        { error: "Failed to delete invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoice_number} deleted successfully`,
    });
  } catch (error) {
    console.error("Error in invoice delete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}