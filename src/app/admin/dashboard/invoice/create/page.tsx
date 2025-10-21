"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MinusCircle, Receipt, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { Toaster, toast } from "sonner";
import { InvoiceFormValues } from "@/types/invoice";

export default function CreateInvoicePage() {
    const router = useRouter();
    const [items, setItems] = useState<InvoiceFormValues["items"]>([
        { description: "", detailed_description: "", quantity: 1, rate: 0, amount: 0 }
    ]);

    // Check if the user is logged in
    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch("/api/auth/check", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                toast.error("You must be logged in to access this page.");
                router.push("/auth/2.0/login");
            }
        };

        checkAuth();
    }, [router]);

    const form = useForm<InvoiceFormValues>({
        defaultValues: {
            invoice_number: "",
            issue_date: new Date().toISOString().split('T')[0],
            due_date: "",
            work_reference: "",
            bill_to_name: "",
            bill_to_title: "",
            bill_to_address: "",
            bill_to_email: "",
            bill_to_phone: "",
            service_type: "",
            projects: "",
            billing_basis: "",
            payment_method: "Bank Transfer",
            currency: "PHP",
            service_notes: "",
            subtotal: 0,
            tax_amount: 0,
            total_amount: 0,
            payment_due_date: "",
            payment_reference: "",
            bank_name: "",
            account_name: "",
            account_number: "",
            country: "Philippines",
            status: "pending",
            items: items,
        },
    });

    // Generate invoice number automatically
    useEffect(() => {
        const generateInvoiceNumber = () => {
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `REAIV-${year}-${month}-${random}`;
        };

        const generateWorkReference = () => {
            const year = new Date().getFullYear();
            const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
            const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
            return `WR-${year}-${timestamp}-${random}`;
        };

        if (!form.watch("invoice_number")) {
            form.setValue("invoice_number", generateInvoiceNumber());
        }

        if (!form.watch("work_reference")) {
            form.setValue("work_reference", generateWorkReference());
        }
    }, []);

    useEffect(() => {
        const paymentMethod = form.watch("payment_method");
        const invoiceNumber = form.watch("invoice_number");

        if (paymentMethod && invoiceNumber) {
            // Extract the payment method prefix (e.g., "Bank Transfer" -> "BT")
            const methodPrefix = paymentMethod
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('');

            // Extract the numeric part from invoice number
            const invoiceSuffix = invoiceNumber.split('-').pop() || '';

            // Generate a timestamp component (last 4 digits of current timestamp)
            const timestamp = Date.now().toString().slice(-4);

            // Create the payment reference
            const reference = `${methodPrefix}-${invoiceSuffix}-${timestamp}`;

            // Update the form
            form.setValue("payment_reference", reference);
        }
    }, [form.watch("payment_method"), form.watch("invoice_number")]);

    // Calculate totals when items change
    useEffect(() => {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = form.watch("tax_amount") || 0;
        const total = subtotal + taxAmount;

        form.setValue("subtotal", subtotal);
        form.setValue("total_amount", total);
        form.setValue("items", items);
    }, [items, form.watch("tax_amount")]);

    // Set payment due date same as due date by default
    useEffect(() => {
        const dueDate = form.watch("due_date");
        if (dueDate && !form.watch("payment_due_date")) {
            form.setValue("payment_due_date", dueDate);
        }
    }, [form.watch("due_date")]);

    // Item management functions
    const addNewItem = () => {
        setItems(prev => [...prev, {
            description: "",
            detailed_description: "",
            quantity: 1,
            rate: 0,
            amount: 0
        }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const clientDatabase = {
        "Reaiv Solutions": {
            bill_to_title: "Chief Technology Officer",
            bill_to_email: "contact@reaivsolutions.com",
            bill_to_phone: "+63 917 123 4567",
            bill_to_address: "123 Innovation Street, Makati City, Metro Manila 1229, Philippines",
            service_type: "Custom Software Development Services",
            projects: "AI-Powered Business Automation Platform",
            billing_basis: "Milestone Based",
            currency: "PHP",
            service_notes: "Full-stack development with AI integration and automation features",
            // Payment information
            bank_name: "BPI (Bank of the Philippine Islands)",
            account_name: "REAIV Solutions Inc.",
            account_number: "5363-4321-01",
            country: "Philippines",
            // Predefined items
            items: [
                {
                    description: "AI Integration Development",
                    detailed_description: "Custom AI model integration with business logic and automation workflows",
                    quantity: 1,
                    rate: 45000,
                    amount: 45000
                },
                {
                    description: "Frontend Development",
                    detailed_description: "React/Next.js dashboard with responsive design and user management",
                    quantity: 1,
                    rate: 25000,
                    amount: 25000
                }
            ]
        },
        "TechCorp Philippines": {
            bill_to_title: "Project Manager",
            bill_to_email: "pm@techcorp.ph",
            bill_to_phone: "+63 998 765 4321",
            bill_to_address: "456 Business Park Ave, BGC, Taguig City 1634, Philippines",
            service_type: "Web Development & UX Design Services",
            projects: "Corporate Website Redesign",
            billing_basis: "Fixed Price",
            currency: "PHP",
            service_notes: "Responsive web design with modern UI/UX and CMS integration",
            // Payment information
            bank_name: "BDO Unibank",
            account_name: "TechCorp Philippines",
            account_number: "9876-5432-10",
            country: "Philippines",
            // Predefined items
            items: [
                {
                    description: "Website Design & Development",
                    detailed_description: "Complete website redesign with modern UI/UX and responsive layout",
                    quantity: 1,
                    rate: 35000,
                    amount: 35000
                },
                {
                    description: "CMS Integration",
                    detailed_description: "Content management system setup and customization",
                    quantity: 1,
                    rate: 15000,
                    amount: 15000
                }
            ]
        },
        "StartupHub Inc": {
            bill_to_title: "Founder & CEO",
            bill_to_email: "founder@startuphub.com",
            bill_to_phone: "+63 905 888 9999",
            bill_to_address: "789 Startup Boulevard, Ortigas Center, Pasig City 1605, Philippines",
            service_type: "MVP Development Services",
            projects: "Mobile App MVP Development",
            billing_basis: "Hourly Rate",
            currency: "USD",
            service_notes: "Rapid prototyping and MVP development for mobile application",
            // Payment information
            bank_name: "Wise Pilipinas Inc.",
            account_name: "StartupHub Inc.",
            account_number: "US-1122-3344-5566",
            country: "Philippines",
            // Predefined items
            items: [
                {
                    description: "Mobile App Development (80 hours)",
                    detailed_description: "React Native mobile application with core features and basic UI/UX",
                    quantity: 80,
                    rate: 25,
                    amount: 2000
                },
                {
                    description: "API Development",
                    detailed_description: "Backend API development with authentication and data management",
                    quantity: 1,
                    rate: 800,
                    amount: 800
                }
            ]
        },
        "Digital Innovations Ltd": {
            bill_to_title: "Head of Digital Strategy",
            bill_to_email: "strategy@digitalinnovations.com",
            bill_to_phone: "+63 912 555 7777",
            bill_to_address: "321 Digital Hub, Alabang, Muntinlupa City 1780, Philippines",
            service_type: "Digital Transformation Services",
            projects: "Legacy System Migration & Modernization",
            billing_basis: "Contingency Provision",
            currency: "PHP",
            service_notes: "Complete digital transformation including cloud migration and process automation",
            // Payment information
            bank_name: "Security Bank",
            account_name: "Digital Innovations Ltd.",
            account_number: "2468-1357-90",
            country: "Philippines",
            // Predefined items
            items: [
                {
                    description: "System Analysis & Planning",
                    detailed_description: "Comprehensive analysis of legacy systems and migration planning",
                    quantity: 1,
                    rate: 50000,
                    amount: 50000
                },
                {
                    description: "Cloud Migration Services",
                    detailed_description: "Data migration and cloud infrastructure setup with security protocols",
                    quantity: 1,
                    rate: 75000,
                    amount: 75000
                }
            ]
        },
        "Global Enterprises": {
            bill_to_title: "IT Director",
            bill_to_email: "it.director@globalenterprises.com",
            bill_to_phone: "+63 928 444 3333",
            bill_to_address: "555 Corporate Center, Cebu Business Park, Cebu City 6000, Philippines",
            service_type: "Enterprise Software Solutions",
            projects: "ERP System Integration",
            billing_basis: "Milestone Based",
            currency: "USD",
            service_notes: "Enterprise-level software integration with custom modules and reporting",
            // Payment information
            bank_name: "Metrobank",
            account_name: "Global Enterprises Corp.",
            account_number: "1357-2468-00",
            country: "Philippines",
            // Predefined items
            items: [
                {
                    description: "ERP System Integration",
                    detailed_description: "Complete ERP system setup with custom modules and third-party integrations",
                    quantity: 1,
                    rate: 15000,
                    amount: 15000
                },
                {
                    description: "Custom Reporting Module",
                    detailed_description: "Advanced reporting dashboard with analytics and data visualization",
                    quantity: 1,
                    rate: 8000,
                    amount: 8000
                }
            ]
        }
    };

    // Tax rate configuration
    const TAX_RATE = 0.12; // 12% tax rate

    // Calculate tax automatically when subtotal changes
    useEffect(() => {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const calculatedTax = subtotal * TAX_RATE;
        const total = subtotal + calculatedTax;

        form.setValue("subtotal", subtotal);
        form.setValue("tax_amount", calculatedTax);
        form.setValue("total_amount", total);
        form.setValue("items", items);
    }, [items]);

    const updateItem = (index: number, field: keyof InvoiceFormValues["items"][0], value: any) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };

                // Recalculate amount when quantity or rate changes
                if (field === 'quantity' || field === 'rate') {
                    updatedItem.amount = updatedItem.quantity * updatedItem.rate;
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const handleClientNameChange = (clientName: string) => {
        // Update the form field
        form.setValue("bill_to_name", clientName);

        // Check if client exists in database
        const clientData = clientDatabase[clientName as keyof typeof clientDatabase];

        if (clientData) {
            // Auto-populate all related fields
            form.setValue("bill_to_title", clientData.bill_to_title);
            form.setValue("bill_to_email", clientData.bill_to_email);
            form.setValue("bill_to_phone", clientData.bill_to_phone);
            form.setValue("bill_to_address", clientData.bill_to_address);
            form.setValue("service_type", clientData.service_type);
            form.setValue("projects", clientData.projects);
            form.setValue("billing_basis", clientData.billing_basis);
            form.setValue("currency", clientData.currency);
            form.setValue("service_notes", clientData.service_notes);

            // Auto-populate payment information
            form.setValue("bank_name", clientData.bank_name);
            form.setValue("account_name", clientData.account_name);
            form.setValue("account_number", clientData.account_number);
            form.setValue("country", clientData.country);

            // Auto-populate invoice items
            if (clientData.items && clientData.items.length > 0) {
                setItems(clientData.items);
            }

            // Show success toast
            toast.success(`Complete client profile loaded for ${clientName}! Including items and payment details.`);
        }
    };

    const handleSubmit = async (data: InvoiceFormValues) => {
        toast.dismiss();

        // Validation
        if (items.length === 0 || items.some(item => !item.description.trim())) {
            toast.error("Please add at least one item with a description.");
            return;
        }

        if (data.total_amount <= 0) {
            toast.error("Invoice total must be greater than zero.");
            return;
        }

        // Validate required payment information
        if (!data.payment_method) {
            toast.error("Payment method is required.");
            return;
        }

        if (!data.payment_due_date) {
            toast.error("Payment due date is required.");
            return;
        }

        if (!data.bank_name) {
            toast.error("Bank name is required.");
            return;
        }

        if (!data.account_name) {
            toast.error("Account name is required.");
            return;
        }

        if (!data.account_number) {
            toast.error("Account number is required.");
            return;
        }

        if (!data.country) {
            toast.error("Country is required.");
            return;
        }

        try {
            const res = await fetch("/api/invoices/create", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const result = await res.json();
                const otpCode = result.otp?.code;
                toast.success("Invoice created successfully!");
                form.reset();
                if (otpCode) {
                    router.push(`/admin/dashboard/invoice/confirmation?otp=${otpCode}`);
                } else {
                    router.push("/admin/dashboard/listing");
                }
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to create invoice.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number, currency?: string) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency || form.watch("currency") || 'PHP',
        }).format(amount || 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <Toaster richColors position="top-center" />
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Form */}
                <Card className="p-8 shadow-xl border border-slate-200 bg-white rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/dashboard/listing")}
                            className="mr-2"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <Receipt className="text-[#8CE232]" size={32} />
                        <h2 className="text-3xl tracking-tighter font-bold text-slate-900">Create Invoice</h2>
                    </div>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {/* Invoice Header Information */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-gradient-to-br from-[#8CE232]/5 to-transparent">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232] flex items-center gap-2">
                                    <Receipt size={20} />
                                    Invoice Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Invoice Number (Auto Generated)</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("invoice_number", { required: true })}
                                                placeholder="REAIV-2025-001" disabled className="bg-gray-100"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Work Reference (Auto Generated)</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("work_reference", { required: true })}
                                                placeholder="Project reference or contract ID" disabled className="bg-gray-100"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Issue Date</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...form.register("issue_date", { required: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Due Date</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...form.register("due_date", { required: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </div>
                            </Card>

                            {/* Billing Information */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-white">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Billing Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormItem className="md:col-span-2">
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Client Name</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("bill_to_name", { required: true })}
                                                placeholder="Client or company name"
                                                onChange={(e) => handleClientNameChange(e.target.value)}
                                                list="client-suggestions"
                                            />
                                        </FormControl>
                                    </FormItem>

                                    <FormItem>
                                        <FormLabel>Title/Position</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...form.register("bill_to_title")}
                                                placeholder="Job title or position"
                                                className={form.watch("bill_to_title") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                    </FormItem>

                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...form.register("bill_to_email")}
                                                placeholder="client@example.com"
                                                className={form.watch("bill_to_email") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                    </FormItem>

                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...form.register("bill_to_phone")}
                                                placeholder="+63 XXX XXX XXXX"
                                                className={form.watch("bill_to_phone") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                    </FormItem>

                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...form.register("bill_to_address")}
                                                placeholder="Complete billing address"
                                                rows={3}
                                                className={form.watch("bill_to_address") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                    </FormItem>
                                </div>
                            </Card>

                            {/* Service Details */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-white">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Service Details</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Service Type</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("service_type", { required: true })}
                                                placeholder="e.g., Software Development Services"
                                                className={form.watch("service_type") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>

                                    <FormItem>
                                        <FormLabel>Projects</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...form.register("projects")}
                                                placeholder="Project names or descriptions"
                                                className={form.watch("projects") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                    </FormItem>

                                    <FormItem>
                                        <FormLabel>Billing Basis</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => form.setValue("billing_basis", value)}
                                                value={form.watch("billing_basis") || ""}
                                            >
                                                <SelectTrigger className={form.watch("billing_basis") ? "bg-green-50 border-green-200" : ""}>
                                                    <SelectValue placeholder="Select billing basis" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                                                    <SelectItem value="Hourly Rate">Hourly Rate</SelectItem>
                                                    <SelectItem value="Milestone Based">Milestone Based</SelectItem>
                                                    <SelectItem value="Contingency Provision">Contingency Provision</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>

                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => form.setValue("currency", value)}
                                                value={form.watch("currency") || "PHP"}
                                            >
                                                <SelectTrigger className={form.watch("currency") !== "PHP" ? "bg-green-50 border-green-200" : ""}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PHP">PHP</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>

                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Service Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...form.register("service_notes")}
                                                placeholder="Additional notes about the services provided"
                                                rows={3}
                                                className={form.watch("service_notes") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                    </FormItem>
                                </div>
                            </Card>

                            {/* Invoice Items */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-white">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232] flex items-center gap-2">
                                    <DollarSign size={20} />
                                    Invoice Items
                                </h3>

                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-semibold text-sm text-slate-600">Item #{index + 1}</span>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:bg-red-100"
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-3">
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Description *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                                            placeholder="Item description"
                                                            className={item.description ? "bg-green-50 border-green-200" : ""}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                                                            className={item.quantity > 1 ? "bg-green-50 border-green-200" : ""}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel>Rate</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.rate}
                                                            onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                                                            placeholder="0.00"
                                                            className={item.rate > 0 ? "bg-green-50 border-green-200" : ""}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel>Amount</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            value={formatCurrency(item.amount)}
                                                            disabled
                                                            className="bg-gray-100 font-semibold"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Detailed Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            value={item.detailed_description || ""}
                                                            onChange={(e) => updateItem(index, "detailed_description", e.target.value)}
                                                            placeholder="Optional detailed description"
                                                            rows={2}
                                                            className={item.detailed_description ? "bg-green-50 border-green-200" : ""}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    onClick={addNewItem}
                                    variant="outline"
                                    className="mt-4 w-full border-[#8CE232] text-[#8CE232] hover:bg-[#8CE232]/10"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Item
                                </Button>
                            </Card>

                            {/* Financial Summary with Auto Tax Calculation */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-gradient-to-br from-green-50 to-transparent">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Financial Summary <span className="text-xs text-slate-500">(Automatically calculated at 12% of subtotal)</span></h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <FormItem>
                                        <FormLabel>Subtotal</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={formatCurrency(form.watch("subtotal"))}
                                                disabled
                                                className="bg-gray-100 font-semibold"
                                            />
                                        </FormControl>
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel>Tax Amount (12% VAT)</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={formatCurrency(form.watch("tax_amount"))}
                                                disabled
                                                className="bg-gray-100 font-semibold"
                                            />
                                        </FormControl>
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel>Total Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={formatCurrency(form.watch("total_amount"))}
                                                disabled
                                                className="bg-[#8CE232]/20 font-bold text-lg"
                                            />
                                        </FormControl>
                                    </FormItem>
                                </div>

                                {/* Tax calculation breakdown */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Tax Calculation Breakdown</h4>
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(form.watch("subtotal"))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax Rate:</span>
                                            <span>{(TAX_RATE * 100)}%</span>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Tax Amount:</span>
                                            <span>{formatCurrency(form.watch("tax_amount"))}</span>
                                        </div>
                                        <hr className="border-blue-300" />
                                        <div className="flex justify-between font-bold">
                                            <span>Total Amount:</span>
                                            <span>{formatCurrency(form.watch("total_amount"))}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Payment Information - Enhanced with auto-populated bank details */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-white">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Payment Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Payment Method</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Select 
                                                onValueChange={(value) => form.setValue("payment_method", value)}
                                                value={form.watch("payment_method") || ""}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="Bank Transfer (Wise)">Bank Transfer (Wise)</SelectItem>
                                                    <SelectItem value="PayPal">PayPal</SelectItem>
                                                    <SelectItem value="GCash">GCash</SelectItem>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Payment Due Date</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...form.register("payment_due_date", { required: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Payment Reference</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...form.register("payment_reference")}
                                                placeholder="Auto-generated reference"
                                                className="bg-gray-50"
                                                disabled
                                            />
                                        </FormControl>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Auto-generated based on payment method and invoice number
                                        </p>
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Bank Name</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("bank_name", { required: true })}
                                                placeholder="e.g., BPI, BDO, Wise Pilipinas Inc."
                                                className={form.watch("bank_name") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Account Name</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("account_name", { required: true })}
                                                placeholder="Account holder name"
                                                className={form.watch("account_name") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Account Number</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("account_number", { required: true })}
                                                placeholder="Bank account number"
                                                className={form.watch("account_number") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Country</FormLabel>
                                            <span className="text-red-500 text-sm font-semibold">*</span>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...form.register("country", { required: true })}
                                                placeholder="Philippines"
                                                className={form.watch("country") ? "bg-green-50 border-green-200" : ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </div>
                            </Card>

                            {/* Invoice Status */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-white">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Invoice Status</h3>
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select
                                            defaultValue="pending"
                                            onValueChange={(value) => form.setValue("status", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            </Card>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-[#8CE232] text-black font-bold py-6 rounded-lg hover:bg-[#8CE232]/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Receipt size={20} />
                                Create Invoice
                            </Button>
                        </form>
                    </FormProvider>
                </Card>

                {/* Right: Live Preview - Exact 1:1 Design */}
                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
                    <div className="max-w-4xl mx-auto bg-white shadow-lg h-full">
                        {/* Header */}
                        <div className="bg-slate-700 text-white p-6 justify-between items-start">
                            <div>
                                <div className="mb-6 border-2 border-[#91cd49] text-[#91cd49] text-center px-5 py-2 rounded font-semibold uppercase tracking-widest text-xs">
                                    INVOICE
                                </div>
                                <div className="inline-block bg-[#91cd49] text-white px-6 py-3 rounded-lg text-2xl font-bold lowercase tracking-wide">
                                    reaiv
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="text-left">
                                        <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Invoice Number</div>
                                        <div className="text-sm text-[#91cd49] font-semibold">
                                            {form.watch("invoice_number") || "REAIV-XXXX-XXX"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Issue Date</div>
                                        <div className="text-sm text-[#91cd49] font-semibold">
                                            {form.watch("issue_date") ? formatDate(form.watch("issue_date")) : "Not set"}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Work / Reference</div>
                                        <div className="text-sm text-[#91cd49] font-semibold">
                                            {form.watch("work_reference") || "Work Reference"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Due Date</div>
                                        <div className="text-sm text-[#91cd49] font-semibold">
                                            {form.watch("due_date") ? formatDate(form.watch("due_date")) : "Not set"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amount Due Section */}
                        <div className="bg-green-50 p-6 text-center border-b-4 border-[#91cd49]">
                            <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">
                                Amount Due ({form.watch("currency") || "PHP"})
                            </div>
                            <div className="text-3xl text-slate-700 font-bold my-2">
                                {formatCurrency(form.watch("total_amount") || 0)}
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                Due {form.watch("payment_due_date") ? formatDate(form.watch("payment_due_date")) :
                                    form.watch("due_date") ? formatDate(form.watch("due_date")) : "Not set"}
                            </div>
                            <button className="bg-[#91cd49] hover:bg-[#7ab33a] text-white px-6 py-2 rounded text-sm font-semibold mt-3 transition-colors">
                                Pay {formatCurrency(form.watch("total_amount") || 0)}
                            </button>
                        </div>

                        {/* Invoice Body */}
                        <div className="p-6">
                            {/* Billing Information */}
                            <div className="mb-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-600 mb-3">BILLED TO</h3>
                                        <p className="font-bold mb-1 text-sm">
                                            {form.watch("bill_to_name") || "Client Name"}
                                        </p>
                                        {form.watch("bill_to_title") && (
                                            <p className="mb-1 text-sm">{form.watch("bill_to_title")}</p>
                                        )}
                                        {form.watch("bill_to_address") && (
                                            <p className="mb-1 text-sm">{form.watch("bill_to_address")}</p>
                                        )}
                                        {form.watch("bill_to_email") && (
                                            <p className="mb-1 text-sm">
                                                Email: <span className="text-[#91cd49] font-semibold">{form.watch("bill_to_email")}</span>
                                            </p>
                                        )}
                                        {form.watch("bill_to_phone") && (
                                            <p className="mb-1 text-sm">
                                                Phone: <span className="text-[#91cd49] font-semibold">{form.watch("bill_to_phone")}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-600 mb-3">SERVICE DETAILS</h3>
                                        <p className="mb-1 text-sm">
                                            <strong>Service Type:</strong> {form.watch("service_type") || "Service Type"}
                                        </p>
                                        {form.watch("projects") && (
                                            <p className="mb-1 text-sm"><strong>Projects:</strong> {form.watch("projects")}</p>
                                        )}
                                        {form.watch("billing_basis") && (
                                            <p className="mb-1 text-sm"><strong>Billing Basis:</strong> {form.watch("billing_basis")}</p>
                                        )}
                                        {form.watch("payment_method") && (
                                            <p className="mb-1 text-sm"><strong>Payment Method:</strong> {form.watch("payment_method")}</p>
                                        )}
                                        <p className="mb-1 text-sm">
                                            <strong>Currency:</strong> {form.watch("currency") || "PHP"}
                                        </p>
                                        {form.watch("service_notes") && (
                                            <p className="mt-2 text-xs italic text-gray-600">{form.watch("service_notes")}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Items */}
                            <div className="mb-6">
                                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-gray-100">
                                    Invoice Items
                                </h2>
                                <table className="w-full border-collapse mt-3 text-xs">
                                    <thead>
                                        <tr>
                                            <th className="bg-slate-700 text-white p-2 text-left font-semibold uppercase text-xs tracking-wide">
                                                Description
                                            </th>
                                            <th className="bg-slate-700 text-white p-2 text-center font-semibold uppercase text-xs tracking-wide">
                                                Qty
                                            </th>
                                            <th className="bg-slate-700 text-white p-2 text-center font-semibold uppercase text-xs tracking-wide">
                                                Rate
                                            </th>
                                            <th className="bg-slate-700 text-white p-2 text-right font-semibold uppercase text-xs tracking-wide">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="p-2 border-b border-gray-100 align-top">
                                                    <div className="font-semibold text-slate-700 mb-1 text-xs">
                                                        {item.description || `Item ${index + 1}`}
                                                    </div>
                                                    {item.detailed_description && (
                                                        <div className="text-xs text-gray-600 leading-relaxed">
                                                            {item.detailed_description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-2 border-b border-gray-100 text-center text-xs">{item.quantity}</td>
                                                <td className="p-2 border-b border-gray-100 text-center text-xs">
                                                    {formatCurrency(item.rate)}
                                                </td>
                                                <td className="p-2 border-b border-gray-100 text-right text-xs">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-gray-500 text-xs">
                                                    No items added yet
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="bg-gray-50">
                                            <td colSpan={3} className="p-2 text-right font-semibold text-xs">Subtotal</td>
                                            <td className="p-2 text-right font-semibold text-xs">
                                                {formatCurrency(form.watch("subtotal") || 0)}
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td colSpan={3} className="p-2 text-right font-semibold text-xs">Taxes</td>
                                            <td className="p-2 text-right font-semibold text-xs">
                                                {form.watch("tax_amount") > 0 ? formatCurrency(form.watch("tax_amount")) : '—'}
                                            </td>
                                        </tr>
                                        <tr className="bg-slate-700 text-white font-bold">
                                            <td colSpan={3} className="p-2 text-right text-xs">
                                                Amount Due ({form.watch("currency") || "PHP"})
                                            </td>
                                            <td className="p-2 text-right text-xs">{formatCurrency(form.watch("total_amount") || 0)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment Information */}
                            <div className="mb-6">
                                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-gray-100">
                                    Payment Information
                                </h2>
                                <div className="bg-amber-50 p-4 rounded-lg">
                                    <h3 className="text-orange-600 mb-3 text-sm font-semibold">
                                        {form.watch("payment_method") || "Payment Method"}
                                    </h3>
                                    <p className="mb-1 text-xs">
                                        <strong>Payment Due:</strong>{' '}
                                        {form.watch("payment_due_date") ? formatDate(form.watch("payment_due_date")) :
                                            form.watch("due_date") ? formatDate(form.watch("due_date")) : "Not set"}
                                    </p>
                                    {form.watch("payment_reference") && (
                                        <p className="mb-2 text-xs">
                                            <strong>Reference:</strong>{' '}
                                            <span className="bg-green-100 px-2 py-1 rounded font-mono font-semibold text-slate-700 text-xs">
                                                {form.watch("payment_reference")}
                                            </span>
                                        </p>
                                    )}
                                    {(form.watch("bank_name") || form.watch("account_name") || form.watch("account_number")) && (
                                        <div className="bg-white p-3 rounded-lg mt-2 border border-orange-200">
                                            <h4 className="text-slate-700 mb-2 text-xs font-semibold">Recipient Bank Details</h4>
                                            <div className="space-y-1 text-xs">
                                                {form.watch("bank_name") && (
                                                    <div className="flex">
                                                        <span className="font-semibold text-gray-600 w-20">Bank:</span>
                                                        <span>{form.watch("bank_name")}</span>
                                                    </div>
                                                )}
                                                {form.watch("account_name") && (
                                                    <div className="flex">
                                                        <span className="font-semibold text-gray-600 w-20">Account:</span>
                                                        <span>{form.watch("account_name")}</span>
                                                    </div>
                                                )}
                                                {form.watch("account_number") && (
                                                    <div className="flex">
                                                        <span className="font-semibold text-gray-600 w-20">Number:</span>
                                                        <span>{form.watch("account_number")}</span>
                                                    </div>
                                                )}
                                                {form.watch("country") && (
                                                    <div className="flex">
                                                        <span className="font-semibold text-gray-600 w-20">Country:</span>
                                                        <span>{form.watch("country")}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-blue-50 p-3 border-l-4 border-blue-400 rounded-md mt-3 text-xs leading-relaxed">
                                    <strong>Note:</strong> This invoice is issued under the contingency schedule defined in the signed agreement.
                                    If the standard milestone schedule applies instead, please advise and a split invoice (USD demo + PHP final)
                                    will be issued accordingly.
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-700 text-white p-6 text-center">
                            <div className="text-2xl font-bold text-[#91cd49] mb-2">reaiv</div>
                            <div className="text-sm text-[#91cd49] mb-2">REAIV - Reimagine AI Ventures</div>
                            <div className="text-xs opacity-80 tracking-wide">Think different. Build intelligent. Scale effortlessly.</div>
                            <div className="text-xs opacity-60 mt-3">This invoice was generated using the REAIV template format.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}