"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, PlusCircle, Info, AtSign } from "lucide-react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Loader from "@/components/kokonutui/loader"; // Import the loader component

// Simple random password generator
function generatePassword(length = 12) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < length; i++) {
        pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
}

// Generate client email from name
function generateClientEmail(name: string) {
    if (!name) return "";
    const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, ".");
    return `${cleanName}@juno.com`;
}

export default function CreateClientPage() {
    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const watchName = form.watch("name");
    const [clientEmail, setClientEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false); // State to control the loader

    // Auto-generate password on mount
    useEffect(() => {
        form.setValue("password", generatePassword(12));
    }, [form]);

    // Auto-generate client email based on name
    useEffect(() => {
        setClientEmail(generateClientEmail(watchName));
    }, [watchName]);

    const assignClientAndCreateFolders = async (clientId: string) => {
        try {
            console.log("Assigning client and creating folders for clientId:", clientId); // Debug log

            const response = await fetch("/api/admin/assign-client", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientId, // Dynamically pass the client ID
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to assign client and create folders:", error.error);
                toast.error("Failed to create folders for the client.");
            } else {
                const result = await response.json();
                console.log("Folders creation response:", result); // Debug log
                toast.success("Folders created successfully for the client!");
            }
        } catch (error) {
            console.error("Error assigning client and creating folders:", error);
            toast.error("An unexpected error occurred while creating folders.");
        }
    };

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            clientEmail,
        };

        setIsLoading(true); // Show the loader
        try {
            console.log("Submitting client creation payload:", payload); // Debug log

            const response = await fetch("/api/admin/dashboard/client/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Client creation response:", result); // Debug log
                console.log("User ID:", result.userId); // Debug log to verify userId

                toast.success("Client created successfully! Email sent.");

                // Check if userId exists before calling assignClientAndCreateFolders
                if (result.userId) {
                    await assignClientAndCreateFolders(result.userId);
                } else {
                    console.error("User ID is missing in the response:", result);
                    toast.error("Failed to retrieve client ID. Cannot create folders.");
                }

                form.reset(); // Reset the form after successful submission
                setClientEmail(""); // Clear the auto-generated email
            } else {
                const error = await response.json();
                console.error("Failed to create client:", error.error);
                toast.error(error.error || "Failed to create client.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false); // Hide the loader
        }
    };

    if (isLoading) {
        // Show the loader while processing
        return <Loader title="Creating client..." subtitle="Please wait while we set everything up for you." />;
    }

    return (
        <div className="w-full max-w-lg mx-auto mt-6 md:mt-10 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
                <PlusCircle className="w-5 h-5 md:w-6 md:h-6 text-[#E84912]" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Add New Client</h2>
            </div>

            {/* Info Alert */}
            <Alert className="mb-4 md:mb-6 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs sm:text-sm text-blue-800">
                    After creating the client, an email will be sent to the provided address with login credentials and onboarding information.
                </AlertDescription>
            </Alert>

            <Form {...form}>
                <form
                    className="space-y-6 md:space-y-8"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm md:text-base">Client Name</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            placeholder="e.g. MUSH NATURALS"
                                            className="pl-10 md:pl-12 pr-4 md:pr-6 py-4 md:py-6 text-sm md:text-base"
                                            required
                                        />
                                        <User className="absolute left-3 top-3 md:top-4 h-4 w-4 md:h-5 md:w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </FormControl>
                                {clientEmail && (
                                    <FormDescription className="text-xs md:text-sm flex items-center gap-1.5">
                                        <AtSign className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-500" />
                                        <span className="text-gray-600">Client Email: </span>
                                        <span className="font-medium text-[#E84912]">{clientEmail}</span>
                                    </FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm md:text-base">Contact Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="client@email.com"
                                            className="pl-10 md:pl-12 pr-4 md:pr-6 py-4 md:py-6 text-sm md:text-base"
                                            required
                                        />
                                        <Mail className="absolute left-3 top-3 md:top-4 h-4 w-4 md:h-5 md:w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </FormControl>
                                <FormDescription className="text-xs md:text-sm">
                                    Login credentials will be sent to this email.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm md:text-base">
                                    Password <span className="text-gray-500 text-xs md:text-sm">(Auto Generated)</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            type="text"
                                            readOnly
                                            className="pl-10 md:pl-12 pr-4 md:pr-6 py-4 md:py-6 text-sm md:text-base bg-gray-100 cursor-not-allowed"
                                        />
                                        <Lock className="absolute left-3 top-3 md:top-4 h-4 w-4 md:h-5 md:w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </FormControl>
                                <FormDescription className="text-xs md:text-sm">
                                    A secure password is generated automatically.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full py-5 md:py-6 px-4 md:px-6 text-sm md:text-base bg-[#E84912] hover:bg-[#d63d0e] text-white font-semibold flex items-center justify-center gap-2 md:gap-3 rounded-lg md:rounded-xl shadow-lg"
                    >
                        <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                        Create Client
                    </Button>
                </form>
            </Form>
        </div>
    );
}