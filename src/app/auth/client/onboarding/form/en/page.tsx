"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const questions = [
  {
    label: "Company Name",
    type: "text",
    key: "companyName",
    required: true,
  },
  {
    label: "Age of the Company",
    type: "number",
    key: "companyAge",
    required: true,
  },
  {
    label: "Gender proportion of your buyers",
    type: "enum",
    key: "genderProportion",
    required: true,
    options: [
      { value: "male", label: "Mostly male" },
      { value: "female", label: "Mostly female" },
      { value: "equal", label: "Equal male and female" },
      { value: "na", label: "Prefer not to say" },
    ],
  },
  {
    label: "Where do your buyers live?",
    type: "text",
    key: "buyersLocation",
    required: true,
  },
  {
    label: "Define at least 3 aspects that characterize your target audience",
    type: "text",
    key: "audienceAspects",
    required: true,
  },
  {
    label: "If there is something important that hasn't been mentioned in the previous responses, you may include it now.",
    type: "text",
    key: "otherImportant",
    required: false,
  },
  {
    label: "Problem / Need / Aspiration of your customers",
    type: "text",
    key: "customerProblem",
    required: true,
  },
  {
    label: "Which of the problems (needs or aspirations) you indicated is the most important?",
    type: "text",
    key: "mostImportantProblem",
    required: true,
  },
  {
    label: "Your solution: How does your product or service solve these problems for your customers?",
    type: "text",
    key: "solution",
    required: true,
  },
  {
    label: "Make a list of at least 3 things you do better than your competitors (your differentiators)",
    type: "text",
    key: "differentiators",
    required: true,
  },
  {
    label: "Objections: What are the possible “buts” for why people might not buy from you?",
    type: "text",
    key: "objections",
    required: true,
  },
  {
    label: "And of all these \"buts,\" which would you say is the most important?",
    type: "text",
    key: "mostImportantObjection",
    required: true,
  },
  {
    label: "Who would you say are your benchmarks?",
    type: "text",
    key: "benchmarks",
    required: true,
  },
  {
    label: "Who would you say are your competitors?",
    type: "text",
    key: "competitors",
    required: true,
  },
  {
    label: "What aspects do you highlight about your competitors?",
    type: "text",
    key: "competitorHighlights",
    required: true,
  },
  {
    label: "What are your best-selling / most in-demand products?",
    type: "text",
    key: "bestSellers",
    required: true,
  },
  {
    label: "What are the priority products for sales currently?",
    type: "text",
    key: "priorityProducts",
    required: true,
  },
  {
    label: "Which people / influencers are references in your industry?",
    type: "text",
    key: "industryInfluencers",
    required: true,
  },
  {
    label: "Which magazines, social media accounts (IG, Twitter, TikTok, etc.), music, series, blogs, movies, books… does your market consume?",
    type: "text",
    key: "marketMedia",
    required: true,
  },
  {
    label: "What is your monthly budget for investing in Paid Media platforms (Facebook Ads, TikTok Ads, Google Ads…)?",
    type: "text",
    key: "monthlyBudget",
    required: true,
  },
  {
    label: "Common examples of copy/text/slogans you often use.",
    type: "text",
    key: "commonCopy",
    required: true,
  },
  {
    label: "Lastly, is there any other comment you would like to add?",
    type: "text",
    key: "finalComment",
    required: false,
  },
];

export default function ClientOnboardingForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const current = questions[step];
  const progress = Math.round(((step + 1) / questions.length) * 100);

  function handleChange(key: string, value: any) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (step < questions.length - 1) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  // Check if all required questions are answered
  const allRequiredAnswered = questions
    .filter(q => q.required)
    .every(q => answers[q.key] && answers[q.key].toString().trim() !== "");

  async function handleSubmit() {
    setSubmitting(true);

    try {
      const response = await fetch("/api/client/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers), // Send the answers to the API
      });

      if (response.ok) {
        toast.success("Onboarding form submitted successfully!", {
          style: {
            background: "#53B36A",
            color: "white",
            border: "1px solid #438D34",
          },
        });
        setTimeout(() => {
          // Redirect to the client dashboard after successful submission
          router.push("/auth/client/onboarding/assets");
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit the form.", {
          style: {
            background: "#EA6D51",
            color: "white",
            border: "1px solid #E84912",
          },
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        style: {
          background: "#EA6D51",
          color: "white",
          border: "1px solid #E84912",
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#E84912]/10 via-white to-[#438D34]/10">
      {/* Progress bar floating at the top */}
      <div className="fixed top-0 left-0 w-full px-0 z-10">
        <Progress value={progress} className="h-2 bg-gray-200 rounded-none" />
        <div className="flex justify-between items-center px-6 py-2">
          <span className="text-xs text-gray-500">
            Step {step + 1} of {questions.length}
          </span>
          <span className="text-xs text-[#E84912] font-bold">
            {progress}%
          </span>
        </div>
      </div>

      {/* Top-left Back Button */}
      <Button
        variant="outline"
        className="absolute z-99 top-6 left-6 px-6 py-3 mt-4 rounded-xl border-[#EA6D51] text-black hover:bg-orange-50 font-semibold transition-all animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
        onClick={async () => {
          router.push("/auth/client/onboarding");
        }}
      >
        ← Back to Onboarding Home
      </Button>

      {/* Main question area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.98 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-2xl mx-auto px-6 py-10 sm:py-16"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl font-cursive tracking-wide sm:text-4xl font-bold text-gray-900 mb-2 text-center drop-shadow"
            >
              {current.label}
              {current.required && (
                <span className="ml-1 text-[#E84912]">*</span>
              )}
            </motion.h2>
            <Separator className="mb-6" />
            <div className="flex flex-col items-center">
              {current.type === "text" && (
                <Textarea
                  value={answers[current.key] || ""}
                  onChange={(e) => handleChange(current.key, e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[80px] resize-none text-base"
                  required={current.required}
                  autoFocus
                />
              )}
              {current.type === "number" && (
                <Input
                  type="number"
                  value={answers[current.key] || ""}
                  onChange={(e) => handleChange(current.key, e.target.value)}
                  placeholder="Enter a number"
                  required={current.required}
                  autoFocus
                  className="text-base"
                />
              )}
              {current.type === "enum" && (
                <RadioGroup
                  value={answers[current.key] || ""}
                  onValueChange={(v) => handleChange(current.key, v)}
                  className="space-y-3 w-full"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {current.options?.map((opt: any) => (
                      <label
                        key={opt.value}
                        htmlFor={opt.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm
                          ${answers[current.key] === opt.value
                            ? "border-[#E84912] bg-[#E84912]/10 scale-105"
                            : "border-gray-200 hover:border-[#E84912]/30"
                          }
                        `}
                      >
                        <RadioGroupItem
                          value={opt.value}
                          id={opt.value}
                          className="peer"
                        />
                        <span className="font-medium text-gray-700 text-base">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-between items-center w-full max-w-2xl px-6 pb-10"
        >
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            className="transition-all"
          >
            Back
          </Button>
          {step < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={submitting}
              className="bg-[#E84912] text-white hover:bg-[#d63d0e] transition-all"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !allRequiredAnswered}
              className="bg-[#E84912] text-white hover:bg-[#d63d0e] transition-all"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}