"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageProvider";

export default function ActivatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [valid, setValid] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [success, setSuccess] = useState(false);

    const { t } = useLanguage();

    // Validate token on mount
    useEffect(() => {
        async function validateToken() {
            setLoading(true);
            setError("");
            setValid(false);
            if (!token) {
                setError(t("activate.invalidToken") || "Invalid or missing activation token.");
                setLoading(false);
                return;
            }
            const res = await fetch("/api/auth/activate/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setValid(true);
            } else {
                setError(data.error || t("activate.invalidOrExpired") || "Invalid or expired activation link.");
            }
            setLoading(false);
        }
        validateToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Handle password submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError(t("activate.passwordMin") || "Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setError(t("activate.passwordsNoMatch") || "Passwords do not match.");
            return;
        }
        setLoading(true);
        const res = await fetch("/api/auth/activate/set-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
            credentials: "include",
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
            setSuccess(true);
            toast.success(t("activate.passwordSet") || "Password set! Redirecting...");
            setTimeout(() => {
                router.push(`/auth/activate/credentials?email=${encodeURIComponent(data.email)}`);
            }, 1500);
        } else {
            setError(data.error || t("activate.failed") || "Activation failed.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7f2] via-[#f8fafc] to-[#f0fdf4] px-4 py-12">
            <div className="w-full max-w-2xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {t("activate.title") || "Activate Your Account"}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {t("activate.subtitle") || "Set a secure password to get started with Juno"}
                    </p>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <div>
                                <Lock className="w-8 h-8 text-[#E84912]" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-lg">{t("activate.validating") || "Validating your activation link..."}</p>
                    </div>
                ) : error && !valid ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <div className="flex items-center gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-xl font-bold text-red-600 mb-2">{t("activate.failedTitle") || "Activation Failed"}</h2>
                                <p className="text-gray-700">{error}</p>
                                <button
                                    onClick={() => router.push("/auth/2.0/login")}
                                    className="mt-4 inline-block px-6 py-2 bg-[#E84912] hover:bg-[#d63d0e] text-white font-bold rounded-lg transition"
                                >
                                    {t("activate.backToLogin") || "Back to Login"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : success ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">
                            {t("activate.activated") || "Account Activated!"}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t("activate.successDesc") || "Your password has been set successfully. Redirecting to login..."}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div className="bg-green-600 h-1 rounded-full animate-pulse" style={{ width: "100%" }}></div>
                        </div>
                    </div>
                ) : valid && !loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        {/* Instructions */}
                        <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <h3 className="font-semibold text-blue-900 mb-2">{t("activate.requirementsTitle") || "Password Requirements:"}</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    {t("activate.requirement1") || "At least 6 characters long"}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    {t("activate.requirement2") || "Must match in both fields"}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    {t("activate.requirement3") || "Use a mix of uppercase, lowercase, and numbers for better security"}
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Alert */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("activate.newPassword") || "New Password"}
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder={t("activate.passwordPlaceholder") || "Enter a secure password"}
                                        required
                                        minLength={6}
                                        className="w-full pr-12 py-6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("activate.confirmPassword") || "Confirm Password"}
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder={t("activate.confirmPasswordPlaceholder") || "Confirm your password"}
                                        required
                                        minLength={6}
                                        className="w-full pr-12 py-6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-600">{t("activate.strength") || "Password Strength:"}</div>
                                    <div className="flex gap-1">
                                        <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-gray-200"}`}></div>
                                        <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-gray-200"}`}></div>
                                        <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? "bg-green-500" : "bg-gray-200"}`}></div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-[#E84912] hover:bg-[#d63d0e] text-white font-bold py-6 rounded-lg text-lg transition-all duration-200 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                <Lock className="w-5 h-5" />
                                {loading ? t("activate.activating") || "Activating..." : t("activate.setPassword") || "Set Password & Activate"}
                            </Button>

                            {/* Footer Text */}
                            <p className="text-center text-sm text-gray-500">
                                {t("activate.agree") || "By activating your account, you agree to our Terms of Service and Privacy Policy"}
                            </p>
                        </form>
                    </div>
                ) : null}
            </div>
        </div>
    );
}