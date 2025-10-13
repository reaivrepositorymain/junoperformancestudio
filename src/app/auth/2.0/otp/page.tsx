"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper for OTP input
  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleVerify = async () => {
    setLoading(true);
    toast.dismiss();
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp }),
      });
      const result = await res.json();

      if (res.ok && result.success && result.id && result.type) {
        toast.success("Access granted!");
        setTimeout(() => {
          // Route based on type
          if (result.type === "proposal") {
            router.push(`/proposal/${result.id}`);
          } else if (result.type === "invoice") {
            router.push(`/invoice/${result.id}`);
          }
        }, 1200);
      } else {
        toast.error(result.error || "Invalid code.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="bg-slate-50 min-h-screen flex items-center justify-center bg-background font-sans px-2">
        <Card className="glass-effect rounded-2xl shadow-2xl p-4 md:p-8 w-full max-w-md md:max-w-lg border-primary bg-background/80 backdrop-blur-lg">
          {/* Logo Section */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <img
                src="/resources/images/reaiv-logo.png"
                alt="Reaiv logo"
                width={72}
                height={72}
                className="h-12 md:h-16 w-auto"
              />
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-black mb-2">
              Access Portal
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-medium tracking-wide">
              Enter your access code to view proposals or invoices
            </p>
          </div>

          {/* OTP Input Section */}
          <div className="mb-6 md:mb-8">
            <Label className="block text-xs md:text-sm font-semibold tracking-wider text-center text-muted-foreground mb-3 md:mb-4">
              Enter 8-digit verification code
            </Label>
            <div className="flex justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <InputOTP
                maxLength={8}
                className="gap-1 md:gap-2"
                value={otp}
                onChange={handleOtpChange}
                disabled={loading}
              >
                <InputOTPGroup>
                  {[...Array(8)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={`w-10 h-12 md:w-12 md:h-16 border-1 border-primary bg-white text-xl md:text-2xl font-bold text-center transition-all duration-150
              focus:border-[#8CE232] focus:ring-2 focus:ring-[#8CE232] 
              ${otp.length === 8 ? "border-[#8CE232] shadow-lg" : "border-slate-300"}
            `}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {/* Add a subtle animation or icon for feedback */}
            <div className="flex justify-center mt-2">
              {loading ? (
                <svg className="animate-spin h-6 w-6 text-[#8CE232]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : otp.length === 8 ? (
                <span className="text-[#8CE232] font-semibold animate-pulse">Ready to verify!</span>
              ) : (
                <span className="text-slate-400 text-xs">Enter all 8 digits</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 md:space-y-4">
            <Button
              className="w-full tracking-tight cursor-pointer bg-primary text-black font-bold text-base md:text-lg py-4 md:py-6 px-3 md:px-4 rounded-lg md:rounded-xl hover:bg-primary/90 hover:scale-[1.01] hover:shadow-xl transition-all duration-200 shadow-lg tracking-wide"
              size="lg"
              onClick={handleVerify}
              disabled={loading || otp.length !== 8}
            >
              {loading ? "Verifying..." : "Verify & Access"}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-[10px] md:text-xs text-muted-foreground tracking-tight font-medium">
              © {new Date().getFullYear()} REAIV. All rights reserved.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}