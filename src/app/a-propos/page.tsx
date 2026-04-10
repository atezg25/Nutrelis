"use client";
import Link from "next/link";

export default function APropos() {
  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#060f08", borderBottom: "1px solid #1a3522", padding: "0 60px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#060f08", fontWeight: 900, fontSize: 16, fontFamily: "var(--font-sora), sans-serif" }}>N</div>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#f0fff4" }}>NUTRELIS</span>
        </Link>
        <div style={{ display: "flex", gap: 32 }}>
          {[{ label: "Produits", href: "/produits/astaxanthine-12mg" }, { label: "Science", href: "/science" }, { label: "Avis clients", href: "/avis-clients" }, { label: "FAQ", href: "/faq" }].map(item => (
            <Link key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{item.label}</Link>
          ))}
        </div>
        <Link href="/produits/astaxanthine-12mg" style={{ background: "var(--accent)", color: "#060f08", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          Commander →
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #060f08 0%, #0a1a0d 100%)", padding: "96px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>NOTRE HISTOIRE</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 900, color: "#f0fff4", lineHeight: 1.15, marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          Nés au Cameroun,<br /><span style={{ color: "var(--accent)" }}>engagés pour votre santé</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}>
          NUTRELIS est une marque de compléments alimentaires premium fondée avec une mission simple : rendre accessible à tous les actifs naturels les plus puissants du monde, dosés cliniquement pour des résultats réels.
        </p>
      </section>

      {/* MISSION */}
      <section style={{ padding: "96px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>NOTRE MISSION</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>
              Des formules d'excellence,<br />sans compromis
            </h2>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
              Le marché des compléments alimentaires est saturé de produits sous-dosés, synthétiques ou remplis d'additifs inutiles. Chez NUTRELIS, nous avons choisi une autre voie.
            </p>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
              Chaque produit que nous formulons répond à un seul critère : est-ce que ça marche vraiment ? Nous partons des études cliniques, sélectionnons la forme la plus biodisponible, et dosons à la hauteur des recherches scientifiques.
            </p>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8 }}>
              Notre premier produit, l'Astaxanthine 12mg, est l'illustration parfaite de cette philosophie. 12mg par gélule — la dose validée par la science — issue de micro-algues cultivées naturellement à Hawaï.
            </p>
          </div>
          <div style={{ background: "#f0faf2", borderRadius: 24, padding: "48px", border: "1px solid #c8e6d0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                { num: "12 000+", label: "Clients satisfaits", desc: "Au Cameroun et en Afrique francophone" },
                { num: "4.8/5", label: "Note moyenne", desc: "Sur plus de 650 avis vérifiés" },
                { num: "90 jours", label: "Garantie satisfait ou remboursé", desc: "Sans questions, sans complications" },
                { num: "100%", label: "Ingrédients naturels", desc: "Certifiés et testés par laboratoire indépendant" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: 32, borderBottom: i < 3 ? "1px solid #c8e6d0" : "none" }}>
                  <div style={{ color: "var(--accent)", fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", flexShrink: 0, minWidth: 80 }}>{s.num}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section style={{ padding: "96px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>CE QUI NOUS GUIDE</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>Nos valeurs fondamentales</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { icon: "🔬", titre: "Science avant tout", desc: "Chaque formule est basée sur des études cliniques publiées. Pas de marketing sans preuves. Nos dosages correspondent aux recherches, pas aux marges bénéficiaires." },
              { icon: "🌿", titre: "Naturalité sans compromis", desc: "Nous sélectionnons uniquement des actifs issus de sources naturelles. Notre Astaxanthine provient de micro-algues Haematococcus pluvialis cultivées à Hawaï — jamais de synthèse chimique." },
              { icon: "🔍", titre: "Transparence totale", desc: "Chaque lot est analysé par un laboratoire tiers indépendant. Nos étiquettes reflètent exactement ce que contient chaque gélule. Aucun ingrédient caché, aucun liant inutile." },
              { icon: "🎯", titre: "Résultats mesurables", desc: "94% de nos clients constatent des résultats visibles après 8 semaines. Nous ne promettons pas des miracles — nous livrons des transformations progressives et durables." },
              { icon: "🤝", titre: "Service client premium", desc: "Une équipe disponible pour répondre à vos questions, vous guider dans votre choix et vous accompagner dans votre parcours de bien-être. Vos résultats sont notre priorité." },
              { icon: "♻️", titre: "Engagement durable", desc: "Nos emballages sont conçus pour minimiser l'impact environnemental. Nous travaillons avec des fournisseurs qui partagent nos valeurs de durabilité et de responsabilité." },
            ].map((v, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #c8e6d0", boxShadow: "0 2px 16px rgba(29,185,84,0.05)" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{v.titre}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONDATEUR */}
      <section style={{ padding: "96px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>LE MOT DU FONDATEUR</p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 800, marginBottom: 40 }}>Pourquoi j'ai créé NUTRELIS</h2>
          <div style={{ background: "#f0faf2", borderRadius: 24, padding: "56px", border: "1px solid #c8e6d0", position: "relative" }}>
            <div style={{ fontSize: 64, color: "var(--accent)", lineHeight: 1, marginBottom: 24, opacity: 0.3 }}>"</div>
            <p style={{ fontSize: 18, lineHeight: 1.9, color: "#333", marginBottom: 32, fontStyle: "italic" }}>
              En cherchant des solutions naturelles pour ma propre santé, j'ai découvert l'astaxanthine — et j'ai été stupéfait par les études. Mais sur le marché, impossible de trouver un produit naturel, bien dosé, à un prix accessible. Soit les dosages étaient ridicules, soit les sources étaient synthétiques, soit les prix étaient prohibitifs.
              <br /><br />
              J'ai créé NUTRELIS pour combler ce manque. Des formules premium, accessibles en Afrique, avec la transparence que chaque consommateur mérite.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20 }}>A</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Anicet Tezanou</div>
                <div style={{ color: "#666", fontSize: 13 }}>Fondateur & CEO, NUTRELIS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: "72px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#060f08", marginBottom: 16 }}>
          Rejoignez la communauté NUTRELIS
        </h2>
        <p style={{ color: "rgba(6,15,8,0.75)", fontSize: 16, marginBottom: 36 }}>Plus de 12 000 personnes ont déjà transformé leur santé</p>
        <Link href="/produits/astaxanthine-12mg" style={{ display: "inline-block", background: "#060f08", color: "#fff", padding: "18px 52px", borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          Découvrir nos produits →
        </Link>
      </section>

      {/* FOOTER */}
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