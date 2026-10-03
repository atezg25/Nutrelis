"use client";
import { use, useEffect, useState } from "react";

/**
 * BORDEREAU DE COLIS — à imprimer et coller sur le colis (format A5 paysage ou portrait). Expéditeur, destinataire, contenu,
 * transporteur, et SURTOUT la somme à encaisser à la remise (ou la mention « payé, ne rien encaisser »).
 */
type Donnees = {
  colis: Record<string, string | number | boolean | null>;
  items: { name: string; qty: number }[];
  expediteur: { nom: string; telephone: string; adresse: string };
};

export default function Bordereau({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [d, setD] = useState<Donnees | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    void fetch(`/api/admin/shipments/${id}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? setD((await r.json()) as Donnees) : setErreur(r.status === 401 ? "Connectez-vous à la console pour imprimer ce bordereau." : "Colis introuvable.")))
      .catch(() => setErreur("Chargement impossible."));
  }, [id]);

  if (erreur) return <p style={{ padding: 30, fontFamily: "system-ui" }}>{erreur}</p>;
  if (!d) return <p style={{ padding: 30, fontFamily: "system-ui" }}>Chargement…</p>;
  const c = d.colis;
  const cod = Number(c.cod_fcfa ?? 0);
  // Colis déjà livré : la somme a été remise au livreur. Un bordereau réimprimé ne doit PAS redemander de l'argent.
  const encaisse = cod > 0 && c.cod_collected === true;
  const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: 16, fontFamily: "system-ui, sans-serif", color: "#000" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } @page { size: A5; margin: 8mm; } }`}</style>
      <div className="no-print" style={{ maxWidth: 560, margin: "0 auto 14px", display: "flex", gap: 10 }}>
        <button onClick={() => window.print()} style={{ background: "#1f7a3a", color: "#fff", border: 0, borderRadius: 9, padding: "11px 18px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>🖨️ Imprimer</button>
        <button onClick={() => window.close()} style={{ background: "#fff", border: "1px solid #bbb", borderRadius: 9, padding: "11px 18px", cursor: "pointer", fontSize: 15 }}>Fermer</button>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", border: "3px solid #000", padding: 18, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid #000", paddingBottom: 8 }}>
          <strong style={{ fontSize: 22, letterSpacing: 1 }}>{d.expediteur.nom || "NUTRELIS"}</strong>
          <strong style={{ fontSize: 22 }}>{String(c.number)}</strong>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>EXPÉDITEUR</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{d.expediteur.nom || "NUTRELIS"}<br />{d.expediteur.telephone && <>Tél. {d.expediteur.telephone}<br /></>}{d.expediteur.adresse}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>TRANSPORTEUR</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{String(c.carrier_name ?? "—")}{c.carrier_phone ? <><br />Tél. {String(c.carrier_phone)}</> : null}{c.tracking ? <><br />Suivi : <strong>{String(c.tracking)}</strong></> : null}</div>
          </div>
        </div>
        <div style={{ border: "2px solid #000", padding: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>DESTINATAIRE</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{String(c.customer_name)}</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{String(c.phone)}</div>
          <div style={{ fontSize: 17, marginTop: 4 }}>{[c.address, c.city].filter(Boolean).join(", ") || "—"}</div>
          {c.order_notes ? <div style={{ fontSize: 13, marginTop: 6 }}>Note du client : {String(c.order_notes)}</div> : null}
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>CONTENU</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{d.items.map((i, k) => <div key={k}>{i.qty} × {i.name}</div>)}</div>
        </div>
        <div style={{ border: "3px solid #000", padding: 12, textAlign: "center", background: cod > 0 && !encaisse ? "#000" : "#fff", color: cod > 0 && !encaisse ? "#fff" : "#000" }}>
          {encaisse ? (
            <><div style={{ fontSize: 22, fontWeight: 900 }}>DÉJÀ ENCAISSÉ</div><div style={{ fontSize: 14 }}>{fcfa(cod)} remis à la livraison : ne rien encaisser</div></>
          ) : cod > 0 ? (
            <><div style={{ fontSize: 13, letterSpacing: 2, fontWeight: 700 }}>À ENCAISSER À LA REMISE</div><div style={{ fontSize: 34, fontWeight: 900 }}>{fcfa(cod)}</div></>
          ) : (
            <><div style={{ fontSize: 22, fontWeight: 900 }}>PAYÉ</div><div style={{ fontSize: 14 }}>Ne rien encaisser auprès du destinataire</div></>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#444" }}>Expédié le {new Date(String(c.shipped_at)).toLocaleDateString("fr-FR")} · Fragile : manipuler avec soin · Suivi : nutrelis.bio/suivi</div>
      </div>
    </div>
  );
}
