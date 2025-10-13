"use client";

import { usePathname } from "next/navigation";
import LanguageSelector from "./LanguageSelector";

export default function ConditionalLanguageSelector() {
  const pathname = usePathname();
  
  if (
    pathname.startsWith("/auth/client/onboarding/form/en") ||
    pathname.startsWith("/auth/client/onboarding/form/es") ||
    pathname.startsWith("/auth/client/onboarding")
  ) {
    return null;
  }
  return <LanguageSelector />;
}