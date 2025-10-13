import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
        const body = await request.json();
        
        const {
            invoice_number,
            issue_date,
            due_date,
            work_reference,
            bill_to_name,
            bill_to_title,
            bill_to_address,
            bill_to_email,
            bill_to_phone,
            service_type,
            projects,
            billing_basis,
            payment_method,
            currency,
            service_notes,
            subtotal,
            tax_amount,
            total_amount,
            payment_due_date,
            payment_reference,
            bank_name,
            account_name,
            account_number,
            country,
            status,
            items
        } = body;

        // Validate required fields
        if (!invoice_number || !issue_date || !due_date || !work_reference || 
            !bill_to_name || !service_type || !currency || 
            subtotal === undefined || total_amount === undefined) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "At least one invoice item is required" },
                { status: 400 }
            );
        }

        // Validate items have required fields
        for (const item of items) {
            if (!item.description || item.quantity === undefined || 
                item.rate === undefined || item.amount === undefined) {
                return NextResponse.json(
                    { error: "All items must have description, quantity, rate, and amount" },
                    { status: 400 }
                );
            }
        }

        // Check if invoice number already exists
        const { data: existingInvoice } = await supabase
            .from("invoices")
            .select("id")
            .eq("invoice_number", invoice_number)
            .single();

        if (existingInvoice) {
            return NextResponse.json(
                { error: "Invoice number already exists" },
                { status: 409 }
            );
        }

        // Insert invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .insert({
                invoice_number,
                issue_date,
                due_date,
                work_reference,
                bill_to_name,
                bill_to_title,
                bill_to_address,
                bill_to_email,
                bill_to_phone,
                service_type,
                projects,
                billing_basis,
                payment_method,
                currency,
                service_notes,
                subtotal,
                tax_amount: tax_amount || 0,
                total_amount,
                payment_due_date,
                payment_reference,
                bank_name,
                account_name,
                account_number,
                country,
                status: status || 'pending'
            })
            .select()
            .single();

        if (invoiceError) {
            console.error("Invoice creation error:", invoiceError);
            return NextResponse.json(
                { error: "Failed to create invoice" },
                { status: 500 }
            );
        }

        // Insert invoice items
        const invoiceItems = items.map((item: any, index: number) => ({
            invoice_id: invoice.id,
            description: item.description,
            detailed_description: item.detailed_description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            sort_order: index
        }));

        const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(invoiceItems);

        if (itemsError) {
            console.error("Invoice items creation error:", itemsError);
            // Rollback: delete the invoice if items creation fails
            await supabase
                .from("invoices")
                .delete()
                .eq("id", invoice.id);
            
            return NextResponse.json(
                { error: "Failed to create invoice items" },
                { status: 500 }
            );
        }

        // Generate OTP for the invoice using the same function as proposals
        const otpCode = generateOtpCode();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Insert OTP
        const { data: otp, error: otpError } = await supabase
            .from("otps")
            .insert({
                code: otpCode,
                invoice_id: invoice.id,
                client_name: bill_to_name,
                expires_at: expiresAt
            })
            .select()
            .single();

        if (otpError) {
            console.error("OTP creation error:", otpError);
            // Don't fail the entire operation, just log the error
            console.warn("Invoice created but OTP generation failed");
        }

        return NextResponse.json({
            success: true,
            message: "Invoice created successfully",
            invoice: {
                id: invoice.id,
                invoice_number: invoice.invoice_number,
                total_amount: invoice.total_amount,
                currency: invoice.currency
            },
            otp: otp ? {
                code: otp.code,
                expires_at: otp.expires_at
            } : null
        });

    } catch (error) {
        console.error("Invoice creation API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}