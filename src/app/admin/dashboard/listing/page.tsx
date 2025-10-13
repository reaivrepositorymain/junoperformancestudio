"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Copy, Plus, FileText, Receipt, Download, Mail } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for better typography
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2' }
    ]
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 8, // Reduced base font size
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
        backgroundColor: '#ffffff',
    },
    // Header Section - Much more compact
    header: {
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        padding: 15, // Reduced from 25
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flexDirection: 'column',
    },
    logo: {
        backgroundColor: '#91cd49',
        color: '#ffffff',
        padding: '6 18', // Much smaller padding
        borderRadius: 4,
        fontSize: 18, // Reduced from 24
        fontWeight: 'bold',
        textTransform: 'lowercase',
        letterSpacing: 0.3,
        marginBottom: 12, // Reduced from 20
        textAlign: 'center',
        width: 80, // Reduced from 100
    },
    invoiceBadge: {
        backgroundColor: 'transparent',
        border: '1px solid #91cd49', // Thinner border
        color: '#91cd49',
        padding: '4 10', // Much smaller padding
        borderRadius: 3,
        fontSize: 8, // Reduced from 10
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        textAlign: 'center',
        width: 50, // Reduced from 70
    },
    // Invoice Meta Grid - Very compact
    invoiceMeta: {
        marginTop: 12, // Reduced from 20
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // Reduced from 15
    },
    metaItem: {
        width: '45%',
        marginBottom: 6, // Reduced from 10
    },
    metaItemRight: {
        width: '45%',
        marginBottom: 6,
        alignItems: 'flex-end',
    },
    metaLabel: {
        fontSize: 7, // Reduced from 10
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        opacity: 0.7,
        marginBottom: 2, // Reduced from 4
        color: '#ffffff',
    },
    metaValue: {
        fontSize: 10, // Reduced from 14
        color: '#91cd49',
        fontWeight: 'bold',
    },
    // Amount Due Section - Very compact
    amountSection: {
        backgroundColor: '#e8f5e9',
        padding: '12 20', // Much smaller padding
        textAlign: 'center',
        borderBottom: '2px solid #91cd49', // Thinner border
    },
    amountLabel: {
        fontSize: 9, // Reduced from 12
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4, // Reduced from 8
    },
    amountValue: {
        fontSize: 28, // Reduced from 36
        color: '#2c3e50',
        fontWeight: 'bold',
        marginVertical: 4, // Reduced from 8
    },
    dueDate: {
        fontSize: 10, // Reduced from 14
        color: '#666666',
        marginTop: 4, // Reduced from 8
    },
    payButton: {
        backgroundColor: '#91cd49',
        color: '#ffffff',
        padding: '6 20', // Much smaller padding
        borderRadius: 3,
        fontSize: 10, // Reduced from 14
        fontWeight: 'bold',
        marginTop: 8, // Reduced from 15
        textAlign: 'center',
        alignSelf: 'center',
        width: 140, // Reduced from 180
    },
    // Invoice Body - Much smaller padding
    content: {
        padding: 15, // Reduced from 25
        paddingBottom: 50, // Reduced space for footer
    },
    section: {
        marginBottom: 15, // Reduced from 25
    },
    sectionTitle: {
        fontSize: 10, // Reduced from 14
        fontWeight: 'bold',
        color: '#2c3e50',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 8, // Reduced from 15
        paddingBottom: 4, // Reduced from 8
        borderBottom: '1px solid #f0f0f0', // Thinner border
    },
    // Info Grid - Very compact
    infoGrid: {
        flexDirection: 'row',
        gap: 20, // Reduced from 30
    },
    infoBlock: {
        width: '48%',
    },
    infoBlockTitle: {
        fontSize: 9, // Reduced from 12
        fontWeight: 'bold',
        color: '#666666',
        marginBottom: 6, // Reduced from 12
    },
    infoText: {
        fontSize: 7, // Reduced from 9
        lineHeight: 1.2, // Reduced from 1.4
        marginBottom: 2, // Reduced from 4
        color: '#333333',
    },
    infoTextBold: {
        fontSize: 7, // Reduced from 9
        fontWeight: 'bold',
        marginBottom: 2, // Reduced from 4
        color: '#333333',
    },
    infoHighlight: {
        color: '#91cd49',
        fontWeight: 'bold',
    },
    infoNote: {
        marginTop: 4, // Reduced from 8
        fontStyle: 'italic',
        color: '#666666',
        fontSize: 6, // Reduced from 8
        lineHeight: 1.2, // Reduced from 1.3
    },
    // Table Styles - Very compact
    table: {
        marginTop: 8, // Reduced from 15
    },
    tableHeader: {
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        flexDirection: 'row',
        paddingVertical: 6, // Reduced from 10
        paddingHorizontal: 8, // Reduced from 12
    },
    tableHeaderCell: {
        fontSize: 7, // Reduced from 10
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    tableHeaderDesc: { width: '55%' },
    tableHeaderQty: { width: '15%', textAlign: 'center' },
    tableHeaderRate: { width: '15%', textAlign: 'center' },
    tableHeaderAmount: { width: '15%', textAlign: 'right' },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8, // Reduced from 12
        paddingHorizontal: 8, // Reduced from 12
        borderBottom: '1px solid #f0f0f0',
    },
    tableCell: {
        fontSize: 7, // Reduced from 9
        lineHeight: 1.2, // Reduced from 1.3
        color: '#333333',
    },
    tableCellDesc: { width: '55%' },
    tableCellQty: { width: '15%', textAlign: 'center' },
    tableCellRate: { width: '15%', textAlign: 'center' },
    tableCellAmount: { width: '15%', textAlign: 'right' },
    itemDescription: {
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 2, // Reduced from 3
        fontSize: 8, // Reduced from 10
    },
    itemDetail: {
        fontSize: 6, // Reduced from 8
        color: '#666666',
        lineHeight: 1.2, // Reduced from 1.3
    },
    itemDetailBold: {
        fontWeight: 'bold',
    },
    itemDetailItalic: {
        fontStyle: 'italic',
    },
    // Summary Rows - Very compact
    summaryRow: {
        backgroundColor: '#f8f9fa',
        flexDirection: 'row',
        paddingVertical: 4, // Reduced from 8
        paddingHorizontal: 8, // Reduced from 12
        fontWeight: 'bold',
    },
    summaryLabel: {
        width: '70%',
        textAlign: 'right',
        fontSize: 7, // Reduced from 9
        color: '#333333',
    },
    summaryValue: {
        width: '30%',
        textAlign: 'right',
        fontSize: 7, // Reduced from 9
        color: '#333333',
    },
    grandTotalRow: {
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        flexDirection: 'row',
        paddingVertical: 8, // Reduced from 12
        paddingHorizontal: 8, // Reduced from 12
        fontSize: 10, // Reduced from 14
        fontWeight: 'bold',
    },
    grandTotalLabel: {
        width: '70%',
        textAlign: 'right',
    },
    grandTotalValue: {
        width: '30%',
        textAlign: 'right',
    },
    // Payment Information - Very compact
    paymentSection: {
        backgroundColor: '#fff8e1',
        padding: 12, // Reduced from 20
        borderRadius: 4, // Reduced from 8
        marginTop: 10, // Reduced from 20
    },
    paymentTitle: {
        fontSize: 9, // Reduced from 13
        fontWeight: 'bold',
        color: '#f57c00',
        marginBottom: 8, // Reduced from 15
    },
    paymentInfo: {
        fontSize: 7, // Reduced from 9
        marginBottom: 3, // Reduced from 6
        color: '#333333',
        lineHeight: 1.2, // Reduced from 1.3
    },
    paymentInfoBold: {
        fontWeight: 'bold',
    },
    referenceCode: {
        backgroundColor: '#e8f5e9',
        padding: '2 6', // Much smaller padding
        borderRadius: 2,
        fontFamily: 'Courier',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    // Payment Method Box - Very compact
    paymentMethod: {
        backgroundColor: '#ffffff',
        padding: 8, // Reduced from 15
        borderRadius: 3, // Reduced from 6
        marginTop: 6, // Reduced from 12
        border: '1px solid #ffe0b2',
    },
    paymentMethodTitle: {
        color: '#2c3e50',
        marginBottom: 6, // Reduced from 10
        fontSize: 8, // Reduced from 11
        fontWeight: 'bold',
    },
    paymentDetails: {
        fontSize: 6, // Reduced from 8
        lineHeight: 1.3, // Reduced from 1.4
    },
    paymentDetailRow: {
        flexDirection: 'row',
        marginBottom: 2, // Reduced from 4
    },
    paymentLabel: {
        width: 60, // Reduced from 80
        fontWeight: 'bold',
        color: '#666666',
    },
    paymentValue: {
        flex: 1,
        color: '#333333',
    },
    // Note Box - Very compact
    noteBox: {
        backgroundColor: '#e3f2fd',
        padding: 8, // Reduced from 15
        borderLeft: '3px solid #2196f3', // Thinner border
        borderRadius: 2, // Reduced from 4
        marginTop: 8, // Reduced from 15
        fontSize: 6, // Reduced from 8
        lineHeight: 1.3, // Reduced from 1.4
        color: '#333333',
    },
    noteTitle: {
        fontWeight: 'bold',
        marginBottom: 2, // Reduced from 4
    },
    // Footer - Much more compact
    footer: {
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        padding: 8, // Reduced from 15
        textAlign: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerLogo: {
        fontSize: 14, // Reduced from 20
        fontWeight: 'bold',
        color: '#91cd49',
        marginBottom: 2, // Reduced from 5
    },
    footerSubtitle: {
        fontSize: 8, // Reduced from 11
        color: '#91cd49',
        marginBottom: 2, // Reduced from 5
    },
    footerTagline: {
        fontSize: 6, // Reduced from 9
        opacity: 0.8,
        letterSpacing: 0.3,
        marginBottom: 2, // Reduced from 5
    },
    footerNote: {
        fontSize: 5, // Reduced from 8
        opacity: 0.6,
    },
});

