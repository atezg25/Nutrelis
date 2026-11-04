import { query } from "./db";
import { notifierBoutique } from "./notifier";

/**
 * Rappel quotidien des livraisons programmées (Telegram + e-mail, via les destinataires des alertes de la console).
 * Envoyé chaque jour à partir de 7 h (heure du Cameroun) tant qu'il y a des commandes EN RETARD, À LIVRER AUJOURD'HUI ou DEMAIN.
 * Deux serveurs tournent : la table `rappel_livraison` (un jour = une ligne) garantit UN SEUL envoi par jour.
 */
const HEURE_ENVOI = 7;

type Ligne = { number: string; customer_name: string; phone: string; city: string | null; address: string | null; total_fcfa: number; payment_status: string; jour: string; ecart: number; resume: string | null };

const PAIEMENT: Record<string, string> = { payee: "payée", en_attente: "paiement en attente", a_la_livraison: "à encaisser à la livraison", echouee: "paiement échoué", remboursee: "remboursée" };

function ligneTexte(l: Ligne): string {
  const lieu = [l.city, l.address].filter(Boolean).join(", ") || "adresse non précisée";
  return `• ${l.number} — ${l.customer_name} (${l.phone})\n  ${l.resume ?? ""}\n  ${lieu} — ${l.total_fcfa.toLocaleString("fr-FR")} FCFA, ${PAIEMENT[l.payment_status] ?? l.payment_status}`;
}

export async function envoyerRappelsLivraison(forcer = false): Promise<{ envoye: boolean; commandes: number }> {
  const maintenant = await query<{ jour: string; heure: number }>(
    "SELECT to_char((now() AT TIME ZONE 'Africa/Douala')::date, 'YYYY-MM-DD') AS jour, extract(hour FROM now() AT TIME ZONE 'Africa/Douala')::int AS heure",
  );
  const { jour, heure } = maintenant[0]!;
  if (!forcer && heure < HEURE_ENVOI) return { envoye: false, commandes: 0 };

  const rows = await query<Ligne>(
    `SELECT o.number, o.customer_name, o.phone, o.city, o.address, o.total_fcfa, o.payment_status,
            to_char(o.deliver_on, 'YYYY-MM-DD') AS jour,
            (o.deliver_on - $1::date) AS ecart,
            (SELECT string_agg(i.qty || ' × ' || i.name, ', ') FROM order_item i WHERE i.order_id = o.id) AS resume
       FROM customer_order o
      WHERE o.deliver_on IS NOT NULL AND o.status NOT IN ('livree','annulee') AND o.deliver_on <= $1::date + 1
      ORDER BY o.deliver_on, o.created_at`,
    [jour],
  );
  if (rows.length === 0) return { envoye: false, commandes: 0 };

  if (!forcer) {
    const pris = await query("INSERT INTO rappel_livraison (jour) VALUES ($1::date) ON CONFLICT (jour) DO NOTHING RETURNING jour", [jour]);
    if (pris.length === 0) return { envoye: false, commandes: rows.length }; // déjà envoyé aujourd'hui (par l'autre serveur ou plus tôt)
  }

  const retard = rows.filter((r) => Number(r.ecart) < 0);
  const aujourdhui = rows.filter((r) => Number(r.ecart) === 0);
  const demain = rows.filter((r) => Number(r.ecart) === 1);
  const parties: string[] = [];
  if (retard.length) parties.push(`🔴 EN RETARD (${retard.length})\n${retard.map((r) => `${ligneTexte(r)}\n  prévue le ${r.jour}`).join("\n")}`);
  if (aujourdhui.length) parties.push(`🟠 À LIVRER AUJOURD'HUI (${aujourdhui.length})\n${aujourdhui.map(ligneTexte).join("\n")}`);
  if (demain.length) parties.push(`🔵 À PRÉPARER POUR DEMAIN (${demain.length})\n${demain.map(ligneTexte).join("\n")}`);
  const sujet = `📅 Livraisons programmées — ${aujourdhui.length} aujourd'hui, ${retard.length} en retard, ${demain.length} demain`;
  await notifierBoutique(sujet, `${parties.join("\n\n")}\n\nDétail : https://nutrelis.bio/admin (Commandes > « À livrer aujourd'hui ou en retard »)`);
  return { envoye: true, commandes: rows.length };
}

/** Vérifie toutes les 10 minutes si le rappel du jour doit partir (démarré une fois par processus). */
export function demarrerRappelsLivraison(): void {
  const g = globalThis as { __rappelsLivraison?: boolean };
  if (g.__rappelsLivraison) return;
  g.__rappelsLivraison = true;
  const tick = () => { void envoyerRappelsLivraison().catch((e) => console.error("[nutrelis] rappel livraison", e instanceof Error ? e.message : e)); };
  setTimeout(tick, 60_000).unref?.();
  setInterval(tick, 10 * 60_000).unref?.();
}
