"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/lang/en";
import es from "@/lang/es";

export const languages = [
  { code: "en", name: "English", flag: "🇺🇸", flagCode: "us" },
  { code: "es", name: "Español", flag: "🇪🇸", flagCode: "es" },
];

// Translation resources
const translations: Record<string, Record<string, string>> = {
  en,
  es,
};

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => { },
  t: (key) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (stored && languages.some(l => l.code === stored)) setLanguage(stored);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("lang", language);
  }, [language]);

  const t = (key: string) => translations[language]?.[key] || translations["en"][key] || key;

  // Prevent rendering until hydrated to avoid mismatch
  if (!hydrated) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}