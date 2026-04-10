"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
export default function Livraison() {
  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: "0 60px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 16 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        <div style={{ display: "flex", gap: 32 }}>
          {[{ label: "Produits", href: "/produits/astaxanthine-12mg" }, { label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }].map(item => (
            <Link key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{item.label}</Link>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <NavbarCart />
  <Link href="/produits/astaxanthine-12mg" style={{ background: "var(--accent)", color: "#060f08", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
    Commander →
  </Link>
</div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #060f08, #0a1a0d)", padding: "72px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>LIVRAISON & RETOURS</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          Livré chez vous{" "}
          <span style={{ color: "var(--accent)" }}>rapidement et en sécurité</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>Via ATEZ Express — Expédition sous 24h après confirmation</p>
      </section>

      {/* OPTIONS LIVRAISON */}
      <section style={{ padding: "80px 60px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 48, textAlign: "center" }}>
            Options de livraison
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              {
                icon: "📦",
                titre: "Livraison Standard",
                prix: "GRATUITE",
                prixDesc: "Pour toutes les commandes",
                delai: "4 à 7 jours ouvrés",
                details: ["Via ATEZ Express", "Numéro de suivi fourni", "Expédition sous 24h", "Disponible partout au Cameroun"],
                popular: false,
              },
              {
                icon: "⚡",
                titre: "Livraison Express",
                prix: "Payante",
                prixDesc: "Tarif calculé à la commande",
                delai: "1 à 2 jours ouvrés",
                details: ["Via ATEZ Express prioritaire", "Suivi en temps réel", "Expédition le jour même si commande avant 12h", "Disponible dans les principales villes"],
                popular: true,
              },
            ].map((opt, i) => (
              <div key={i} style={{ background: opt.popular ? "#f0faf2" : "#f8f9fa", border: opt.popular ? "2px solid var(--accent)" : "1px solid #e0e0e0", borderRadius: 20, padding: 36, position: "relative" }}>
                {opt.popular && (
                  <div style={{ position: "absolute", top: -12, right: 20, background: "var(--accent)", color: "#060f08", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 20, letterSpacing: 1 }}>
                    RECOMMANDÉ
                  </div>
                )}
                <div style={{ fontSize: 36, marginBottom: 16 }}>{opt.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 8 }}>{opt.titre}</h3>
                <div style={{ color: "var(--accent)", fontSize: "1.6rem", fontWeight: 900, marginBottom: 4 }}>{opt.prix}</div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>{opt.prixDesc}</div>
                <div style={{ background: "var(--accent)", color: "#060f08", display: "inline-block", padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, marginBottom: 24 }}>
                  ⏱️ {opt.delai}
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {opt.details.map((d, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#444" }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESSUS */}
      <section style={{ padding: "80px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 48, textAlign: "center" }}>
            Comment ça marche ?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { num: "01", titre: "Vous passez commande", desc: "Choisissez votre pack sur notre site, sélectionnez votre mode de paiement et confirmez." },
              { num: "02", titre: "Confirmation sous 2h", desc: "Vous recevez un email de confirmation avec les détails de votre commande." },
              { num: "03", titre: "Expédition sous 24h", desc: "Votre commande est préparée et confiée à ATEZ Express le jour même ou le lendemain matin." },
              { num: "04", titre: "Suivi en temps réel", desc: "Vous recevez votre numéro de suivi par email et SMS pour suivre votre colis." },
              { num: "05", titre: "Livraison à votre porte", desc: "ATEZ Express livre à votre adresse. En cas d'absence, un avis de passage vous est laissé." },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 24, padding: "28px 0", borderBottom: i < 4 ? "1px solid #c8e6d0" : "none" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 15, flexShrink: 0, fontFamily: "var(--font-sora), sans-serif" }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{step.titre}</div>
                  <div style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLITIQUE RETOURS */}
      <section style={{ padding: "80px 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 16, textAlign: "center" }}>
            Politique de retours
          </h2>
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
            Pour des raisons d'hygiène et de sécurité, les produits vendus ne peuvent normalement pas être retournés. Cependant, notre <strong>garantie 90 jours</strong> vous protège intégralement.
          </p>

          <div style={{ background: "#f0faf2", border: "2px solid var(--accent)", borderRadius: 20, padding: "40px", marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <span style={{ fontSize: 40 }}>🛡️</span>
              <div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: 12, color: "var(--accent)" }}>
                  Garantie Satisfait ou Remboursé — 90 jours
                </h3>
                <p style={{ color: "#444", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                  Si vous ne constatez pas d'améliorations visibles dans les 90 jours suivant votre achat, contactez notre service client et nous vous remboursons intégralement — sans questions, sans frais de retour à votre charge.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {["✅ Aucune question posée", "✅ Remboursement intégral", "✅ Produit entamé accepté", "✅ Simple et rapide"].map((b, i) => (
                    <span key={i} style={{ background: "#fff", border: "1px solid #c8e6d0", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "#333" }}>{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#f8f9fa", border: "1px solid #e0e0e0", borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Comment faire une demande de remboursement ?</h3>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10, color: "#555", fontSize: 14, lineHeight: 1.6 }}>
              <li>Envoyez un email à <strong>contact@nutrelis.com</strong></li>
              <li>Incluez votre numéro de commande et la raison de votre demande</li>
              <li>Notre équipe répond dans les 24-48h</li>
              <li>Le remboursement est traité dans les 5-7 jours ouvrés</li>
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ RAPIDE */}
      <section style={{ padding: "60px 60px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.6rem", fontWeight: 800, marginBottom: 36, textAlign: "center" }}>
            Questions fréquentes sur la livraison
          </h2>
          {[
            { q: "Que faire si mon colis n'arrive pas ?", a: "Contactez-nous à contact@nutrelis.com avec votre numéro de commande. Nous faisons le suivi auprès d'ATEZ Express et résolvons la situation dans les 48h." },
            { q: "Puis-je modifier mon adresse après commande ?", a: "Oui, dans les 2h suivant la commande. Au-delà, si le colis est déjà expédié, contactez-nous et nous trouverons une solution." },
            { q: "Livrez-vous en zone rurale ?", a: "ATEZ Express couvre les principales villes et leurs environs. Pour les zones éloignées, contactez-nous avant de passer commande pour confirmer la faisabilité." },
            { q: "Livrez-vous en dehors du Cameroun ?", a: "Actuellement, nous livrons uniquement au Cameroun. Nous travaillons à élargir notre service. Contactez-nous pour être prévenu dès que votre pays est disponible." },
          ].map((faq, i) => (
            <div key={i} style={{ padding: "20px 0", borderBottom: i < 3 ? "1px solid #e0e0e0" : "none" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>📌 {faq.q}</div>
              <div style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>© 2026 NUTRELIS — Tous droits réservés</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "Accueil", href: "/" }, { label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}