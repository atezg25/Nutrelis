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
        transition: "all 0.2s",
        padding: 0,
        overflow: "hidden",
      }}
      title={locale === "fr" ? "Switch to English" : "Passer en Français"}
    >
      <img
        src={locale === "fr" ? "/images/flag-en.svg" : "/images/flag-fr.svg"}
        alt={locale === "fr" ? "English" : "Français"}
        style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
      />
    </button>
  );
}
