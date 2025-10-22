"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageProvider";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error(t("login.email") + " " + t("login.required") || "Please enter your email.");
            return;
        }
        setLoading(true);
        const res = await fetch("/api/auth/reset-password/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comp_email: email }),
        });
        setLoading(false);
        if (res.ok) {
            toast.success(t("login.resetLinkSent") || "If your email exists, a reset link has been sent.");
            setEmail("");
        } else {
            const data = await res.json();
            toast.error(data.error || t("login.resetFailed") || "Failed to send reset link.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff7f2] via-[#f8fafc] to-[#f0fdf4] px-4 py-12 relative overflow-hidden">
            {/* Animated Shapes Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <>
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-1.png" alt="" width={180} height={180} className="absolute top-10 left-10 animate-shape1 opacity-70" style={{ zIndex: 1 }} />
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-2.png" alt="" width={120} height={120} className="absolute top-1/2 left-0 animate-shape2 opacity-60" style={{ zIndex: 1 }} />
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-3.png" alt="" width={140} height={140} className="absolute bottom-10 right-10 animate-shape3 opacity-60" style={{ zIndex: 1 }} />
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-4.png" alt="" width={100} height={100} className="absolute bottom-1/3 left-1/2 animate-shape4 opacity-50" style={{ zIndex: 1 }} />
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-5.png" alt="" width={90} height={90} className="absolute top-1/4 right-1/4 animate-shape5 opacity-50" style={{ zIndex: 1 }} />
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-6.png" alt="" width={110} height={110} className="absolute bottom-0 left-1/4 animate-shape6 opacity-40" style={{ zIndex: 1 }} />
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-1.png" alt="" width={180} height={180} className="absolute top-10 right-10 animate-shape1 opacity-70" style={{ zIndex: 1 }} />
                    <Image src="/resources/shapes/RECURSOS GRAFICOS-2.png" alt="" width={120} height={120} className="absolute top-1/2 right-0 animate-shape2 opacity-60" style={{ zIndex: 1 }} />
                </>
            </div>
            {/* Back to Login Arrow Top Left */}
            <button
                type="button"
                onClick={() => router.push("/auth/2.0/login")}
                className="absolute top-6 left-6 flex items-center gap-2 text-black hover:text-[#E84912] font-semibold transition z-10"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{t("login.backToLogin") || "Back to Login"}</span>
            </button>
            <div className="relative z-10 w-full flex flex-col items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{t("login.resetPassword") || "Reset Password"}</h1>
                <p className="text-gray-600 mb-4 text-center max-w-md">
                    {t("login.resetDesc") || "Enter your company email address to receive a password reset link."}
                </p>
                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
                    <div>
                        <Label className="mb-2 font-medium text-gray-700 flex items-center">
                            {t("login.companyEmail") || "Company Email Address"}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-pointer text-[#E84912] font-semibold ">?</span>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    {t("login.companyEmailTooltip") || <>Please use your <span className="font-semibold">@juno.com</span> email address associated with your account.</>}
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t("login.companyEmailPlaceholder") || "companyname@juno.com"}
                            required
                            autoComplete="email"
                            className="mt-1 py-6"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black hover:bg-[#E84912] text-white font-bold py-6 rounded-lg transition"
                    >
                        {loading ? (t("login.sending") || "Sending...") : (t("login.sendResetLink") || "Send Reset Link")}
                    </Button>
                </form>
            </div>
        </div>
    );
}