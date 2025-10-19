"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const languages = [
  { code: "en", name: "English", flag: "🇺🇸", flagCode: "us" },
  { code: "es", name: "Español", flag: "🇪🇸", flagCode: "es" },
];

const translations: Record<string, Record<string, string>> = {
  en: {
    //login client
    "login.clientPortal": "Client Portal",
    "login.clientPortalDesc": "Access your proposals, performance reports and collaborate seamlessly with your team.",
    "login.secure": "Secure",
    "login.fast": "Fast",
    "login.reliable": "Reliable",
    "login.rights": "All rights reserved.",
    "login.welcomeBack": "Welcome back",
    "login.signInClient": "Sign in to access Client Dashboard",
    "login.email": "Email address",
    "login.password": "Password",
    "login.forgotPassword": "Forgot your password?",
    "login.resetComingSoon": "Password reset feature coming soon!",
    "login.requestHere": "Request here",
    "login.agreeTerms": "By signing in, you agree to our",
    "login.terms": "Terms",
    "login.and": "and",
    "login.privacyPolicy": "Privacy Policy",

    //admin login
    "admin.loginTitle": "Admin Login",
    "admin.accessTitle": "Admin Access",
    "admin.accessDesc": "Sign in to manage the system",
    "admin.email": "Email",
    "admin.password": "Password",
    "admin.signIn": "Admin Sign In",
    "admin.signingIn": "Signing in...",
    "admin.needAccess": "Need admin access?",
    "admin.contactSupport": "Contact support",
    "admin.contactToast": "Contact system administrator for access!",
    "admin.portalTitle": "Admin Portal",
    "admin.portalDesc": "Manage proposals, oversee client accounts, and control system settings with powerful admin tools.",
    "admin.control": "Control",
    "admin.monitor": "Monitor",
    "admin.manage": "Manage",
    "admin.rights": "All rights reserved.",
  },
  es: {
    //login client
    "login.clientPortal": "Portal de Cliente",
    "login.clientPortalDesc": "Accede a tus propuestas, informes de rendimiento y colabora fácilmente con tu equipo.",
    "login.secure": "Seguro",
    "login.fast": "Rápido",
    "login.reliable": "Fiable",
    "login.rights": "Todos los derechos reservados.",
    "login.welcomeBack": "Bienvenido de nuevo",
    "login.signInClient": "Inicia sesión para acceder al Panel de Cliente",
    "login.email": "Correo electrónico",
    "login.password": "Contraseña",
    "login.forgotPassword": "¿Olvidaste tu contraseña?",
    "login.resetComingSoon": "¡La función de restablecimiento de contraseña llegará pronto!",
    "login.requestHere": "Solicitar aquí",
    "login.agreeTerms": "Al iniciar sesión, aceptas nuestros",
    "login.terms": "Términos",
    "login.and": "y",
    "login.privacyPolicy": "Política de Privacidad",

    //admin login
    "admin.loginTitle": "Acceso de Administrador",
    "admin.accessTitle": "Acceso de Administrador",
    "admin.accessDesc": "Inicia sesión para gestionar el sistema",
    "admin.email": "Correo electrónico",
    "admin.password": "Contraseña",
    "admin.signIn": "Acceso Administrador",
    "admin.signingIn": "Iniciando sesión...",
    "admin.needAccess": "¿Necesitas acceso de administrador?",
    "admin.contactSupport": "Contactar soporte",
    "admin.contactToast": "¡Contacta al administrador del sistema para obtener acceso!",
    "admin.portalTitle": "Portal de Administrador",
    "admin.portalDesc": "Gestiona propuestas, supervisa cuentas de clientes y controla la configuración del sistema con potentes herramientas de administración.",
    "admin.control": "Control",
    "admin.monitor": "Monitor",
    "admin.manage": "Gestionar",
    "admin.rights": "Todos los derechos reservados.",
  },
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