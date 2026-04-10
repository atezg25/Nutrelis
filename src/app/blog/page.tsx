"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
const articles = [
  {
    slug: "astaxanthine-guide-complet",
    categorie: "Science",
    titre: "Guide complet sur l'Astaxanthine : tout ce que vous devez savoir",
    extrait: "L'astaxanthine est l'antioxydant le plus puissant de la nature. Découvrez son mode d'action, ses bénéfices prouvés et pourquoi le dosage est crucial pour des résultats réels.",
    date: "15 Mars 2026",
    duree: "8 min",
    img: "/images/astaxanthine/NUT2.png",
    vedette: true,
  },
  {
    slug: "peau-lumineuse-naturellement",
    categorie: "Beauté",
    titre: "5 conseils pour une peau lumineuse naturellement",
    extrait: "La peau éclatante ne vient pas d'une crème miracle. Elle vient de l'intérieur. Voici comment nourrir votre peau en profondeur avec les bons actifs naturels.",
    date: "8 Mars 2026",
    duree: "5 min",
    img: "/images/astaxanthine/NUT3.png",
  },
  {
    slug: "antioxydants-comparaison",
    categorie: "Science",
    titre: "Vitamine C vs CoQ10 vs Astaxanthine : lequel choisir ?",
    extrait: "Tous les antioxydants ne se valent pas. Comparaison complète des mécanismes, des preuves cliniques et des cas d'usage de chaque antioxydant majeur.",
    date: "1 Mars 2026",
    duree: "7 min",
    img: "/images/astaxanthine/NUT4.png",
  },
  {
    slug: "complement-alimentaire-bien-choisir",
    categorie: "Santé",
    titre: "Comment bien choisir un complément alimentaire : 6 critères essentiels",
    extrait: "Le marché des compléments est saturé de produits sous-dosés et synthétiques. Voici les 6 questions à poser avant tout achat pour ne pas jeter votre argent.",
    date: "22 Février 2026",
    duree: "6 min",
    img: "/images/astaxanthine/NUT5.png",
  },
  {
    slug: "temoignage-marie-ange",
    categorie: "Témoignage",
    titre: "\"Ma peau n'a jamais été aussi lumineuse\" — Le témoignage de Marie Ange",
    extrait: "Après 3 semaines d'Astaxanthine NUTRELIS, Marie Ange partage sa transformation. De la fatigue chronique à un teint éclatant — son histoire complète.",
    date: "15 Février 2026",
    duree: "3 min",
    img: "/images/astaxanthine/Ast2.png",
  },
  {
    slug: "astaxanthine-yeux-ecrans",
    categorie: "Santé",
    titre: "Fatigue oculaire et écrans : pourquoi l'astaxanthine est la réponse naturelle",
    extrait: "8h par jour sur écran, c'est la moyenne des professionnels africains. Découvrez comment l'astaxanthine protège vos yeux de la lumière bleue et réduit la fatigue visuelle.",
    date: "5 Février 2026",
    duree: "5 min",
    img: "/images/astaxanthine/img4A.png",
  },
];

const couleurCategorie: Record<string, string> = {
  Science: "#1db954",
  Beauté: "#e91e8c",
  Santé: "#2196f3",
  Témoignage: "#ff9800",
};

export default function Blog() {
  const vedette = articles[0];
  const reste = articles.slice(1);

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: "0 60px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 16 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        <div style={{ display: "flex", gap: 32 }}>
          {[{ label: "Produits", href: "/produits/astaxanthine-12mg" }, { label: "Science", href: "/science" }, { label: "FAQ", href: "/faq" }].map(item => (
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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>LE BLOG NUTRELIS</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          Science, santé &{" "}
          <span style={{ color: "var(--accent)" }}>bien-être</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          Des articles fondés sur la science pour prendre soin de vous intelligemment
        </p>
      </section>

      {/* ARTICLE EN VEDETTE */}
      <section style={{ padding: "72px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 24 }}>À LA UNE</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, background: "#fff", borderRadius: 24, overflow: "hidden", border: "1px solid #c8e6d0", boxShadow: "0 4px 32px rgba(29,185,84,0.06)" }}>
            <div style={{ background: "#fdf5f3", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, padding: 48 }}>
              <img src={vedette.img} alt={vedette.titre} style={{ width: "100%", maxWidth: 300, objectFit: "contain" }} />
            </div>
            <div style={{ padding: "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: 1, display: "inline-block", width: "fit-content", marginBottom: 20 }}>
                {vedette.categorie.toUpperCase()}
              </span>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
                {vedette.titre}
              </h2>
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>
                {vedette.extrait}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
                <span style={{ color: "#888", fontSize: 13 }}>📅 {vedette.date}</span>
                <span style={{ color: "#888", fontSize: 13 }}>⏱️ {vedette.duree} de lecture</span>
              </div>
              <Link href={`/blog/${vedette.slug}`} style={{ background: "var(--accent)", color: "#060f08", padding: "14px 32px", borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: "none", display: "inline-block", width: "fit-content" }}>
                Lire l'article →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TOUS LES ARTICLES */}
      <section style={{ padding: "72px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800 }}>
              Tous les articles
            </h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Tous", "Science", "Beauté", "Santé", "Témoignage"].map((cat, i) => (
                <span key={i} style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid", borderColor: i === 0 ? "var(--accent)" : "#ddd", background: i === 0 ? "#e8f5eb" : "#fff", color: i === 0 ? "var(--accent)" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {reste.map((art, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", transition: "all 0.3s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(29,185,84,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ background: "#fdf5f3", height: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <img src={art.img} alt={art.titre} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ background: "#e8f5eb", color: couleurCategorie[art.categorie] ?? "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 1 }}>
                      {art.categorie.toUpperCase()}
                    </span>
                    <span style={{ color: "#bbb", fontSize: 12 }}>⏱️ {art.duree}</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>
                    {art.titre}
                  </h3>
                  <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{art.extrait}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#aaa", fontSize: 12 }}>📅 {art.date}</span>
                    <Link href={`/blog/${art.slug}`} style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                      Lire →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: "#f0faf2", padding: "72px 60px", textAlign: "center", borderTop: "1px solid #c8e6d0" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>NEWSLETTER</p>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: 12 }}>
          Recevez nos articles en avant-première
        </h2>
        <p style={{ color: "#555", fontSize: 15, marginBottom: 36 }}>Conseils santé, nouveaux produits et offres exclusives. Pas de spam.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
          <input
            type="email"
            placeholder="votre@email.com"
            style={{ flex: 1, padding: "14px 18px", borderRadius: 10, border: "1.5px solid #c8e6d0", fontSize: 15, outline: "none" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onBlur={e => e.currentTarget.style.borderColor = "#c8e6d0"}
          />
          <button style={{ background: "var(--accent)", color: "#060f08", border: "none", padding: "14px 28px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sora), sans-serif" }}>
            S'abonner →
          </button>
        </div>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>© 2026 NUTRELIS — Tous droits réservés</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "Accueil", href: "/" }, { label: "Produits", href: "/produits/astaxanthine-12mg" }, { label: "Contact", href: "/contact" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}