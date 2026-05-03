"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "es";

// Sidebar nav translations — instant, before Google Translate kicks in
export const translations = {
  en: {
    Dashboard: "Dashboard",
    Events: "Events",
    Calendar: "Calendar",
    Participants: "Participants",
    Providers: "Providers",
    Materials: "Materials",
    Tasks: "Tasks",
    Reminders: "Reminders",
    "Email Templates": "Email Templates",
    Communications: "Communications",
    Reports: "Reports",
    Documents: "Documents",
    Settings: "Settings",
    "User Management": "User Management",
    Admin: "Admin",
    Coordinator: "Coordinator",
    switchLang: "Español",
    langLabel: "EN",
  },
  es: {
    Dashboard: "Panel",
    Events: "Eventos",
    Calendar: "Calendario",
    Participants: "Participantes",
    Providers: "Proveedores",
    Materials: "Materiales",
    Tasks: "Tareas",
    Reminders: "Recordatorios",
    "Email Templates": "Plantillas de correo",
    Communications: "Comunicaciones",
    Reports: "Informes",
    Documents: "Documentos",
    Settings: "Configuración",
    "User Management": "Gestión de usuarios",
    Admin: "Admin",
    Coordinator: "Coordinador",
    switchLang: "English",
    langLabel: "ES",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggleLang: () => {},
  t: (key) => key,
});

function getGoogTransCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("googtrans=/en/es");
}

function setTranslateCookie(toSpanish: boolean) {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const rootDomain = parts.length > 2 ? "." + parts.slice(-2).join(".") : hostname;

  if (toSpanish) {
    document.cookie = `googtrans=/en/es; path=/`;
    document.cookie = `googtrans=/en/es; domain=${hostname}; path=/`;
    document.cookie = `googtrans=/en/es; domain=${rootDomain}; path=/`;
  } else {
    // Clear at every possible domain level Google may have set it
    const past = "expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0";
    const domains = [hostname, `.${hostname}`, rootDomain, `.${rootDomain.replace(/^\./, "")}`];
    document.cookie = `googtrans=; ${past}; path=/`;
    for (const d of domains) {
      document.cookie = `googtrans=; ${past}; domain=${d}; path=/`;
    }
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    // Detect current state from cookie (most reliable signal)
    const isSpanish = getGoogTransCookie();
    if (isSpanish) {
      setLang("es");
      localStorage.setItem("gather_lang", "es");
    } else {
      const saved = localStorage.getItem("gather_lang") as Lang | null;
      if (saved === "es") {
        // Saved as Spanish but no cookie — was cleared externally, reset to EN
        localStorage.setItem("gather_lang", "en");
      }
      setLang("en");
    }
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "es" : "en";
    localStorage.setItem("gather_lang", next);

    if (next === "es") {
      setTranslateCookie(true);
      window.location.reload();
    } else {
      // Clear cookie at all domain levels first
      setTranslateCookie(false);
      // Also trigger Google Translate's own restore via its hidden combo select
      const select = document.querySelector("select.goog-te-combo") as HTMLSelectElement | null;
      if (select) {
        select.value = "";
        select.dispatchEvent(new Event("change"));
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 300);
      } else {
        // Fresh navigation (not just reload) to avoid cached translation state
        window.location.href = window.location.href;
      }
    }
  };

  const t = (key: TranslationKey): string => translations[lang][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
