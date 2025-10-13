import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
        return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
    }

    try {
        // Fetch invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .select("*")
            .eq("id", id)
            .single();

        if (invoiceError || !invoice) {
            console.error("Invoice fetch error:", invoiceError);
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Fetch invoice items
        const { data: items, error: itemsError } = await supabase
            .from("invoice_items")
            .select(`
                id,
                description,
                detailed_description,
                quantity,
                rate,
                amount,
                sort_order
            `)
            .eq("invoice_id", id)
            .order("sort_order", { ascending: true });

        if (itemsError) {
            console.error("Invoice items fetch error:", itemsError);
            return NextResponse.json({ error: "Failed to fetch invoice items" }, { status: 500 });
        }

        console.log("Fetched invoice:", invoice.invoice_number);
        console.log("Fetched items:", items);

        return NextResponse.json({
            success: true,
            invoice,
            items: items || []
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
        return NextResponse.json({ error: "Invalid invoice ID format" }, { status: 400 });
    }

    try {
        const body = await request.json();

        const {
            work_reference,
            issue_date,
            due_date,
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
        if (!work_reference || !issue_date || !due_date || !bill_to_name || 
            !service_type || !currency || subtotal === undefined || 
            total_amount === undefined) {
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

        // Update invoice
        const { error: invoiceError } = await supabase
            .from("invoices")
            .update({
                work_reference,
                issue_date,
                due_date,
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
                status: status || 'pending',
                updated_at: new Date().toISOString()
            })
            .eq("id", id);

        if (invoiceError) {
            console.error("Invoice update error:", invoiceError);
            return NextResponse.json(
                { error: "Failed to update invoice" },
                { status: 500 }
            );
        }

        // Delete existing items
        const { error: deleteItemsError } = await supabase
            .from("invoice_items")
            .delete()
            .eq("invoice_id", id);

        if (deleteItemsError) {
            console.error("Error deleting existing items:", deleteItemsError);
            return NextResponse.json(
                { error: "Failed to update invoice items" },
                { status: 500 }
            );
        }

        // Insert updated items
        const invoiceItems = items.map((item: any, index: number) => ({
            invoice_id: id,
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
            console.error("Invoice items update error:", itemsError);
            return NextResponse.json(
                { error: "Failed to update invoice items" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Invoice updated successfully"
        });

    } catch (error) {
        console.error("Invoice update API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}