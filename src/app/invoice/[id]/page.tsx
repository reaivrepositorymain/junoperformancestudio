"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Invoice, InvoiceItem } from "@/types/invoice";

export default function InvoicePage() {
    const params = useParams();
    const invoiceId = params?.id as string;
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/invoices/${invoiceId}`);
                if (res.ok) {
                    const data = await res.json();
                    // Set both invoice and items from the API response
                    setInvoice(data.invoice);
                    setItems(data.items || []); // Set items separately
                    console.log("Invoice data:", data.invoice);
                    console.log("Items data:", data.items);
                }
            } catch (error) {
                console.error("Failed to fetch invoice:", error);
            } finally {
                setLoading(false);
            }
        };

        if (invoiceId) {
            fetchInvoice();
        }
    }, [invoiceId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-lg text-gray-500">Loading invoice...</span>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-lg text-red-500">Invoice not found</span>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: invoice.currency,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-0">
            <div className="max-w-4xl mx-auto bg-white shadow-lg">
                {/* Header */}
                <div className="bg-slate-700 text-white p-10 justify-between items-start">
                    <div>
                        <div className="mb-10 border-2 border-[#91cd49] text-[#91cd49] text-center px-5 py-2 rounded font-semibold uppercase tracking-widest text-sm">
                            INVOICE
                        </div>
                        <div className="inline-block bg-[#91cd49] text-white px-8 py-4 rounded-lg text-3xl font-bold tracking-wide">
                            REAIV
                        </div>
                        <div className="grid grid-cols-2 gap-5 mt-8">
                            <div className="text-left">
                                <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Invoice Number</div>
                                <div className="text-base text-[#91cd49] font-semibold">{invoice.invoice_number}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Issue Date</div>
                                <div className="text-base text-[#91cd49] font-semibold">{formatDate(invoice.issue_date)}</div>
                            </div>
                            <div className="text-left">
                                <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Work / Reference</div>
                                <div className="text-base text-[#91cd49] font-semibold">{invoice.work_reference}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Due Date</div>
                                <div className="text-base text-[#91cd49] font-semibold">{formatDate(invoice.due_date)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amount Due Section */}
                <div className="bg-green-50 p-8 text-center border-b-4 border-[#91cd49]">
                    <div className="text-sm text-gray-600 uppercase tracking-widest mb-2">Amount Due ({invoice.currency})</div>
                    <div className="text-5xl text-slate-700 font-bold my-3">{formatCurrency(invoice.total_amount)}</div>
                    <div className="text-base text-gray-600 mt-2">
                        Due {formatDate(invoice.payment_due_date || invoice.due_date)}
                    </div>
                    <button className="bg-[#91cd49] hover:bg-[#7ab33a] text-white px-10 py-4 rounded text-lg font-semibold mt-5 transition-colors">
                        Pay {formatCurrency(invoice.total_amount)}
                    </button>
                </div>

                {/* Invoice Body */}
                <div className="p-10">
                    {/* Billing Information */}
                    <div className="mb-10">
                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-4">BILLED TO</h3>
                                <p className="font-bold mb-1">{invoice.bill_to_name}</p>
                                {invoice.bill_to_title && <p className="mb-1">{invoice.bill_to_title}</p>}
                                {invoice.bill_to_address && <p className="mb-1">{invoice.bill_to_address}</p>}
                                {invoice.bill_to_email && (
                                    <p className="mb-1">
                                        Email: <span className="text-[#91cd49] font-semibold">{invoice.bill_to_email}</span>
                                    </p>
                                )}
                                {invoice.bill_to_phone && (
                                    <p className="mb-1">
                                        Phone: <span className="text-[#91cd49] font-semibold">{invoice.bill_to_phone}</span>
                                    </p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-4">SERVICE DETAILS</h3>
                                <p className="mb-1"><strong>Service Type:</strong> {invoice.service_type}</p>
                                {invoice.projects && <p className="mb-1"><strong>Projects:</strong> {invoice.projects}</p>}
                                {invoice.billing_basis && <p className="mb-1"><strong>Billing Basis:</strong> {invoice.billing_basis}</p>}
                                {invoice.payment_method && <p className="mb-1"><strong>Payment Method:</strong> {invoice.payment_method}</p>}
                                <p className="mb-1"><strong>Currency:</strong> {invoice.currency}</p>
                                {invoice.service_notes && (
                                    <p className="mt-3 text-sm italic text-gray-600">{invoice.service_notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-wide mb-5 pb-3 border-b-2 border-gray-100">
                            Invoice Items
                        </h2>
                        <table className="w-full border-collapse mt-5">
                            <thead>
                                <tr>
                                    <th className="bg-slate-700 text-white p-4 text-left font-semibold uppercase text-xs tracking-wide w-[55%]">
                                        Description
                                    </th>
                                    <th className="bg-slate-700 text-white p-4 text-center font-semibold uppercase text-xs tracking-wide">
                                        Qty
                                    </th>
                                    <th className="bg-slate-700 text-white p-4 text-center font-semibold uppercase text-xs tracking-wide">
                                        Rate
                                    </th>
                                    <th className="bg-slate-700 text-white p-4 text-right font-semibold uppercase text-xs tracking-wide">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Use items state instead of invoice.items */}
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-5 border-b border-gray-100 text-center text-gray-500">
                                            No items found for this invoice
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-5 border-b border-gray-100 align-top">
                                                <div className="font-semibold text-slate-700 mb-1">{item.description}</div>
                                                {item.detailed_description && (
                                                    <div className="text-sm text-gray-600 leading-relaxed">{item.detailed_description}</div>
                                                )}
                                            </td>
                                            <td className="p-5 border-b border-gray-100 text-center">{item.quantity}</td>
                                            <td className="p-5 border-b border-gray-100 text-center">{formatCurrency(item.rate)}</td>
                                            <td className="p-5 border-b border-gray-100 text-right">{formatCurrency(item.amount)}</td>
                                        </tr>
                                    ))
                                )}
                                <tr className="bg-gray-50">
                                    <td colSpan={3} className="p-5 text-right font-semibold">Subtotal</td>
                                    <td className="p-5 text-right font-semibold">{formatCurrency(invoice.subtotal || invoice.total_amount)}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td colSpan={3} className="p-5 text-right font-semibold">Taxes</td>
                                    <td className="p-5 text-right font-semibold">
                                        {invoice.tax_amount > 0 ? formatCurrency(invoice.tax_amount) : '—'}
                                    </td>
                                </tr>
                                <tr className="bg-slate-700 text-white text-lg font-bold">
                                    <td colSpan={3} className="p-5 text-right">Amount Due ({invoice.currency})</td>
                                    <td className="p-5 text-right">{formatCurrency(invoice.total_amount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-wide mb-5 pb-3 border-b-2 border-gray-100">
                            Payment Information
                        </h2>
                        <div className="bg-amber-50 p-8 rounded-lg">
                            <h3 className="text-orange-600 mb-5 text-lg font-semibold">{invoice.payment_method}</h3>
                            <p className="mb-2">
                                <strong>Payment Due:</strong> {formatDate(invoice.payment_due_date || invoice.due_date)}
                            </p>
                            {invoice.payment_reference && (
                                <p className="mb-4">
                                    <strong>Reference:</strong>{' '}
                                    <span className="bg-green-100 px-3 py-1 rounded font-mono font-semibold text-slate-700">
                                        {invoice.payment_reference}
                                    </span>
                                </p>
                            )}
                            {(invoice.bank_name || invoice.account_name || invoice.account_number) && (
                                <div className="bg-white p-5 rounded-lg mt-4 border border-orange-200">
                                    <h4 className="text-slate-700 mb-4 text-base font-semibold">Recipient Bank Details</h4>
                                    <div className="grid grid-cols-[180px_1fr] gap-2 text-sm leading-relaxed">
                                        {invoice.bank_name && (
                                            <>
                                                <span className="font-semibold text-gray-600">Bank Name:</span>
                                                <span>{invoice.bank_name}</span>
                                            </>
                                        )}
                                        {invoice.account_name && (
                                            <>
                                                <span className="font-semibold text-gray-600">Account Name:</span>
                                                <span>{invoice.account_name}</span>
                                            </>
                                        )}
                                        {invoice.account_number && (
                                            <>
                                                <span className="font-semibold text-gray-600">Account Number:</span>
                                                <span>{invoice.account_number}</span>
                                            </>
                                        )}
                                        {invoice.country && (
                                            <>
                                                <span className="font-semibold text-gray-600">Country:</span>
                                                <span>{invoice.country}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-blue-50 p-5 border-l-4 border-blue-400 rounded-md mt-5 text-sm leading-relaxed">
                            <strong>Note:</strong> This invoice is issued under the contingency schedule defined in the signed agreement.
                            If the standard milestone schedule applies instead, please advise and a split invoice (USD demo + PHP final)
                            will be issued accordingly.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-700 text-white p-10 text-center">
                    <div className="text-4xl font-bold text-[#91cd49] mb-3">reaiv</div>
                    <div className="text-base text-[#91cd49] mb-4">REAIV - Reimagine AI Ventures</div>
                    <div className="text-sm opacity-80 tracking-wide">Think different. Build intelligent. Scale effortlessly.</div>
                    <div className="text-xs opacity-60 mt-5">This invoice was generated using the REAIV template format.</div>
                </div>
            </div>
        </div>
    );
}