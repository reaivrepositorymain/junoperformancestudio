"use client";

import { useLanguage, languages } from "@/context/LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const activeLang = languages.find(l => l.code === language);

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2 font-semibold text-sm hover:bg-gray-50 transition-colors"
            aria-label="Select language"
          >
            {activeLang?.flagCode && (
              <span className={`fi fi-${activeLang.flagCode} text-lg border border-gray-300`} />
            )}
            <span className="font-semibold text-gray-900">{activeLang?.name}</span>
            <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {languages.map(l => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded ${
                language === l.code
                  ? "bg-black text-white font-bold"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              {l.flagCode && (
                <span className={`fi fi-${l.flagCode} text-lg border border-gray-300`} />
              )}
              <span>{l.name}</span>
              {language === l.code && (
                <span className="ml-auto text-xs bg-[#E84912] text-white px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}