// Updated InvoicePDF component with more compact structure
const InvoicePDF = ({ invoice, items, formatCurrency, formatDate }: any) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header - Very compact */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logo}>
                        <Text>reaiv</Text>
                    </View>
                    
                    {/* Invoice Meta - 2x2 Grid - Compact */}
                    <View style={styles.invoiceMeta}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Invoice Number</Text>
                            <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
                        </View>
                        <View style={styles.metaItemRight}>
                            <Text style={[styles.metaLabel, { textAlign: 'right' }]}>Issue Date</Text>
                            <Text style={[styles.metaValue, { textAlign: 'right' }]}>{formatDate(invoice.issue_date)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Work / Reference</Text>
                            <Text style={styles.metaValue}>{invoice.work_reference || 'N/A'}</Text>
                        </View>
                        <View style={styles.metaItemRight}>
                            <Text style={[styles.metaLabel, { textAlign: 'right' }]}>Due Date</Text>
                            <Text style={[styles.metaValue, { textAlign: 'right' }]}>{formatDate(invoice.due_date)}</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.invoiceBadge}>
                    <Text>INVOICE</Text>
                </View>
            </View>

            {/* Amount Due Section - Very compact */}
            <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Amount Due ({invoice.currency})</Text>
                <Text style={styles.amountValue}>{formatCurrency(invoice.total_amount, invoice.currency)}</Text>
                <Text style={styles.dueDate}>Due {formatDate(invoice.payment_due_date || invoice.due_date)}</Text>
                <View style={styles.payButton}>
                    <Text>Pay {formatCurrency(invoice.total_amount, invoice.currency)}</Text>
                </View>
            </View>

            {/* Invoice Body - Very compact content */}
            <View style={styles.content}>
                {/* Billing Information - Compact 2 column grid */}
                <View style={styles.section}>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoBlockTitle}>BILLED TO</Text>
                            <Text style={styles.infoTextBold}>{invoice.bill_to_name}</Text>
                            {invoice.bill_to_title && <Text style={styles.infoText}>{invoice.bill_to_title}</Text>}
                            {invoice.bill_to_address && <Text style={styles.infoText}>{invoice.bill_to_address}</Text>}
                            {invoice.bill_to_email && (
                                <Text style={styles.infoText}>
                                    Email: <Text style={styles.infoHighlight}>{invoice.bill_to_email}</Text>
                                </Text>
                            )}
                            {invoice.bill_to_phone && (
                                <Text style={styles.infoText}>
                                    Phone: <Text style={styles.infoHighlight}>{invoice.bill_to_phone}</Text>
                                </Text>
                            )}
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.infoBlockTitle}>SERVICE DETAILS</Text>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoTextBold}>Service Type:</Text> {invoice.service_type}
                            </Text>
                            {invoice.projects && (
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoTextBold}>Projects:</Text> {invoice.projects}
                                </Text>
                            )}
                            {invoice.billing_basis && (
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoTextBold}>Billing Basis:</Text> {invoice.billing_basis}
                                </Text>
                            )}
                            {invoice.payment_method && (
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoTextBold}>Payment Method:</Text> {invoice.payment_method}
                                </Text>
                            )}
                            <Text style={styles.infoText}>
                                <Text style={styles.infoTextBold}>Currency:</Text> {invoice.currency}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Invoice Items - Very compact table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Invoice Items</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, styles.tableHeaderDesc]}>Description</Text>
                            <Text style={[styles.tableHeaderCell, styles.tableHeaderQty]}>Qty</Text>
                            <Text style={[styles.tableHeaderCell, styles.tableHeaderRate]}>Rate</Text>
                            <Text style={[styles.tableHeaderCell, styles.tableHeaderAmount]}>Amount</Text>
                        </View>

                        {/* Table Rows */}
                        {(!items || items.length === 0) ? (
                            <View style={styles.tableRow}>
                                <View style={styles.tableCellDesc}>
                                    <Text style={styles.itemDescription}>Consolidated Payment — Contingency Provision</Text>
                                    <Text style={styles.itemDetail}>
                                        Per Development Contract ({invoice.work_reference || 'Contract Reference'}): USD demo milestone reallocated and added to the final PHP payment, resulting in a single{' '}
                                        <Text style={styles.itemDetailBold}>{formatCurrency(invoice.total_amount, invoice.currency)}</Text> consolidated payout due on the{' '}
                                        <Text style={styles.itemDetailItalic}>last calendar day</Text> of the signing month.
                                    </Text>
                                </View>
                                <Text style={[styles.tableCell, styles.tableCellQty]}>1</Text>
                                <Text style={[styles.tableCell, styles.tableCellRate]}>
                                    {formatCurrency(invoice.total_amount, invoice.currency)}
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellAmount]}>
                                    {formatCurrency(invoice.total_amount, invoice.currency)}
                                </Text>
                            </View>
                        ) : (
                            items.map((item: any, index: number) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={styles.tableCellDesc}>
                                        <Text style={styles.itemDescription}>{item.description || 'Service Item'}</Text>
                                        {item.detailed_description && (
                                            <Text style={styles.itemDetail}>{item.detailed_description}</Text>
                                        )}
                                    </View>
                                    <Text style={[styles.tableCell, styles.tableCellQty]}>{item.quantity || 1}</Text>
                                    <Text style={[styles.tableCell, styles.tableCellRate]}>
                                        {formatCurrency(item.rate || 0, invoice.currency)}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.tableCellAmount]}>
                                        {formatCurrency(item.amount || 0, invoice.currency)}
                                    </Text>
                                </View>
                            ))
                        )}

                        {/* Summary Rows - Very compact */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>
                                {formatCurrency(invoice.subtotal || invoice.total_amount, invoice.currency)}
                            </Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Taxes</Text>
                            <Text style={styles.summaryValue}>
                                {invoice.tax_amount > 0 ? formatCurrency(invoice.tax_amount, invoice.currency) : '—'}
                            </Text>
                        </View>
                        
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Amount Due ({invoice.currency})</Text>
                            <Text style={styles.grandTotalValue}>
                                {formatCurrency(invoice.total_amount, invoice.currency)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Information - Very compact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <View style={styles.paymentSection}>
                        <Text style={styles.paymentTitle}>{invoice.payment_method || 'Bank Transfer'}</Text>
                        <Text style={styles.paymentInfo}>
                            <Text style={styles.paymentInfoBold}>Payment Due:</Text> {formatDate(invoice.payment_due_date || invoice.due_date)}
                        </Text>
                        <Text style={styles.paymentInfo}>
                            <Text style={styles.paymentInfoBold}>Reference:</Text>{' '}
                            <View style={styles.referenceCode}>
                                <Text>
                                    {invoice.payment_reference || `${invoice.work_reference || 'Contract'} — Consolidated Payment`}
                                </Text>
                            </View>
                        </Text>

                        {/* Bank Details Box - Only if data exists - Very compact */}
                        {(invoice.bank_name || invoice.account_name || invoice.account_number) && (
                            <View style={styles.paymentMethod}>
                                <Text style={styles.paymentMethodTitle}>Recipient Bank Details</Text>
                                <View style={styles.paymentDetails}>
                                    {invoice.bank_name && (
                                        <View style={styles.paymentDetailRow}>
                                            <Text style={styles.paymentLabel}>Bank Name:</Text>
                                            <Text style={styles.paymentValue}>{invoice.bank_name}</Text>
                                        </View>
                                    )}
                                    {invoice.account_name && (
                                        <View style={styles.paymentDetailRow}>
                                            <Text style={styles.paymentLabel}>Account Name:</Text>
                                            <Text style={styles.paymentValue}>{invoice.account_name}</Text>
                                        </View>
                                    )}
                                    {invoice.account_number && (
                                        <View style={styles.paymentDetailRow}>
                                            <Text style={styles.paymentLabel}>Account Number:</Text>
                                            <Text style={styles.paymentValue}>{invoice.account_number}</Text>
                                        </View>
                                    )}
                                    {invoice.country && (
                                        <View style={styles.paymentDetailRow}>
                                            <Text style={styles.paymentLabel}>Country:</Text>
                                            <Text style={styles.paymentValue}>{invoice.country}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Very compact Note Box */}
                    <View style={styles.noteBox}>
                        <Text style={styles.noteTitle}>Note:</Text>
                        <Text>
                            This invoice is issued under the contingency schedule defined in the signed agreement. 
                            If the standard milestone schedule applies instead, please advise and a split invoice 
                            (USD demo + PHP final) will be issued accordingly.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Footer - Very compact */}
            <View style={styles.footer}>
                <Text style={styles.footerLogo}>reaiv</Text>
                <Text style={styles.footerSubtitle}>REAIV - Reimagine AI Ventures</Text>
                <Text style={styles.footerTagline}>Think different. Build intelligent. Scale effortlessly.</Text>
                <Text style={styles.footerNote}>This invoice was generated using the REAIV template format.</Text>
            </View>
        </Page>
    </Document>
);

export default function DashboardListingPage() {
    const [data, setData] = useState<{
        proposals: any[];
        invoices: any[];
        otps: any[];
    }>({
        proposals: [],
        invoices: [],
        otps: []
    });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: string; otp_id: string; type: 'proposal' | 'invoice' } | null>(null);
    const [search, setSearch] = useState("");
    const [clientFilter, setClientFilter] = useState("all");
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const router = useRouter();

    // Optimized data fetching with parallel requests and better error handling
    useEffect(() => {
        let isMounted = true; // Prevent state updates if component unmounts

        async function fetchAllData() {
            setLoading(true);

            try {
                // Parallel fetch all data at once
                const [proposalsRes, invoicesRes, otpsRes] = await Promise.all([
                    fetch("/api/proposals/listing", {
                        method: "GET",
                        cache: 'no-store', // Ensure fresh data
                        headers: {
                            'Cache-Control': 'no-cache',
                        }
                    }),
                    fetch("/api/invoices/listing", {
                        method: "GET",
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache',
                        }
                    }),
                    fetch("/api/otps/listing", {
                        method: "GET",
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache',
                        }
                    })
                ]);

                // Check if all requests were successful
                if (!proposalsRes.ok || !invoicesRes.ok || !otpsRes.ok) {
                    throw new Error('One or more API requests failed');
                }

                // Parse responses in parallel
                const [proposalsData, invoicesData, otpsData] = await Promise.all([
                    proposalsRes.json(),
                    invoicesRes.json(),
                    otpsRes.json()
                ]);

                // Only update state if component is still mounted
                if (isMounted) {
                    setData({
                        proposals: proposalsData.proposals || [],
                        invoices: invoicesData.invoices || [],
                        otps: otpsData.otps || []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                if (isMounted) {
                    setData({
                        proposals: [],
                        invoices: [],
                        otps: []
                    });
                    toast.error("Failed to load data. Please try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchAllData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

    // Optimized auth check with timeout
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const res = await fetch("/api/auth/check", {
                    method: "GET",
                    credentials: "include",
                    signal: controller.signal,
                    cache: 'no-store'
                });

                clearTimeout(timeoutId);

                if (!res.ok) {
                    toast.error("You must be logged in to access this page.");
                    router.push("/auth/2.0/login");
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    toast.error("Authentication check timed out.");
                } else {
                    toast.error("Authentication check failed.");
                }
                router.push("/auth/2.0/login");
            }
        };

        checkAuth();
    }, [router]);

    const sendInvoiceEmail = async (invoice: any) => {
        if (!invoice.bill_to_email) {
            toast.error('No email address found for this invoice.');
            return;
        }

        setSendingEmailId(invoice.id);

        try {
            const response = await fetch('/api/invoices/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    recipientEmail: invoice.bill_to_email,
                    invoiceData: invoice,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`Invoice email sent successfully to ${invoice.bill_to_email}!`);
            } else {
                toast.error(result.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send email. Please try again.');
        } finally {
            setSendingEmailId(null);
        }
    };

    const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
        setUpdatingStatusId(invoiceId);

        try {
            const response = await fetch('/api/invoices/update-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    invoiceId,
                    status: newStatus,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // Optimistically update the UI
                setData(prevData => ({
                    ...prevData,
                    invoices: prevData.invoices.map(invoice =>
                        invoice.id === invoiceId
                            ? { ...invoice, status: newStatus }
                            : invoice
                    ),
                }));

                toast.success(`Invoice status updated to "${newStatus}"!`);
            } else {
                toast.error(result.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status. Please try again.');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Memoized client names with better performance
    const clientNames = useMemo(() => {
        const proposalClients = data.proposals.map(p => p.client_name).filter(Boolean);
        const invoiceClients = data.invoices.map(i => i.bill_to_name).filter(Boolean);
        return [...new Set([...proposalClients, ...invoiceClients])];
    }, [data.proposals, data.invoices]);

    // Optimized filtering with early returns
    const filteredProposals = useMemo(() => {
        let filtered = data.proposals;

        // Early return if no filters applied
        if (clientFilter === "all" && !search.trim()) {
            return filtered;
        }

        // Apply client filter first (potentially smaller dataset)
        if (clientFilter !== "all") {
            filtered = filtered.filter(p => p.client_name === clientFilter);
        }

        // Apply search filter
        if (search.trim()) {
            const searchTerm = search.trim().toLowerCase();
            filtered = filtered.filter(p => {
                return (
                    p.title?.toLowerCase().includes(searchTerm) ||
                    p.client_name?.toLowerCase().includes(searchTerm) ||
                    p.overview?.toLowerCase().includes(searchTerm)
                );
            });
        }

        return filtered;
    }, [data.proposals, search, clientFilter]);

    // Optimized invoice filtering
    const filteredInvoices = useMemo(() => {
        let filtered = data.invoices;

        // Early return if no filters applied
        if (clientFilter === "all" && !search.trim()) {
            return filtered;
        }

        // Apply client filter first
        if (clientFilter !== "all") {
            filtered = filtered.filter(i => i.bill_to_name === clientFilter);
        }

        // Apply search filter
        if (search.trim()) {
            const searchTerm = search.trim().toLowerCase();
            filtered = filtered.filter(i => {
                return (
                    i.invoice_number?.toLowerCase().includes(searchTerm) ||
                    i.bill_to_name?.toLowerCase().includes(searchTerm) ||
                    i.service_type?.toLowerCase().includes(searchTerm) ||
                    i.work_reference?.toLowerCase().includes(searchTerm)
                );
            });
        }

        return filtered;
    }, [data.invoices, search, clientFilter]);

    // Create OTP lookup map for O(1) access instead of O(n) find operations
    const otpLookup = useMemo(() => {
        const lookup = new Map();
        data.otps.forEach(otp => {
            if (otp.proposal_id) {
                lookup.set(`proposal_${otp.proposal_id}`, otp);
            }
            if (otp.invoice_id) {
                lookup.set(`invoice_${otp.invoice_id}`, otp);
            }
        });
        return lookup;
    }, [data.otps]);

    const openDeleteDialog = (itemId: string, otpId: string, type: 'proposal' | 'invoice') => {
        setSelectedItem({ id: itemId, otp_id: otpId, type });
        setDialogOpen(true);
    };

    const handleLogout = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                toast.success("Logged out successfully!");
                router.push("/auth/2.0/login");
            } else {
                toast.error("Logout failed.");
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.error("Logout request timed out.");
            } else {
                toast.error("Network error.");
            }
        }
    };

    // Optimized delete handler with better error handling
    const handleDelete = async () => {
        if (!selectedItem) return;

        setDeletingId(selectedItem.id);

        try {
            const endpoint = selectedItem.type === 'proposal' ? '/api/proposals/delete' : '/api/invoices/delete';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const res = await fetch(endpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    [`${selectedItem.type}Id`]: selectedItem.id,
                    otpId: selectedItem.otp_id,
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                // Optimistic update - immediately update UI
                setData(prevData => ({
                    ...prevData,
                    [selectedItem.type === 'proposal' ? 'proposals' : 'invoices']:
                        prevData[selectedItem.type === 'proposal' ? 'proposals' : 'invoices']
                            .filter(item => item.id !== selectedItem.id),
                    otps: prevData.otps.filter(otp => otp.id !== selectedItem.otp_id)
                }));
                toast.success(`${selectedItem.type === 'proposal' ? 'Proposal' : 'Invoice'} deleted successfully!`);
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to delete item.");
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.error("Delete request timed out.");
            } else {
                toast.error("Failed to delete item. Please try again.");
            }
        } finally {
            setDeletingId(null);
            setDialogOpen(false);
            setSelectedItem(null);
        }
    };

    // Memoized currency formatter to avoid recreation
    const formatCurrency = useMemo(() => {
        const formatters = new Map();
        return (amount: number, currency: string = 'PHP') => {
            if (!formatters.has(currency)) {
                formatters.set(currency, new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: currency,
                }));
            }
            return formatters.get(currency).format(amount);
        };
    }, []);

    // Memoized date formatter
    const formatDate = useMemo(() => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        return (dateString: string) => formatter.format(new Date(dateString));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 px-4 py-10">
            <Toaster richColors position="top-center" />
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-black">
                        Dashboard <span style={{ color: '#8CE232' }}>Listing</span>
                    </h1>
                    <div className="flex gap-4">
                        <Button
                            style={{ backgroundColor: '#8CE232', color: '#000000' }}
                            className="font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                            onClick={() => router.push("/dashboard/proposal/create")}
                        >
                            <Plus size={16} />
                            Create Proposal
                        </Button>
                        <Button
                            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            onClick={() => router.push("/dashboard/invoice/create")}
                        >
                            <Receipt size={16} />
                            Create Invoice
                        </Button>
                        <Button
                            variant="outline"
                            style={{ borderColor: '#8CE232', color: '#8CE232' }}
                            className="font-bold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
                    <Input
                        type="text"
                        placeholder="Search proposals and invoices..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ borderColor: '#8CE232' }}
                        className="md:w-1/2 w-full bg-white/80 focus:border-green-400 focus:ring-green-300"
                    />
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger
                            style={{ borderColor: '#8CE232' }}
                            className="md:w-1/4 w-full bg-white/80 focus:border-green-400"
                        >
                            {clientFilter === "all" ? "All Clients" : clientFilter}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Clients</SelectItem>
                            {clientNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Proposals Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText style={{ color: '#8CE232' }} size={24} />
                        <h2 className="text-2xl font-bold text-black">
                            Proposals <span style={{ color: '#8CE232' }}>({filteredProposals.length})</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8CE232] mx-auto mb-4"></div>
                                <p className="text-slate-600">Loading...</p>
                            </div>
                        </div>
                    ) : filteredProposals.length === 0 ? (
                        <div className="text-center text-slate-500 py-20 bg-white rounded-xl border border-slate-200">
                            No proposals found.
                        </div>
                    ) : (
                        <Table className="bg-white rounded-xl border border-slate-200 shadow">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Overview</TableHead>
                                    <TableHead>OTP</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProposals.map((proposal, idx) => {
                                    const otp = otpLookup.get(`proposal_${proposal.id}`);
                                    return (
                                        <TableRow key={proposal.id} className="hover:bg-green-50 transition">
                                            <TableCell className="text-center font-semibold">{idx + 1}</TableCell>
                                            <TableCell className="font-medium">{proposal.title}</TableCell>
                                            <TableCell>{proposal.client_name}</TableCell>
                                            <TableCell className="max-w-[300px] truncate">{proposal.overview}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                        {otp?.code || <span className="text-slate-400">No OTP</span>}
                                                    </span>
                                                    {otp?.code && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            style={{ color: '#8CE232' }}
                                                            className="hover:bg-green-50"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(otp.code);
                                                                toast.success("OTP copied!");
                                                            }}
                                                            aria-label="Copy OTP"
                                                        >
                                                            <Copy size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center flex gap-2 justify-center">
                                                <Button
                                                    variant="secondary"
                                                    style={{ borderColor: '#8CE232' }}
                                                    className="px-4 text-black hover:bg-green-50"
                                                    onClick={() => router.push(`/dashboard/proposal/edit/${proposal.id}`)}
                                                    aria-label="Edit Proposal"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="px-4"
                                                    disabled={deletingId === proposal.id}
                                                    onClick={() => openDeleteDialog(proposal.id, otp?.id || '', 'proposal')}
                                                >
                                                    {deletingId === proposal.id ? "Deleting..." : "Delete"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Invoices Section with PDF Download */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Receipt className="text-blue-600" size={24} />
                        <h2 className="text-2xl font-bold text-black">
                            Invoices <span className="text-blue-600">({filteredInvoices.length})</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center text-slate-500 py-20">Loading invoices...</div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="text-center text-slate-500 py-20 bg-white rounded-xl border border-slate-200">
                            No invoices found.
                        </div>
                    ) : (
                        <Table className="bg-white rounded-xl border border-slate-200 shadow">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    <TableHead>Invoice Number</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>OTP</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((invoice, idx) => {
                                    const otp = otpLookup.get(`invoice_${invoice.id}`);
                                    return (
                                        <TableRow key={invoice.id} className="hover:bg-green-50 transition">
                                            <TableCell className="text-center font-semibold">{idx + 1}</TableCell>
                                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                            <TableCell>{invoice.bill_to_name}</TableCell>
                                            <TableCell className="font-semibold">
                                                {formatCurrency(invoice.total_amount, invoice.currency)}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={invoice.status}
                                                    onValueChange={(newStatus) => updateInvoiceStatus(invoice.id, newStatus)}
                                                    disabled={updatingStatusId === invoice.id}
                                                >
                                                    <SelectTrigger className="w-28 h-8 p-0 border-none bg-transparent">
                                                        <SelectValue asChild>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${invoice.status === 'paid'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : invoice.status === 'overdue'
                                                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                }`}>
                                                                {updatingStatusId === invoice.id ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                                                        Updating...
                                                                    </span>
                                                                ) : (
                                                                    invoice.status
                                                                )}
                                                            </span>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">
                                                            <span className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                                Pending
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="paid">
                                                            <span className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                Paid
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="overdue">
                                                            <span className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                Overdue
                                                            </span>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                        {otp?.code || <span className="text-slate-400">No OTP</span>}
                                                    </span>
                                                    {otp?.code && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            style={{ color: '#8CE232' }}
                                                            className="hover:bg-green-50"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(otp.code);
                                                                toast.success("OTP copied!");
                                                            }}
                                                            aria-label="Copy OTP"
                                                        >
                                                            <Copy size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center flex gap-2 justify-center">
                                                {invoice.status !== 'paid' && (
                                                    <Button
                                                        variant="outline"
                                                        className="px-3 text-green-600 border-green-600 hover:bg-green-50"
                                                        disabled={sendingEmailId === invoice.id || !invoice.bill_to_email}
                                                        onClick={() => sendInvoiceEmail(invoice)}
                                                        aria-label="Send Invoice Email"
                                                        title={!invoice.bill_to_email ? 'No email address available' : 'Send invoice via email'}
                                                    >
                                                        {sendingEmailId === invoice.id ? (
                                                            "Sending..."
                                                        ) : (
                                                            <>
                                                                <Mail size={14} />
                                                                Send Email
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                {/* React-PDF Download Button */}
                                                <PDFDownloadLink
                                                    document={<InvoicePDF
                                                        invoice={invoice}
                                                        formatCurrency={formatCurrency}
                                                        formatDate={formatDate}
                                                    />}
                                                    fileName={`Invoice_${invoice.invoice_number || invoice.id}.pdf`}
                                                >
                                                    {({ blob, url, loading, error }) => (
                                                        <Button
                                                            variant="outline"
                                                            className="px-3 text-blue-600 border-blue-600 hover:bg-blue-50"
                                                            disabled={loading}
                                                            aria-label="Download Invoice PDF"
                                                        >
                                                            {loading ? (
                                                                "Generating..."
                                                            ) : (
                                                                <>
                                                                    <Download size={14} />
                                                                    PDF
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </PDFDownloadLink>
                                                <Button
                                                    variant="secondary"
                                                    style={{ borderColor: '#8CE232' }}
                                                    className="px-4 text-black hover:bg-green-50"
                                                    onClick={() => router.push(`/dashboard/invoice/edit/${invoice.id}`)}
                                                    aria-label="Edit Invoice"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="px-4"
                                                    disabled={deletingId === invoice.id}
                                                    onClick={() => openDeleteDialog(invoice.id, otp?.id || '', 'invoice')}
                                                >
                                                    {deletingId === invoice.id ? "Deleting..." : "Delete"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Delete Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete {selectedItem?.type === 'proposal' ? 'Proposal' : 'Invoice'}</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this {selectedItem?.type} and its connected OTP? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deletingId === selectedItem?.id}
                            >
                                {deletingId === selectedItem?.id ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}