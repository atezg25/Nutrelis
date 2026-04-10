"use client";
import { useState } from "react";
import Link from "next/link";
import NavbarCart from "@/components/NavbarCart";
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: "1px solid #e8e8e8", padding: "22px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.4 }}>{q}</span>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--accent)", fontSize: 20, fontWeight: 700 }}>
          {open ? "−" : "+"}
        </div>
      </div>
      {open && <div style={{ color: "#555", fontSize: 15, lineHeight: 1.8, marginTop: 16, paddingRight: 48 }}>{a}</div>}
    </div>
  );
}

const categories = [
  {
    titre: "🌿 Le produit",
    faqs: [
      { q: "C'est quoi exactement l'astaxanthine ?", a: "L'Astaxanthine est un antioxydant naturel extrêmement puissant, extrait d'une micro-algue appelée Haematococcus pluvialis. C'est elle qui donne naturellement leur couleur rouge aux saumons sauvages, aux crevettes et aux flamants roses. Elle est 6000× plus puissante que la Vitamine C, 1800× plus que le CoQ10, et 550× plus que le thé vert. Elle est étudiée pour : la peau, les yeux, l'énergie, la récupération et le vieillissement cellulaire." },
      { q: "Quelle est la composition exacte de NUTRELIS Astaxanthine ?", a: "Notre unique ingrédient actif est l'Astaxanthine, issue de la micro-algue Haematococcus pluvialis (12mg par gélule). L'enveloppe de la gélule est composée de Gélatine et d'Eau Purifiée. C'est tout. Aucun additif, aucun liant, aucun colorant artificiel." },
      { q: "Pourquoi NUTRELIS utilise 12mg et pas moins ?", a: "95% de l'astaxanthine vendue sur le marché contient 4 à 6mg — insuffisant pour obtenir les effets documentés par les études cliniques. Les recherches qui démontrent les bénéfices sur la peau, l'énergie et la protection cellulaire utilisent systématiquement des doses de 8 à 12mg par jour. Chez NUTRELIS, nous refusons de vous sous-doser pour augmenter nos marges." },
      { q: "L'astaxanthine NUTRELIS est-elle naturelle ou synthétique ?", a: "100% naturelle. Notre astaxanthine est cultivée naturellement à Hawaï à partir de la micro-algue Haematococcus pluvialis. La forme naturelle est jusqu'à 50× plus biodisponible que la version synthétique. Nous ne faisons aucun compromis sur ce point." },
      { q: "Est-ce vegan / sans gluten ?", a: "Notre Astaxanthine est issue de micro-algues donc 100% d'origine végétale. Les gélules sont à base de gélatine (donc non vegan pour la gélule elle-même, mais le contenu est vegan). Le produit est sans gluten, sans lactose, sans colorants artificiels." },
    ]
  },
  {
    titre: "⏱️ Résultats & Utilisation",
    faqs: [
      { q: "Combien de temps avant de voir les premiers résultats ?", a: "La majorité de nos clients remarquent des premiers effets après 10 à 15 jours : peau plus lumineuse, moins de fatigue visuelle, énergie plus stable. Les résultats les plus visibles apparaissent après 4 à 6 semaines d'utilisation quotidienne. Après 8-12 semaines : transformation complète, peau visiblement plus jeune, élasticité restaurée, teint unifié." },
      { q: "Comment dois-je prendre l'astaxanthine ?", a: "1 gélule par jour, pendant un repas (de préférence un repas contenant des graisses — l'astaxanthine est liposoluble, les graisses améliorent son absorption). Idéalement, prenez-la toujours au même moment de la journée pour créer une routine. Pas besoin de cycles : vous pouvez la prendre en continu." },
      { q: "Est-ce adapté si j'ai la peau sensible ?", a: "Oui. L'Astaxanthine aide précisément à réduire l'inflammation et les rougeurs. Beaucoup de clients avec une peau sensible ou réactive la préfèrent à d'autres antioxydants plus irritants. Elle agit de l'intérieur, sans contact direct avec la peau." },
      { q: "Quel est le meilleur moment de la journée pour la prendre ?", a: "Au moment d'un repas contenant des graisses (déjeuner ou dîner). Les matières grasses améliorent l'absorption des caroténoïdes. Évitez de la prendre à jeun — cela réduit l'absorption sans danger particulier, mais c'est moins efficace." },
    ]
  },
  {
    titre: "🔒 Sécurité & Compatibilité",
    faqs: [
      { q: "Est-ce vraiment sans danger ?", a: "100% safe. L'astaxanthine est l'un des compléments les plus étudiés et les plus sûrs au monde. Aucun effet secondaire connu, même à long terme. Des millions de personnes en prennent quotidiennement au Japon depuis des décennies. La FDA américaine lui a accordé le statut GRAS (Generally Recognized As Safe)." },
      { q: "Est-ce compatible avec d'autres compléments ?", a: "Oui dans la majorité des cas. L'Astaxanthine se combine très bien avec collagène, oméga-3, magnésium, zinc, vitamine D, etc. Elle est particulièrement synergique avec les oméga-3. Si vous suivez un traitement médical, demandez toujours conseil à votre médecin avant de commencer un complément." },
      { q: "Peut-on le prendre pendant la grossesse ou l'allaitement ?", a: "Par précaution, nous déconseillons la prise pendant la grossesse et l'allaitement, faute d'études suffisantes sur ces populations. Consultez votre médecin ou sage-femme avant toute supplémentation." },
      { q: "Est-ce que ça protège du soleil ?", a: "L'Astaxanthine agit comme un bouclier interne contre les UV. Elle ne remplace pas une crème solaire externe, mais elle réduit l'impact du stress solaire sur les cellules et aide la peau à mieux se défendre contre les dommages photo-induits. Utilisez-la en complément de votre protection solaire habituelle." },
    ]
  },
  {
    titre: "📦 Commande & Livraison",
    faqs: [
      { q: "Comment passer commande ?", a: "Rendez-vous sur la page produit, choisissez votre pack (1, 2 ou 3 boîtes), sélectionnez le mode de paiement et confirmez votre commande. Vous recevrez un email de confirmation avec votre numéro de suivi sous 24h." },
      { q: "Quels sont les délais de livraison ?", a: "Livraison standard gratuite via ATEZ Express : 4 à 7 jours ouvrés. Livraison express payante : 1 à 2 jours ouvrés. Toutes les commandes sont expédiées sous 24 heures après confirmation du paiement." },
      { q: "Comment fonctionne l'abonnement mensuel ?", a: "L'abonnement vous permet de recevoir automatiquement votre commande chaque mois via ATEZ Express. Vous bénéficiez de -15% sur chaque livraison. Aucun engagement — vous annulez quand vous voulez depuis votre espace client, sans frais." },
      { q: "Dans quels pays livrez-vous ?", a: "Nous livrons actuellement au Cameroun. Nous travaillons activement à étendre notre service à d'autres pays d'Afrique francophone. Contactez-nous pour être prévenu dès que votre pays est disponible." },
    ]
  },
  {
    titre: "↩️ Retours & Garantie",
    faqs: [
      { q: "Qu'est-ce que la garantie 90 jours ?", a: "Si vous ne constatez pas d'améliorations visibles dans les 90 jours suivant votre commande, contactez notre service client et nous vous remboursons intégralement — sans poser de questions, sans complications, sans frais de retour à votre charge." },
      { q: "Comment faire valoir la garantie ?", a: "Envoyez-nous un email à contact@nutrelis.com avec votre numéro de commande et la raison de votre demande. Notre équipe vous répond dans les 24-48h et traite votre remboursement sans tracas." },
      { q: "Puis-je retourner un produit ouvert ?", a: "Oui, dans le cadre de la garantie 90 jours. Nous faisons confiance à nos clients. Si le produit n'a pas donné les résultats attendus après utilisation régulière, nous vous remboursons même si la boîte est entamée." },
    ]
  },
];

