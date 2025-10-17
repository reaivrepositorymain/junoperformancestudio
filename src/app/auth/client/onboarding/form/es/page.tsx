"use client";

import { useState } from "react";
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
    label: "Nombre de la empresa",
    type: "text",
    key: "companyName",
    required: true,
  },
  {
    label: "Edad de la empresa",
    type: "number",
    key: "companyAge",
    required: true,
  },
  {
    label: "Proporción de género de tus compradores",
    type: "enum",
    key: "genderProportion",
    required: true,
    options: [
      { value: "male", label: "Mayormente hombres" },
      { value: "female", label: "Mayormente mujeres" },
      { value: "equal", label: "Igual hombres y mujeres" },
      { value: "na", label: "Prefiero no decirlo" },
    ],
  },
  {
    label: "¿Dónde viven tus compradores?",
    type: "text",
    key: "buyersLocation",
    required: true,
  },
  {
    label: "Define al menos 3 aspectos que caracterizan a tu público objetivo",
    type: "text",
    key: "audienceAspects",
    required: true,
  },
  {
    label: "Opcional: Si hay algo importante que no se haya mencionado en las respuestas anteriores, puedes incluirlo ahora.",
    type: "text",
    key: "otherImportant",
    required: false,
  },
  {
    label: "Problema / Necesidad / Aspiración de tus clientes",
    type: "text",
    key: "customerProblem",
    required: true,
  },
  {
    label: "¿Cuál de los problemas, necesidades o aspiraciones que indicaste es el más importante?",
    type: "text",
    key: "mostImportantProblem",
    required: true,
  },
  {
    label: "Tu solución: ¿Cómo tu producto o servicio resuelve estos problemas para tus clientes?",
    type: "text",
    key: "solution",
    required: true,
  },
  {
    label: "Haz una lista de al menos 3 cosas que haces mejor que tus competidores (tus diferenciadores)",
    type: "text",
    key: "differentiators",
    required: true,
  },
  {
    label: "Objeciones: ¿Cuáles son los posibles “peros” por los que la gente podría no comprarte?",
    type: "text",
    key: "objections",
    required: true,
  },
  {
    label: "Y de todos estos \"peros\", ¿cuál dirías que es el más importante?",
    type: "text",
    key: "mostImportantObjection",
    required: true,
  },
  {
    label: "¿Quiénes dirías que son tus referentes?",
    type: "text",
    key: "benchmarks",
    required: true,
  },
  {
    label: "¿Quiénes dirías que son tus competidores?",
    type: "text",
    key: "competitors",
    required: true,
  },
  {
    label: "¿Qué aspectos destacas de tus competidores?",
    type: "text",
    key: "competitorHighlights",
    required: true,
  },
  {
    label: "¿Cuáles son tus productos más vendidos / más demandados?",
    type: "text",
    key: "bestSellers",
    required: true,
  },
  {
    label: "¿Cuáles son los productos prioritarios para ventas actualmente?",
    type: "text",
    key: "priorityProducts",
    required: true,
  },
  {
    label: "¿Qué personas / influencers son referentes en tu industria?",
    type: "text",
    key: "industryInfluencers",
    required: true,
  },
  {
    label: "¿Qué revistas, cuentas de redes sociales (IG, Twitter, TikTok, etc.), música, series, blogs, películas, libros… consume tu mercado?",
    type: "text",
    key: "marketMedia",
    required: true,
  },
  {
    label: "¿Cuál es tu presupuesto mensual para invertir en plataformas de Paid Media (Facebook Ads, TikTok Ads, Google Ads…)?",
    type: "text",
    key: "monthlyBudget",
    required: true,
  },
  {
    label: "Ejemplos comunes de copy/textos/eslóganes que sueles usar.",
    type: "text",
    key: "commonCopy",
    required: true,
  },
  {
    label: "Por último, ¿hay algún otro comentario que te gustaría agregar?",
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
    .filter((q) => q.required)
    .every((q) => answers[q.key] && answers[q.key].toString().trim() !== "");

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/client/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...answers,
          isEspanol: true, // Set the isEspanol field to true for Spanish form
        }),
      });

      if (response.ok) {
        toast.success("¡Formulario enviado exitosamente! 🎉");
        setTimeout(() => {
          router.push("/auth/client/onboarding/assets");
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al enviar el formulario.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#E84912]/10 via-white to-[#438D34]/10">
      {/* Barra de progreso flotante arriba */}
      <div className="fixed top-0 left-0 w-full px-0 z-10">
        <Progress value={progress} className="h-2 bg-gray-200 rounded-none" />
        <div className="flex justify-between items-center px-6 py-2">
          <span className="text-xs text-gray-500">
            Paso {step + 1} de {questions.length}
          </span>
          <span className="text-xs text-[#E84912] font-bold">{progress}%</span>
        </div>
      </div>

      {/* Área principal de la pregunta */}
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
                  placeholder="Escribe tu respuesta aquí..."
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
                  placeholder="Ingresa un número"
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
                          ${
                            answers[current.key] === opt.value
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
        {/* Botones de navegación */}
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
            Atrás
          </Button>
          {step < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={submitting}
              className="bg-[#E84912] text-white hover:bg-[#d63d0e] transition-all"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !allRequiredAnswered}
              className="bg-[#E84912] text-white hover:bg-[#d63d0e] transition-all"
            >
              {submitting ? "Enviando..." : "Enviar"}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}