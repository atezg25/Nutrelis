"use client";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
export default function Science() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <NavbarCart />
  <Link href="/produits/astaxanthine-12mg" style={{ background: "var(--accent)", color: "#060f08", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
    Commander →
  </Link>
</div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #060f08 0%, #0a1a0d 100%)", padding: "96px 60px", textAlign: "center" }}>
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>LA SCIENCE DERRIÈRE NUTRELIS</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 900, color: "#f0fff4", lineHeight: 1.15, marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          L'antioxydant le plus puissant<br /><span style={{ color: "var(--accent)" }}>que la nature ait créé</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.8, maxWidth: 680, margin: "0 auto" }}>
          L'Astaxanthine n'est pas un supplément ordinaire. C'est l'un des composés les plus étudiés et les plus puissants de la nature — et la science le prouve.
        </p>
      </section>

      {/* QU'EST-CE QUE L'ASTAXANTHINE */}
      <section style={{ padding: "96px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>LES BASES</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 20 }}>C'est quoi exactement l'Astaxanthine ?</h2>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, maxWidth: 720, margin: "0 auto" }}>
              L'Astaxanthine est un <strong>antioxydant naturel de la famille des caroténoïdes</strong>, extrait d'une micro-algue appelée <em>Haematococcus pluvialis</em>. C'est elle qui donne naturellement leur couleur rouge aux saumons sauvages, aux crevettes et aux flamants roses.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { power: "6 000×", vs: "vs Vitamine C", color: "#e74c3c" },
              { power: "1 800×", vs: "vs CoQ10", color: "#e67e22" },
              { power: "800×", vs: "vs Acide α-lipoïque", color: "#8e44ad" },
              { power: "550×", vs: "vs Thé vert", color: "#27ae60" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#f8f9fa", borderRadius: 16, padding: "28px 20px", textAlign: "center", border: "1px solid #eee" }}>
                <div style={{ color: s.color, fontSize: "2.4rem", fontWeight: 900, fontFamily: "var(--font-sora), sans-serif", lineHeight: 1 }}>{s.power}</div>
                <div style={{ color: "#555", fontSize: 13, marginTop: 8, fontWeight: 600 }}>plus puissante</div>
                <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>{s.vs}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉCANISME D'ACTION */}
      <section style={{ padding: "96px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>COMMENT ÇA MARCHE</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>Un mécanisme unique</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { icon: "🧬", titre: "Elle s'intègre aux membranes cellulaires", desc: "Contrairement à la plupart des antioxydants, l'astaxanthine peut traverser les membranes cellulaires et agir à la fois à l'intérieur et à l'extérieur de la cellule. Elle protège la bicouche lipidique — le bouclier fondamental de chaque cellule." },
              { icon: "🧠", titre: "Elle traverse la barrière hémato-encéphalique", desc: "L'astaxanthine est l'un des rares antioxydants capables de traverser la barrière hémato-encéphalique, offrant une protection directe au cerveau et aux yeux contre le stress oxydatif." },
              { icon: "⚡", titre: "Elle neutralise les radicaux libres", desc: "Elle capture les radicaux libres de façon unique : elle s'y lie sans être détruite elle-même, offrant une protection continue sans s'épuiser comme la plupart des antioxydants classiques." },
            ].map((m, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #c8e6d0" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{m.icon}</div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 14, lineHeight: 1.3 }}>{m.titre}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.75 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BÉNÉFICES CLINIQUES */}
      <section style={{ padding: "96px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>VALIDÉ PAR LA SCIENCE</p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800 }}>Bénéfices cliniquement prouvés</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { categorie: "🌟 Peau & Beauté", points: ["Améliore l'élasticité de la peau (études humaines, 8-12 semaines)", "Réduit l'apparence des rides et ridules", "Améliore l'hydratation cutanée", "Protège contre les dommages causés par les UV", "Uniformise le teint et réduit les taches"] },
              { categorie: "⚡ Énergie & Endurance", points: ["Réduit la fatigue musculaire après l'effort", "Améliore la récupération sportive", "Augmente l'endurance cardiovasculaire", "Réduit l'inflammation post-exercice", "Améliore les performances en endurance"] },
              { categorie: "👁️ Santé oculaire", points: ["Réduit la fatigue oculaire (idéal pour les écrans)", "Protège la rétine du stress oxydatif", "Améliore l'acuité visuelle et l'adaptation à la lumière", "Réduit le risque de DMLA (dégénérescence maculaire)", "Protège contre la lumière bleue"] },
              { categorie: "🧠 Cerveau & Cognition", points: ["Protection neuronale contre le stress oxydatif", "Améliore la mémoire et les fonctions cognitives", "Réduit l'inflammation cérébrale", "Potentiel neuroprotecteur étudié", "Améliore la concentration et la clarté mentale"] },
            ].map((b, i) => (
              <div key={i} style={{ background: "#f8fffe", border: "1px solid #c8e6d0", borderRadius: 20, padding: "32px 28px" }}>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 20 }}>{b.categorie}</h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {b.points.map((p, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#444", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI 12MG */}
      <section style={{ padding: "96px 60px", background: "#f0faf2" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>LE DOSAGE FAIT TOUT</p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 24 }}>Pourquoi 12mg et pas moins ?</h2>
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, maxWidth: 700, margin: "0 auto 48px" }}>
            95% des produits d'astaxanthine sur le marché contiennent 4 à 6mg par gélule — insuffisant pour obtenir les effets documentés par la recherche. Les études cliniques qui démontrent les bénéfices sur la peau, l'énergie et la protection cellulaire utilisent des doses de <strong>8 à 12mg par jour</strong>.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 700, margin: "0 auto" }}>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 20, padding: "28px" }}>
              <div style={{ color: "#e53e3e", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>❌ AUTRES MARQUES</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#e53e3e", marginBottom: 8 }}>4–6mg</div>
              <div style={{ color: "#888", fontSize: 13 }}>Dose insuffisante pour les effets cliniques documentés</div>
            </div>
            <div style={{ background: "#e8f5eb", border: "2px solid var(--accent)", borderRadius: 20, padding: "28px" }}>
              <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>✅ NUTRELIS</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--accent)", marginBottom: 8 }}>12mg</div>
              <div style={{ color: "#444", fontSize: 13 }}>Dose validée par les études pour des résultats réels</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: "72px 60px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#060f08", marginBottom: 16 }}>
          Expérimentez la science sur votre peau
        </h2>
        <p style={{ color: "rgba(6,15,8,0.75)", fontSize: 16, marginBottom: 36 }}>12mg par gélule. Naturel. Cliniquement dosé. Garanti 90 jours.</p>
        <Link href="/produits/astaxanthine-12mg" style={{ display: "inline-block", background: "#060f08", color: "#fff", padding: "18px 52px", borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-sora), sans-serif" }}>
          Commander l'Astaxanthine 12mg →
        </Link>
      </section>

      <footer style={{ background: "#060f08", padding: "40px 60px", borderTop: "1px solid #1a3522" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>© 2026 NUTRELIS — Tous droits réservés</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "Accueil", href: "/" }, { label: "À propos", href: "/a-propos" }, { label: "Contact", href: "/contact" }].map(l => (
              <Link key={l.label} href={l.href} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}