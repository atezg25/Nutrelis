"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { medusa } from "@/lib/medusa";
import { useLocale } from "@/context/LocaleContext";
import { useScreenSize } from "@/hooks/useIsMobile";
import HydrationGuard from "@/components/HydrationGuard";

export default function Commandes() {
  const { t } = useLocale();
  const isMobile = useScreenSize() === "mobile";
  const { customer, loading } = useAuth();
  const router = useRouter();
  const [commandes, setCommandes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!loading && !customer) router.push("/auth/connexion");
  }, [customer, loading, router]);

  useEffect(() => {
    if (!customer) return;
    medusa.store.order.list()
      .then(({ orders }) => setCommandes(orders))
      .catch(() => setCommandes([]))
      .finally(() => setChargement(false));
  }, [customer]);

  if (loading || chargement) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>{t("account.loading")}</p>
    </div>
  );

  return (
    <HydrationGuard bg="#f8f9fa" style={{ minHeight: "100vh" }}>
      <nav style={{ background: "#7D0806", padding: isMobile ? "0 16px" : "0 60px", height: isMobile ? 56 : 68, display: "flex", alignItems: "center", gap: isMobile ? 10 : 16 }}>
        <Link href="/compte" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: isMobile ? 12 : 14 }}>{t("account.backToAccount")}</Link>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
        <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: isMobile ? 14 : 16, color: "#fff" }}>{t("account.ordersTitle")}</span>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 32 }}>{t("account.ordersTitle")}</h1>

        {commandes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 20, border: "1px solid #eee" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, marginBottom: 12 }}>{t("account.noOrders")}</h2>
            <p style={{ color: "#888", marginBottom: 24 }}>{t("account.noOrdersDesc")}</p>
            <Link href="/produits/astaxanthine-12mg" style={{ background: "#7D0806", color: "#fff", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 800, fontSize: 14 }}>
              {t("account.orderNow")}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {commandes.map((cmd, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 15 }}>{t("account.orderLabel")} #{cmd.display_id}</p>
                    <p style={{ color: "#888", fontSize: 13 }}>{new Date(cmd.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span style={{ background: cmd.status === "completed" ? "#f0faf2" : "#fdecea", color: cmd.status === "completed" ? "#1db954" : "#7D0806", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {cmd.status === "completed" ? "✅ " + t("account.delivered") : cmd.status === "pending" ? "⏳ " + t("account.pending") : cmd.status}
                  </span>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ color: "#555", fontSize: 14 }}>{cmd.items?.length} {t("account.itemsCount")}</p>
                  <p style={{ fontWeight: 900, fontSize: 16, color: "#7D0806" }}>{(cmd.total / 100).toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HydrationGuard>
  );
}
