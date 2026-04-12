"use client";
import { useLocale } from "@/context/LocaleContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 8,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: 1,
        transition: "all 0.2s",
      }}
      title={locale === "fr" ? "Switch to English" : "Passer en Français"}
    >
      {locale === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
    </button>
  );
}
