"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(6,15,8,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(29,185,84,0.15)" : "none",
      transition: "all 0.3s",
      padding: "0 60px",
      height: 70,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, color: "#fff", fontSize: 16,
          fontFamily: "var(--font-sora), sans-serif",
        }}>N</div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "var(--font-sora), sans-serif", letterSpacing: 1 }}>
          NUTRELIS
        </span>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
       {[
          { label: "Produits", href: "/produits/astaxanthine-12mg" },
          { label: "Science", href: "/science" },
          { label: "Avis clients", href: "/avis-clients" },
          { label: "FAQ", href: "/faq" },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"}
          >{item.label}</Link>
        ))}
        <Link href="/produits/astaxanthine-12mg" style={{
          background: "var(--accent)", color: "#fff",
          padding: "10px 24px", borderRadius: 8,
          fontSize: 14, fontWeight: 700, textDecoration: "none",
          fontFamily: "var(--font-sora), sans-serif",
          boxShadow: "0 4px 16px rgba(29,185,84,0.35)",
        }}>
          Commander →
        </Link>
      </div>
    </nav>
  );
}

export default function Homepage() {
  return (
    <main style={{ background: "var(--bg-primary)", color: "#fff", overflowX: "hidden" }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        minHeight: "auto",
        background: "radial-gradient(ellipse at 30% 50%, rgba(29,185,84,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(29,185,84,0.06) 0%, transparent 50%), var(--bg-primary)",
        display: "flex", alignItems: "center",
        padding: "120px 60px 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: "absolute", top: "10%", right: "5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "5%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,185,84,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", width: "100%" }}>

          {/* Texte gauche */}
         <div style={{ order: 2 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.3)",
              borderRadius: 20, padding: "6px 16px", marginBottom: 24,
            }}>
              <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                ★★★★★ NOTÉ 4.8/5 · PLUS DE 12 000 CLIENTS
              </span>
            </div>

            <h1 style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: "clamp(2.4rem, 4vw, 3.8rem)",
              fontWeight: 900, lineHeight: 1.1,
              marginBottom: 24, letterSpacing: -1,
            }}>
              La Nature à Son{" "}
              <span style={{ color: "var(--accent)" }}>Plus Puissant</span>
              {" "}Pour Votre Corps.
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: 18,
              lineHeight: 1.8, marginBottom: 40, maxWidth: 480,
            }}>
              Des compléments alimentaires premium, cliniquement dosés, issus de la nature. Formulés pour des résultats visibles et durables.
            </p>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 40 }}>
              <Link href="/produits/astaxanthine-12mg" style={{
                background: "var(--accent)", color: "#fff",
                padding: "18px 40px", borderRadius: 12,
                fontSize: 16, fontWeight: 900, textDecoration: "none",
                fontFamily: "var(--font-sora), sans-serif",
                boxShadow: "0 8px 32px rgba(29,185,84,0.35)",
                display: "inline-block",
              }}>
                Découvrir nos produits →
              </Link>
              <a href="#produits" style={{
                color: "rgba(255,255,255,0.7)", fontSize: 15,
                fontWeight: 600, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                En savoir plus ↓
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 40 }}>
              {[
                { val: "12 000+", label: "Clients satisfaits" },
                { val: "4.8/5", label: "Note moyenne" },
                { val: "90j", label: "Garantie remboursé" },
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ color: "var(--accent)", fontSize: 22, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>{stat.val}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image droite */}
         <div style={{ position: "relative", display: "flex", justifyContent: "center", order: 1 }}>
            {/* Cercle vert derrière */}
            <div style={{
              position: "absolute", inset: "10%",
              background: "radial-gradient(circle, rgba(29,185,84,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            }} />

            {/* Badge 100% naturel */}
            <div style={{
              position: "absolute", top: "8%", left: "5%", zIndex: 2,
              width: 90, height: 90, borderRadius: "50%",
              background: "#fff",
              border: "3px solid var(--accent)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(29,185,84,0.25)",
            }}>
              <span style={{ fontSize: 18 }}>🌿</span>
              <span style={{ color: "#1a7a3c", fontSize: 8, fontWeight: 800, textAlign: "center" }}>100%<br />NATUREL</span>
            </div>

            {/* Badge 90 jours */}
            <div style={{
              position: "absolute", top: "8%", right: "5%", zIndex: 2,
              width: 90, height: 90, borderRadius: "50%",
              background: "#fff",
              border: "3px solid var(--accent)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(29,185,84,0.25)",
            }}>
              <span style={{ color: "var(--accent)", fontSize: 22, fontWeight: 900, lineHeight: 1 }}>90</span>
              <span style={{ color: "var(--accent)", fontSize: 8, fontWeight: 800 }}>JOURS</span>
              <span style={{ color: "#888", fontSize: 7, textAlign: "center" }}>Satisfait ou<br />Remboursé</span>
            </div>

            <img
              src="/images/astaxanthine/img_transparent.png"
              alt="NUTRELIS Astaxanthine"
              style={{
                width: "70%", maxWidth: 320, height: "auto",
                objectFit: "contain", position: "relative", zIndex: 1,
                filter: "drop-shadow(0 20px 60px rgba(29,185,84,0.2))",
              }}
            />
          </div>
        </div>
      </section>

      {/* BADGES CONFIANCE */}
      <section style={{ background: "rgba(29,185,84,0.08)", borderTop: "1px solid rgba(29,185,84,0.15)", borderBottom: "1px solid rgba(29,185,84,0.15)", padding: "24px 60px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
          {[
            { icon: "🔬", label: "Formule cliniquement prouvée" },
            { icon: "✅", label: "Certifié tiers indépendant" },
            { icon: "🌿", label: "Ingrédients 100% naturels" },
            { icon: "🚚", label: "Livraison ATEZ Express" },
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{b.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUITS */}
      <section id="produits" style={{ padding: "100px 60px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              NOS PRODUITS
            </p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800 }}>
              Science & Nature au Service de Votre Santé
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {/* Produit vedette — Astaxanthine */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(29,185,84,0.3)",
              borderRadius: 24, overflow: "hidden",
              transition: "all 0.3s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = "1px solid rgba(29,185,84,0.6)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(29,185,84,0.1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = "1px solid rgba(29,185,84,0.3)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Image */}
              <div style={{
                background: "radial-gradient(ellipse at 50% 60%, rgba(29,185,84,0.12) 0%, rgba(6,15,8,0.8) 100%)",
                padding: "40px", textAlign: "center", position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  background: "var(--accent)", color: "#fff",
                  fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
                }}>
                  −20%
                </div>
                <img
                  src="/images/astaxanthine/img_transparent.png"
                  alt="Astaxanthine NUTRELIS"
                  style={{ width: "60%", maxWidth: 160, height: "auto", objectFit: "contain", filter: "drop-shadow(0 10px 30px rgba(29,185,84,0.2))", margin: "20px auto 0", display: "block" }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: "28px" }}>
                <p style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
                  ANTIOXYDANT PREMIUM
                </p>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>
                  Astaxanthine 12mg
                </h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                  L'antioxydant le plus puissant au monde. 6000× plus efficace que la Vitamine C. Peau, yeux, énergie.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {["Peau", "Yeux", "Énergie", "Anti-âge"].map((tag, i) => (
                    <span key={i} style={{
                      background: "rgba(29,185,84,0.1)", color: "var(--accent)",
                      fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                      border: "1px solid rgba(29,185,84,0.2)",
                    }}>{tag}</span>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "line-through", marginRight: 8 }}>18 750 FCFA</span>
                    <span style={{ color: "var(--accent)", fontSize: 22, fontWeight: 900, fontFamily: "var(--font-sora), sans-serif" }}>15 000 FCFA</span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>★★★★★ 4.8</div>
                </div>

                <Link href="/produits/astaxanthine-12mg" style={{
                  display: "block", textAlign: "center",
                  background: "var(--accent)", color: "#fff",
                  padding: "14px", borderRadius: 10,
                  fontSize: 14, fontWeight: 800, textDecoration: "none",
                  fontFamily: "var(--font-sora), sans-serif",
                  boxShadow: "0 4px 20px rgba(29,185,84,0.3)",
                }}>
                  Découvrir →
                </Link>
              </div>
            </div>

            {/* Produits à venir */}
            {[
              { nom: "Collagène Marin", desc: "Fermeté et élasticité de la peau. Articulations renforcées.", tags: ["Peau", "Articulations"] },
              { nom: "Complexe Oméga-3", desc: "Santé cardiovasculaire, cerveau et vision. Pureté maximale.", tags: ["Cœur", "Cerveau"] },
            ].map((p, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24, overflow: "hidden",
                opacity: 0.6,
                position: "relative",
              }}>
                {/* Badge bientôt */}
                <div style={{
                  position: "absolute", top: 16, left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", fontSize: 11, fontWeight: 700,
                  padding: "4px 16px", borderRadius: 20, zIndex: 2,
                  letterSpacing: 1,
                }}>
                  BIENTÔT DISPONIBLE
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  padding: "40px", textAlign: "center",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 260,
                }}>
                  <span style={{ fontSize: 60, opacity: 0.3 }}>🧴</span>
                </div>

                <div style={{ padding: "28px" }}>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
                    PROCHAINEMENT
                  </p>
                  <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
                    {p.nom}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                    {p.desc}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    {p.tags.map((tag, j) => (
                      <span key={j} style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 11, padding: "4px 12px", borderRadius: 20,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}>{tag}</span>
                    ))}
                  </div>
                  <button style={{
                    width: "100%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)", padding: "14px",
                    borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: "not-allowed",
                  }}>
                    Bientôt disponible
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI NUTRELIS */}
      <section style={{ padding: "100px 60px", background: "rgba(29,185,84,0.04)", borderTop: "1px solid rgba(29,185,84,0.1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              NOTRE PHILOSOPHIE
            </p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800 }}>
              Pourquoi Choisir NUTRELIS ?
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { icon: "🔬", titre: "Dosage clinique", desc: "Chaque formule est dosée selon les standards cliniques pour une efficacité maximale." },
              { icon: "🌿", titre: "100% Naturel", desc: "Ingrédients purs issus de la nature, sans additifs, sans compromis sur la qualité." },
              { icon: "✅", titre: "Testé & Certifié", desc: "Chaque lot est testé par un laboratoire tiers indépendant pour garantir la pureté." },
              { icon: "🛡️", titre: "Garanti 90 jours", desc: "Satisfait ou remboursé intégralement. Zéro risque pour vous." },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(29,185,84,0.15)",
                borderRadius: 20, padding: "32px 28px",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(29,185,84,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(29,185,84,0.4)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(29,185,84,0.15)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "rgba(29,185,84,0.1)",
                  border: "1px solid rgba(29,185,84,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 20,
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 12 }}>
                  {item.titre}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <section style={{ padding: "100px 60px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
              TÉMOIGNAGES
            </p>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800 }}>
              Ils Ont Transformé Leur Santé
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { nom: "Marie Ange", img: "/images/astaxanthine/designfreek-ai-generated-8702314-1.jpg", note: 5, texte: "Ma peau n'a jamais été aussi lumineuse. Depuis l'Astaxanthine NUTRELIS, mon teint est éclatant et mes imperfections ont disparu.", semaines: "3 semaines" },
              { nom: "Christine", img: "/images/astaxanthine/counselling-woman-628928-1.jpg", note: 5, texte: "Un vrai boost d'énergie au quotidien. Ma fatigue a disparu et ma peau est plus nette. NUTRELIS est devenu indispensable.", semaines: "6 semaines" },
              { nom: "Audrey", img: "/images/astaxanthine/awala-bride-5521283-1.jpg", note: 5, texte: "Ma peau est plus ferme et mes ridules moins visibles. Mon visage paraît plus jeune. Des résultats naturels et durables.", semaines: "8 semaines" },
            ].map((avis, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(29,185,84,0.15)",
                borderRadius: 20, padding: "28px",
              }}>
                <div style={{ color: "var(--accent)", fontSize: 18, marginBottom: 16 }}>★★★★★</div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>
                  &ldquo;{avis.texte}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--accent)" }}>
                      <img src={avis.img} alt={avis.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{avis.nom}</p>
                      <p style={{ color: "var(--accent)", fontSize: 11, fontWeight: 600 }}>✓ Client vérifié</p>
                    </div>
                  </div>
                  <span style={{ background: "rgba(29,185,84,0.1)", color: "var(--accent)", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                    {avis.semaines}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        padding: "100px 60px",
        background: "radial-gradient(ellipse at 50% 50%, rgba(29,185,84,0.12) 0%, transparent 70%)",
        textAlign: "center",
        borderTop: "1px solid rgba(29,185,84,0.1)",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
            COMMENCEZ AUJOURD&apos;HUI
          </p>
          <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>
            Transformez Votre Santé avec NUTRELIS
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, lineHeight: 1.8, marginBottom: 40 }}>
            Rejoignez plus de 12 000 clients qui ont déjà transformé leur quotidien avec nos compléments premium.
          </p>
          <Link href="/produits/astaxanthine-12mg" style={{
            display: "inline-block",
            background: "var(--accent)", color: "#fff",
            padding: "20px 56px", borderRadius: 14,
            fontSize: 17, fontWeight: 900, textDecoration: "none",
            fontFamily: "var(--font-sora), sans-serif",
            boxShadow: "0 8px 40px rgba(29,185,84,0.4)",
            marginBottom: 20,
          }}>
            Commander maintenant — 70% OFF →
          </Link>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            ✅ Garantie satisfait ou remboursé 90 jours · Livraison gratuite
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#030a04",
        borderTop: "1px solid rgba(29,185,84,0.1)",
        padding: "60px 60px 40px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, marginBottom: 48 }}>
            {/* Logo + description */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 16 }}>N</div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "var(--font-sora), sans-serif" }}>NUTRELIS</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.8, maxWidth: 280 }}>
                Compléments alimentaires premium, formulés avec des ingrédients naturels cliniquement dosés.
              </p>
            </div>

            {/* Liens */}
           {[
              { titre: "Produits", liens: [
                { label: "Astaxanthine 12mg", href: "/produits/astaxanthine-12mg" },
                { label: "Collagène Marin", href: "#" },
                { label: "Oméga-3", href: "#" },
              ]},
              { titre: "Entreprise", liens: [
                { label: "À propos", href: "/a-propos" },
                { label: "Science", href: "/science" },
                { label: "Blog", href: "/blog" },
              ]},
              { titre: "Support", liens: [
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
                { label: "Livraison", href: "/livraison" },
                { label: "Retours", href: "/retours" },
              ]},
            ].map((col, i) => (
              <div key={i}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 20 }}>{col.titre}</p>
                {col.liens.map((lien, j) => (
                  <Link key={j} href={lien.href} style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 12, textDecoration: "none" }}>
                    {lien.label}
                  </Link>
                ))}
              </div>
            ))}
            </div>
        </div>
      </footer>
    </main>
  );
}