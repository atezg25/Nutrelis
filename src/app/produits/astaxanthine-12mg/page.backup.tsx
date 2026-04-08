"use client";
import { useState, useEffect, useRef } from "react";

/* ── COUNTDOWN ── */
function Countdown() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 59 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const p = n => String(n).padStart(2, "0");
  return (
    <span style={{ fontWeight: 900, letterSpacing: 2, fontSize: 15 }}>
      {p(time.h)}:{p(time.m)}:{p(time.s)}
    </span>
  );
}

/* ── NAVBAR ── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(255,248,246,0.97)" : "#fff8f6",
      borderBottom: "1px solid var(--asta-border)",
      backdropFilter: "blur(12px)",
      transition: "all 0.3s",
      boxShadow: scrolled ? "0 2px 20px rgba(125,8,6,0.08)" : "none",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "0 40px", height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "var(--asta-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 16,
            fontFamily: "var(--font-playfair)",
          }}>N</div>
          <span style={{
            fontFamily: "var(--font-playfair)", fontWeight: 900,
            fontSize: 22, letterSpacing: 3, color: "var(--asta-text)",
          }}>NUTRELIS</span>
        </a>

        {/* Menu desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}
          className="desktop-nav">
          {["Produits", "Science", "Avis clients", "FAQ"].map(item => (
            <a key={item} href="#" style={{
              color: "var(--asta-text2)", fontSize: 14, fontWeight: 500,
              textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "var(--asta-accent)"}
              onMouseLeave={e => e.target.style.color = "var(--asta-text2)"}
            >{item}</a>
          ))}
        </div>

        {/* CTA + burger */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#commander" style={{
            background: "var(--asta-accent)", color: "#fff",
            padding: "10px 24px", borderRadius: 8,
            fontSize: 14, fontWeight: 800, textDecoration: "none",
            transition: "all 0.2s", letterSpacing: 0.3,
            boxShadow: "0 4px 14px rgba(125,8,6,0.25)",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Commander →
          </a>
          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none", background: "none", border: "none",
              cursor: "pointer", flexDirection: "column", gap: 5, padding: 4,
            }}
            className="burger-btn"
          >
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 22, height: 2, background: "var(--asta-text)",
                borderRadius: 2, transition: "all 0.3s",
              }} />
            ))}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div style={{
          background: "#fff8f6", borderTop: "1px solid var(--asta-border)",
          padding: "16px 24px 24px",
        }}>
          {["Produits", "Science", "Avis clients", "FAQ"].map(item => (
            <a key={item} href="#" style={{
              display: "block", padding: "12px 0",
              borderBottom: "1px solid var(--asta-border)",
              color: "var(--asta-text)", fontSize: 15, fontWeight: 500,
              textDecoration: "none",
            }}>{item}</a>
          ))}
          <a href="#commander" style={{
            display: "block", marginTop: 16,
            background: "var(--asta-accent)", color: "#fff",
            padding: "14px", borderRadius: 10,
            fontSize: 15, fontWeight: 800, textDecoration: "none",
            textAlign: "center",
          }}>
            Commander maintenant →
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .burger-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

/* ── IMAGE GALLERY ── */
function Gallery() {
  const images = [
    "/images/astaxanthine/img_.png",
    "/images/astaxanthine/img1A.png",
    "/images/astaxanthine/NUT2.png",
    "/images/astaxanthine/img4A.png",
    "/images/astaxanthine/img5A.png",
    "/images/astaxanthine/NUT3.png",
    "/images/astaxanthine/NUT4.png",
    "/images/astaxanthine/NUT5.png",
  ];
  const [main, setMain] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Image principale */}
      <div style={{
        background: "#fdf5f3", borderRadius: 20,
        border: "1.5px solid var(--asta-border)",
        overflow: "hidden", position: "relative",
        aspectRatio: "1/1",
      }}>
        <div style={{
          position: "absolute", top: 16, left: 16,
          background: "var(--asta-accent)", color: "#fff",
          fontSize: 13, fontWeight: 800, padding: "5px 12px",
          borderRadius: 6, letterSpacing: 0.5, zIndex: 2,
        }}>
          −20%
        </div>
        <img
          src={images[main]}
          alt="NUTRELIS Astaxanthine"
          style={{
            width: "100%", height: "100%",
            objectFit: "contain", transition: "all 0.3s",
            padding: 24,
          }}
        />
      </div>

      {/* Thumbnails */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setMain(i)}
            style={{
              aspectRatio: "1/1", borderRadius: 10, overflow: "hidden",
              border: `2px solid ${main === i ? "var(--asta-accent)" : "var(--asta-border)"}`,
              cursor: "pointer", background: "#fdf5f3",
              transition: "all 0.2s", opacity: main === i ? 1 : 0.7,
            }}
          >
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── FAQ ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{
      borderBottom: "1px solid var(--asta-border)",
      padding: "20px 0", cursor: "pointer",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 16, color: "var(--asta-text)", lineHeight: 1.4 }}>{q}</span>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          border: "1.5px solid var(--asta-accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, color: "var(--asta-accent)", fontSize: 20, fontWeight: 700,
        }}>
          {open ? "−" : "+"}
        </div>
      </div>
      {open && (
        <p style={{
          color: "var(--asta-text2)", fontSize: 15, lineHeight: 1.8,
          marginTop: 14, paddingRight: 46,
        }}>{a}</p>
      )}
    </div>
  );
}

