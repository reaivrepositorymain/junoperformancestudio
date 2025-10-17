"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Loader from "@/components/kokonutui/loader";
import { ALargeSmall, Languages } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(true);
    const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkAuthAndQuestionnaireStatus() {
            try {
                // Check if user is authenticated
                const authRes = await fetch("/api/auth/check", {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });
                if (!authRes.ok) {
                    router.push("/auth/2.0/login");
                    return;
                }

                // Check questionnaire status
                const response = await fetch("/api/client/check-questionnaire", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    const { hasCompletedQuestionnaire } = await response.json();
                    if (!hasCompletedQuestionnaire) {
                        setIsFirstTimeLogin(true);
                    }
                } else {
                    toast.error("Failed to check questionnaire status.");
                }
            } catch (error) {
                console.error("Error checking authentication or questionnaire status:", error);
                toast.error("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        }

        checkAuthAndQuestionnaireStatus();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7f2] via-[#f8fafc] to-[#f0fdf4]">
                <Loader
                    title="Loading your onboarding experience..."
                    subtitle="Please wait while we check your account and prepare your onboarding form."
                    size="md"
                />
            </div>
        );
    }

    if (isFirstTimeLogin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E84912]/10 via-white to-[#438D34]/10 p-6 relative">
                {/* Top-left Back Button */}
                <Button
                    variant="outline"
                    className="absolute top-6 left-6 px-6 py-3 rounded-xl border-[#EA6D51] text-black hover:bg-orange-50 font-semibold transition-all animate-fade-in-up"
                    style={{ animationDelay: '0.1s' }}
                    onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                        router.push("/auth/2.0/login");
                    }}
                >
                    ← Back to Login
                </Button>

                <h1 className="text-6xl tracking-tighter font-bold text-gray-800 mb-8 text-center animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}>
                    Welcome to <span className="font-brand font-extrabold text-7xl uppercase text-black">Juno</span>
                </h1>

                <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl animate-fade-in-up"
                    style={{ animationDelay: '0.4s' }}>
                    To get started, please complete your onboarding form. Choose your preferred language below to begin.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 max-w-lg w-full justify-center items-center animate-fade-in-up"
                    style={{ animationDelay: '0.6s' }}>
                    <button
                        className="flex items-center font-cursive tracking-wide gap-2 px-4 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-[#E84912] shadow-md hover:shadow-lg transition-all cursor-pointer group text-lg font-semibold text-[#E84912]"
                        onClick={() => router.push("/auth/client/onboarding/form/en")}
                    >
                        <ALargeSmall className="w-6 h-6 text-[#E84912] group-hover:scale-110 transition-transform" />
                        English Form
                    </button>
                    <button
                        className="flex items-center font-cursive tracking-wide gap-2 px-4 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-[#E84912] shadow-md hover:shadow-lg transition-all cursor-pointer group text-lg font-semibold text-[#E84912]"
                        onClick={() => router.push("/auth/client/onboarding/form/es")}
                    >
                        <Languages className="w-6 h-6 text-[#E84912] group-hover:scale-110 transition-transform" />
                        Español Formulario
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-lg font-medium text-gray-600">Loading...</p>
        </div>
    );
}