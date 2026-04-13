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
        justifyContent: "center",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "50%",
        width: 34,
        height: 34,
        cursor: "pointer",
        fontSize: 20,
        transition: "all 0.2s",
        padding: 0,
      }}
      title={locale === "fr" ? "Switch to English" : "Passer en Français"}
    >
      {locale === "fr" ? "🇬🇧" : "🇫🇷"}
    </button>
  );
}