export default function FAQ() {
  const [activecat, setActivecat] = useState(0);

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
        <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>FOIRE AUX QUESTIONS</p>
        <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#f0fff4", marginBottom: 16 }}>
          Toutes vos questions,<br /><span style={{ color: "var(--accent)" }}>toutes nos réponses</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          Vous ne trouvez pas la réponse ?{" "}
          <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Contactez-nous</Link>
        </p>
      </section>

      {/* FAQ CONTENU */}
      <section style={{ padding: "72px 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Onglets catégories */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            {categories.map((cat, i) => (
              <button key={i} onClick={() => setActivecat(i)} style={{
                padding: "10px 20px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer",
                border: "1.5px solid",
                borderColor: activecat === i ? "var(--accent)" : "#ddd",
                background: activecat === i ? "#e8f5eb" : "#fff",
                color: activecat === i ? "var(--accent)" : "#555",
                transition: "all 0.2s",
              }}>
                {cat.titre}
              </button>
            ))}
          </div>

          {/* FAQs actives */}
          <div>
            {categories[activecat].faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#f0faf2", padding: "72px 60px", textAlign: "center", borderTop: "1px solid #c8e6d0" }}>
        <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 800, marginBottom: 16 }}>
          Une autre question ?
        </h2>
        <p style={{ color: "#555", fontSize: 16, marginBottom: 36 }}>Notre équipe répond en moins de 24h</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/contact" style={{ background: "var(--accent)", color: "#060f08", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
            Nous contacter →
          </Link>
          <Link href="/produits/astaxanthine-12mg" style={{ background: "#fff", color: "var(--accent)", padding: "16px 40px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1.5px solid var(--accent)" }}>
            Voir le produit
          </Link>
        </div>
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