"use client";
import dynamic from "next/dynamic";

const BoutonGoogleContent = dynamic(() => import("./BoutonGoogleContent"), {
  ssr: false,
  loading: () => (
    <button
      disabled
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        width: "100%", padding: "14px 24px", background: "#fff",
        border: "1.5px solid #ddd", borderRadius: 12, fontSize: 15,
        fontWeight: 600, color: "#aaa",
      }}
    >
      Chargement Google...
    </button>
  ),
});

export default function BoutonGoogle({ onSuccess }: { onSuccess?: () => void }) {
  return <BoutonGoogleContent onSuccess={onSuccess} />;
}
