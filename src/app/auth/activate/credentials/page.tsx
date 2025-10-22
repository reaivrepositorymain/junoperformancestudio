"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Copy, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageProvider";

export default function CredentialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success(t("credentials.emailCopied") || "Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/auth/client/onboarding");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7f2] via-[#f8fafc] to-[#f0fdf4] px-2 py-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t("credentials.allSet") || "You're All Set!"}
          </h1>
          <p className="text-base text-gray-600 max-w-md mx-auto">
            {t("credentials.accountCreated") || "Your account has been created and activated. Here are your login credentials."}
          </p>
        </div>

        {/* Credentials Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t("credentials.loginEmail") || "Your Login Email"}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E84912]" />
                  <span className="text-base md:text-sm font-semibold text-gray-900 break-all">
                    {email || "N/A"}
                  </span>
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                className={`p-2 md:p-3 rounded-lg transition-all duration-200 font-semibold flex items-center gap-1 ${copied
                  ? "bg-green-500 text-white"
                  : "bg-black text-white hover:bg-[#E84912]"
                  }`}
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">{copied ? t("credentials.copied") || "Copied!" : t("credentials.copy") || "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 md:p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">{t("credentials.important") || "Important Information:"}</h3>
            <ul className="space-y-1 text-xs md:text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{t("credentials.useEmail") || "Use this email to log in to your Juno account"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{t("credentials.usePassword") || "The password you just set will be used for all future logins"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="flex-1 bg-black hover:bg-[#E84912] text-white font-bold py-3 md:py-6 rounded-lg text-base transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? t("credentials.loading") || "Loading..." : t("credentials.continue") || "Continue to Onboarding"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {t("credentials.needHelp") || "Need help?"}{" "}
          <a href="#" className="text-[#E84912] hover:underline font-semibold">
            {t("credentials.contactSupport") || "Contact support"}
          </a>
        </p>
      </div>
    </div>
  );
}