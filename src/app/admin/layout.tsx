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
