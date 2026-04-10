"use client";
import { useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";

const avis = [
  { nom: "Marie Ange", ville: "Douala", stars: 5, titre: "Ma peau n'a jamais été aussi lumineuse", texte: "Depuis que j'ai commencé l'astaxanthine NUTRELIS, mon teint est éclatant et uniforme. Les imperfections ont disparu. Je reçois des compliments chaque jour. Je n'aurais jamais cru qu'un complément puisse avoir un tel effet sur ma peau.", semaines: "3 semaines", img: "/images/astaxanthine/Ast2.png", pack: "2 Boîtes" },
  { nom: "Christine", ville: "Yaoundé", stars: 5, titre: "Un vrai boost d'énergie au quotidien", texte: "Depuis que j'ai intégré l'astaxanthine Nutrelis à ma routine, je me sens plus énergique et concentrée toute la journée. Ma fatigue a disparu et ma peau est plus nette, mes cheveux tombent beaucoup moins.", semaines: "6 semaines", img: "/images/astaxanthine/Ast3.png", pack: "3 Boîtes" },
  { nom: "Audrey", ville: "Bafoussam", stars: 5, titre: "Une peau plus ferme et visiblement rajeunie", texte: "Après quelques semaines, ma peau est plus ferme et mes ridules sont nettement moins visibles. Mon visage paraît tonique et reposé, et mes proches remarquent la différence. Je me sens plus jeune chaque jour.", semaines: "8 semaines", img: "/images/astaxanthine/Ast4.png", pack: "2 Boîtes" },
  { nom: "Alex", ville: "Douala", stars: 5, titre: "Des résultats visibles sur mes cheveux et ma peau", texte: "En quelques semaines, mes cheveux sont plus forts, moins cassants et tombent beaucoup moins. Ma peau est plus douce, mieux hydratée et rayonne de santé. Nutrelis est facile à intégrer et les résultats sont durables.", semaines: "5 semaines", img: "/images/astaxanthine/Asta1.png", pack: "1 Boîte" },
  { nom: "Sandrine", ville: "Kribi", stars: 5, titre: "Je recommande à toutes mes amies", texte: "J'étais sceptique au début mais après 3 semaines, mes amies m'ont demandé ce que j'utilisais. Mon teint est lumineux, ma peau est hydratée et je me sens pleine d'énergie. NUTRELIS est devenu mon secret beauté.", semaines: "3 semaines", img: "/images/astaxanthine/Asta2.png", pack: "2 Boîtes" },
  { nom: "Patrick", ville: "Ngaoundéré", stars: 5, titre: "Excellent pour la récupération sportive", texte: "Je fais du sport régulièrement et depuis que je prends l'astaxanthine NUTRELIS, ma récupération est nettement meilleure. Moins de courbatures, plus d'énergie à l'entraînement. Un produit que je recommande à tous les sportifs.", semaines: "4 semaines", img: "/images/astaxanthine/Asta3.png", pack: "3 Boîtes" },
  { nom: "Isabelle", ville: "Douala", stars: 5, titre: "Ma peau résiste mieux au soleil", texte: "Travaillant beaucoup en extérieur, j'avais des problèmes de teint inégal et de taches. Depuis NUTRELIS, ma peau est plus uniforme et résiste mieux au soleil. Un vrai bouclier naturel !", semaines: "10 semaines", img: "/images/astaxanthine/Ast2.png", pack: "3 Boîtes" },
  { nom: "Thomas", ville: "Yaoundé", stars: 4, titre: "Bons résultats, livraison rapide", texte: "Les résultats sont là — peau plus claire et énergie améliorée. La livraison via ATEZ Express était rapide. Je retire une étoile car j'aurais aimé plus d'infos sur le suivi de commande, mais le produit est excellent.", semaines: "7 semaines", img: "/images/astaxanthine/Asta1.png", pack: "2 Boîtes" },
  { nom: "Céleste", ville: "Buea", stars: 5, titre: "Transformation visible en moins d'un mois", texte: "Je n'espérais pas des résultats aussi rapides. Dès la 2ème semaine, mon entourage remarquait que j'avais l'air plus reposée et lumineuse. Après un mois, la transformation est complète. Merci NUTRELIS !", semaines: "4 semaines", img: "/images/astaxanthine/Asta2.png", pack: "2 Boîtes" },
];

const stats = [
  { value: "12 000+", label: "Clients satisfaits" },
  { value: "4.8/5", label: "Note moyenne" },
  { value: "96%", label: "Recommandent NUTRELIS" },
  { value: "94%", label: "Résultats visibles" },
];

export default function AvisClients() {
  const [filtre, setFiltre] = useState(0);

  const filtres = ["Tous les avis", "⭐⭐⭐⭐⭐ 5 étoiles", "⭐⭐⭐⭐ 4 étoiles"];
  const avisFiltres = filtre === 0 ? avis : avis.filter(a => a.stars === (filtre === 1 ? 5 : 4));

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: "0 60px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 16 }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        <div style={{ display: "flex", gap: 32 }}>
          {[{ label: "Produits", href: "/produits/astaxanthine-12mg" }, { label: "Science", href: "/science" }, { label: "Avis clients", href: "/avis-clients" }, { label: "FAQ", href: "/faq" }].map(item => (
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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>TÉMOIGNAGES CLIENTS</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          Ils ont essayé,{" "}
          <span style={{ color: "var(--accent)" }}>ils ont adopté</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          Des vrais clients, des vrais résultats — sans filtre
        </p>
      </section>

      {/* STATS */}
      <section style={{ background: "#f0faf2", borderBottom: "1px solid #c8e6d0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "32px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid #c8e6d0" : "none" }}>
              <div style={{ color: "var(--accent)", fontSize: "2.4rem", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 8, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NOTE GLOBALE */}
      <section style={{ padding: "64px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "6rem", fontWeight: 900, color: "var(--accent)", fontFamily: "var(--font-sora), sans-serif", lineHeight: 1 }}>4.8</div>
            <div style={{ color: "#f5a623", fontSize: 32, margin: "12px 0 8px", letterSpacing: 4 }}>★★★★★</div>
            <div style={{ color: "#888", fontSize: 14 }}>sur 650+ avis vérifiés</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { stars: 5, pct: 89 },
              { stars: 4, pct: 8 },
              { stars: 3, pct: 2 },
              { stars: 2, pct: 1 },
              { stars: 1, pct: 0 },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#555", minWidth: 20 }}>{r.stars}★</span>
                <div style={{ flex: 1, height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: r.stars >= 4 ? "var(--accent)" : "#ddd", borderRadius: 5, transition: "width 0.6s" }} />
                </div>
                <span style={{ fontSize: 13, color: "#888", minWidth: 32 }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTRES + AVIS */}
      <section style={{ padding: "0 60px 80px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Filtres */}
          <div style={{ display: "flex", gap: 12, paddingTop: 48, marginBottom: 48, flexWrap: "wrap" }}>
            {filtres.map((f, i) => (
              <button key={i} onClick={() => setFiltre(i)} style={{
                padding: "10px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
                border: "1.5px solid", borderColor: filtre === i ? "var(--accent)" : "#ddd",
                background: filtre === i ? "#e8f5eb" : "#fff",
                color: filtre === i ? "var(--accent)" : "#555",
                transition: "all 0.2s",
              }}>
                {f}
              </button>
            ))}
            <span style={{ marginLeft: "auto", color: "#888", fontSize: 14, alignSelf: "center" }}>
              {avisFiltres.length} avis
            </span>
          </div>

          {/* Grille avis */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {avisFiltres.map((a, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #eee", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", transition: "all 0.3s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(29,185,84,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ color: "#f5a623", fontSize: 16, marginBottom: 12, letterSpacing: 2 }}>{"★".repeat(a.stars)}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 800, marginBottom: 10, lineHeight: 1.4 }}>{a.titre}</h3>
                <p style={{ color: "#666", fontSize: 13, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{a.texte}"</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent)", flexShrink: 0 }}>
                      <img src={a.img} alt={a.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.nom}</div>
                      <div style={{ color: "#aaa", fontSize: 11 }}>📍 {a.ville}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ background: "#e8f5eb", color: "var(--accent)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 4 }}>
                      ✅ Vérifié
                    </div>
                    <div style={{ color: "#bbb", fontSize: 11 }}>{a.semaines}</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#aaa", fontSize: 11 }}>Pack acheté :</span>
                  <span style={{ color: "#555", fontSize: 12, fontWeight: 600 }}>{a.pack}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: "72px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#060f08", marginBottom: 16 }}>
          Rejoignez nos 12 000+ clients satisfaits
        </h2>
        <p style={{ color: "rgba(6,15,8,0.75)", fontSize: 16, marginBottom: 36 }}>
          Garantie 90 jours satisfait ou remboursé — sans risque
        </p>
        <Link href="/produits/astaxanthine-12mg" style={{ display: "inline-block", background: "#060f08", color: "#fff", padding: "18px 52px", borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          Commander maintenant →
        </Link>
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