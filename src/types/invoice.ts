export interface InvoiceItem {
    id: string;
    description: string;
    detailed_description?: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    work_reference: string;
    bill_to_name: string;
    bill_to_title?: string;
    bill_to_address?: string;
    bill_to_email?: string;
    bill_to_phone?: string;
    service_type: string;
    projects?: string;
    billing_basis?: string;
    payment_method?: string;
    currency: string;
    service_notes?: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    payment_due_date?: string;
    payment_reference?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    country?: string;
    status: string;
    items: InvoiceItem[];
}

export type InvoiceWithItems = Invoice & {
    items: InvoiceItem[];
};

export type InvoiceFormValues = {
    invoice_number: string;
    issue_date: string;
    due_date: string;
    work_reference: string;

    // Billing Information
    bill_to_name: string;
    bill_to_title?: string;
    bill_to_address?: string;
    bill_to_email?: string;
    bill_to_phone?: string;

    // Service Details
    service_type: string;
    projects?: string;
    billing_basis?: string;
    payment_method?: string;
    currency: string;
    service_notes?: string;

    // Financial
    subtotal: number;
    tax_amount: number;
    total_amount: number;

    // Payment Information
    payment_due_date?: string;
    payment_reference?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    country?: string;

    // Status
    status: string;

    // Items
    items: {
        description: string;
        detailed_description?: string;
        quantity: number;
        rate: number;
        amount: number;
    }[];
};