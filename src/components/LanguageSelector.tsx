"use client";

import { useLanguage, languages } from "@/context/LanguageProvider";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-xl shadow-lg px-3 py-2 flex gap-2 items-center border border-gray-200">
      {languages.map(l => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={`px-2 py-1 rounded font-semibold text-sm flex items-center gap-1 transition-colors ${
            language === l.code ? "bg-[#E84912] text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.name}</span>
        </button>
      ))}
    </div>
  );
}