/* ── PACK SELECTOR ── */
function PackSelector() {
  const [mode, setMode] = useState("unique");
  const [selected, setSelected] = useState(1);
  const packs = [
    {
      id: 1, label: "DÉCOUVERTE", capsules: "1 Boîte · 60 capsules",
      cure: "Cure de 60 jours", prix: 15000, ancien: 18750, aboPrix: 12750,
      eco: null, img: "/images/astaxanthine/P_01.png",
    },
    {
      id: 2, label: "RÉSULTATS", capsules: "2 Boîtes · 120 capsules",
      cure: "Cure de 120 jours", prix: 27000, ancien: 33750, aboPrix: 22950,
      eco: "3 000 FCFA", popular: true, img: "/images/astaxanthine/P_02.png",
    },
    {
      id: 3, label: "TRANSFORMATION", capsules: "3 Boîtes · 180 capsules",
      cure: "Cure de 180 jours", prix: 36000, ancien: 45000, aboPrix: 30600,
      eco: "9 000 FCFA", img: "/images/astaxanthine/P_03.png",
    },
  ];
  const current = packs.find(p => p.id === selected);
  const price = mode === "abonnement" ? current.aboPrix : current.prix;

  return (
    <div>
      {/* Toggle */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        background: "#f5ebe8", borderRadius: 12, padding: 5,
        marginBottom: 24, border: "1px solid var(--asta-border)",
      }}>
        {[
          { id: "unique", label: "Achat unique" },
          { id: "abonnement", label: "⭐ Abonnement −15%" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setMode(tab.id)} style={{
            padding: "12px 8px",
            background: mode === tab.id ? "var(--asta-accent)" : "transparent",
            color: mode === tab.id ? "#fff" : "var(--asta-text2)",
            border: "none", borderRadius: 8,
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            transition: "all 0.2s",
          }}>{tab.label}</button>
        ))}
      </div>

      {mode === "abonnement" && (
        <div style={{
          background: "#fdecea", border: "1px solid var(--asta-accent)",
          borderRadius: 10, padding: "14px 16px", marginBottom: 20,
          fontSize: 13, color: "var(--asta-text2)", lineHeight: 1.7,
        }}>
          📦 <strong style={{ color: "var(--asta-text)" }}>Livraison automatique mensuelle</strong> via ATEZ Express
          &nbsp;·&nbsp; 💰 <strong style={{ color: "var(--asta-text)" }}>−15% à vie</strong>
          &nbsp;·&nbsp; ✅ <strong style={{ color: "var(--asta-text)" }}>Annulable à tout moment</strong>
        </div>
      )}

      {/* Packs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {packs.map(pack => (
          <div key={pack.id} onClick={() => setSelected(pack.id)} style={{
            display: "flex", alignItems: "center", gap: 16,
            background: selected === pack.id ? "#fdecea" : "#fff",
            border: `2px solid ${selected === pack.id ? "var(--asta-accent)" : "var(--asta-border)"}`,
            borderRadius: 12, padding: "16px 20px", cursor: "pointer",
            transition: "all 0.2s", position: "relative",
          }}>
            {pack.popular && (
              <div style={{
                position: "absolute", top: -11, right: 16,
                background: "var(--asta-accent)", color: "#fff",
                fontSize: 10, fontWeight: 800, letterSpacing: 1,
                padding: "3px 10px", borderRadius: 20,
              }}>
                LE PLUS POPULAIRE
              </div>
            )}
            {/* Radio */}
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${selected === pack.id ? "var(--asta-accent)" : "#ccc"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {selected === pack.id && (
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--asta-accent)" }} />
              )}
            </div>
            {/* Image */}
            <img src={pack.img} alt={pack.label} style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }} />
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--asta-text)", marginBottom: 2 }}>
                {pack.capsules}
              </div>
              <div style={{ fontSize: 12, color: "var(--asta-text2)" }}>{pack.cure}</div>
              {pack.eco && mode === "unique" && (
                <div style={{ fontSize: 12, color: "var(--asta-gold)", fontWeight: 700, marginTop: 2 }}>
                  ✓ Économisez {pack.eco}
                </div>
              )}
            </div>
            {/* Prix */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: "var(--asta-accent)", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                {(mode === "abonnement" ? pack.aboPrix : pack.prix).toLocaleString()} <span style={{ fontSize: 12 }}>FCFA</span>
              </div>
              <div style={{ color: "#aaa", fontSize: 12, textDecoration: "line-through" }}>
                {pack.ancien.toLocaleString()} FCFA
              </div>
              {mode === "abonnement" && (
                <div style={{ fontSize: 11, color: "var(--asta-gold)", fontWeight: 700 }}>/mois</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton commander */}
      <button style={{
        width: "100%", background: "var(--asta-accent)", color: "#fff",
        border: "none", padding: "18px", borderRadius: 12,
        fontSize: 17, fontWeight: 900, cursor: "pointer",
        letterSpacing: 0.5, boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
        transition: "all 0.2s", marginBottom: 14,
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        {mode === "abonnement" ? "S'ABONNER MAINTENANT — ÉCONOMISER 15% →" : "COMMANDER MAINTENANT →"}
      </button>

      {/* Badges */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 20,
        fontSize: 12, color: "var(--asta-text2)", flexWrap: "wrap",
      }}>
        {["🔒 Paiement sécurisé", "📦 Livraison ATEZ Express", "↩️ Garanti 90 jours"].map((b, i) => (
          <span key={i}>{b}</span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
export default function Astaxanthine() {
  const clientPhotos = [
    "/images/astaxanthine/Ast2.png", "/images/astaxanthine/Ast3.png",
    "/images/astaxanthine/Ast4.png", "/images/astaxanthine/Asta1.png",
    "/images/astaxanthine/Asta2.png", "/images/astaxanthine/Asta3.png",
  ];

  return (
    <div style={{ background: "var(--asta-bg)", color: "var(--asta-text)", overflowX: "hidden" }}>

{/* ── BANDEAU PROMO ── */}
<div style={{
  background: "#7D0806", color: "#fff",
  textAlign: "center", padding: "10px 16px",
}}>
  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
    🎉 VENTE SPÉCIALE — Achetez maintenant et économisez jusqu'à 70% aujourd'hui !
  </p>
</div>

{/* ── HERO ── */}
<section style={{
  background: "#fff",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  minHeight: 540,
  overflow: "hidden",
}}>
  {/* Côté gauche — Image */}
  <div style={{
    position: "relative",
    background: "radial-gradient(ellipse at 60% 50%, #fde8e4 0%, #fff5f3 60%, #fff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 40px 40px 80px",
    overflow: "hidden",
  }}>

    {/* Cercles décoratifs */}
    <div style={{
      position: "absolute", width: 420, height: 420,
      borderRadius: "50%", border: "1px solid rgba(125,8,6,0.06)",
      top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", width: 560, height: 560,
      borderRadius: "50%", border: "1px solid rgba(125,8,6,0.03)",
      top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      pointerEvents: "none",
    }} />

    {/* Badge "90 jours" */}
    <div style={{
      position: "absolute", top: 32, right: 32, zIndex: 3,
      width: 96, height: 96, borderRadius: "50%",
      background: "linear-gradient(135deg, #c8940a, #f5c842, #c8940a)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      boxShadow: "0 6px 24px rgba(184,134,11,0.45)",
    }}>
      <span style={{ color: "#fff", fontSize: 8, fontWeight: 800, letterSpacing: 1 }}>MONEY BACK</span>
      <span style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1, margin: "2px 0" }}>90</span>
      <span style={{ color: "#fff", fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>DAYS</span>
    </div>

    {/* Badge "Naturel" */}
    <div style={{
      position: "absolute", top: 32, left: 32, zIndex: 3,
      width: 84, height: 84, borderRadius: "50%",
      background: "linear-gradient(135deg, #145f2e, #1db954)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      boxShadow: "0 6px 20px rgba(26,122,60,0.4)",
      border: "3px solid #fff",
    }}>
      <span style={{ color: "#fff", fontSize: 7, fontWeight: 800, textAlign: "center", letterSpacing: 0.5, padding: "0 10px", lineHeight: 1.5 }}>
        NATUREL<br />100% PUR
      </span>
    </div>

    {/* IMAGE PRINCIPALE — sans fond */}
    <img
      src="/images/astaxanthine/img_.png"
      alt="NUTRELIS Astaxanthine 12mg"
      style={{
        width: "100%",
        maxWidth: 500,
        height: "auto",
        objectFit: "contain",
        position: "relative",
        zIndex: 2,
        filter: "drop-shadow(0 20px 40px rgba(125,8,6,0.18)) drop-shadow(0 4px 12px rgba(0,0,0,0.06))",
        mixBlendMode: "multiply",
      }}
    />

    {/* Badge -20% */}
    <div style={{
      position: "absolute", bottom: 32, left: 32, zIndex: 3,
      background: "var(--asta-accent)", color: "#fff",
      fontWeight: 900, fontSize: 17, padding: "8px 16px",
      borderRadius: 10, boxShadow: "0 4px 16px rgba(125,8,6,0.4)",
    }}>
      −20%
    </div>

    {/* Ligne décorative bas */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 5,
      background: "linear-gradient(90deg, transparent, var(--asta-accent) 30%, var(--asta-accent) 70%, transparent)",
    }} />
  </div>

  {/* Côté droit — Texte */}
  <div style={{
    display: "flex", flexDirection: "column",
    justifyContent: "center",
    padding: "56px 80px 56px 60px",
    background: "#fff",
  }}>

    {/* Note */}
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      marginBottom: 24, background: "#f9f9f9",
      borderRadius: 30, padding: "8px 18px",
      width: "fit-content", border: "1px solid #eee",
    }}>
      <span style={{ color: "#00b67a", fontSize: 15, letterSpacing: -1 }}>★★★★★</span>
      <span style={{ color: "#333", fontSize: 13, fontWeight: 600 }}>Noté 4.8/5</span>
      <span style={{ color: "#ccc" }}>|</span>
      <span style={{ color: "#555", fontSize: 13 }}>
        Approuvé par <strong style={{ color: "#0d0d0d" }}>12 000+</strong> clients
      </span>
    </div>

    {/* Titre — police Sora, taille réduite */}
    <h1 style={{
      fontSize: "clamp(1.9rem, 2.8vw, 2.9rem)",
      fontWeight: 800,
      lineHeight: 1.15,
      marginBottom: 18,
      fontFamily: "var(--font-sora), sans-serif",
      color: "#0d0d0d",
      letterSpacing: -0.5,
    }}>
      Regardez et ressentez{" "}
      <span style={{ color: "var(--asta-accent)" }}>votre meilleur vous</span>{" "}
      avec l'antioxydant le plus puissant au monde.
    </h1>

    {/* Sous-titre */}
    <p style={{
      color: "#666", fontSize: 15,
      lineHeight: 1.75, marginBottom: 28, maxWidth: 460,
    }}>
      Notre Astaxanthine naturelle à la pleine dose clinique de{" "}
      <strong style={{ color: "#0d0d0d" }}>12mg</strong> — issue de micro-algues
      hawaïennes. Pure, puissante, en gélule quotidienne.
    </p>

    {/* Points clés */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
      {[
        "6000× plus puissant que la Vitamine C",
        "Résultats visibles dès 2 semaines",
        "Garantie satisfait ou remboursé 90 jours",
      ].map((point, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "#fdecea", border: "1.5px solid var(--asta-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "var(--asta-accent)", fontSize: 11, fontWeight: 900 }}>✓</span>
          </div>
          <span style={{ color: "#444", fontSize: 14, fontWeight: 500 }}>{point}</span>
        </div>
      ))}
    </div>

    {/* CTA */}
    <a href="#commander" style={{
      display: "inline-flex", alignItems: "center",
      justifyContent: "center",
      background: "var(--asta-accent)", color: "#fff",
      padding: "19px 52px", borderRadius: 10,
      fontSize: 16, fontWeight: 800, textDecoration: "none",
      boxShadow: "0 8px 28px rgba(125,8,6,0.35)",
      letterSpacing: 0.5, width: "fit-content",
      fontFamily: "var(--font-sora), sans-serif",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 14px 40px rgba(125,8,6,0.45)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(125,8,6,0.35)";
      }}
    >
      COMMANDER MAINTENANT — 70% OFF
    </a>

    {/* Micro-garanties */}
    <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 12, color: "#999", flexWrap: "wrap" }}>
      <span>🔒 Paiement sécurisé</span>
      <span>📦 Livraison ATEZ Express</span>
      <span>↩️ 90 jours remboursé</span>
    </div>
  </div>
</section>
  {/* Côté gauche — Image */}
  <div style={{
    position: "relative",
    background: "radial-gradient(ellipse at 60% 50%, #fde8e4 0%, #fff5f3 60%, #fff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 48px 48px 80px",
    overflow: "hidden",
  }}>

    {/* Cercles décoratifs en arrière-plan */}
    <div style={{
      position: "absolute", width: 400, height: 400,
      borderRadius: "50%", border: "1px solid rgba(125,8,6,0.07)",
      top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", width: 520, height: 520,
      borderRadius: "50%", border: "1px solid rgba(125,8,6,0.04)",
      top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      pointerEvents: "none",
    }} />

    {/* Badge "90 jours" — haut droite */}
    <div style={{
      position: "absolute", top: 36, right: 36, zIndex: 3,
      width: 96, height: 96, borderRadius: "50%",
      background: "linear-gradient(135deg, #c8940a, #f5c842, #c8940a)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      boxShadow: "0 6px 24px rgba(184,134,11,0.45), inset 0 1px 0 rgba(255,255,255,0.3)",
    }}>
      <span style={{ color: "#fff", fontSize: 8, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>MONEY BACK</span>
      <span style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1, margin: "2px 0" }}>90</span>
      <span style={{ color: "#fff", fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>DAYS</span>
      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 7, letterSpacing: 0.5 }}>GUARANTEE</span>
    </div>

    {/* Badge "Naturel" — haut gauche */}
    <div style={{
      position: "absolute", top: 36, left: 36, zIndex: 3,
      width: 84, height: 84, borderRadius: "50%",
      background: "linear-gradient(135deg, #145f2e, #1db954, #145f2e)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      boxShadow: "0 6px 20px rgba(26,122,60,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
      border: "3px solid #fff",
    }}>
      <span style={{ color: "#fff", fontSize: 7, fontWeight: 800, textAlign: "center", letterSpacing: 0.5, padding: "0 10px", lineHeight: 1.4 }}>
        NATUREL<br />100% PUR
      </span>
    </div>

    {/* Points décoratifs */}
    {[
      { top: "15%", left: "15%", size: 6 },
      { top: "75%", left: "10%", size: 4 },
      { top: "85%", right: "12%", size: 8 },
      { top: "20%", right: "18%", size: 5 },
    ].map((dot, i) => (
      <div key={i} style={{
        position: "absolute",
        top: dot.top, left: dot.left, right: dot.right,
        width: dot.size, height: dot.size,
        borderRadius: "50%",
        background: "rgba(125,8,6,0.15)",
        pointerEvents: "none",
      }} />
    ))}

    {/* IMAGE PRINCIPALE */}
    <img
      src="/images/astaxanthine/img_.png"
      alt="NUTRELIS Astaxanthine 12mg"
      style={{
        width: "90%",
        maxWidth: 460,
        height: "auto",
        objectFit: "contain",
        position: "relative",
        zIndex: 2,
        filter: "drop-shadow(0 24px 48px rgba(125,8,6,0.2)) drop-shadow(0 8px 16px rgba(0,0,0,0.08))",
        transform: "scale(1.05)",
      }}
    />

    {/* Badge "-20%" bas gauche */}
    <div style={{
      position: "absolute", bottom: 36, left: 36, zIndex: 3,
      background: "var(--asta-accent)", color: "#fff",
      fontWeight: 900, fontSize: 18, padding: "8px 16px",
      borderRadius: 10, boxShadow: "0 4px 16px rgba(125,8,6,0.4)",
      lineHeight: 1,
    }}>
      −20%
    </div>

    {/* Ligne décorative bas */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 5,
      background: "linear-gradient(90deg, transparent, var(--asta-accent), transparent)",
    }} />
  </div>

  {/* Côté droit — Texte */}
  <div style={{
    display: "flex", flexDirection: "column",
    justifyContent: "center",
    padding: "60px 80px 60px 64px",
    background: "#fff",
  }}>

    {/* Note Trustpilot */}
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      marginBottom: 28,
      background: "#f9f9f9", borderRadius: 30,
      padding: "8px 18px", width: "fit-content",
      border: "1px solid #eee",
    }}>
      <div style={{ display: "flex", gap: 2 }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: "#00b67a", fontSize: 16 }}>★</span>
        ))}
      </div>
      <span style={{ color: "#333", fontSize: 13, fontWeight: 600 }}>
        Noté 4.8/5
      </span>
      <span style={{ color: "#999", fontSize: 13 }}>|</span>
      <span style={{ color: "#555", fontSize: 13 }}>
        Approuvé par <strong style={{ color: "#0d0d0d" }}>12 000+</strong> clients
      </span>
    </div>

    {/* Titre */}
    <h1 style={{
      fontSize: "clamp(2.2rem, 3.2vw, 3.4rem)",
      fontWeight: 900,
      lineHeight: 1.1,
      marginBottom: 22,
      fontFamily: "var(--font-playfair)",
      color: "#0d0d0d",
      letterSpacing: -0.5,
    }}>
      Regardez et ressentez{" "}
      <span style={{ color: "var(--asta-accent)" }}>votre meilleur vous</span>{" "}
      avec l'antioxydant le plus puissant au monde.
    </h1>

    {/* Sous-titre */}
    <p style={{
      color: "#666",
      fontSize: 16,
      lineHeight: 1.75,
      marginBottom: 32,
      maxWidth: 460,
    }}>
      Notre Astaxanthine naturelle à la pleine dose clinique de{" "}
      <strong style={{ color: "#0d0d0d" }}>12mg</strong> — issue de micro-algues
      hawaïennes. Pure, puissante, en gélule quotidienne.
    </p>

    {/* Points clés */}
    <div style={{
      display: "flex", flexDirection: "column", gap: 10,
      marginBottom: 36,
    }}>
      {[
        "6000× plus puissant que la Vitamine C",
        "Résultats visibles dès 2 semaines",
        "Garantie satisfait ou remboursé 90 jours",
      ].map((point, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "#fdecea",
            border: "1.5px solid var(--asta-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "var(--asta-accent)", fontSize: 12, fontWeight: 900 }}>✓</span>
          </div>
          <span style={{ color: "#444", fontSize: 14, fontWeight: 500 }}>{point}</span>
        </div>
      ))}
    </div>

    {/* CTA */}
    <a href="#commander" style={{
      display: "inline-flex", alignItems: "center",
      justifyContent: "center",
      background: "var(--asta-accent)", color: "#fff",
      padding: "20px 52px", borderRadius: 10,
      fontSize: 17, fontWeight: 900, textDecoration: "none",
      boxShadow: "0 8px 28px rgba(125,8,6,0.35)",
      letterSpacing: 0.5, width: "fit-content",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 14px 40px rgba(125,8,6,0.45)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(125,8,6,0.35)";
      }}
    >
      COMMANDER MAINTENANT — 70% OFF
    </a>

