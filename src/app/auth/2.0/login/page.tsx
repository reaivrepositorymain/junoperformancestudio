"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageProvider";
import { useMediaQuery } from "react-responsive";
import { Eye, EyeOff } from "lucide-react";

const junoColors = [
    "#E84912", // destructive-foreground
    "#F6A100", // primary
    "#D7770F", // primary-foreground
    "#53B36A", // secondary
    "#438D34", // secondary-foreground
    "#67ACAA", // accent
    "#64C2C6", // accent-foreground
    "#3669B2", // ring
    "#2953A1", // sidebar-ring
    "#719AD1", // sidebar-primary-foreground
];

// Validation schema
const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [currentJunoColorIndex, setCurrentJunoColorIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
    const { t } = useLanguage();
    const isMobile = useMediaQuery({ maxWidth: 639 });
    const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const [showClientPassword, setShowClientPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);

    // Setup separate forms for client and admin
    const clientForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onSubmit",
    });

    const adminForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onSubmit",
    });

    // JUNO title color transition effect
    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);

            setTimeout(() => {
                setCurrentJunoColorIndex((prevIndex) =>
                    (prevIndex + 1) % junoColors.length
                );
                setIsVisible(true);
            }, 300); // Fade out duration

        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (data: LoginFormData, isAdmin = false) => {
        setLoading(true);
        toast.dismiss();

        const loadingToast = toast.loading(
            isAdmin ? "Signing in as admin..." : "Signing in...",
            {
                style: {
                    background: "#FDD49F",
                    color: "#D7770F",
                    border: "1px solid #C4E1DE",
                },
            }
        );

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ ...data, isAdmin }),
                headers: { "Content-Type": "application/json" },
            });

            toast.dismiss(loadingToast);

            if (res.ok) {
                const result = await res.json();

                // Only allow admin role for admin login
                if (isAdmin && result.user?.role !== "admin") {
                    toast.error("You do not have admin access.", {
                        style: {
                            background: "#EA6D51",
                            color: "white",
                            border: "1px solid #E84912",
                        },
                        duration: 4000,
                    });
                    setLoading(false);
                    return;
                }

                toast.success(
                    `${isAdmin ? 'Admin' : 'Client'} login successful! Redirecting...`,
                    {
                        style: {
                            background: isAdmin ? "#F97316" : "#53B36A",
                            color: "white",
                            border: isAdmin ? "1px solid #EA580C" : "1px solid #438D34",
                        },
                        duration: 2000,
                    }
                );

                setTimeout(async () => {
                    if (isAdmin) {
                        router.push("/admin/dashboard");
                    } else {
                        // Check if the client has completed the onboarding questionnaire
                        const questionnaireRes = await fetch("/api/client/check-questionnaire", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${result.token}`, // Pass the token for authentication
                            },
                        });

                        if (questionnaireRes.ok) {
                            const { hasCompletedQuestionnaire } = await questionnaireRes.json();
                            if (!hasCompletedQuestionnaire) {
                                router.push("/auth/client/onboarding");
                            } else {
                                router.push("/dashboard/client");
                            }
                        } else {
                            toast.error("Failed to check onboarding status.", {
                                style: {
                                    background: "#EA6D51",
                                    color: "white",
                                    border: "1px solid #E84912",
                                },
                                duration: 4000,
                            });
                        }
                    }
                }, 1000);
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Invalid credentials.", {
                    style: {
                        background: "#EA6D51",
                        color: "white",
                        border: "1px solid #E84912",
                    },
                    duration: 4000,
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Network error. Please check your connection and try again.", {
                style: {
                    background: "#EA6D51",
                    color: "white",
                    border: "1px solid #E84912",
                },
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Form validation handler for client
    const onClientInvalid = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message, {
                style: {
                    background: "#EA6D51",
                    color: "white",
                    border: "1px solid #E84912",
                },
                duration: 3000,
            });
        }
    };

    // Form validation handler for admin
    const onAdminInvalid = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message, {
                style: {
                    background: "#EA6D51",
                    color: "white",
                    border: "1px solid #E84912",
                },
                duration: 3000,
            });
        }
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center bg-white ${isMobile ? "p-2" : isTablet ? "p-4" : "p-6"
                }`}
        >
            <Toaster
                richColors={false}
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#FDD49F",
                        color: "#D7770F",
                        border: "1px solid #C4E1DE",
                    },
                }}
            />

            {/* Animated Shapes Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {isMobile ? (
                    <>
                        <Image
                            src="/resources/shapes/RECURSOS GRAFICOS-1.png"
                            alt=""
                            width={100}
                            height={100}
                            className="absolute top-4 left-4 animate-shape1 opacity-60"
                            style={{ zIndex: 1 }}
                        />
                        <Image
                            src="/resources/shapes/RECURSOS GRAFICOS-3.png"
                            alt=""
                            width={80}
                            height={80}
                            className="absolute bottom-4 right-4 animate-shape3 opacity-50"
                            style={{ zIndex: 1 }}
                        />
                    </>
                ) : (
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
                )}
            </div>

            <Card
                className={`rounded-xl shadow-2xl p-0 w-full ${isMobile
                    ? "max-w-xs"
                    : isTablet
                        ? "max-w-lg"
                        : "max-w-4xl"
                    } border-2 border-gray-200 bg-white flex flex-col overflow-hidden`}
            >
                {/* Content Container with Smooth Transition */}
                <div
                    className={`flex ${isDesktop ? "flex-row" : isTablet ? "flex-col" : "flex-col"
                        } overflow-hidden min-h-[500px] ${isDesktop ? "lg:min-h-[670px]" : isTablet ? "md:min-h-[600px]" : ""
                        } relative`}
                >
                    {/* Client Login Layout */}
                    <div
                        className={`absolute inset-0 flex ${isDesktop ? "flex-row" : isTablet ? "flex-col" : "flex-col"
                            } transition-all duration-700 ease-in-out transform ${activeTab === "client"
                                ? "translate-x-0 opacity-100"
                                : isDesktop
                                    ? "translate-x-full opacity-0"
                                    : "opacity-0"
                            }`}
                    >
                        {/* Left: Logo and branding - Hidden on mobile/tablet, visible on desktop */}
                        {isDesktop && (
                            <div className="bg-white flex-col items-center justify-center px-8 py-12 lg:w-1/2 w-full hidden lg:flex">
                                <div className="mb-6">
                                    <Image
                                        src="/resources/favicons/isologos.png"
                                        alt="Juno logo"
                                        width={200}
                                        height={96}
                                        className="drop-shadow-2xl w-56"
                                        priority
                                    />
                                </div>
                                <h2 className="text-xl lg:text-2xl font-bold text-black/90 mb-5 text-center">
                                    {t("login.clientPortal")}
                                </h2>
                                <p className="text-black/80 text-center mb-6 text-base lg:text-lg leading-relaxed max-w-sm">
                                    {t("login.clientPortalDesc")}
                                </p>
                                <div className="flex items-center space-x-6 text-black/70">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-black rounded-full"></div>
                                        <span className="text-sm">{t("login.secure")}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-black rounded-full"></div>
                                        <span className="text-sm">{t("login.fast")}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-black rounded-full"></div>
                                        <span className="text-sm">{t("login.reliable")}</span>
                                    </div>
                                </div>
                                <div className="mt-10 text-xs text-black/50 text-center">
                                    &copy; {new Date().getFullYear()} Juno. {t("login.rights")}
                                </div>
                            </div>
                        )}

                        {/* Right: Client Login Form */}
                        <div
                            className={`flex flex-col justify-center px-6 sm:px-8 py-8 ${isDesktop ? "lg:py-40 lg:w-1/2" : "w-full"
                                } bg-black`}
                        >
                            <div className="max-w-sm mx-auto w-full">
                                {/* Tab Navigation - Modern Toggle Buttons */}
                                <div className="flex justify-center items-center mb-6">
                                    <div className="bg-white/20 p-1 rounded-full flex gap-1">
                                        <button
                                            onClick={() => setActiveTab("client")}
                                            className={`px-4 py-2 rounded-full font-semibold cursor-pointer text-sm transition-all duration-300 ${activeTab === "client"
                                                ? "bg-white text-black shadow-md"
                                                : "text-white/70 hover:text-white"
                                                }`}
                                        >
                                            Client
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("admin")}
                                            className={`px-4 py-2 rounded-full font-semibold cursor-pointer text-sm transition-all duration-300 ${activeTab === "admin"
                                                ? "bg-white text-black shadow-md"
                                                : "text-white/70 hover:text-white"
                                                }`}
                                        >
                                            Admin
                                        </button>
                                    </div>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-white tracking-tight">
                                    {t("login.welcomeBack")}
                                </h2>
                                <p className="text-white/70 text-center mb-6 sm:mb-8 text-base sm:text-lg">
                                    {t("login.signInClient")}
                                </p>

                                <FormProvider {...clientForm}>
                                    <form
                                        onSubmit={clientForm.handleSubmit(
                                            (data) => handleLogin(data, false),
                                            onClientInvalid
                                        )}
                                        className="space-y-5 sm:space-y-6"
                                    >
                                        <FormItem>
                                            <FormLabel className="text-white font-semibold text-base sm:text-lg mb-2 block">
                                                {t("login.email")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    {...clientForm.register("email")}
                                                    disabled={loading}
                                                    autoComplete="email"
                                                    placeholder="companyname@juno.com"
                                                    className={`bg-white/10 border-2 ${clientForm.formState.errors.email
                                                        ? "border-red-400 focus:border-red-400"
                                                        : "border-white/20 focus:border-blue-400"
                                                        } focus:ring-2 focus:ring-blue-400/20 text-white placeholder:text-white/50 text-base sm:text-lg py-3 sm:py-6 rounded-xl transition-all duration-200`}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-sm mt-1" />
                                        </FormItem>

                                        <FormItem>
                                            <FormLabel className="text-white font-semibold text-base sm:text-lg mb-2 block">
                                                {t("login.password")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showClientPassword ? "text" : "password"}
                                                        {...clientForm.register("password")}
                                                        disabled={loading}
                                                        autoComplete="current-password"
                                                        placeholder="••••••••••"
                                                        className={`bg-white/10 border-2 ${clientForm.formState.errors.password
                                                            ? "border-red-400 focus:border-red-400"
                                                            : "border-white/20 focus:border-blue-400"
                                                            } focus:ring-2 focus:ring-blue-400/20 text-white placeholder:text-white/50 text-base sm:text-lg py-3 sm:py-6 rounded-xl transition-all duration-200`}
                                                    />
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => setShowClientPassword((prev) => !prev)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                                                    >
                                                        {showClientPassword ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <Eye className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-sm mt-1" />
                                        </FormItem>

                                        <div className="pt-3 sm:pt-4">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white hover:bg-white font-bold text-lg sm:text-xl py-3 sm:py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <div
                                                            className="w-4 h-4 sm:w-5 sm:h-5 border-2 rounded-full animate-spin"
                                                            style={{
                                                                borderColor: `${junoColors[currentJunoColorIndex]}30`,
                                                                borderTopColor: junoColors[currentJunoColorIndex],
                                                            }}
                                                        ></div>
                                                        <span
                                                            className={`transition-all duration-300 ease-in-out ${isVisible
                                                                ? "opacity-100 transform scale-100"
                                                                : "opacity-30 transform scale-95"
                                                                }`}
                                                            style={{
                                                                color: junoColors[currentJunoColorIndex],
                                                                textShadow: `0 0 10px ${junoColors[currentJunoColorIndex]}20`,
                                                            }}
                                                        >
                                                            Signing in...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`transition-all duration-300 ease-in-out ${isVisible
                                                            ? "opacity-100 transform scale-100"
                                                            : "opacity-30 transform scale-95"
                                                            }`}
                                                        style={{
                                                            color: junoColors[currentJunoColorIndex],
                                                            textShadow: `0 0 10px ${junoColors[currentJunoColorIndex]}20`,
                                                        }}
                                                    >
                                                        Sign In
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </FormProvider>

                                <div className="mt-5 sm:mt-6 text-center">
                                    <span className="text-white/70 text-sm sm:text-base">
                                        {t("login.forgotPassword")}
                                    </span>
                                    <a
                                        href="#"
                                        className="ml-2 text-white font-semibold hover:text-[#E84912] transition-colors underline-offset-4 hover:underline text-sm sm:text-base"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push("/auth/2.0/reset-password");
                                        }}
                                    >
                                        {t("login.requestHere")}
                                    </a>
                                </div>

                                <div className="mt-4 sm:mt-5 text-center text-white/70 text-xs sm:text-sm leading-relaxed px-2">
                                    {t("login.agreeTerms")}{" "}
                                    <a
                                        href="#"
                                        className="text-white hover:text-[#E84912] transition-colors underline-offset-4 hover:underline"
                                    >
                                        {t("login.terms")}
                                    </a>
                                    {" "}{t("login.and")}{" "}
                                    <a
                                        href="#"
                                        className="text-white hover:text-[#E84912] transition-colors underline-offset-4 hover:underline"
                                    >
                                        {t("login.privacyPolicy")}
                                    </a>
                                    .
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Login Layout */}
                    <div
                        className={`absolute inset-0 flex ${isDesktop ? "flex-row" : "flex-col"
                            } transition-all duration-700 ease-in-out transform ${activeTab === "admin"
                                ? "translate-x-0 opacity-100"
                                : isDesktop
                                    ? "-translate-x-full opacity-0"
                                    : "opacity-0"
                            }`}
                    >
                        {/* Left: Admin Login Form */}
                        <div
                            className={`flex flex-col justify-center px-6 sm:px-8 py-8 ${isDesktop ? "lg:py-12 lg:w-1/2" : "w-full"
                                } bg-gradient-to-br from-gray-900 to-black`}
                        >
                            <div className="max-w-sm mx-auto w-full">
                                {/* Tab Navigation - Modern Toggle Buttons */}
                                <div className="flex justify-center items-center mb-6">
                                    <div className="bg-white/20 p-1 rounded-full flex gap-1">
                                        <button
                                            onClick={() => setActiveTab("client")}
                                            className={`px-4 py-2 rounded-full font-semibold cursor-pointer text-sm transition-all duration-300 ${activeTab === "client"
                                                ? "bg-white text-black shadow-md"
                                                : "text-white/70 hover:text-white"
                                                }`}
                                        >
                                            Client
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("admin")}
                                            className={`px-4 py-2 rounded-full font-semibold cursor-pointer text-sm transition-all duration-300 ${activeTab === "admin"
                                                ? "bg-white text-black shadow-md"
                                                : "text-white/70 hover:text-white"
                                                }`}
                                        >
                                            Admin
                                        </button>
                                    </div>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-white tracking-tight">
                                    {t("admin.accessTitle")}
                                </h2>
                                <p className="text-white/70 text-center mb-6 sm:mb-8 text-base sm:text-lg">
                                    {t("admin.accessDesc")}
                                </p>

                                <FormProvider {...adminForm}>
                                    <form
                                        onSubmit={adminForm.handleSubmit(
                                            (data) => handleLogin(data, true),
                                            onAdminInvalid
                                        )}
                                        className="space-y-5 sm:space-y-6"
                                    >
                                        <FormItem>
                                            <FormLabel className="text-white font-semibold text-base sm:text-lg mb-2 block">
                                                {t("admin.email")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    {...adminForm.register("email")}
                                                    disabled={loading}
                                                    autoComplete="email"
                                                    placeholder="admin@juno.com"
                                                    className={`bg-white/10 border-2 ${adminForm.formState.errors.email
                                                        ? "border-red-400 focus:border-red-400"
                                                        : "border-white/20 focus:border-orange-400"
                                                        } focus:ring-2 focus:ring-orange-400/20 text-white placeholder:text-white/50 text-base sm:text-lg py-3 sm:py-6 rounded-xl transition-all duration-200`}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-sm mt-1" />
                                        </FormItem>

                                        <FormItem>
                                            <FormLabel className="text-white font-semibold text-base sm:text-lg mb-2 block">
                                                {t("admin.password")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showAdminPassword ? "text" : "password"}
                                                        {...adminForm.register("password")}
                                                        disabled={loading}
                                                        autoComplete="current-password"
                                                        placeholder="••••••••••"
                                                        className={`bg-white/10 border-2 ${adminForm.formState.errors.password
                                                            ? "border-red-400 focus:border-red-400"
                                                            : "border-white/20 focus:border-orange-400"
                                                            } focus:ring-2 focus:ring-orange-400/20 text-white placeholder:text-white/50 text-base sm:text-lg py-3 sm:py-6 rounded-xl transition-all duration-200`}
                                                    />
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => setShowAdminPassword((prev) => !prev)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                                                    >
                                                        {showAdminPassword ? (
                                                            <EyeOff className="w-5 h-5" />
                                                        ) : (
                                                            <Eye className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-sm mt-1" />
                                        </FormItem>

                                        <div className="pt-3 sm:pt-4">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white hover:bg-white text-white font-bold text-lg sm:text-xl py-3 sm:py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {loading ? (
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        <span
                                                            className={`transition-all duration-300 ease-in-out ${isVisible
                                                                ? "opacity-100 transform scale-100"
                                                                : "opacity-30 transform scale-95"
                                                                }`}
                                                            style={{
                                                                color: junoColors[currentJunoColorIndex],
                                                                textShadow: `0 0 10px ${junoColors[currentJunoColorIndex]}20`,
                                                            }}
                                                        >
                                                            {t("admin.signingIn")}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`transition-all duration-300 ease-in-out ${isVisible
                                                            ? "opacity-100 transform scale-100"
                                                            : "opacity-30 transform scale-95"
                                                            }`}
                                                        style={{
                                                            color: junoColors[currentJunoColorIndex],
                                                            textShadow: `0 0 10px ${junoColors[currentJunoColorIndex]}20`,
                                                        }}
                                                    >
                                                        {t("admin.signIn")}
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </FormProvider>

                                <div className="mt-5 sm:mt-6 text-center">
                                    <span className="text-white/70 text-sm sm:text-base">
                                        Need admin access?
                                    </span>
                                    <a
                                        href="#"
                                        className="ml-2 text-white font-semibold hover:text-orange-300 transition-colors underline-offset-4 hover:underline text-sm sm:text-base"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toast.info("Contact system administrator for access!", {
                                                style: {
                                                    background: "#F97316",
                                                    color: "white",
                                                    border: "1px solid #EA580C",
                                                },
                                            });
                                        }}
                                    >
                                        {t("admin.contactSupport")}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right: Logo and branding for Admin - Only on desktop */}
                        {isDesktop && (
                            <div className="bg-white flex-col items-center justify-center px-8 py-12 lg:w-1/2 w-full hidden lg:flex">
                                <div className="mb-6">
                                    <Image
                                        src="/resources/favicons/isologos.png"
                                        alt="Juno logo"
                                        width={200}
                                        height={96}
                                        className="drop-shadow-2xl w-56"
                                        priority
                                    />
                                </div>
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-5 text-center">
                                    {t("admin.portalTitle")}
                                </h2>
                                <p className="text-gray-700 text-center mb-6 text-base lg:text-lg leading-relaxed max-w-sm">
                                    {t("admin.portalDesc")}
                                </p>
                                <div className="flex items-center space-x-6 text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm">{t("admin.control")}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-sm">{t("admin.monitor")}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                        <span className="text-sm">{t("admin.manage")}</span>
                                    </div>
                                </div>
                                <div className="mt-10 text-xs text-gray-500 text-center">
                                    &copy; {new Date().getFullYear()} Juno Admin Portal. {t("admin.rights")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}