"use client";
import { useCallback, useEffect, useState } from "react";

// ============================================================
// Administration NUTRELIS : commandes, paiements, stock, produits, revendeurs.
// Un seul écran à onglets. Tout passe par /api/admin/* (cookie signé, mot de passe unique).
// ============================================================
type Ligne = Record<string, string | number | boolean | null>;
type Onglet = "tableau" | "commandes" | "paiements" | "stock" | "produits" | "revendeurs";

const VERT = "#1f7a3a";
const fcfa = (n: unknown) => `${Number(n ?? 0).toLocaleString("fr-FR")} FCFA`;
const date = (s: unknown) => (s ? new Date(String(s)).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");

const LIB_STATUT: Record<string, string> = { nouvelle: "Nouvelle", confirmee: "Confirmée", expediee: "Expédiée", livree: "Livrée", annulee: "Annulée" };
const LIB_PAIEMENT: Record<string, string> = { en_attente: "En attente", payee: "Payée", echouee: "Échouée", a_la_livraison: "À la livraison", remboursee: "Remboursée" };
const LIB_MODE: Record<string, string> = { fapshi: "Mobile Money (Fapshi)", livraison: "À la livraison", especes: "Espèces", virement: "Virement" };
const LIB_CANAL: Record<string, string> = { web: "Site", revendeur: "Revendeur", manuel: "Saisie" };
const COULEUR_STATUT: Record<string, string> = { nouvelle: "#b45309", confirmee: "#1d4ed8", expediee: "#6d28d9", livree: VERT, annulee: "#b91c1c" };
const COULEUR_PAIEMENT: Record<string, string> = { en_attente: "#b45309", payee: VERT, echouee: "#b91c1c", a_la_livraison: "#1d4ed8", remboursee: "#6b7280" };

async function api<T = Ligne>(chemin: string, options?: { method?: string; body?: unknown }): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const res = await fetch(`/api/admin/${chemin}`, {
    method: options?.method ?? "GET",
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, status: res.status, data };
}

function Badge({ texte, couleur }: { texte: string; couleur: string }) {
  return <span style={{ background: `${couleur}1a`, color: couleur, padding: "2px 9px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{texte}</span>;
}

const carte: React.CSSProperties = { background: "#fff", border: "1px solid #e4e7e2", borderRadius: 14, padding: 16 };
const champ: React.CSSProperties = { border: "1px solid #cfd5cc", borderRadius: 9, padding: "8px 10px", fontSize: 14, background: "#fff", minWidth: 0 };
const bouton: React.CSSProperties = { background: VERT, color: "#fff", border: 0, borderRadius: 9, padding: "9px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const boutonDiscret: React.CSSProperties = { ...bouton, background: "#fff", color: "#1a1a1a", border: "1px solid #cfd5cc" };

function Tableau({ colonnes, lignes, onClic }: { colonnes: { titre: string; rendu: (l: Ligne) => React.ReactNode }[]; lignes: Ligne[]; onClic?: (l: Ligne) => void }) {
  return (
    <div style={{ ...carte, padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>{colonnes.map((c) => <th key={c.titre} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e4e7e2", color: "#555", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>{c.titre}</th>)}</tr>
        </thead>
        <tbody>
          {lignes.length === 0 && <tr><td colSpan={colonnes.length} style={{ padding: 18, color: "#777" }}>Rien à afficher.</td></tr>}
          {lignes.map((l, i) => (
            <tr key={String(l.id ?? i)} onClick={onClic ? () => onClic(l) : undefined} style={{ cursor: onClic ? "pointer" : "default", borderBottom: "1px solid #f0f2ee" }}>
              {colonnes.map((c) => <td key={c.titre} style={{ padding: "10px 12px", verticalAlign: "top" }}>{c.rendu(l)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- Connexion
function Connexion({ onOk }: { onOk: () => void }) {
  const [mdp, setMdp] = useState("");
  const [err, setErr] = useState("");
  const [charge, setCharge] = useState(false);
  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErr("");
    const r = await api("login", { method: "POST", body: { password: mdp } });
    setCharge(false);
    if (r.ok) onOk(); else setErr(r.data.error ?? "Connexion impossible.");
  }
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={envoyer} style={{ ...carte, width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>NUTRELIS — Administration</h1>
        <input type="password" autoFocus value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="Mot de passe" style={champ} />
        {err && <div style={{ color: "#b91c1c", fontSize: 13 }}>{err}</div>}
        <button type="submit" disabled={charge || !mdp} style={{ ...bouton, opacity: charge || !mdp ? 0.6 : 1 }}>Se connecter</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- Tableau de bord
function TableauDeBord({ ouvrir }: { ouvrir: (o: Onglet) => void }) {
  const [d, setD] = useState<{ chiffres: Ligne; stockFaible: Ligne[]; derniers: Ligne[] } | null>(null);
  useEffect(() => { void api<{ chiffres: Ligne; stockFaible: Ligne[]; derniers: Ligne[] }>("stats").then((r) => r.ok && setD(r.data)); }, []);
  if (!d) return <p>Chargement…</p>;
  const c = d.chiffres;
  const tuiles: [string, string, Onglet?][] = [
    ["Commandes aujourd'hui", String(c.commandes_jour), "commandes"],
    ["Encaissé aujourd'hui", fcfa(c.ca_jour), "paiements"],
    ["Encaissé ce mois", fcfa(c.ca_mois), "paiements"],
    ["À traiter", String(c.a_traiter), "commandes"],
    ["Pas encore payées", String(c.impayees), "paiements"],
  ];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        {tuiles.map(([t, v, o]) => (
          <button key={t} onClick={() => o && ouvrir(o)} style={{ ...carte, textAlign: "left", cursor: "pointer" }}>
            <div style={{ fontSize: 12.5, color: "#666" }}>{t}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{v}</div>
          </button>
        ))}
      </div>
      {d.stockFaible.length > 0 && (
        <div style={{ ...carte, borderColor: "#f1c27d", background: "#fffaf0" }}>
          <strong>⚠️ Stock bas ou épuisé</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {d.stockFaible.map((s) => <li key={String(s.sku)}>{String(s.pname)} — {String(s.label)} : <strong>{String(s.stock)}</strong> en stock</li>)}
          </ul>
          <button onClick={() => ouvrir("stock")} style={{ ...boutonDiscret, marginTop: 10 }}>Réapprovisionner</button>
        </div>
      )}
      <div>
        <h3 style={{ margin: "4px 0 8px" }}>Dernières commandes</h3>
        <Tableau lignes={d.derniers} onClic={() => ouvrir("commandes")} colonnes={[
          { titre: "N°", rendu: (l) => String(l.number) },
          { titre: "Client", rendu: (l) => String(l.customer_name) },
          { titre: "Total", rendu: (l) => fcfa(l.total_fcfa) },
          { titre: "Statut", rendu: (l) => <Badge texte={LIB_STATUT[String(l.status)] ?? String(l.status)} couleur={COULEUR_STATUT[String(l.status)] ?? "#555"} /> },
          { titre: "Paiement", rendu: (l) => <Badge texte={LIB_PAIEMENT[String(l.payment_status)] ?? String(l.payment_status)} couleur={COULEUR_PAIEMENT[String(l.payment_status)] ?? "#555"} /> },
        ]} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Commandes
type Detail = { commande: Ligne; items: Ligne[]; paiements: Ligne[] };

function DetailCommande({ id, fermer, recharger }: { id: string; fermer: () => void; recharger: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [msg, setMsg] = useState("");
  const charger = useCallback(() => { void api<Detail>(`orders/${id}`).then((r) => r.ok && setD(r.data)); }, [id]);
  useEffect(charger, [charger]);
  async function agir(corps: Record<string, unknown>) {
    setMsg("");
    const r = await api(`orders/${id}`, { method: "PATCH", body: corps });
    if (!r.ok) setMsg(r.data.error ?? "Échec."); else { charger(); recharger(); }
  }
  if (!d) return null;
  const c = d.commande;
  const tel = String(c.phone ?? "").replace(/[^\d]/g, "");
  return (
    <div style={{ ...carte, marginBottom: 14, borderColor: VERT }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Commande {String(c.number)} — {LIB_CANAL[String(c.channel)]}{c.reseller_name ? ` (${String(c.reseller_name)})` : ""}</h3>
        <button onClick={fermer} style={boutonDiscret}>Fermer</button>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 12 }}>
        <div>
          <strong>{String(c.customer_name)}</strong><br />
          {String(c.phone)} {c.email ? <>· {String(c.email)}</> : null}<br />
          {[c.address, c.city].filter(Boolean).join(", ")}
          {c.notes ? <><br /><em>« {String(c.notes)} »</em></> : null}
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={`tel:+${tel}`} style={{ ...boutonDiscret, textDecoration: "none" }}>Appeler</a>
            <a href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer" style={{ ...boutonDiscret, textDecoration: "none" }}>WhatsApp</a>
          </div>
        </div>
        <div>
          {d.items.map((i, k) => <div key={k}>{String(i.qty)} × {String(i.name)} — {fcfa(Number(i.unit_fcfa) * Number(i.qty))}</div>)}
          {Number(c.delivery_fcfa) > 0 && <div>Livraison — {fcfa(c.delivery_fcfa)}</div>}
          <div style={{ marginTop: 6, fontWeight: 800 }}>Total {fcfa(c.total_fcfa)}</div>
          <div style={{ marginTop: 6 }}>
            <Badge texte={LIB_PAIEMENT[String(c.payment_status)] ?? ""} couleur={COULEUR_PAIEMENT[String(c.payment_status)] ?? "#555"} /> {LIB_MODE[String(c.payment_method)]}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#555" }}>Statut :</span>
        {(["nouvelle", "confirmee", "expediee", "livree", "annulee"] as const).map((s) => (
          <button key={s} onClick={() => void agir({ statut: s })} style={{ ...boutonDiscret, ...(c.status === s ? { background: COULEUR_STATUT[s], color: "#fff", borderColor: COULEUR_STATUT[s] } : {}) }}>{LIB_STATUT[s]}</button>
        ))}
      </div>
      {c.payment_status !== "payee" && c.status !== "annulee" && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#555" }}>Marquer comme payée :</span>
          <button onClick={() => void agir({ paiementRecu: "especes" })} style={bouton}>Espèces</button>
          <button onClick={() => void agir({ paiementRecu: "virement" })} style={bouton}>Virement</button>
          <button onClick={() => void agir({ paiementRecu: "livraison" })} style={bouton}>Payée à la livraison</button>
        </div>
      )}
      {d.paiements.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
          Paiements en ligne : {d.paiements.map((p, k) => <span key={k}>[{String(p.provider)} {String(p.provider_ref ?? "")} · {LIB_PAIEMENT[String(p.status)]}{p.provider_status ? ` (${String(p.provider_status)})` : ""}] </span>)}
        </div>
      )}
      {msg && <div style={{ color: "#b91c1c", marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

function NouvelleCommande({ fait, annuler }: { fait: () => void; annuler: () => void }) {
  const [produits, setProduits] = useState<Ligne[]>([]);
  const [revendeurs, setRevendeurs] = useState<Ligne[]>([]);
  const [revendeurId, setRevendeurId] = useState("");
  const [client, setClient] = useState({ nom: "", telephone: "", ville: "", adresse: "" });
  const [lignes, setLignes] = useState<{ variantId: string; qty: number }[]>([{ variantId: "", qty: 1 }]);
  const [mode, setMode] = useState("especes");
  const [paye, setPaye] = useState(true);
  const [err, setErr] = useState("");
  useEffect(() => {
    void api<{ variantes: Ligne[] }>("products").then((r) => r.ok && setProduits(r.data.variantes ?? []));
    void api<{ revendeurs: Ligne[] }>("resellers").then((r) => r.ok && setRevendeurs((r.data.revendeurs ?? []).filter((x) => x.active)));
  }, []);
  async function valider() {
    setErr("");
    const r = await api("orders", { method: "POST", body: { lignes: lignes.filter((l) => l.variantId), client, mode, revendeurId: revendeurId || undefined, paiementRecu: paye } });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else fait();
  }
  return (
    <div style={{ ...carte, marginBottom: 14, display: "grid", gap: 10 }}>
      <h3 style={{ margin: 0 }}>Nouvelle commande (vente directe ou revendeur)</h3>
      <select value={revendeurId} onChange={(e) => setRevendeurId(e.target.value)} style={champ}>
        <option value="">Vente directe (prix public)</option>
        {revendeurs.map((r) => <option key={String(r.id)} value={String(r.id)}>{String(r.name)} — remise {String(r.discount_pct)} %</option>)}
      </select>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <input placeholder="Nom du client" value={client.nom} onChange={(e) => setClient({ ...client, nom: e.target.value })} style={champ} />
        <input placeholder="Téléphone" value={client.telephone} onChange={(e) => setClient({ ...client, telephone: e.target.value })} style={champ} />
        <input placeholder="Ville" value={client.ville} onChange={(e) => setClient({ ...client, ville: e.target.value })} style={champ} />
        <input placeholder="Adresse" value={client.adresse} onChange={(e) => setClient({ ...client, adresse: e.target.value })} style={champ} />
      </div>
      {lignes.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: 8 }}>
          <select value={l.variantId} onChange={(e) => setLignes(lignes.map((x, k) => (k === i ? { ...x, variantId: e.target.value } : x)))} style={{ ...champ, flex: 1 }}>
            <option value="">Choisir un pack…</option>
            {produits.filter((p) => p.active).map((p) => <option key={String(p.id)} value={String(p.id)}>{String(p.label)} ({String(p.sku)}) — {fcfa(p.price_fcfa)} — stock {String(p.stock)}</option>)}
          </select>
          <input type="number" min={1} value={l.qty} onChange={(e) => setLignes(lignes.map((x, k) => (k === i ? { ...x, qty: Number(e.target.value) } : x)))} style={{ ...champ, width: 80 }} />
        </div>
      ))}
      <div><button onClick={() => setLignes([...lignes, { variantId: "", qty: 1 }])} style={boutonDiscret}>+ Ajouter un pack</button></div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={champ}>
          <option value="especes">Espèces</option><option value="virement">Virement</option><option value="livraison">À la livraison</option>
        </select>
        <label style={{ fontSize: 14 }}><input type="checkbox" checked={paye} onChange={(e) => setPaye(e.target.checked)} /> Déjà payée</label>
      </div>
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      <div style={{ display: "flex", gap: 8 }}><button onClick={() => void valider()} style={bouton}>Enregistrer la commande</button><button onClick={annuler} style={boutonDiscret}>Annuler</button></div>
    </div>
  );
}

function Commandes() {
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [statut, setStatut] = useState("");
  const [canal, setCanal] = useState("");
  const [q, setQ] = useState("");
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [nouvelle, setNouvelle] = useState(false);
  const charger = useCallback(() => {
    const p = new URLSearchParams();
    if (statut) p.set("statut", statut);
    if (canal) p.set("canal", canal);
    if (q) p.set("q", q);
    void api<{ orders: Ligne[] }>(`orders?${p}`).then((r) => r.ok && setLignes(r.data.orders ?? []));
  }, [statut, canal, q]);
  useEffect(charger, [charger]);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input placeholder="Rechercher (n°, nom, téléphone)" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...champ, flex: 1, minWidth: 200 }} />
        <select value={statut} onChange={(e) => setStatut(e.target.value)} style={champ}>
          <option value="">Tous les statuts</option>
          {Object.entries(LIB_STATUT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={canal} onChange={(e) => setCanal(e.target.value)} style={champ}>
          <option value="">Tous les canaux</option>
          {Object.entries(LIB_CANAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => setNouvelle(true)} style={bouton}>+ Nouvelle commande</button>
      </div>
      {nouvelle && <NouvelleCommande fait={() => { setNouvelle(false); charger(); }} annuler={() => setNouvelle(false)} />}
      {ouvert && <DetailCommande id={ouvert} fermer={() => setOuvert(null)} recharger={charger} />}
      <Tableau lignes={lignes} onClic={(l) => setOuvert(String(l.id))} colonnes={[
        { titre: "N°", rendu: (l) => <strong>{String(l.number)}</strong> },
        { titre: "Date", rendu: (l) => date(l.created_at) },
        { titre: "Client", rendu: (l) => <>{String(l.customer_name)}<br /><span style={{ color: "#777", fontSize: 12 }}>{String(l.phone)}{l.city ? ` · ${String(l.city)}` : ""}</span></> },
        { titre: "Commande", rendu: (l) => <span style={{ fontSize: 13 }}>{String(l.resume ?? "")}{l.reseller_name ? <><br /><em>{String(l.reseller_name)}</em></> : null}</span> },
        { titre: "Total", rendu: (l) => fcfa(l.total_fcfa) },
        { titre: "Statut", rendu: (l) => <Badge texte={LIB_STATUT[String(l.status)] ?? String(l.status)} couleur={COULEUR_STATUT[String(l.status)] ?? "#555"} /> },
        { titre: "Paiement", rendu: (l) => <Badge texte={LIB_PAIEMENT[String(l.payment_status)] ?? String(l.payment_status)} couleur={COULEUR_PAIEMENT[String(l.payment_status)] ?? "#555"} /> },
      ]} />
    </div>
  );
}

// ---------------------------------------------------------------- Paiements
function Paiements() {
  const [d, setD] = useState<{ resume: Ligne; paiements: Ligne[] } | null>(null);
  useEffect(() => { void api<{ resume: Ligne; paiements: Ligne[] }>("payments").then((r) => r.ok && setD(r.data)); }, []);
  if (!d) return <p>Chargement…</p>;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        {([["Encaissé", d.resume.encaisse], ["En attente de paiement", d.resume.en_attente], ["À encaisser à la livraison", d.resume.a_la_livraison]] as const).map(([t, v]) => (
          <div key={t} style={carte}><div style={{ fontSize: 12.5, color: "#666" }}>{t}</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fcfa(v)}</div></div>
        ))}
      </div>
      <Tableau lignes={d.paiements} colonnes={[
        { titre: "Date", rendu: (l) => date(l.created_at) },
        { titre: "Commande", rendu: (l) => <>{String(l.number)}<br /><span style={{ color: "#777", fontSize: 12 }}>{String(l.customer_name)}</span></> },
        { titre: "Moyen", rendu: (l) => (l.provider === "fapshi" ? "Fapshi" : LIB_MODE[String(l.provider)] ?? String(l.provider)) },
        { titre: "Référence", rendu: (l) => String(l.provider_ref ?? "—") },
        { titre: "Montant", rendu: (l) => fcfa(l.amount_fcfa) },
        { titre: "Résultat", rendu: (l) => <><Badge texte={LIB_PAIEMENT[String(l.status)] ?? String(l.status)} couleur={COULEUR_PAIEMENT[String(l.status)] ?? "#555"} />{l.provider_status ? <span style={{ color: "#777", fontSize: 12 }}> {String(l.provider_status)}</span> : null}</> },
      ]} />
    </div>
  );
}

// ---------------------------------------------------------------- Stock
function Stock() {
  const [d, setD] = useState<{ variantes: Ligne[]; mouvements: Ligne[] } | null>(null);
  const [f, setF] = useState({ variantId: "", delta: "", raison: "reappro", note: "" });
  const [err, setErr] = useState("");
  const charger = useCallback(() => { void api<{ variantes: Ligne[]; mouvements: Ligne[] }>("stock").then((r) => r.ok && setD(r.data)); }, []);
  useEffect(charger, [charger]);
  async function enregistrer() {
    setErr("");
    const delta = Number(f.delta);
    const r = await api("stock", { method: "POST", body: { variantId: f.variantId, delta, raison: f.raison, note: f.note } });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else { setF({ ...f, delta: "", note: "" }); charger(); }
  }
  if (!d) return <p>Chargement…</p>;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Tableau lignes={d.variantes} colonnes={[
        { titre: "Produit", rendu: (l) => String(l.product_name) },
        { titre: "Pack", rendu: (l) => <>{String(l.label)} <span style={{ color: "#777", fontSize: 12 }}>{String(l.sku)}</span></> },
        { titre: "En stock", rendu: (l) => <strong style={{ color: Number(l.stock) <= Number(l.low_stock_alert) ? "#b91c1c" : "inherit" }}>{String(l.stock)}</strong> },
        { titre: "Alerte à", rendu: (l) => String(l.low_stock_alert) },
      ]} />
      <div style={{ ...carte, display: "grid", gap: 10 }}>
        <strong>Entrée ou sortie de stock</strong>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
          <select value={f.variantId} onChange={(e) => setF({ ...f, variantId: e.target.value })} style={champ}>
            <option value="">Choisir un pack…</option>
            {d.variantes.map((v) => <option key={String(v.id)} value={String(v.id)}>{String(v.product_name)} — {String(v.label)}</option>)}
          </select>
          <input type="number" placeholder="Quantité (+ entrée, − sortie)" value={f.delta} onChange={(e) => setF({ ...f, delta: e.target.value })} style={champ} />
          <select value={f.raison} onChange={(e) => setF({ ...f, raison: e.target.value })} style={champ}>
            <option value="reappro">Réapprovisionnement</option><option value="initial">Stock de départ</option><option value="ajustement">Ajustement d'inventaire</option><option value="casse">Casse / perte</option><option value="retour">Retour client</option>
          </select>
          <input placeholder="Note (facultatif)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} style={champ} />
        </div>
        {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
        <div><button onClick={() => void enregistrer()} disabled={!f.variantId || !f.delta} style={{ ...bouton, opacity: !f.variantId || !f.delta ? 0.6 : 1 }}>Enregistrer</button></div>
      </div>
      <div>
        <h3 style={{ margin: "4px 0 8px" }}>Journal des mouvements</h3>
        <Tableau lignes={d.mouvements} colonnes={[
          { titre: "Date", rendu: (l) => date(l.created_at) },
          { titre: "Pack", rendu: (l) => `${String(l.product_name)} — ${String(l.label)}` },
          { titre: "Mouvement", rendu: (l) => <strong style={{ color: Number(l.delta) > 0 ? VERT : "#b91c1c" }}>{Number(l.delta) > 0 ? "+" : ""}{String(l.delta)}</strong> },
          { titre: "Motif", rendu: (l) => `${String(l.reason)}${l.ref ? ` · ${String(l.ref)}` : ""}${l.note ? ` · ${String(l.note)}` : ""}` },
        ]} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Produits
function Produits() {
  const [d, setD] = useState<{ produits: Ligne[]; variantes: Ligne[] } | null>(null);
  const [nouv, setNouv] = useState({ name: "", slug: "", sku: "", label: "", prix: "", prixRevendeur: "" });
  const [pack, setPack] = useState<Record<string, { sku: string; label: string; prix: string; prixRevendeur: string }>>({});
  const [err, setErr] = useState("");
  const charger = useCallback(() => { void api<{ produits: Ligne[]; variantes: Ligne[] }>("products").then((r) => r.ok && setD(r.data)); }, []);
  useEffect(charger, [charger]);
  async function maj(chemin: string, body: Record<string, unknown>) {
    setErr("");
    const r = await api(chemin, { method: "PATCH", body });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else charger();
  }
  async function creer() {
    setErr("");
    const r = await api("products", { method: "POST", body: { name: nouv.name, slug: nouv.slug, packs: [{ sku: nouv.sku, label: nouv.label, prix: Number(nouv.prix), prixRevendeur: nouv.prixRevendeur ? Number(nouv.prixRevendeur) : null }] } });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else { setNouv({ name: "", slug: "", sku: "", label: "", prix: "", prixRevendeur: "" }); charger(); }
  }
  async function ajouterPack(productId: string) {
    const p = pack[productId];
    if (!p) return;
    setErr("");
    const r = await api("variants", { method: "POST", body: { productId, sku: p.sku, label: p.label, prix: Number(p.prix), prixRevendeur: p.prixRevendeur ? Number(p.prixRevendeur) : null } });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else { setPack({ ...pack, [productId]: { sku: "", label: "", prix: "", prixRevendeur: "" } }); charger(); }
  }
  if (!d) return <p>Chargement…</p>;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      {d.produits.map((p) => {
        const id = String(p.id);
        const pk = pack[id] ?? { sku: "", label: "", prix: "", prixRevendeur: "" };
        return (
          <div key={id} style={{ ...carte, opacity: p.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div><strong style={{ fontSize: 16 }}>{String(p.name)}</strong> <span style={{ color: "#777", fontSize: 12 }}>/{String(p.slug)}</span></div>
              <button onClick={() => void maj(`products/${id}`, { active: !p.active })} style={boutonDiscret}>{p.active ? "Retirer de la boutique" : "Remettre en boutique"}</button>
            </div>
            <div style={{ marginTop: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <thead><tr style={{ textAlign: "left", color: "#666", fontSize: 12 }}><th>Pack</th><th>Prix public</th><th>Prix revendeur</th><th>Stock</th><th></th></tr></thead>
                <tbody>
                  {d.variantes.filter((v) => v.product_id === p.id).map((v) => (
                    <tr key={String(v.id)} style={{ opacity: v.active ? 1 : 0.5 }}>
                      <td style={{ padding: "6px 8px 6px 0" }}>{String(v.label)} <span style={{ color: "#777", fontSize: 12 }}>{String(v.sku)}</span></td>
                      <td><input defaultValue={String(v.price_fcfa)} onBlur={(e) => Number(e.target.value) !== Number(v.price_fcfa) && void maj(`variants/${String(v.id)}`, { prix: Number(e.target.value) })} style={{ ...champ, width: 100 }} /></td>
                      <td><input defaultValue={v.reseller_price_fcfa == null ? "" : String(v.reseller_price_fcfa)} placeholder="auto" onBlur={(e) => void maj(`variants/${String(v.id)}`, { prixRevendeur: e.target.value === "" ? null : Number(e.target.value) })} style={{ ...champ, width: 100 }} /></td>
                      <td><strong>{String(v.stock)}</strong></td>
                      <td><button onClick={() => void maj(`variants/${String(v.id)}`, { active: !v.active })} style={boutonDiscret}>{v.active ? "Désactiver" : "Activer"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <input placeholder="Code (ex. NUT-AX-6P)" value={pk.sku} onChange={(e) => setPack({ ...pack, [id]: { ...pk, sku: e.target.value } })} style={{ ...champ, width: 150 }} />
              <input placeholder="Libellé du pack" value={pk.label} onChange={(e) => setPack({ ...pack, [id]: { ...pk, label: e.target.value } })} style={{ ...champ, flex: 1, minWidth: 140 }} />
              <input type="number" placeholder="Prix" value={pk.prix} onChange={(e) => setPack({ ...pack, [id]: { ...pk, prix: e.target.value } })} style={{ ...champ, width: 100 }} />
              <input type="number" placeholder="Prix revendeur" value={pk.prixRevendeur} onChange={(e) => setPack({ ...pack, [id]: { ...pk, prixRevendeur: e.target.value } })} style={{ ...champ, width: 130 }} />
              <button onClick={() => void ajouterPack(id)} disabled={!pk.sku || !pk.label || !pk.prix} style={bouton}>+ Ajouter ce pack</button>
            </div>
          </div>
        );
      })}
      <div style={{ ...carte, display: "grid", gap: 8 }}>
        <strong>Ajouter un produit à vendre</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="Nom du produit" value={nouv.name} onChange={(e) => setNouv({ ...nouv, name: e.target.value })} style={{ ...champ, flex: 1, minWidth: 160 }} />
          <input placeholder="identifiant-web (ex. omega-3)" value={nouv.slug} onChange={(e) => setNouv({ ...nouv, slug: e.target.value })} style={{ ...champ, width: 200 }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="Code du 1er pack" value={nouv.sku} onChange={(e) => setNouv({ ...nouv, sku: e.target.value })} style={{ ...champ, width: 150 }} />
          <input placeholder="Libellé du pack (ex. 1 boîte - 30 caps)" value={nouv.label} onChange={(e) => setNouv({ ...nouv, label: e.target.value })} style={{ ...champ, flex: 1, minWidth: 180 }} />
          <input type="number" placeholder="Prix" value={nouv.prix} onChange={(e) => setNouv({ ...nouv, prix: e.target.value })} style={{ ...champ, width: 100 }} />
          <input type="number" placeholder="Prix revendeur" value={nouv.prixRevendeur} onChange={(e) => setNouv({ ...nouv, prixRevendeur: e.target.value })} style={{ ...champ, width: 130 }} />
        </div>
        <div><button onClick={() => void creer()} disabled={!nouv.name || !nouv.slug || !nouv.sku || !nouv.label || !nouv.prix} style={bouton}>Créer le produit</button></div>
        <div style={{ fontSize: 12.5, color: "#666" }}>Un nouveau produit est en vente dès que son stock est renseigné (onglet Stock). Il apparaît automatiquement sur sa page /produits/identifiant-web.</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Revendeurs
function Revendeurs() {
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [f, setF] = useState({ name: "", phone: "", city: "", remisePct: "20" });
  const [detail, setDetail] = useState<{ revendeur: Ligne; commandes: Ligne[] } | null>(null);
  const [err, setErr] = useState("");
  const charger = useCallback(() => { void api<{ revendeurs: Ligne[] }>("resellers").then((r) => r.ok && setLignes(r.data.revendeurs ?? [])); }, []);
  useEffect(charger, [charger]);
  async function creer() {
    setErr("");
    const r = await api("resellers", { method: "POST", body: { name: f.name, phone: f.phone, city: f.city, remisePct: Number(f.remisePct) } });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else { setF({ name: "", phone: "", city: "", remisePct: "20" }); charger(); }
  }
  async function voir(id: string) { const r = await api<{ revendeur: Ligne; commandes: Ligne[] }>(`resellers/${id}`); if (r.ok) setDetail(r.data); }
  async function maj(id: string, body: Record<string, unknown>) {
    setErr("");
    const r = await api(`resellers/${id}`, { method: "PATCH", body });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else { charger(); if (detail) void voir(id); }
  }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      <div style={{ ...carte, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <strong>Nouveau revendeur</strong>
        <input placeholder="Nom" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ ...champ, flex: 1, minWidth: 140 }} />
        <input placeholder="Téléphone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} style={{ ...champ, width: 140 }} />
        <input placeholder="Ville" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} style={{ ...champ, width: 120 }} />
        <input type="number" placeholder="Remise %" value={f.remisePct} onChange={(e) => setF({ ...f, remisePct: e.target.value })} style={{ ...champ, width: 100 }} />
        <button onClick={() => void creer()} disabled={!f.name} style={bouton}>Ajouter</button>
      </div>
      {detail && (
        <div style={{ ...carte, borderColor: VERT }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>{String(detail.revendeur.name)} — remise {String(detail.revendeur.discount_pct)} %</h3>
            <button onClick={() => setDetail(null)} style={boutonDiscret}>Fermer</button>
          </div>
          <div style={{ margin: "8px 0", fontSize: 13, color: "#555" }}>Prix revendeur : celui du pack s'il est renseigné (onglet Produits), sinon le prix public moins la remise.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <input type="number" defaultValue={String(detail.revendeur.discount_pct)} onBlur={(e) => void maj(String(detail.revendeur.id), { remisePct: Number(e.target.value) })} style={{ ...champ, width: 100 }} />
            <button onClick={() => void maj(String(detail.revendeur.id), { active: !detail.revendeur.active })} style={boutonDiscret}>{detail.revendeur.active ? "Désactiver" : "Réactiver"}</button>
          </div>
          <Tableau lignes={detail.commandes} colonnes={[
            { titre: "N°", rendu: (l) => String(l.number) },
            { titre: "Date", rendu: (l) => date(l.created_at) },
            { titre: "Commande", rendu: (l) => String(l.resume ?? "") },
            { titre: "Total", rendu: (l) => fcfa(l.total_fcfa) },
            { titre: "Paiement", rendu: (l) => <Badge texte={LIB_PAIEMENT[String(l.payment_status)] ?? ""} couleur={COULEUR_PAIEMENT[String(l.payment_status)] ?? "#555"} /> },
          ]} />
        </div>
      )}
      <Tableau lignes={lignes} onClic={(l) => void voir(String(l.id))} colonnes={[
        { titre: "Revendeur", rendu: (l) => <><strong>{String(l.name)}</strong>{l.active ? null : <span style={{ color: "#b91c1c" }}> (inactif)</span>}<br /><span style={{ color: "#777", fontSize: 12 }}>{[l.phone, l.city].filter(Boolean).join(" · ")}</span></> },
        { titre: "Remise", rendu: (l) => `${String(l.discount_pct)} %` },
        { titre: "Commandes", rendu: (l) => String(l.commandes) },
        { titre: "Achats", rendu: (l) => fcfa(l.achats_fcfa) },
        { titre: "Reste à payer", rendu: (l) => <strong style={{ color: Number(l.reste_a_payer_fcfa) > 0 ? "#b91c1c" : "inherit" }}>{fcfa(l.reste_a_payer_fcfa)}</strong> },
      ]} />
    </div>
  );
}

// ---------------------------------------------------------------- Page
const ONGLETS: [Onglet, string][] = [["tableau", "Tableau de bord"], ["commandes", "Commandes"], ["paiements", "Paiements"], ["stock", "Stock"], ["produits", "Produits"], ["revendeurs", "Revendeurs"]];

export default function Admin() {
  const [etat, setEtat] = useState<"inconnu" | "deconnecte" | "connecte">("inconnu");
  const [onglet, setOnglet] = useState<Onglet>("tableau");
  useEffect(() => { void api("stats").then((r) => setEtat(r.ok ? "connecte" : "deconnecte")); }, []);
  if (etat === "inconnu") return <p style={{ padding: 20 }}>Chargement…</p>;
  if (etat === "deconnecte") return <Connexion onOk={() => setEtat("connecte")} />;
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 14px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: VERT }}>NUTRELIS — Administration</h1>
        <button onClick={() => void api("logout", { method: "POST" }).then(() => setEtat("deconnecte"))} style={boutonDiscret}>Déconnexion</button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {ONGLETS.map(([k, v]) => <button key={k} onClick={() => setOnglet(k)} style={{ ...boutonDiscret, ...(onglet === k ? { background: VERT, color: "#fff", borderColor: VERT } : {}) }}>{v}</button>)}
      </div>
      {onglet === "tableau" && <TableauDeBord ouvrir={setOnglet} />}
      {onglet === "commandes" && <Commandes />}
      {onglet === "paiements" && <Paiements />}
      {onglet === "stock" && <Stock />}
      {onglet === "produits" && <Produits />}
      {onglet === "revendeurs" && <Revendeurs />}
    </div>
  );
}
