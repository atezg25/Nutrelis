"use client";
import { useLocale } from "@/context/LocaleContext";

export default function LanguageSwitcher({ variant }: { variant?: "badge" }) {
  const { locale, setLocale } = useLocale();
  const isBadge = variant === "badge";

  return (
    <button
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isBadge ? "rgba(6,15,8,0.85)" : "rgba(255,255,255,0.1)",
        border: isBadge ? "1px solid rgba(29,185,84,0.4)" : "1px solid rgba(255,255,255,0.25)",
        borderRadius: isBadge ? "0 10px 10px 0" : "50%",
        width: isBadge ? 38 : 34,
        height: isBadge ? 38 : 34,
        cursor: "pointer",
        transition: "all 0.2s",
        padding: 0,
        overflow: "hidden",
        backdropFilter: isBadge ? "blur(12px)" : undefined,
        boxShadow: isBadge ? "2px 0 12px rgba(0,0,0,0.3)" : undefined,
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
