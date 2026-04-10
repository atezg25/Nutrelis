"use client";
import { useCart } from "@/context/CartContext";
import NavbarCart from "@/components/NavbarCart";
import { useState, useEffect, useRef } from "react";

function Countdown() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 59 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n) => String(n).padStart(2, "0");
  return (
    <span style={{ fontWeight: 900, letterSpacing: 2 }}>
      {p(time.h)}:{p(time.m)}:{p(time.s)}
    </span>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(255,248,246,0.97)",
      borderBottom: "1px solid var(--asta-border)",
      backdropFilter: "blur(12px)",
      boxShadow: scrolled ? "0 2px 20px rgba(125,8,6,0.08)" : "none",
      transition: "all 0.3s",
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 40px",
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--asta-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: 16,
            fontFamily: "var(--font-sora), sans-serif",
          }}>
            N
          </div>
          <span style={{
            fontFamily: "var(--font-sora), sans-serif",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: 3,
            color: "var(--asta-text)",
          }}>
            NUTRELIS
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Produits", "Science", "Avis clients", "FAQ"].map((item) => (
            <a key={item} href="#" style={{
              color: "var(--asta-text2)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}>
              {item}
            </a>
          ))}
        </div>
       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NavbarCart />
          <a href="#commander" style={{
            background: "var(--asta-accent)",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(125,8,6,0.25)",
            fontFamily: "var(--font-sora), sans-serif",
          }}>
            Commander →
          </a>
        </div>
      </div>
    </nav>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        borderBottom: "1px solid var(--asta-border)",
        padding: "20px 0",
        cursor: "pointer",
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}>
        <span style={{ fontWeight: 600, fontSize: 16, color: "var(--asta-text)" }}>
          {q}
        </span>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "1.5px solid var(--asta-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--asta-accent)",
          fontSize: 20,
          fontWeight: 700,
        }}>
          {open ? "−" : "+"}
        </div>
      </div>
      {open && (
        <p style={{
          color: "var(--asta-text2)",
          fontSize: 15,
          lineHeight: 1.8,
          marginTop: 14,
          paddingRight: 46,
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

function PackSelector({ onPackChange }: { onPackChange?: (prix: number, original: number, mode: string) => void }) {
  const [mode, setMode] = useState("unique");
  const [selected, setSelected] = useState(2);
  const [ajouté, setAjouté] = useState(false);
  const { ajouterArticle } = useCart();
useEffect(() => {
    const pack = packs.find(p => p.id === selected)!;
    if (onPackChange) onPackChange(
      mode === "abonnement" ? pack.aboPrix : pack.prix,
      mode === "abonnement" ? pack.prix : pack.ancien,
      mode
    );
  }, []);
  const packs = [
    {
      id: 1,
      label: "DÉCOUVERTE",
      capsules: "1 Boîte · 60 capsules",
      cure: "Cure de 60 jours",
      prix: 15000,
      ancien: 18750,
      aboPrix: 14250,
      eco: null,
      popular: false,
      img: "/images/astaxanthine/P_01.png",
    },
    {
      id: 2,
      label: "RÉSULTATS",
      capsules: "2 Boîtes · 120 capsules",
      cure: "Cure de 120 jours",
      prix: 27000,
      ancien: 33750,
      aboPrix: 25650,
      eco: "3 000 FCFA",
      popular: true,
      img: "/images/astaxanthine/P_02.png",
    },
    {
      id: 3,
      label: "TRANSFORMATION",
      capsules: "3 Boîtes · 180 capsules",
      cure: "Cure de 180 jours",
      prix: 36000,
      ancien: 45000,
      aboPrix: 34200,
      eco: "9 000 FCFA",
      popular: false,
      img: "/images/astaxanthine/P_03.png",
    },
  ];

useEffect(() => {
    const pack = packs.find(p => p.id === selected)!;
    if (onPackChange) onPackChange(
      mode === "abonnement" ? pack.aboPrix : pack.prix,
      mode === "abonnement" ? pack.prix : pack.ancien,
      mode
    );
  }, [selected, mode]);

  const current = packs.find((p) => p.id === selected)!;

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#f5ebe8",
        borderRadius: 12,
        padding: 5,
        marginBottom: 24,
        border: "1px solid var(--asta-border)",
      }}>
        {[
          { id: "unique", label: "Achat unique" },
          { id: "abonnement", label: "⭐ Abonnement −15%" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
  setMode(tab.id);
  const pack = packs.find(p => p.id === selected)!;
  if (onPackChange) onPackChange(
    tab.id === "abonnement" ? pack.aboPrix : pack.prix,
    tab.id === "abonnement" ? pack.prix : pack.ancien,
    tab.id
  );
}}
            style={{
              padding: "12px 8px",
              background: mode === tab.id ? "var(--asta-accent)" : "transparent",
              color: mode === tab.id ? "#fff" : "var(--asta-text2)",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-sora), sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "abonnement" && (
        <div style={{
          background: "#fdecea",
          border: "1px solid var(--asta-accent)",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 20,
          fontSize: 13,
          color: "var(--asta-text2)",
          lineHeight: 1.7,
        }}>
          📦{" "}
          <strong style={{ color: "var(--asta-text)" }}>
            Livraison automatique mensuelle
          </strong>{" "}
          via ATEZ Express &nbsp;·&nbsp; 💰{" "}
          <strong style={{ color: "var(--asta-text)" }}>−15% à vie</strong>
          &nbsp;·&nbsp; ✅{" "}
          <strong style={{ color: "var(--asta-text)" }}>
            Annulable à tout moment
          </strong>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {packs.map((pack) => (
          <div
            key={pack.id}
            onClick={() => {
  setSelected(pack.id);
  if (onPackChange) onPackChange(
    mode === "abonnement" ? pack.aboPrix : pack.prix,
    mode === "abonnement" ? pack.prix : pack.ancien,
    mode
  );
}}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: selected === pack.id ? "#fdecea" : "#fff",
              border: `2px solid ${selected === pack.id ? "var(--asta-accent)" : "var(--asta-border)"}`,
              borderRadius: 12,
              padding: "16px 20px",
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            {pack.popular && (
              <div style={{
                position: "absolute",
                top: -11,
                right: 16,
                background: "var(--asta-accent)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                padding: "3px 10px",
                borderRadius: 20,
              }}>
                LE PLUS POPULAIRE
              </div>
            )}
            <div style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              flexShrink: 0,
              border: `2px solid ${selected === pack.id ? "var(--asta-accent)" : "#ccc"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {selected === pack.id && (
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--asta-accent)",
                }} />
              )}
            </div>
            <img
              src={pack.img}
              alt={pack.label}
              style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--asta-text)", marginBottom: 2 }}>
                {pack.capsules}
              </div>
              <div style={{ fontSize: 12, color: "var(--asta-text2)" }}>
                {pack.cure}
              </div>
              {pack.eco && mode === "unique" && (
                <div style={{ fontSize: 12, color: "var(--asta-gold)", fontWeight: 700, marginTop: 2 }}>
                 {pack.eco && mode === "unique" && (
                <span style={{
                  display: "inline-block",
                  background: "var(--asta-accent)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  marginTop: 6,
                }}>
                  Économisez {pack.eco}
                </span>
              )}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: "var(--asta-accent)", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                {(mode === "abonnement" ? pack.aboPrix : pack.prix).toLocaleString()}
                <span style={{ fontSize: 12 }}> FCFA</span>
              </div>
              <div style={{ color: "#aaa", fontSize: 12, textDecoration: "line-through" }}>
                {pack.ancien.toLocaleString()} FCFA
              </div>
              {mode === "abonnement" && (
                <div style={{ fontSize: 11, color: "var(--asta-gold)", fontWeight: 700 }}>
                  /mois
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          const pack = packs.find(p => p.id === selected)!;
          ajouterArticle({
            id: `asta-pack-${pack.id}-${mode}`,
            nom: `NUTRELIS Astaxanthine 12mg`,
            description: pack.capsules,
            prix: mode === "abonnement" ? pack.aboPrix : pack.prix,
            prixOriginal: pack.ancien,
            image: pack.img,
            mode: mode as "unique" | "abonnement",
          });
          setAjouté(true);
          setTimeout(() => setAjouté(false), 2000);
        }}
        style={{
          width: "100%",
          background: ajouté ? "#1db954" : "var(--asta-accent)",
          color: "#fff",
          border: "none",
          padding: "18px",
          borderRadius: 12,
          fontSize: 17,
          fontWeight: 900,
          cursor: "pointer",
          letterSpacing: 0.5,
          marginBottom: 10,
          fontFamily: "var(--font-sora), sans-serif",
          boxShadow: ajouté ? "0 6px 24px rgba(29,185,84,0.4)" : "0 6px 24px rgba(125,8,6,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.3s",
        }}>
        {ajouté ? "✅ AJOUTÉ AU PANIER !" : `⚡ ${mode === "abonnement" ? "S'ABONNER — ÉCONOMISER 15%" : "ACHETER MAINTENANT"}`}
      </button>

      <button
        onClick={() => {
          const pack = packs.find(p => p.id === selected)!;
          ajouterArticle({
            id: `asta-pack-${pack.id}-${mode}`,
            nom: `NUTRELIS Astaxanthine 12mg`,
            description: pack.capsules,
            prix: mode === "abonnement" ? pack.aboPrix : pack.prix,
            prixOriginal: pack.ancien,
            image: pack.img,
            mode: mode as "unique" | "abonnement",
          });
          window.location.href = "/panier";
        }}
        style={{
          width: "100%", background: "transparent", color: "var(--asta-accent)",
          border: "2px solid var(--asta-accent)", padding: "16px", borderRadius: 12,
          fontSize: 15, fontWeight: 800, cursor: "pointer",
          letterSpacing: 0.5, marginBottom: 14,
          fontFamily: "var(--font-sora), sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
        🛒 AJOUTER AU PANIER
      </button>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 20,
        fontSize: 12,
        color: "var(--asta-text2)",
        flexWrap: "wrap",
      }}>
        <span>🔒 Paiement sécurisé</span>
        <span>📦 Livraison ATEZ Express</span>
        <span>↩️ Garanti 90 jours</span>
      </div>
    </div>
  );
}

function RaisonsSection() {
  const [active, setActive] = useState<number | null>(null);
  const raisons = [
    {
      num: "01",
      title: "6000× plus puissante que la Vitamine C",
      text: "12mg validés cliniquement pour l'élasticité, l'énergie et la protection cellulaire. Là où d'autres réduisent les doses, nous choisissons l'excellence. Sans compromis.",
      img: "/images/astaxanthine/Sld2.png",
    },
    {
      num: "02",
      title: "Dose clinique de 12mg validée par les études",
      text: "95% de l'astaxanthine vendue en ligne est synthétique. La nôtre est cultivée naturellement à Hawaï sous le soleil, ce qui la rend plus puissante et mieux absorbée.",
      img: "/images/astaxanthine/Sld3.webp",
    },
    {
      num: "03",
      title: "Cultivée naturellement, jamais synthétique",
      text: "Puissance et biodisponibilité supérieures. Vrai produit naturel, pas d'imitation. Votre corps mérite ce qu'il y a de mieux.",
      img: "/images/astaxanthine/Sld4.webp",
    },
    {
      num: "04",
      title: "Pénètre le cerveau, les yeux et la peau",
      text: "Elle traverse les barrières naturelles et protège de l'intérieur, contrairement aux autres antioxydants. Protection cellulaire complète.",
      img: "/images/astaxanthine/Sld5.webp",
    },
    {
      num: "05",
      title: "Transparence totale sur toute la chaîne",
      text: "Chaque lot testé par un laboratoire tiers indépendant. Ingrédients clairs, sans additifs, sans mélanges cachés — astaxanthine pure d'Hawaï, au dosage clinique.",
      img: "/images/astaxanthine/img_sla.png",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
      {raisons.map((r, i) => (
        <div
          key={i}
          onClick={() => setActive(active === i ? null : i)}
          style={{
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            border: `2px solid ${active === i ? "var(--asta-accent)" : "var(--asta-border)"}`,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: active === i ? "0 8px 32px rgba(125,8,6,0.18)" : "0 2px 8px rgba(0,0,0,0.05)",
            position: "relative",
          }}
        >
          <div style={{ opacity: active === i ? 0 : 1, transition: "opacity 0.2s" }}>
            <div style={{ height: 180, overflow: "hidden", background: "#fdf5f3" }}>
              <img src={r.img} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "16px 16px 20px" }}>
              <div style={{
                display: "inline-block",
                background: "var(--asta-bg2)", color: "var(--asta-accent)",
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                padding: "3px 10px", borderRadius: 20, marginBottom: 10,
                border: "1px solid var(--asta-border)",
              }}>
                RAISON {r.num}
              </div>
              <h3 style={{
                fontSize: 13, fontWeight: 700,
                fontFamily: "var(--font-sora), sans-serif",
                lineHeight: 1.4, color: "var(--asta-text)", textAlign: "center",
              }}>
                {r.title}
              </h3>
              <div style={{ textAlign: "center", marginTop: 8, color: "var(--asta-text2)", fontSize: 16 }}>▼</div>
            </div>
          </div>

          {active === i && (
            <div style={{
              position: "absolute", inset: 0,
              background: "#fff", borderRadius: 14,
              padding: "20px 16px",
              display: "flex", flexDirection: "column",
              justifyContent: "space-between",
              zIndex: 10,
            }}>
              <div>
                <div style={{
                  display: "inline-block",
                  background: "var(--asta-accent)", color: "#fff",
                  fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  padding: "3px 10px", borderRadius: 20, marginBottom: 10,
                }}>
                  RAISON {r.num}
                </div>
                <h3 style={{
                  fontSize: 13, fontWeight: 800,
                  fontFamily: "var(--font-sora), sans-serif",
                  lineHeight: 1.4, color: "var(--asta-text)", marginBottom: 12,
                }}>
                  {r.title}
                </h3>
                <p style={{ color: "var(--asta-text2)", fontSize: 12, lineHeight: 1.7 }}>
                  {r.text}
                </p>
              </div>
              <div>
                
            <a href="#commander"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "block", textAlign: "center",
                    background: "var(--asta-accent)", color: "#fff",
                    padding: "10px", borderRadius: 8,
                    fontSize: 12, fontWeight: 800, textDecoration: "none",
                    marginBottom: 10,
                    fontFamily: "var(--font-sora), sans-serif",
                  }}
                >
                  COMMANDER →
                </a>
                <div style={{ textAlign: "center", color: "var(--asta-text2)", fontSize: 16, transform: "rotate(180deg)" }}>▼</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
function ProductFaqItem({ icon, q, a }: { icon: string; q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        borderBottom: "1px solid var(--asta-border)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 0",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: open
            ? "var(--asta-accent)"
            : "linear-gradient(135deg, #fdecea, #f5e0dd)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
          transition: "all 0.3s",
          boxShadow: open ? "0 4px 12px rgba(125,8,6,0.25)" : "none",
        }}>
          {icon}
        </div>
        <span style={{
          flex: 1,
          fontWeight: 600, fontSize: 14,
          color: open ? "var(--asta-accent)" : "var(--asta-text)",
          fontFamily: "var(--font-sora), sans-serif",
          transition: "color 0.2s",
        }}>
          {q}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: open ? "var(--asta-accent)" : "var(--asta-bg2)",
          border: `1.5px solid ${open ? "var(--asta-accent)" : "var(--asta-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#fff" : "var(--asta-text2)",
          fontSize: 16, fontWeight: 700, flexShrink: 0,
          transition: "all 0.3s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>
          +
        </div>
      </div>
      {open && (
        <div style={{
          marginLeft: 56,
          marginBottom: 16,
          padding: "16px 20px",
          background: "linear-gradient(135deg, #fff8f6, #fdecea)",
          borderRadius: 12,
          border: "1px solid var(--asta-border)",
          borderLeft: "3px solid var(--asta-accent)",
        }}>
          <p style={{
            color: "var(--asta-text2)", fontSize: 13,
            lineHeight: 1.8, margin: 0,
          }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}
function ProductGallery() {
  const [main, setMain] = useState(0);
  const images = [
    "/images/astaxanthine/img_transparent.png",
    "/images/astaxanthine/img1A.png",
    "/images/astaxanthine/NUT2.png",
    "/images/astaxanthine/img4A.png",
    "/images/astaxanthine/img5A.png",
    "/images/astaxanthine/NUT3.png",
    "/images/astaxanthine/NUT4.png",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 80 }}>
      {/* Image principale */}
      <div style={{
        position: "relative",
        background: "radial-gradient(ellipse at 50% 50%, #fde8e4, #fff5f3)",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid var(--asta-border)",
        aspectRatio: "1/1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", top: 16, right: 16, zIndex: 2,
          background: "var(--asta-accent)", color: "#fff",
          fontWeight: 900, fontSize: 15, padding: "6px 12px",
          borderRadius: 8,
        }}>
          −20%
        </div>
        <div style={{
          position: "absolute", bottom: 16, left: 16, zIndex: 2,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          fontSize: 12, fontWeight: 600, padding: "6px 12px",
          borderRadius: 20,
        }}>
          100+ Vendus Aujourd&apos;hui
        </div>
        <img
          src={images[main]}
          alt="NUTRELIS Astaxanthine"
          style={{
            width: "85%", height: "85%",
            objectFit: "contain",
            transition: "all 0.3s",
            filter: "drop-shadow(0 8px 24px rgba(125,8,6,0.15))",
          }}
        />
      </div>

      {/* Thumbnails en dessous */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: 8,
      }}>
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setMain(i)}
            style={{
              aspectRatio: "1/1",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
              border: `2px solid ${main === i ? "var(--asta-accent)" : "var(--asta-border)"}`,
              background: "#fdf5f3",
              opacity: main === i ? 1 : 0.7,
              transition: "all 0.2s",
            }}
          >
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          </div>
        ))}
      </div>
      {/* FAQ accordéon produit */}
      <div style={{ marginTop: 8 }}>
       {[
          {
            icon: "💊",
            q: "C'est quoi exactement l'astaxanthine ?",
            a: (
              <div>
                <p style={{ marginBottom: 10 }}>L'Astaxanthine est un <strong>antioxydant naturel extrêmement puissant</strong>, extrait d'une micro-algue appelée <strong>Haematococcus pluvialis</strong>. C'est elle qui donne leur couleur rouge aux saumons sauvages et aux flamants roses.</p>
                <p style={{ marginBottom: 8, fontWeight: 700, color: "var(--asta-accent)" }}>Elle est :</p>
                <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 10 }}>
                  {["6000× plus puissante que la Vitamine C", "1800× plus puissante que le CoQ10", "800× plus puissante que l'acide alpha-lipoïque", "550× plus puissante que le thé vert"].map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "var(--asta-accent)", fontWeight: 700 }}>➡️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>Elle est étudiée pour : peau, yeux, énergie, récupération et vieillissement cellulaire.</p>
              </div>
            ),
          },
          {
            icon: "📅",
            q: "Combien de temps avant de voir les premiers résultats ?",
            a: (
              <div>
                <p style={{ marginBottom: 12 }}>La majorité remarque des effets après <strong>10 à 15 jours</strong> : peau plus lumineuse, moins de fatigue visuelle, énergie plus stable.</p>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>Après 3 semaines :</p>
                  {["Teint plus lumineux", "Peau mieux hydratée", "Premières rides atténuées", "Ce fameux \"glow\" naturel"].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#1db954" }}>✅</span><span>{item}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>Après 8-12 semaines :</p>
                  {["Transformation complète", "Peau visiblement plus jeune", "Élasticité restaurée", "Teint unifié et éclatant"].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "#1db954" }}>✅</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            icon: "🛡️",
            q: "Est-ce que c'est vraiment sans danger ?",
            a: (
              <div>
                <p>100% safe. L'astaxanthine est l'un des compléments les plus étudiés et les plus sûrs au monde. <strong>Aucun effet secondaire connu</strong>, même à long terme. Des millions de personnes en prennent quotidiennement au Japon depuis des décennies.</p>
              </div>
            ),
          },
          {
            icon: "✨",
            q: "Quel sont les bénéfices clés de l'Astaxanthine ?",
            a: (
              <div>
                {[
                  { titre: "🌸 Pour la peau :", items: ["Éclat visible", "Rides et ridules atténuées", "Élasticité améliorée", "Hydratation renforcée", "Protection UV interne"] },
                  { titre: "⚡ Pour l'énergie & le bien-être :", items: ["Moins de fatigue", "Meilleure récupération", "Soutien des muscles et des articulations"] },
                  { titre: "👁️ Pour les yeux :", items: ["Protection contre la lumière bleue", "Confort visuel au quotidien"] },
                  { titre: "🛡️ Pour l'immunité :", items: ["Renforcement naturel des défenses"] },
                ].map((section, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>{section.titre}</p>
                    {section.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        <span style={{ color: "#1db954" }}>✓</span><span>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(125,8,6,0.06)", borderRadius: 8, border: "1px solid var(--asta-border)" }}>
                  <p style={{ fontWeight: 800, marginBottom: 6 }}>🏆 Pourquoi NUTRELIS est supérieur ?</p>
                  {["Astaxanthine naturelle issue de micro-algues", "Haute biodisponibilité", "12mg par gélule (dosage premium)", "Pur, puissant, sans artifices"].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "var(--asta-accent)", fontWeight: 700 }}>•</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            icon: "🔬",
            q: "Composition",
            a: (
              <div>
                <p>Notre unique ingrédient actif est l'<strong>Astaxanthine</strong>, issue de la micro-algue <em>Haematococcus pluvialis</em>. L'enveloppe de la gélule est composée de <strong>Gélatine</strong> et d'<strong>Eau Purifiée</strong> — chaque capsule est conçue pour une pureté et une performance maximales.</p>
              </div>
            ),
          },
          {
            icon: "📦",
            q: "Livraison",
            a: (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>📦 Livraison standard gratuite :</p>
                  <p style={{ marginBottom: 4 }}>Réception en <strong>4 à 7 jours ouvrés</strong> via <strong>Atez Express</strong>.</p>
                  <p>Les commandes sont <strong>expédiées sous 24 heures</strong>.</p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "var(--asta-accent)", marginBottom: 6 }}>⚡ Livraison express payante :</p>
                  <p style={{ marginBottom: 4 }}>Réception en <strong>1 à 2 jours ouvrés</strong> via <strong>Atez Express</strong>.</p>
                  <p>Les commandes sont <strong>expédiées sous 24 heures</strong>.</p>
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(125,8,6,0.06)", borderRadius: 8, border: "1px solid var(--asta-border)" }}>
                  <p style={{ fontSize: 12, color: "var(--asta-text2)" }}>⚠️ Pour des raisons d'hygiène et de sécurité, les produits vendus ne peuvent être ni retournés, ni échangés, ni remboursés après l'achat.</p>
                </div>
              </div>
            ),
          },
        ].map((item, i) => (
          <ProductFaqItem key={i} icon={item.icon} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
function StatsSection() {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(windowHeight / 2 - elementCenter);
      const maxDistance = windowHeight / 2 + rect.height / 2;
      const p = Math.max(0, Math.min(1, 1 - distanceFromCenter / maxDistance));
      setProgress(p);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { value: 94, label: "Ont constaté une peau plus ferme et plus élastique", desc: "après 8+ semaines de prise régulière" },
    { value: 96, label: "Recommanderaient NUTRELIS à un proche", desc: "pour la protection cellulaire et le vieillissement en santé" },
    { value: 92, label: "Ont noté une meilleure énergie et clarté mentale", desc: "particulièrement en après-midi" },
    { value: 89, label: "Préfèrent NUTRELIS aux autres suppléments essayés", desc: "grâce à la pureté et la puissance des ingrédients" },
  ];

  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 80px" }}>
      {stats.map((stat, i) => (
        <div key={i}>
          <div style={{
            color: "var(--asta-accent)",
            fontSize: "2.8rem",
            fontWeight: 900,
            fontFamily: "var(--font-sora), sans-serif",
            lineHeight: 1,
            marginBottom: 8,
          }}>
            {Math.round(stat.value * progress)}
            <span style={{ fontSize: "1.4rem" }}>%</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--asta-text)" }}>
            {stat.label}
          </div>
          <div style={{ color: "var(--asta-text2)", fontSize: 13, marginBottom: 12 }}>
            {stat.desc}
          </div>
          {/* Barre de progression */}
          <div style={{
            height: 6,
            background: "#f0e8e8",
            borderRadius: 6,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${stat.value * progress}%`,
              background: "linear-gradient(90deg, var(--asta-accent), #c0392b)",
              borderRadius: 6,
              transition: "width 0.1s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqItemWhite({ icon, q, a }: { icon: string; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "16px 20px",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: open ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "linear-gradient(135deg, #7D0806, #c0392b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          flex: 1, fontWeight: 600, fontSize: 14,
          color: "#1a0505",
          fontFamily: "var(--font-sora), sans-serif",
        }}>
          {q}
        </span>
        <span style={{
          color: open ? "var(--asta-accent)" : "#999",
          fontSize: 20, fontWeight: 300, flexShrink: 0,
          transition: "all 0.2s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          display: "inline-block",
        }}>
          +
        </span>
      </div>
      {open && (
        <p style={{
          color: "#666", fontSize: 13, lineHeight: 1.8,
          marginTop: 12, paddingLeft: 50,
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function Astaxanthine() {
  const [prixAffiche, setPrixAffiche] = useState(27000);
  const [prixOriginal, setPrixOriginal] = useState(33750);
  const [selectedPack, setSelectedPack] = useState(2);
  const [mode, setMode] = useState<"unique" | "abonnement">("unique");

  const packs = [
    { id: 1, label: "1 Boîte · 60 capsules", desc: "Cure de 60 jours", prix: 15000, original: 18750 },
    { id: 2, label: "2 Boîtes · 120 capsules", desc: "Cure de 120 jours", prix: 27000, original: 33750, eco: "3 000 FCFA", popular: true },
    { id: 3, label: "3 Boîtes · 180 capsules", desc: "Cure de 180 jours", prix: 36000, original: 45000, eco: "9 000 FCFA" },
  ];

  const currentPack = packs.find(p => p.id === selectedPack)!;
  const currentPrice = mode === "abonnement" ? Math.round(currentPack.prix * 0.95) : currentPack.prix;
  const originalPrice = mode === "abonnement" ? currentPack.prix : currentPack.original;
  const clientPhotos = [
    "/images/astaxanthine/Ast2.png",
    "/images/astaxanthine/Ast3.png",
    "/images/astaxanthine/Ast4.png",
    "/images/astaxanthine/Asta1.png",
    "/images/astaxanthine/Asta2.png",
    "/images/astaxanthine/Asta3.png",
  ];

  return (
    <div style={{ background: "var(--asta-bg)", color: "var(--asta-text)", overflowX: "hidden" }}>

      {/* BANDEAU PROMO */}
      <div style={{
        background: "#7D0806",
        color: "#fff",
        textAlign: "center",
        padding: "11px 16px",
        fontSize: 13,
        fontWeight: 600,
      }}>
        🎉 VENTE SPÉCIALE — Achetez maintenant et économisez jusqu'à 70% aujourd'hui !
        &nbsp;·&nbsp; Expire dans <Countdown />
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
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
          background: "radial-gradient(ellipse at 50% 50%, #f7d5cf 0%, #fde8e4 40%, #fff5f3 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: "1px solid rgba(125,8,6,0.06)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: "50%",
            border: "1px solid rgba(125,8,6,0.03)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            top: 40, right: 52, zIndex: 40,
            width: 100, height: 100, borderRadius: "50%",
            background: "#fff",
            border: "3px solid var(--asta-accent)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(125,8,6,0.2)",
          }}>
            <span style={{ color: "var(--asta-accent)", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>90</span>
            <span style={{ color: "var(--asta-accent)", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>JOURS</span>
            <span style={{ color: "#888", fontSize: 7, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>
              Satisfait ou<br />Remboursé
            </span>
          </div>
          <div style={{
            position: "absolute",
            top: 40, left: 60, zIndex: 3,
            width: 90, height: 90, borderRadius: "50%",
            background: "#fff",
            border: "3px solid #1db954",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}>
            <span style={{ fontSize: 20 }}>🌿</span>
            <span style={{ color: "#1a7a3c", fontSize: 9, fontWeight: 800, textAlign: "center", lineHeight: 1.3, padding: "0 6px" }}>
              100%<br />NATUREL
            </span>
          </div>
          <img
            src="/images/astaxanthine/img_transparent.png"
            alt="NUTRELIS Astaxanthine 12mg"
            style={{
              width: "58%",
              maxWidth: 320,
              height: "auto",
              objectFit: "contain",
              position: "relative",
              zIndex: 2,
              filter: "drop-shadow(0 24px 48px rgba(125,8,6,0.2))",
              mixBlendMode: "normal",
            }}
          />
          <div style={{
            position: "absolute",
            bottom: 64,
            left: 52,
            zIndex: 3,
            background: "var(--asta-accent)",
            color: "#fff",
            fontWeight: 900,
            fontSize: 17,
            padding: "8px 16px",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(125,8,6,0.4)",
          }}>
            −20%
          </div>
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "linear-gradient(90deg, transparent, var(--asta-accent) 30%, var(--asta-accent) 70%, transparent)",
          }} />
        </div>

        {/* Côté droit — Texte */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px 48px 40px 40px",
          background: "#fff",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            background: "#f9f9f9",
            borderRadius: 30,
            padding: "8px 18px",
            width: "fit-content",
            border: "1px solid #eee",
          }}>
            <span style={{ color: "#00b67a", fontSize: 15, letterSpacing: -1 }}>★★★★★</span>
            <span style={{ color: "#333", fontSize: 13, fontWeight: 600 }}>Noté 4.8/5</span>
            <span style={{ color: "#ccc" }}>|</span>
            <span style={{ color: "#555", fontSize: 13 }}>
              Approuvé par{" "}
              <strong style={{ color: "#0d0d0d" }}>12 000+</strong> clients
            </span>
          </div>

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

          <p style={{
            color: "#666",
            fontSize: 15,
            lineHeight: 1.75,
            marginBottom: 28,
            maxWidth: 460,
          }}>
            Notre Astaxanthine naturelle à la pleine dose clinique de{" "}
            <strong style={{ color: "#0d0d0d" }}>12mg</strong> — issue de
            micro-algues hawaïennes. Pure, puissante, en gélule quotidienne.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {[
              "6000× plus puissant que la Vitamine C",
              "Résultats visibles dès 2 semaines",
              "Garantie satisfait ou remboursé 90 jours",
            ].map((point, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fdecea",
                  border: "1.5px solid var(--asta-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "var(--asta-accent)", fontSize: 11, fontWeight: 900 }}>✓</span>
                </div>
                <span style={{ color: "#444", fontSize: 14, fontWeight: 500 }}>{point}</span>
              </div>
            ))}
          </div>

          <a href="#commander" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--asta-accent)",
            color: "#fff",
            padding: "19px 52px",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 8px 28px rgba(125,8,6,0.35)",
            letterSpacing: 0.5,
            width: "fit-content",
            fontFamily: "var(--font-sora), sans-serif",
          }}>
            COMMANDER MAINTENANT — 70% OFF
          </a>

          <div style={{
            display: "flex",
            gap: 20,
            marginTop: 16,
            fontSize: 12,
            color: "#999",
            flexWrap: "wrap",
          }}>
            <span>🔒 Paiement sécurisé</span>
            <span>📦 Livraison ATEZ Express</span>
            <span>↩️ 90 jours remboursé</span>
          </div>
        </div>
      </section>

      {/* BADGES CONFIANCE */}
      <div style={{ background: "var(--asta-accent)" }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
        }}>
          {[
            { label: "FORMULE CLINIQUEMENT PROUVÉE", svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "CERTIFIÉ TIERS INDÉPENDANT", svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: "INGRÉDIENTS 100% NATURELS", svg: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" },
          ].map((b, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "22px 28px",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.2)" : "none",
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: "1.5px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "rgba(255,255,255,0.08)",
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

      {/* DÉFILEMENT PHOTOS */}
      <div style={{
        padding: "44px 0",
        overflow: "hidden",
        borderBottom: "1px solid var(--asta-border)",
        background: "#fff",
      }}>
        <p style={{
          textAlign: "center",
          marginBottom: 20,
          color: "var(--asta-gold)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 2,
        }}>
          ★★★★★ &nbsp; Vraies Histoires, Vrais Résultats
        </p>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            display: "flex",
            gap: 16,
            animation: "scrollLeft 30s linear infinite",
            width: "max-content",
          }}>
            {[...clientPhotos, ...clientPhotos, ...clientPhotos, ...clientPhotos, ...clientPhotos].map((photo, i) => (
              <div key={i} style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #fff",
                boxShadow: "0 2px 12px rgba(125,8,6,0.15)",
                flexShrink: 0,
              }}>
                <img src={photo} alt="client"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

     {/* SECTION PRODUIT CENTRÉ */}
      <section style={{ background: "#fff", padding: "80px 60px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "var(--asta-gold)", fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
            ★★★★★ Noté 4.8/5 | Approuvé par 12 000+ clients
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: 40 }}>
            Découvrez notre Astaxanthine à dose clinique premium.
          </h2>

          {/* Carte produit */}
          <div style={{
            position: "relative",
            background: "var(--asta-bg2)",
            borderRadius: 24,
            padding: "48px 40px 40px",
            border: "1px solid var(--asta-border)",
            boxShadow: "0 8px 40px rgba(125,8,6,0.1)",
            overflow: "hidden",
          }}>
            {/* Ruban -70% */}
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: "100px 100px 0 0",
              borderColor: "var(--asta-accent) transparent transparent transparent",
            }} />
            <div style={{
              position: "absolute", top: 20, left: 4,
              color: "#fff", fontWeight: 900, fontSize: 16,
              transform: "rotate(-45deg)",
              fontFamily: "var(--font-sora), sans-serif",
            }}>
              70% OFF
            </div>

            {/* Badge 90 jours */}
            <div style={{
              position: "absolute", top: 24, right: 24,
              width: 90, height: 90, borderRadius: "50%",
              background: "linear-gradient(135deg, #c8940a, #f5c842)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(184,134,11,0.4)",
            }}>
              <span style={{ color: "#fff", fontSize: 7, fontWeight: 800 }}>MONEY BACK</span>
              <span style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>90</span>
              <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>DAYS</span>
            </div>

            {/* Image produit */}
            <img
              src="/images/astaxanthine/img_transparent.png"
              alt="NUTRELIS Astaxanthine 12mg"
              style={{
                width: "55%", maxWidth: 280,
                height: "auto", objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(125,8,6,0.2))",
                margin: "0 auto 32px"
              }}
            />

            {/* Info produit */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "var(--asta-text2)", fontSize: 13, marginBottom: 8 }}>
                NUTRELIS Astaxanthine 12mg — Protection cellulaire & Soutien anti-stress oxydatif
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span style={{ color: "var(--asta-accent)", fontSize: 36, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>
                  15 000 FCFA
                </span>
                <span style={{ color: "#aaa", fontSize: 18, textDecoration: "line-through" }}>
                  18 750 FCFA
                </span>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
              {["✅ Vegan", "✅ Sans gluten", "✅ 100% naturel", "✅ Non-GMO"].map((b, i) => (
                <span key={i} style={{
                  background: "#fff", border: "1px solid var(--asta-border)",
                  borderRadius: 20, padding: "5px 14px",
                  fontSize: 12, color: "var(--asta-text2)", fontWeight: 600,
                }}>
                  {b}
                </span>
              ))}
            </div>

            {/* CTA */}
            <a href="#commander" style={{
              display: "block",
              background: "var(--asta-accent)", color: "#fff",
              padding: "18px", borderRadius: 12,
              fontSize: 17, fontWeight: 900, textDecoration: "none",
              boxShadow: "0 6px 24px rgba(125,8,6,0.35)",
              fontFamily: "var(--font-sora), sans-serif",
              letterSpacing: 0.5,
            }}>
              COMMANDER MAINTENANT — 70% OFF
            </a>

            <p style={{ color: "#aaa", fontSize: 12, marginTop: 16 }}>
              🔒 Paiement sécurisé &nbsp;|&nbsp; ↩️ Garantie 90 jours satisfait ou remboursé
            </p>
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <section style={{ padding: "96px 60px", background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              ILS ONT ESSAYÉ, ILS ONT ADOPTÉ
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              Ils ont ressenti la différence.{" "}
              <span style={{ color: "var(--asta-accent)" }}>Vous aussi.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              { name: "Marie Ange", semaines: "3 semaines", titre: "Ma peau n'a jamais été aussi lumineuse", text: "Depuis que j'ai commencé l'astaxanthine NUTRELIS, mon teint est éclatant et uniforme. Les imperfections ont disparu. Je reçois des compliments chaque jour.", img: "/images/astaxanthine/Ast2.png" },
              { name: "Christine", semaines: "6 semaines", titre: "Un vrai boost d'énergie au quotidien", text: "Je me sens plus énergique et concentrée. Ma fatigue a disparu. Ma peau est plus nette, mes cheveux tombent moins. NUTRELIS est devenu indispensable.", img: "/images/astaxanthine/Ast3.png" },
              { name: "Audrey", semaines: "8 semaines", titre: "Une peau plus ferme et visiblement rajeunie", text: "Après quelques semaines, ma peau est plus ferme et mes ridules moins visibles. Mon visage paraît plus jeune. Des résultats naturels et durables.", img: "/images/astaxanthine/Ast4.png" },
            ].map((avis, i) => (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid var(--asta-border)",
                borderRadius: 20,
                padding: 32,
                boxShadow: "0 2px 20px rgba(125,8,6,0.06)",
              }}>
                <div style={{ color: "#f5a623", fontSize: 18, marginBottom: 12 }}>★★★★★</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, fontFamily: "var(--font-sora), sans-serif" }}>
                  {avis.titre}
                </h3>
                <p style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>
                  &quot;{avis.text}&quot;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2.5px solid var(--asta-accent)",
                    }}>
                      <img src={avis.img} alt={avis.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{avis.name}</div>
                      <div style={{ color: "var(--asta-text2)", fontSize: 12 }}>✅ Client vérifié</div>
                    </div>
                  </div>
                  <div style={{
                    background: "#fdecea",
                    color: "var(--asta-text2)",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}>
                    {avis.semaines}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI NUTRELIS */}
      <section style={{ background: "var(--asta-accent)", padding: "72px 60px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              POURQUOI NOUS FAIRE CONFIANCE
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", color: "#fff" }}>
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
                borderRadius: 18,
                padding: "32px 24px",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{item.label}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 RAISONS */}
      <section style={{ padding: "96px 60px 0", background: "var(--asta-bg2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              5 RAISONS POUR LESQUELLES
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              L'Astaxanthine NUTRELIS est différente de tout ce que vous avez essayé
            </h2>
          </div>
          <RaisonsSection />
        </div>
      </section>

      {/* CTA APRÈS 5 RAISONS */}
      <div style={{
        textAlign: "center",
        padding: "24px 60px 60px",
        background: "var(--asta-bg2)",
      }}>
        <a href="#commander" style={{
          display: "inline-block",
          background: "var(--asta-accent)",
          color: "#fff",
          padding: "18px 52px",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
          fontFamily: "var(--font-sora), sans-serif",
          marginBottom: 16,
        }}>
          Essayez sans risque dès aujourd&apos;hui
        </a>
        <p style={{ color: "var(--asta-text2)", fontSize: 13 }}>
          <span>✅ Garantie satisfait ou remboursé pendant 90 jours</span>
        </p>
      </div>

      {/* VIDÉOS */}
      <section style={{ padding: "96px 60px 0", background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              TÉMOIGNAGES VIDÉO
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif" }}>
              Vraies histoires,{" "}
              <span style={{ color: "var(--asta-accent)" }}>vrais résultats</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { name: "VINCENT", file: "video1.mp4" },
              { name: "CHRISTIAN", file: "video2.mp4" },
              { name: "MIRIANNE", file: "video3.mp4" },
              { name: "ALEX", file: "video4.mp4" },
            ].map((v, i) => (
              <div key={i} style={{
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid var(--asta-border)",
                background: "#fff",
                boxShadow: "0 2px 16px rgba(125,8,6,0.06)",
              }}>
                <video
                  controls
                  style={{ width: "100%", display: "block", maxHeight: 400, objectFit: "cover", background: "#000" }}
                  onPlay={(e) => {
                    const videos = document.querySelectorAll("video");
                    videos.forEach((vid) => {
                      if (vid !== e.currentTarget) {
                        vid.pause();
                      }
                    });
                  }}
                >
                  <source src={`/videos/${v.file}`} type="video/mp4" />
                </video>
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{v.name}</span>
                  <span style={{
                    background: "#fdecea",
                    color: "var(--asta-accent)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: "3px 10px",
                    borderRadius: 10,
                  }}>
                    CLIENT VÉRIFIÉ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA APRÈS VIDÉOS */}
      <div style={{
        textAlign: "center",
        padding: "24px 60px 40px",
        background: "var(--asta-bg)",
      }}>
        <a href="#commander" style={{
          display: "inline-block",
          background: "var(--asta-accent)",
          color: "#fff",
          padding: "18px 52px",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
          fontFamily: "var(--font-sora), sans-serif",
          marginBottom: 16,
        }}>
          Essayez sans risque dès aujourd&apos;hui
        </a>
        <p style={{ color: "var(--asta-text2)", fontSize: 13 }}>
          <span>✅ Garantie satisfait ou remboursé pendant 90 jours</span>
        </p>
      </div>

     {/* PROBLÈME → SOLUTION */}
      <section style={{
        background: "linear-gradient(135deg, #7D0806 0%, #a01010 40%, #d4817e 80%, #f5e8e5 100%)",
        padding: "80px 60px 0",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Badge */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              padding: "6px 16px",
              borderRadius: 20,
            }}>
              LA PROTECTION CELLULAIRE COMMENCE ICI
            </span>
          </div>

          {/* Titre */}
          <h2 style={{
            textAlign: "center",
            color: "#fff",
            fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
            fontWeight: 800,
            fontFamily: "var(--font-sora), sans-serif",
            marginBottom: 48,
            lineHeight: 1.2,
          }}>
            De Fatigué Et Vieillissant À Plein D&apos;énergie Et Épanoui 💪
          </h2>

          {/* Deux colonnes */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 48,
          }}>
            {/* Problème */}
            <div style={{
              background: "rgba(80,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "28px 32px",
            }}>
              <p style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 1.5,
                marginBottom: 20,
              }}>
                VOTRE PROBLÈME
              </p>
              {[
                "Se sentir plus vieux, pas en meilleure forme",
                "Énergie en berne, esprit confus, problèmes de peau",
                "Des compléments qui ne tiennent jamais leurs promesses",
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, flexShrink: 0 }}>✗</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Solution */}
            <div style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: 16,
              padding: "28px 32px",
            }}>
              <p style={{
                color: "var(--asta-accent)",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 1.5,
                marginBottom: 20,
              }}>
                NOTRE SOLUTION
              </p>
              {[
                "Aiguisé, plein d'énergie et rajeuni",
                "Protégé au niveau cellulaire",
                "Confiant et maître de votre santé",
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < 2 ? "1px solid var(--asta-border)" : "none",
                }}>
                  <span style={{ color: "#1db954", fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ color: "var(--asta-text)", fontSize: 15, fontWeight: 500 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image avant/après */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: "6px 16px",
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--asta-accent)",
            }}>
              Dès 2 mois →
            </div>
            <img
              src="/images/astaxanthine/Rajeu-Photo-1.png"
              alt="Transformation NUTRELIS"
              style={{
                maxWidth: 600,
                width: "100%",
                display: "block",
                margin: "0 auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "80px 60px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              LES RÉSULTATS PARLENT D&apos;EUX-MÊMES
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: 16 }}>
              Les Chiffres Le Prouvent
            </h2>
            <p style={{ color: "var(--asta-text2)", fontSize: 15 }}>
              Quand des ingrédients naturels et cliniquement dosés se combinent, les résultats sont indéniables.
            </p>
          </div>
          <StatsSection />
        </div>
      </section>

     {/* NUTRELIS VS AUTRES */}
      <section style={{
        background: "linear-gradient(135deg, #7D0806 0%, #a01010 40%, #d4817e 80%, #f5e8e5 100%)",
        padding: "80px 60px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Gauche — comparaison */}
          <div>
            
            {/* Image + Tableau comparatif */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "end" }}>
              {/* NUTRELIS — avec image au dessus */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img
                  src="/images/astaxanthine/img_transparent.png"
                  alt="NUTRELIS"
                  style={{
                    width: 45,
                    height: "auto",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))",
                    marginBottom: 8,
                  }}
                />
                <div style={{
                  background: "rgba(80,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 14,
                  padding: "32px 20px",
                  width: "100%",
                }}>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, textAlign: "center", marginBottom: 20, letterSpacing: 1 }}>
                    NUTRELIS
                  </p>
                  {["Gélule Premium, Absorption Optimale", "Vegan & Sans Gluten"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                      <span style={{ color: "#1db954", fontSize: 16, flexShrink: 0 }}>✓</span>
                      <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Autres marques */}
              <div style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 14,
                padding: "32px 20px",
              }}>
                <p style={{ color: "var(--asta-text)", fontWeight: 800, fontSize: 15, textAlign: "center", marginBottom: 20, letterSpacing: 1 }}>
                  AUTRES MARQUES
                </p>
                {["Mauvaise Absorption (Comprimés, Poudres, Gummies)", "Sucres, Arômes, Liants"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < 1 ? "1px solid var(--asta-border)" : "none" }}>
                    <span style={{ color: "#e53e3e", fontSize: 16, flexShrink: 0 }}>✗</span>
                    <span style={{ color: "var(--asta-text2)", fontSize: 13 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Droite — points clés + CTA */}
          <div>
            <h2 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
              fontWeight: 800,
              marginBottom: 32,
              lineHeight: 1.2,
            }}>
              <span style={{ color: "var(--asta-gold)" }}>NUTRELIS</span>
              <span style={{ color: "#fff" }}> Vs. Autres Marques</span>
            </h2>

            <div style={{ marginBottom: 40 }}>
              {[
                "Ingrédients propres – efficacité prouvée",
                "Résultats visibles en quelques semaines",
                "Santé durable, pas de solution rapide",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.15)" : "none",
                }}>
                  <span style={{ color: "#1db954", fontSize: 20, flexShrink: 0 }}>✓</span>
                  <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>

            <a href="#commander" style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid #fff",
              color: "#fff",
              padding: "16px 40px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 800,
              textDecoration: "none",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: 14,
            }}>
              Essayez sans risque dès aujourd&apos;hui
            </a>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              <span>✅ Garantie satisfait ou remboursé pendant 90 jours</span>
            </p>
          </div>
        </div>
      </section>

      {/* COMMANDER */}
      <section id="commander" style={{ padding: "96px 60px", background: "var(--asta-bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "var(--asta-gold)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              COMMANDEZ MAINTENANT
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "var(--font-sora), sans-serif", marginBottom: 12 }}>
              Choisissez votre formule
            </h2>
            <p style={{ color: "var(--asta-text2)", fontSize: 15 }}>
              Achat unique ou abonnement mensuel avec livraison automatique ATEZ Express
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

            {/* Gauche — Galerie images */}
            <ProductGallery />

            {/* Droite — Sélecteur de pack */}
            <div>
              {/* Note */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: "#f5a623", fontSize: 16 }}>★★★★★</span>
                <span style={{ color: "var(--asta-text2)", fontSize: 13 }}>4.9/5 · 6 000+ clients satisfaits</span>
              </div>

              {/* Titre produit */}
              <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8, lineHeight: 1.3 }}>
                NUTRELIS ASTAXANTHINE 12mg — COMPLEXE ANTI-AGE INTENSE & PROTECTION CELLULAIRE
              </h3>

              {/* Prix */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ color: "var(--asta-text2)", fontSize: 15, textDecoration: "line-through" }}>
                  {prixOriginal.toLocaleString("fr-FR")} FCFA
                </span>
                <span style={{ color: "var(--asta-accent)", fontSize: 26, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>
                  {prixAffiche.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              {/* Description courte */}
              <p style={{ color: "var(--asta-text2)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, borderLeft: "3px solid var(--asta-accent)", paddingLeft: 12 }}>
                L'astaxanthine est un puissant antioxydant naturel. Elle protège les cellules du vieillissement, améliore l'élasticité de la peau et favorise une peau plus lumineuse, ferme et hydratée.
              </p>

              {/* Bénéfices */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 12, color: "var(--asta-text)" }}>
                  CHOISISSEZ VOTRE PACK :
                </p>
              </div>

              {/* Pack Selector */}
             <PackSelector onPackChange={(prix, original) => {
                setPrixAffiche(prix);
                setPrixOriginal(original);
              }} />

              {/* Bénéfices liste */}
              <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--asta-bg2)", borderRadius: 12, border: "1px solid var(--asta-border)" }}>
                <p style={{ fontSize: 13, color: "var(--asta-text2)", marginBottom: 12, fontWeight: 600 }}>
                  La seule solution naturelle qui agit là où les crèmes ne peuvent pas aller : à l&apos;intérieur de vos cellules
                </p>
                {[
                  "Teint lumineux instantané — résultats visibles dès 2-3 semaines",
                  "Protection cellulaire 6000× supérieure à la Vitamine C",
                  "Énergie stable toute la journée",
                  "Confort visuel maximal — idéal pour les écrans",
                  "12mg de dosage premium — forme la plus biodisponible",
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#1db954", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ color: "var(--asta-text2)", fontSize: 13 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION MÉDECIN — TIMELINE */}
      <section style={{
        background: "linear-gradient(135deg, #fff8f6 0%, #fdecea 50%, #fff8f6 100%)",
        padding: "80px 60px",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Image médecin */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 60% 50%, #fde8e4 0%, transparent 70%)",
              borderRadius: 24,
            }} />
            <img
              src="/images/astaxanthine/Medecin.png"
              alt="Médecin NUTRELIS"
              style={{
                width: "100%", height: "auto",
                objectFit: "contain",
                position: "relative", zIndex: 1,
                filter: "drop-shadow(0 20px 40px rgba(125,8,6,0.15))",
              }}
            />
          </div>

          {/* Timeline droite */}
          <div>
            {/* Titre */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--asta-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
                boxShadow: "0 4px 16px rgba(125,8,6,0.3)",
              }}>
                🌿
              </div>
              <h2 style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontSize: "clamp(1.4rem, 2vw, 1.8rem)",
                fontWeight: 800, color: "var(--asta-accent)",
                lineHeight: 1.3,
              }}>
                Un antioxydant pour une peau plus jeune
              </h2>
            </div>

            {/* Items timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  icon: "✨",
                  bg: "#7D0806",
                  titre: "SEMAINE 2–3 : ÉCLAT INSTANTANÉ",
                  desc: "Teint lumineux naturel, ce \"glow\" que tout le monde remarque • Peau hydratée",
                },
                {
                  icon: "🔥",
                  bg: "#c0392b",
                  titre: "SEMAINE 4–6 : RIDES RÉDUITES",
                  desc: "Traits plus lisses (front, contour des yeux) • Élasticité visiblement améliorée",
                },
                {
                  icon: "💎",
                  bg: "#922b21",
                  titre: "SEMAINE 8 : TRANSFORMATION COMPLÈTE",
                  desc: "Peau plus ferme • Teint plus uniforme • Confort au quotidien",
                },
                {
                  icon: "🛡️",
                  bg: "#7D0806",
                  titre: "PROTECTION CELLULAIRE 6000×",
                  desc: "Soutien antioxydant puissant • Aide face aux UV, pollution et lumière bleue",
                },
                {
                  icon: "⚡",
                  bg: "#c0392b",
                  titre: "ÉNERGIE STABLE TOUTE LA JOURNÉE",
                  desc: "Moins de coups de fatigue • Sensation de vitalité plus régulière",
                },
                {
                  icon: "👁️",
                  bg: "#922b21",
                  titre: "PROTECTION DES YEUX",
                  desc: "Confort visuel • Idéal si vous êtes souvent sur écran",
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "14px 20px",
                  border: "1px solid var(--asta-border)",
                  boxShadow: "0 2px 12px rgba(125,8,6,0.06)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(125,8,6,0.12)";
                    e.currentTarget.style.borderColor = "var(--asta-accent)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(125,8,6,0.06)";
                    e.currentTarget.style.borderColor = "var(--asta-border)";
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: item.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                    boxShadow: `0 4px 12px ${item.bg}55`,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{
                      fontWeight: 800, fontSize: 12,
                      color: "var(--asta-accent)",
                      letterSpacing: 0.5, marginBottom: 3,
                      fontFamily: "var(--font-sora), sans-serif",
                    }}>
                      {item.titre}
                    </p>
                    <p style={{ color: "var(--asta-text2)", fontSize: 12, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GARANTIE */}
      <section style={{
        background: "#fff",
        padding: "80px 60px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Gauche — contenu */}
          <div style={{ textAlign: "center" }}>
            <img
              src="/images/astaxanthine/261-Converti-1.png"
              alt="Garantie 90 jours"
              style={{ width: 200, height: "auto", marginBottom: 20, display: "block", margin: "0 auto 20px", }}
            />
            <p style={{ color: "var(--asta-accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              RESSENTEZ LA DIFFÉRENCE
            </p>
            <h2 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: "2rem", fontWeight: 800, marginBottom: 20,
            }}>
              Garantie 90 jours
            </h2>
            <p style={{
              color: "var(--asta-text2)", fontSize: 15,
              lineHeight: 1.8, maxWidth: 400, margin: "0 auto 32px",
            }}>
              Si vous ne constatez pas d&apos;améliorations visibles dans les 90 jours,
              retournez simplement votre commande pour un remboursement intégral
              sans poser de questions.
            </p>
            <a href="#commander" style={{
              display: "inline-block",
              background: "var(--asta-accent)", color: "#fff",
              padding: "18px 48px", borderRadius: 12,
              fontSize: 16, fontWeight: 900, textDecoration: "none",
              boxShadow: "0 6px 24px rgba(125,8,6,0.3)",
              fontFamily: "var(--font-sora), sans-serif",
              marginBottom: 24,
            }}>
              Essayez sans risque dès aujourd&apos;hui
            </a>
            <p style={{ color: "var(--asta-text2)", fontSize: 13 }}>
              <span>✅ Garantie satisfait ou remboursé pendant 90 jours</span>
            </p>
          </div>

          {/* Droite — image femme avec badge */}
          <div style={{ position: "relative" }}>
            <img
              src="/images/astaxanthine/BadgesA.png"
              alt="Résultats NUTRELIS"
              style={{
                width: "100%", height: "auto",
                objectFit: "contain",
                borderRadius: 24,
              }}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        background: "var(--asta-accent)",
        padding: "80px 60px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: "clamp(1.4rem, 2vw, 1.8rem)",
              fontWeight: 800, color: "#fff",
              letterSpacing: 4,
            }}>
              FOIRE AUX QUESTIONS
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              {
                icon: "🌿",
                q: "Pourquoi choisir NUTRELIS plutôt qu'une autre marque ?",
                a: "NUTRELIS utilise uniquement de l'astaxanthine naturelle issue de micro-algues, avec un dosage premium de 12mg, réputé pour sa haute efficacité et biodisponibilité. Sans additifs inutiles, sans compromis.",
              },
              {
                icon: "👁️",
                q: "Comment dois-je la prendre ?",
                a: "1 gélule par jour pendant un repas, idéalement toujours au même moment, pour une absorption optimale.",
              },
              {
                icon: "✨",
                q: "Est-ce que c'est bon pour la peau ?",
                a: "Oui. L'Astaxanthine stimule l'éclat naturel, améliore l'hydratation et aide à réduire l'apparition des ridules. C'est un des rares antioxydants capables d'agir aussi profondément sur la qualité de la peau.",
              },
              {
                icon: "🌸",
                q: "Est-ce adapté si j'ai la peau sensible ?",
                a: "Oui. L'Astaxanthine aide justement à réduire l'inflammation et les rougeurs. Beaucoup de clients sensibles la préfèrent à d'autres antioxydants plus irritants.",
              },
              {
                icon: "☀️",
                q: "Est-ce que ça protège du soleil ?",
                a: "L'Astaxanthine agit comme un bouclier interne contre les UV. Elle ne remplace pas une crème solaire, mais elle réduit l'impact du stress solaire et aide la peau à mieux se défendre.",
              },
              {
                icon: "💊",
                q: "Est-ce que c'est compatible avec d'autres compléments ?",
                a: "Oui dans la majorité des cas. L'Astaxanthine se combine très bien avec collagène, oméga-3, magnésium, zinc, etc. Si vous suivez un traitement médical, demandez toujours conseil à votre médecin.",
              },
              {
                icon: "🔬",
                q: "Composition",
                a: "Notre unique ingrédient actif est l'Astaxanthine, issue de la micro-algue Haematococcus pluvialis. L'enveloppe de la gélule est composée de Gélatine et d'Eau Purifiée — chaque capsule est conçue pour une pureté et une performance maximales.",
              },
              {
                icon: "📦",
                q: "Livraison",
                a: "Livraison standard gratuite : réception en 4 à 7 jours ouvrés via Atez Express. Les commandes sont expédiées sous 24 heures. Livraison express payante : réception en 1 à 2 jours ouvrés via Atez Express.",
              },
            ].map((faq, i) => (
              <FaqItemWhite key={i} icon={faq.icon} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1a0505", padding: "64px 60px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--asta-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 16,
                }}>
                  N
                </div>
                <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#fff" }}>
                  NUTRELIS
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, marginBottom: 24, maxWidth: 280 }}>
                Des compléments alimentaires d'excellence, formulés à partir des actifs naturels les plus puissants pour votre santé.
              </p>
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
                  <a key={j} href="#" style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none", marginBottom: 12 }}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              © 2026 NUTRELIS — Tous droits réservés
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              Livraison assurée par ATEZ Express 📦
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}