{/* Micro-garanties */}
    <div style={{
      display: "flex", gap: 20, marginTop: 18,
      fontSize: 12, color: "#999", flexWrap: "wrap",
    }}>
      <span>🔒 Paiement sécurisé</span>
      <span>📦 Livraison ATEZ Express</span>
      <span>↩️ 90 jours remboursé</span>
    </div>
  </div>
</section>

{/* ── BADGES CONFIANCE ── */}
<div style={{ background: "var(--asta-accent)" }}>
  <div style={{
    maxWidth: 1280, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
  }}>
    {[
      { label: "FORMULE CLINIQUEMENT PROUVÉE", svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
      { label: "CERTIFIÉ TIERS INDÉPENDANT",   svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      { label: "INGRÉDIENTS 100% NATURELS & PURS", svg: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
    ].map((b, i) => (
      <div key={i} style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: 14,
        padding: "22px 28px",
        borderRight: i < 2 ? "1px solid rgba(255,255,255,0.2)" : "none",
        cursor: "pointer", transition: "background 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          border: "1.5px solid rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, background: "rgba(255,255,255,0.08)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={b.svg} />
          </svg>
        </div>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 0.8 }}>
          {b.label}
        </span>
      </div>
    ))}
  </div>
</div>

      {/* ── DÉFILEMENT PHOTOS CLIENTS ── */}
      <div style={{
        padding: "44px 0", overflow: "hidden",
        borderBottom: "1px solid var(--asta-border)",
        background: "#fff",
      }}>
        <p style={{
          textAlign: "center", marginBottom: 20,
          color: "var(--asta-gold)", fontWeight: 700, fontSize: 13, letterSpacing: 2,
        }}>
          ★★★★★ &nbsp; Vraies Histoires, Vrais Résultats
        </p>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            display: "flex", gap: 16,
            animation: "scrollLeft 25s linear infinite",
            width: "max-content",
          }}>
            {[...clientPhotos, ...clientPhotos, ...clientPhotos].map((photo, i) => (
              <div key={i} style={{
                width: 80, height: 80, borderRadius: "50%",
                overflow: "hidden", border: "3px solid #fff",
                boxShadow: "0 2px 12px rgba(125,8,6,0.15)",
                flexShrink: 0,
              }}>
                <img src={photo} alt="client" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scrollLeft {
            from { transform: translateX(0); }
            to { transform: translateX(-33.33%); }
          }
        `}</style>
      </div>

      {/* ── AVIS CLIENTS ── */}
      <section style={{ padding: "96px 60px", background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              ILS ONT ESSAYÉ, ILS ONT ADOPTÉ
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, fontFamily: "var(--font-playfair)" }}>
              Ils ont ressenti la différence.{" "}
              <span style={{ color: "var(--asta-accent)" }}>Vous aussi.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              {
                name: "Marie Ange", semaines: "3 semaines", stars: 5,
                titre: "Ma peau n'a jamais été aussi lumineuse",
                text: "Depuis que j'ai commencé l'astaxanthine NUTRELIS, mon teint est éclatant et uniforme. Les imperfections ont disparu. Je reçois des compliments chaque jour.",
                img: "/images/astaxanthine/Ast2.png",
              },
              {
                name: "Christine", semaines: "6 semaines", stars: 5,
                titre: "Un vrai boost d'énergie au quotidien",
                text: "Je me sens plus énergique et concentrée. Ma fatigue a disparu. Ma peau est plus nette, mes cheveux tombent moins. NUTRELIS est devenu indispensable.",
                img: "/images/astaxanthine/Ast3.png",
              },
              {
                name: "Audrey", semaines: "8 semaines", stars: 5,
                titre: "Une peau plus ferme et visiblement rajeunie",
                text: "Après quelques semaines, ma peau est plus ferme et mes ridules moins visibles. Mon visage paraît plus jeune. Des résultats naturels et durables.",
                img: "/images/astaxanthine/Ast4.png",
              },
            ].map((avis, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid var(--asta-border)",
                borderRadius: 20, padding: 32,
                boxShadow: "0 2px 20px rgba(125,8,6,0.06)",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(125,8,6,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 20px rgba(125,8,6,0.06)";
                }}
              >
                <div style={{ color: "#f5a623", fontSize: 18, marginBottom: 12 }}>{"★".repeat(avis.stars)}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, color: "var(--asta-text)" }}>
                  {avis.titre}
                </h3>
                <p style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>
                  "{avis.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      overflow: "hidden", border: "2.5px solid var(--asta-accent)",
                    }}>
                      <img src={avis.img} alt={avis.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--asta-text)" }}>{avis.name}</div>
                      <div style={{ color: "var(--asta-text2)", fontSize: 12 }}>✅ Client vérifié</div>
                    </div>
                  </div>
                  <div style={{
                    background: "#fdecea", color: "var(--asta-text2)",
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                  }}>
                    {avis.semaines}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI NUTRELIS ── */}
      <section style={{ background: "var(--asta-accent)", padding: "72px 60px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              POURQUOI NOUS FAIRE CONFIANCE
            </p>
            <h2 style={{
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900,
              fontFamily: "var(--font-playfair)", color: "#fff",
            }}>
              Pourquoi choisir NUTRELIS comme partenaire santé ?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { icon: "🔬", label: "Dosage clinique 12mg", desc: "Dose validée par les études scientifiques" },
              { icon: "🌺", label: "Source hawaïenne", desc: "Micro-algues cultivées sous le soleil d'Hawaï" },
              { icon: "🧪", label: "Testé en laboratoire", desc: "Chaque lot analysé par des tiers indépendants" },
              { icon: "💊", label: "Biodisponibilité max", desc: "Gélule premium pour absorption optimale" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: 18, padding: "32px 24px",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{item.label}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 RAISONS ── */}
      <section style={{ padding: "96px 60px", background: "var(--asta-bg2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              5 RAISONS POUR LESQUELLES
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, fontFamily: "var(--font-playfair)" }}>
              L'Astaxanthine NUTRELIS est différente de tout ce que vous avez essayé
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { num: "01", title: "6000× plus puissante que la Vitamine C", text: "12mg validés cliniquement pour l'élasticité, l'énergie et la protection cellulaire.", img: "/images/astaxanthine/NUT2.png" },
              { num: "02", title: "Dose clinique de 12mg validée par les études", text: "95% de l'astaxanthine vendue est synthétique. La nôtre est cultivée naturellement à Hawaï.", img: "/images/astaxanthine/NUT3.png" },
              { num: "03", title: "Cultivée naturellement, jamais synthétique", text: "Puissance et biodisponibilité supérieures. Vrai produit naturel, pas d'imitation.", img: "/images/astaxanthine/NUT4.png" },
              { num: "04", title: "Pénètre le cerveau, les yeux et la peau", text: "Elle traverse les barrières naturelles et protège de l'intérieur, contrairement aux autres.", img: "/images/astaxanthine/NUT5.png" },
              { num: "05", title: "Transparence totale sur toute la chaîne", text: "Chaque lot testé par un tiers. Ingrédients clairs, sans additifs, sans mélanges cachés.", img: "/images/astaxanthine/img4A.png" },
            ].map((r, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 20,
                overflow: "hidden", border: "1px solid var(--asta-border)",
                boxShadow: "0 2px 16px rgba(125,8,6,0.05)",
                transition: "all 0.3s",
                gridColumn: i === 4 ? "2" : "auto",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(125,8,6,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 16px rgba(125,8,6,0.05)";
                }}
              >
                <div style={{ height: 180, overflow: "hidden", background: "#fdf5f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={r.img} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }} />
                </div>
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ color: "var(--asta-accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
                    RAISON {r.num}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, fontFamily: "var(--font-playfair)", lineHeight: 1.3 }}>
                    {r.title}
                  </h3>
                  <p style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.7 }}>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDÉOS ── */}
      <section style={{ padding: "96px 60px", background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              TÉMOIGNAGES VIDÉO
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, fontFamily: "var(--font-playfair)" }}>
              Vraies histoires, <span style={{ color: "var(--asta-accent)" }}>vrais résultats</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { name: "VINCENT", file: "vincent.mp4" },
              { name: "CHRISTIAN", file: "christian.mp4" },
              { name: "MIRIANNE", file: "mirianne.mp4" },
              { name: "ALEX", file: "alex.mp4" },
            ].map((v, i) => (
              <div key={i} style={{
                borderRadius: 20, overflow: "hidden",
                border: "1px solid var(--asta-border)",
                background: "#fff",
                boxShadow: "0 2px 16px rgba(125,8,6,0.06)",
              }}>
                <video controls style={{ width: "100%", display: "block", maxHeight: 300, objectFit: "cover", background: "#000" }}>
                  <source src={`/videos/${v.file}`} type="video/mp4" />
                </video>
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "var(--asta-text)" }}>{v.name}</span>
                  <span style={{
                    background: "#fdecea", color: "var(--asta-accent)",
                    fontSize: 10, fontWeight: 700, letterSpacing: 1,
                    padding: "3px 10px", borderRadius: 10,
                  }}>
                    CLIENT VÉRIFIÉ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLÈME → SOLUTION ── */}
      <section style={{ padding: "96px 60px", background: "var(--asta-bg2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              TRANSFORMATION NUTRELIS
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, fontFamily: "var(--font-playfair)" }}>
              De fatigué et vieillissant à plein d'énergie et épanoui 🌟
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 0, alignItems: "center" }}>
            <div style={{ background: "#fff", border: "1px solid var(--asta-border)", borderRadius: 20, padding: "36px 32px", boxShadow: "0 2px 16px rgba(125,8,6,0.05)" }}>
              <p style={{ color: "#999", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>❌ VOTRE PROBLÈME ACTUEL</p>
              {[
                "Se sentir plus vieux, pas en meilleure forme",
                "Énergie en berne, esprit confus",
                "Problèmes de peau persistants",
                "Des compléments sans résultats",
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderBottom: i < 3 ? "1px solid var(--asta-border)" : "none",
                }}>
                  <span style={{ color: "#e53e3e", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✗</span>
                  <span style={{ color: "var(--asta-text2)", fontSize: 15 }}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "var(--asta-accent)", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 22, fontWeight: 900,
                boxShadow: "0 4px 20px rgba(125,8,6,0.3)",
              }}>→</div>
            </div>
            <div style={{ background: "#fdecea", border: "2px solid var(--asta-accent)", borderRadius: 20, padding: "36px 32px" }}>
              <p style={{ color: "var(--asta-accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>✅ AVEC NUTRELIS</p>
              {[
                "Aiguisé, plein d'énergie et rajeuni",
                "Protégé au niveau cellulaire",
                "Peau lumineuse, ferme et hydratée",
                "Résultats visibles dès 2 semaines",
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderBottom: i < 3 ? "1px solid rgba(125,8,6,0.15)" : "none",
                }}>
                  <span style={{ color: "var(--asta-accent)", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ color: "var(--asta-text)", fontSize: 15, fontWeight: 500 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "80px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              LES CHIFFRES PARLENT D'EUX-MÊMES
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, fontFamily: "var(--font-playfair)" }}>
              NUTRELIS fonctionne. Les données le prouvent.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { value: "94%", label: "Peau plus ferme & élastique", desc: "après 8+ semaines" },
              { value: "96%", label: "Recommanderaient NUTRELIS", desc: "à un proche" },
              { value: "92%", label: "Meilleure énergie & clarté", desc: "surtout l'après-midi" },
              { value: "89%", label: "Préfèrent NUTRELIS", desc: "aux autres suppléments" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "var(--asta-bg)", border: "1px solid var(--asta-border)",
                borderRadius: 20, padding: "36px 24px", textAlign: "center",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(125,8,6,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ color: "var(--asta-accent)", fontSize: "3.2rem", fontWeight: 900, fontFamily: "var(--font-playfair)", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, margin: "12px 0 6px", color: "var(--asta-text)" }}>{s.label}</div>
                <div style={{ color: "var(--asta-text2)", fontSize: 13 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUTRELIS VS AUTRES ── */}
      <section style={{ padding: "96px 60px", background: "var(--asta-bg2)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>COMPARAISON</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, fontFamily: "var(--font-playfair)" }}>
              NUTRELIS vs. autres marques
            </h2>
          </div>
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid var(--asta-border)", boxShadow: "0 4px 24px rgba(125,8,6,0.08)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "var(--asta-bg2)", borderBottom: "2px solid var(--asta-border)" }}>
              {["Critère", "✅ NUTRELIS", "❌ Autres marques"].map((h, i) => (
                <div key={i} style={{
                  padding: "18px 24px", fontWeight: 800, fontSize: 14,
                  color: i === 1 ? "var(--asta-accent)" : "var(--asta-text)",
                  borderRight: i < 2 ? "1px solid var(--asta-border)" : "none",
                }}>{h}</div>
              ))}
            </div>
            {[
              ["Dosage", "12mg par gélule", "4–6mg (insuffisant)"],
              ["Source", "Naturelle — micro-algues Hawaï", "Synthétique ou non déclarée"],
              ["Forme", "Gélule premium, absorption max", "Comprimés, poudres, gummies"],
              ["Additifs", "Aucun — pure astaxanthine", "Sucres, arômes, liants"],
              ["Tests", "Laboratoire indépendant", "Tests internes uniquement"],
              ["Garantie", "90 jours satisfait ou remboursé", "14–30 jours (ou aucune)"],
            ].map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                borderBottom: i < 5 ? "1px solid var(--asta-border)" : "none",
                background: i % 2 === 0 ? "#fff" : "#fffaf9",
              }}>
                {row.map((cell, j) => (
                  <div key={j} style={{
                    padding: "16px 24px", fontSize: 14,
                    fontWeight: j === 0 ? 600 : 400,
                    color: j === 0 ? "var(--asta-text)" : j === 1 ? "var(--asta-text)" : "var(--asta-text2)",
                    borderRight: j < 2 ? "1px solid var(--asta-border)" : "none",
                  }}>
                    {j === 1 && <span style={{ color: "green" }}>✅ </span>}
                    {j === 2 && <span style={{ color: "#e53e3e" }}>✗ </span>}
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMANDER ── */}
      <section id="commander" style={{ padding: "96px 60px", background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              COMMANDEZ MAINTENANT
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, fontFamily: "var(--font-playfair)", marginBottom: 12 }}>
              Choisissez votre formule
            </h2>
            <p style={{ color: "var(--asta-text2)", fontSize: 16 }}>
              Achat unique ou abonnement mensuel avec livraison automatique ATEZ Express
            </p>
          </div>
          <div style={{ background: "#fff", borderRadius: 24, padding: "48px", border: "1px solid var(--asta-border)", boxShadow: "0 4px 32px rgba(125,8,6,0.08)" }}>
            <PackSelector />
          </div>
        </div>
      </section>

      {/* ── GARANTIE ── */}
      <section style={{ padding: "80px 60px", background: "var(--asta-bg2)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "#fff", border: "2px solid var(--asta-accent)",
            borderRadius: 28, padding: "64px 56px",
            boxShadow: "0 8px 48px rgba(125,8,6,0.1)",
          }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🛡️</div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-playfair)", marginBottom: 16 }}>
              Garantie 90 jours{" "}
              <span style={{ color: "var(--asta-accent)" }}>— Satisfait ou remboursé</span>
            </h2>
            <p style={{ color: "var(--asta-text2)", fontSize: 16, lineHeight: 1.8, maxWidth: 560, margin: "0 auto 32px" }}>
              Vous ne constatez pas d'améliorations visibles dans les 90 jours ?
              Contactez-nous pour un remboursement intégral — sans questions, sans complications.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
              {["✅ Aucune question posée", "✅ Remboursement intégral", "✅ Simple et rapide"].map((b, i) => (
                <span key={i} style={{
                  background: "#fdecea", color: "var(--asta-text2)",
                  padding: "8px 18px", borderRadius: 24, fontSize: 14, fontWeight: 600,
                }}>{b}</span>
              ))}
            </div>
            <a href="#commander" style={{
              display: "inline-block",
              background: "var(--asta-accent)", color: "#fff",
              padding: "18px 52px", borderRadius: 12,
              fontSize: 16, fontWeight: 900, textDecoration: "none",
              boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
            }}>
              ESSAYER SANS RISQUE →
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "96px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              FOIRE AUX QUESTIONS
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, fontFamily: "var(--font-playfair)" }}>
              Vos questions, nos réponses
            </h2>
          </div>
          {[
            { q: "C'est quoi exactement l'astaxanthine ?", a: "L'Astaxanthine est un antioxydant naturel extrait de la micro-algue Haematococcus pluvialis. 6000× plus puissant que la Vitamine C, 1800× plus que le CoQ10. Elle protège vos cellules de l'intérieur et traverse les barrières cérébrales et oculaires." },
            { q: "Combien de temps avant de voir les premiers résultats ?", a: "La majorité de nos clients remarquent des premiers effets après 10 à 15 jours : peau plus lumineuse, moins de fatigue, énergie plus stable. Les résultats complets apparaissent après 4 à 8 semaines d'utilisation quotidienne." },
            { q: "Comment fonctionne l'abonnement mensuel ?", a: "Vous recevez automatiquement votre commande chaque mois via ATEZ Express. Vous bénéficiez de -15% sur chaque livraison. Aucun engagement — annulable à tout moment depuis votre espace client." },
            { q: "Est-ce vraiment sans danger ?", a: "100% safe. L'astaxanthine est l'un des compléments les plus étudiés au monde. Aucun effet secondaire connu même à long terme. Des millions de personnes en prennent quotidiennement au Japon depuis des décennies." },
            { q: "Comment dois-je la prendre ?", a: "1 gélule par jour pendant un repas, idéalement au même moment chaque jour pour une absorption optimale." },
            { q: "Quelle est votre politique de livraison ?", a: "Livraison standard gratuite via ATEZ Express en 4 à 7 jours ouvrés. Express en 1 à 2 jours disponible. Commandes expédiées sous 24h." },
          ].map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a0505", padding: "64px 60px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "var(--asta-accent)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 900, fontSize: 16,
                }}>N</div>
                <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: 22, letterSpacing: 3, color: "#fff" }}>NUTRELIS</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, marginBottom: 24, maxWidth: 280 }}>
                Des compléments alimentaires d'excellence, formulés à partir des actifs naturels les plus puissants pour votre santé.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {["🔒 Paiement sécurisé", "📦 ATEZ Express"].map((b, i) => (
                  <span key={i} style={{
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,0.6)",
                  }}>{b}</span>
                ))}
              </div>
            </div>
            {[
              { title: "PRODUITS", links: ["Astaxanthine 12mg", "Tous les produits", "Abonnements", "Offres spéciales"] },
              { title: "INFORMATIONS", links: ["À propos de NUTRELIS", "Science & recherche", "Blog santé", "Contact"] },
              { title: "SERVICE CLIENT", links: ["FAQ", "Livraison", "Remboursements", "Conditions générales"] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>
                  {col.title}
                </p>
                {col.links.map((link, j) => (
                  <a key={j} href="#" style={{
                    display: "block", color: "rgba(255,255,255,0.65)",
                    fontSize: 14, textDecoration: "none", marginBottom: 12,
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.65)"}
                  >{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>© 2026 NUTRELIS — Tous droits réservés</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Livraison assurée par ATEZ Express 📦</p>
          </div>
        </div>
      </footer>

    </div>
  );
}