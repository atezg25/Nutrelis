import type { Metadata } from "next";
import Reveler from "@/components/Reveler";

// L'administration ne doit JAMAIS être indexée.
export const metadata: Metadata = {
  title: "NUTRELIS — Administration",
  robots: { index: false, follow: false },
};

/** Apparence de la console : retours au survol / au clic / au clavier, tableaux lisibles, défilement doux. Portée : `.nx-admin` seulement. */
const STYLE = `
.nx-admin { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; font-feature-settings: "cv11", "ss01"; }
.nx-admin ::selection { background: #bbf7d0; color: #052e16; }
.nx-admin button, .nx-admin a, .nx-admin input, .nx-admin select, .nx-admin textarea { transition: background-color .15s ease, border-color .15s ease, box-shadow .15s ease, color .15s ease, transform .1s ease, opacity .15s ease; font-family: inherit; }
.nx-admin button:not(:disabled):hover { filter: brightness(.96); }
.nx-admin button:not(:disabled):active { transform: translateY(1px) scale(.99); }
.nx-admin button:disabled { cursor: not-allowed; }
.nx-admin input:focus, .nx-admin select:focus, .nx-admin textarea:focus { outline: none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,.18); }
.nx-admin button:focus-visible, .nx-admin a:focus-visible { outline: 2px solid #16a34a; outline-offset: 2px; }
.nx-admin table thead th { position: sticky; top: 0; background: #f8faf8; z-index: 1; font-weight: 700; }
.nx-admin table tbody tr { transition: background-color .12s ease; }
.nx-admin table tbody tr:hover { background: #f4faf5; }
.nx-admin table tbody tr:last-child { border-bottom: 0 !important; }
.nx-admin h1, .nx-admin h2, .nx-admin h3 { letter-spacing: -0.01em; }
.nx-admin ::-webkit-scrollbar { height: 10px; width: 10px; }
.nx-admin ::-webkit-scrollbar-thumb { background: #cfd8cf; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
.nx-admin ::-webkit-scrollbar-thumb:hover { background: #aebcae; background-clip: padding-box; border: 2px solid transparent; }
@keyframes nx-apparition { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.nx-admin main > div, .nx-admin main > p { animation: nx-apparition .25s ease both; }
/* ===== MOBILE (téléphone / petite tablette) ===== */
.nx-admin { overflow-x: hidden; }
.nx-admin img, .nx-admin video { max-width: 100%; }
.nx-admin td, .nx-admin th { overflow-wrap: anywhere; }
@media (max-width: 860px) {
  /* Zones tactiles >= 44 px ; 16 px dans les champs : iOS ne zoome plus tout seul à la saisie. */
  .nx-admin button, .nx-admin a[style*="border-radius"], .nx-admin select { min-height: 44px; }
  .nx-admin input, .nx-admin select, .nx-admin textarea { font-size: 16px !important; min-height: 44px; max-width: 100%; width: 100%; box-sizing: border-box; }
  .nx-admin input[type="checkbox"], .nx-admin input[type="radio"] { width: 22px; min-height: 22px; }
  /* Formulaires en colonnes -> une seule colonne (les grilles « auto-fit » se replient déjà toutes seules). */
  .nx-admin [style*="grid-template-columns"]:not([style*="auto-fit"]):not([style*="auto-fill"]) { grid-template-columns: minmax(0, 1fr) !important; }
  /* Tableaux -> cartes empilées : chaque ligne devient une fiche, chaque cellule porte son intitulé (data-label). */
  .nx-admin table.nx-table, .nx-admin table.nx-table tbody, .nx-admin table.nx-table tr, .nx-admin table.nx-table td { display: block; width: 100%; box-sizing: border-box; }
  .nx-admin table.nx-table thead { display: none; }
  .nx-admin table.nx-table tbody tr { border: 1px solid #e3e9e3 !important; border-radius: 14px; margin: 0 0 10px; padding: 6px 4px; background: #fff; box-shadow: 0 1px 2px rgba(16,24,20,.04); }
  .nx-admin table.nx-table tbody tr:hover { background: #fff; }
  .nx-admin table.nx-table td { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; padding: 8px 12px !important; text-align: right; border: 0; }
  .nx-admin table.nx-table td::before { content: attr(data-label); flex-shrink: 0; max-width: 42%; text-align: left; color: #5b665e; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; padding-top: 2px; }
  .nx-admin table.nx-table td > * { text-align: right; }
  .nx-admin table.nx-table td[colspan] { display: block; text-align: center; }
  .nx-admin table.nx-table td[colspan]::before { content: none; }
  /* Le conteneur du tableau n'a plus besoin de défiler ni de cadre : les cartes portent le cadre. */
  .nx-admin div:has(> table.nx-table) { border: 0 !important; box-shadow: none !important; background: transparent !important; overflow: visible !important; }
  .nx-admin main { padding-left: 0 !important; padding-right: 0 !important; }
}
/* Barre d'onglets du bas : visible sur téléphone seulement. */
.nx-bottom-nav { display: none; }
@media (max-width: 860px) {
  .nx-bottom-nav { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; background: rgba(255,255,255,.96); backdrop-filter: blur(10px); border-top: 1px solid #e3e9e3; padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -4px 16px rgba(16,24,20,.06); }
  .nx-bottom-nav button { display: flex; flex-direction: column; align-items: center; gap: 2px; border: 0; background: transparent; padding: 6px 2px; border-radius: 12px; font-size: 11px; font-weight: 700; color: #5b665e; position: relative; min-height: 48px; }
  .nx-bottom-nav button[aria-current="page"] { color: #15803d; background: #e8f5eb; }
  .nx-bottom-nav .ico { font-size: 20px; line-height: 1; }
  .nx-bottom-nav .pastille { position: absolute; top: 2px; right: calc(50% - 22px); background: #b91c1c; color: #fff; border-radius: 999px; font-size: 10px; min-width: 18px; padding: 1px 5px; line-height: 14px; }
}
@media (prefers-reduced-motion: reduce) { .nx-admin * { animation: none !important; transition: none !important; } }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nx-admin" style={{ background: "#f3f6f3", minHeight: "100vh", color: "#16201a", fontFamily: "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <Reveler />
      {children}
    </div>
  );
}
