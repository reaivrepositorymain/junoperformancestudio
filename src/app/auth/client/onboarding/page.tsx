"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ALargeSmall, Languages } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(true);
    const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkQuestionnaireStatus() {
            try {
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
                console.error("Error checking questionnaire status:", error);
                toast.error("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        }

        checkQuestionnaireStatus();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-lg font-medium text-gray-600">Loading...</p>
            </div>
        );
    }

    if (isFirstTimeLogin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E84912]/10 via-white to-[#438D34]/10 p-6">
                <h1 className="text-5xl font-cursive font-bold text-gray-800 mb-8 text-center">
                    Welcome to <span className="font-brand font-extrabold text-6xl uppercase text-black">Juno</span>
                </h1>
                <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl">
                    To get started, please complete your onboarding form. Choose your preferred language below to begin.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
                    {/* English Form Card */}
                    <Card
                        className="p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer bg-white rounded-lg border border-gray-200 hover:border-[#E84912]"
                        onClick={() => router.push("/auth/client/onboarding/form/en")}
                    >
                        <div className="flex flex-col items-center">
                            <ALargeSmall className="w-12 h-12 text-[#E84912] mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                English Form
                            </h2>
                            <p className="text-gray-600 text-center mb-6">
                                Complete the onboarding questionnaire in English to get started.
                            </p>
                            <div
                                className="bg-[#E84912] text-white px-6 py-3 rounded-lg font-medium"
                                onClick={() => router.push("/auth/client/onboarding/form/en")}
                            >
                                Start English Form
                            </div>
                        </div>
                    </Card>

                    {/* Spanish Form Card */}
                    <Card
                        className="p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer bg-white rounded-lg border border-gray-200 hover:border-[#E84912]"
                        onClick={() => router.push("/auth/client/onboarding/form/es")}
                    >
                        <div className="flex flex-col items-center">
                            <Languages className="w-12 h-12 text-[#E84912] mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                Formulario en Español
                            </h2>
                            <p className="text-gray-600 text-center mb-6">
                                Complete el cuestionario de incorporación en español para comenzar.
                            </p>
                            <div
                                className="bg-[#E84912] text-white px-6 py-3 rounded-lg font-medium"
                                onClick={() => router.push("/auth/client/onboarding/form/es")}
                            >
                                Iniciar Formulario en Español
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-lg font-medium text-gray-600">Redirecting to your dashboard...</p>
        </div>
    );
}