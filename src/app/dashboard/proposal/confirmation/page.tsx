"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText, ArrowLeft, ExternalLink } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ProposalConfirmationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const otpCode = searchParams.get("otp");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/check", {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    toast.error("You must be logged in to access this page.");
                    router.push("/auth/2.0/login");
                }
            } catch (error) {
                toast.error("Authentication check failed.");
                router.push("/auth/2.0/login");
            }
        };

        checkAuth();
    }, [router]);

    const handleCopyOTP = async () => {
        if (otpCode) {
            try {
                await navigator.clipboard.writeText(otpCode);
                setCopied(true);
                toast.success("OTP copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                toast.error("Failed to copy OTP");
            }
        }
    };

    const handleBackToDashboard = () => {
        router.push("/dashboard/listing");
    };

    const handleCreateAnother = () => {
        router.push("/dashboard/proposal/create");
    };

    const handleViewProposal = async () => {
        if (otpCode) {
            try {
                // Validate OTP and get the actual proposal ID
                const res = await fetch("/api/auth/otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: otpCode }),
                });
                const result = await res.json();

                if (res.ok && result.success && result.id && result.type) {
                    if (result.type === "proposal") {
                        // Open proposal with actual ID in new tab
                        window.open(`/proposal/${result.id}`, '_blank');
                        toast.success("Opening proposal...");
                    } else {
                        toast.error("This code is not for a proposal.");
                    }
                } else {
                    toast.error(result.error || "Invalid or expired code.");
                }
            } catch (error) {
                toast.error("Failed to validate access code.");
                console.error("OTP validation error:", error);
            }
        }
    };

    if (!otpCode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#eaffd0] via-white to-[#8CE232]/10 flex items-center justify-center px-4">
                <Toaster richColors position="top-center" />
                <Card className="p-8 text-center max-w-md">
                    <FileText className="mx-auto mb-4 text-red-500" size={48} />
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Invalid Access</h1>
                    <p className="text-slate-600 mb-6">
                        No OTP code found. Please create a proposal first.
                    </p>
                    <Button
                        onClick={() => router.push("/dashboard/proposal/create")}
                        className="bg-[#8CE232] text-black font-bold hover:bg-[#8CE232]/90"
                    >
                        Create Proposal
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eaffd0] via-white to-[#8CE232]/10 flex items-center justify-center px-4 py-10">
            <Toaster richColors position="top-center" />
            <div className="max-w-2xl w-full">
                <Card className="p-8 shadow-xl border border-[#8CE232]/20 bg-white rounded-2xl">
                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#8CE232]/20 rounded-full mb-4">
                            <FileText className="text-[#8CE232]" size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            Proposal Created Successfully! 🎉
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Your proposal has been generated and is ready to be shared.
                        </p>
                    </div>

                    {/* OTP Display */}
                    <div className="bg-gradient-to-br from-[#8CE232]/10 to-transparent border border-[#8CE232]/30 rounded-xl p-6 mb-8">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-slate-700 mb-2">
                                Proposal Access Code
                            </h2>
                            <p className="text-sm text-slate-600 mb-4">
                                Share this code with your client to access the proposal
                            </p>

                            <div className="bg-white border-2 border-[#8CE232] rounded-lg p-4 mb-4">
                                <div className="font-mono text-2xl font-bold text-[#8CE232] tracking-wider">
                                    {otpCode}
                                </div>
                            </div>

                            <Button
                                onClick={handleCopyOTP}
                                variant="outline"
                                className="border-[#8CE232] text-[#8CE232] hover:bg-[#8CE232]/10 font-semibold"
                            >
                                <Copy size={16} className="mr-2" />
                                {copied ? "Copied!" : "Copy Code"}
                            </Button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">
                            Next Steps:
                        </h3>
                        <div className="space-y-2 text-sm text-blue-700">
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                    1
                                </div>
                                <p>Share the access code above with your client</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                    2
                                </div>
                                <p>Client can access the proposal at <strong>your-domain.com</strong> using this code</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                    3
                                </div>
                                <p>The access code expires in <strong>24 hours</strong> for security</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={handleViewProposal}
                            className="flex-1 bg-[#8CE232] text-black font-bold py-3 hover:bg-[#8CE232]/90 transition-colors"
                        >
                            <ExternalLink size={16} className="mr-2" />
                            Preview Proposal
                        </Button>
                        <Button
                            onClick={handleCreateAnother}
                            variant="outline"
                            className="flex-1 border-[#8CE232] text-[#8CE232] font-bold py-3 hover:bg-[#8CE232]/10 transition-colors"
                        >
                            <FileText size={16} className="mr-2" />
                            Create Another
                        </Button>
                        <Button
                            onClick={handleBackToDashboard}
                            variant="secondary"
                            className="flex-1 font-bold py-3"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Dashboard
                        </Button>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                        <p className="text-xs text-slate-500">
                            This proposal was created using <strong>REAIV</strong> - Reimagine AI Ventures
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}