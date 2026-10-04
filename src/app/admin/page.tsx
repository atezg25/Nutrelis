"use client";
import { useCallback, useEffect, useState } from "react";

// ============================================================
// Administration NUTRELIS : commandes, paiements, stock, produits, revendeurs.
// Un seul écran à onglets. Tout passe par /api/admin/* (cookie signé, mot de passe unique).
// ============================================================
type Ligne = Record<string, string | number | boolean | null>;
type Onglet = "tableau" | "commandes" | "expeditions" | "paiements" | "avis" | "abonnements" | "clients" | "stock" | "produits" | "revendeurs" | "rapports" | "utilisateurs" | "parametres" | "journal" | "compte";

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
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [err, setErr] = useState("");
  const [charge, setCharge] = useState(false);
  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErr("");
    const r = await api("login", { method: "POST", body: { email, password: mdp } });
    setCharge(false);
    if (r.ok) onOk(); else setErr(r.data.error ?? "Connexion impossible.");
  }
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={envoyer} style={{ ...carte, width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: VERT }}>NUTRELIS — Console d'administration</h1>
        <input type="email" autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse e-mail" style={champ} />
        <input type="password" autoComplete="current-password" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="Mot de passe" style={champ} />
        {err && <div style={{ color: "#b91c1c", fontSize: 13 }}>{err}</div>}
        <button type="submit" disabled={charge || !email || !mdp} style={{ ...bouton, opacity: charge || !email || !mdp ? 0.6 : 1 }}>Se connecter</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- Changement de mot de passe (écran obligatoire ou page « Mon compte »)
function FormMotDePasse({ onFait, obligatoire }: { onFait: () => void; obligatoire?: boolean }) {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [charge, setCharge] = useState(false);
  const valide = actuel !== "" && nouveau.length >= 10 && nouveau === confirm;
  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setMsg(""); setOk(false);
    const r = await api("me/password", { method: "POST", body: { actuel, nouveau } });
    setCharge(false);
    if (!r.ok) { setMsg(r.data.error ?? "Échec."); return; }
    setOk(true); setMsg("Mot de passe changé. Les autres sessions ouvertes ont été fermées.");
    setActuel(""); setNouveau(""); setConfirm("");
    onFait();
  }
  return (
    <form onSubmit={envoyer} style={{ ...carte, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 10, maxWidth: 420 }}>
      <strong>{obligatoire ? "Choisissez votre mot de passe" : "Changer mon mot de passe"}</strong>
      {obligatoire && <div style={{ fontSize: 13, color: "#555" }}>Pour votre sécurité, remplacez le mot de passe provisoire par un mot de passe que vous seul connaissez.</div>}
      <input type="password" autoComplete="current-password" placeholder={obligatoire ? "Mot de passe provisoire (actuel)" : "Mot de passe actuel"} value={actuel} onChange={(e) => setActuel(e.target.value)} style={champ} />
      <input type="password" autoComplete="new-password" placeholder="Nouveau mot de passe (10 caractères minimum, lettres et chiffres)" value={nouveau} onChange={(e) => setNouveau(e.target.value)} style={champ} />
      <input type="password" autoComplete="new-password" placeholder="Confirmer le nouveau mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={champ} />
      {nouveau !== "" && confirm !== "" && nouveau !== confirm && <div style={{ color: "#b91c1c", fontSize: 13 }}>Les deux saisies ne correspondent pas.</div>}
      {msg && <div style={{ color: ok ? VERT : "#b91c1c", fontWeight: 700, fontSize: 13 }}>{msg}</div>}
      <div><button type="submit" disabled={!valide || charge} style={{ ...bouton, opacity: !valide || charge ? 0.6 : 1 }}>Enregistrer le nouveau mot de passe</button></div>
    </form>
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
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
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
    <div style={{ ...carte, marginBottom: 14, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 10 }}>
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
        { titre: "Commande", rendu: (l) => <span style={{ fontSize: 13 }}>{String(l.resume ?? "")}{l.subscription ? <> <Badge texte="Abonnement" couleur="#b45309" /></> : null}{l.reseller_name ? <><br /><em>{String(l.reseller_name)}</em></> : null}</span> },
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
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
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
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
      <Tableau lignes={d.variantes} colonnes={[
        { titre: "Produit", rendu: (l) => String(l.product_name) },
        { titre: "Pack", rendu: (l) => <>{String(l.label)} <span style={{ color: "#777", fontSize: 12 }}>{String(l.sku)}</span></> },
        { titre: "En stock", rendu: (l) => <strong style={{ color: Number(l.stock) <= Number(l.low_stock_alert) ? "#b91c1c" : "inherit" }}>{String(l.stock)}</strong> },
        { titre: "Alerte à", rendu: (l) => String(l.low_stock_alert) },
      ]} />
      <div style={{ ...carte, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 10 }}>
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

// ---------------------------------------------------------------- Fiche produit (contenu de la page publique)
type Contenu = {
  accroche?: string; miseEnAvant?: string; avantages?: string[]; raisons?: { titre: string; texte: string; image?: string }[];
  description?: string; ingredients?: string; utilisation?: string; precautions?: string; faq?: { q: string; a: string }[];
  avis?: { nom: string; ville?: string; note: number; texte: string }[]; garantieJours?: number; images?: string[];
  etapes?: { titre: string; texte: string }[]; chiffres?: { valeur: string; libelle: string }[]; sourceChiffres?: string;
  comparatif?: { critere: string; nous: string; autres: string }[]; resultats?: string[]; videos?: { url: string; titre?: string }[];
};
const lignes = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);
const enTexte = (c: Contenu) => ({
  accroche: c.accroche ?? "", miseEnAvant: c.miseEnAvant ?? "", avantages: (c.avantages ?? []).join("\n"),
  raisons: (c.raisons ?? []).map((r) => `${r.titre} | ${r.texte}`).join("\n"),
  description: c.description ?? "", ingredients: c.ingredients ?? "", utilisation: c.utilisation ?? "", precautions: c.precautions ?? "",
  faq: (c.faq ?? []).map((f) => `${f.q} | ${f.a}`).join("\n"),
  avis: (c.avis ?? []).map((a) => `${a.nom} | ${a.ville ?? ""} | ${a.note} | ${a.texte}`).join("\n"),
  garantieJours: String(c.garantieJours ?? 90), images: c.images ?? [],
  etapes: (c.etapes ?? []).map((e) => `${e.titre} | ${e.texte}`).join("\n"),
  chiffres: (c.chiffres ?? []).map((x) => `${x.valeur} | ${x.libelle}`).join("\n"), sourceChiffres: c.sourceChiffres ?? "",
  comparatif: (c.comparatif ?? []).map((r) => `${r.critere} | ${r.nous} | ${r.autres}`).join("\n"), resultats: c.resultats ?? [],
  videos: (c.videos ?? []).map((v) => `${v.url} | ${v.titre ?? ""}`).join("\n"),
});

function FicheProduit({ produit, fermer, enregistre }: { produit: Ligne; fermer: () => void; enregistre: () => void }) {
  const [f, setF] = useState(() => enTexte((produit.content ?? {}) as Contenu));
  const [nom, setNom] = useState(String(produit.name ?? ""));
  const [soustitre, setSoustitre] = useState(String(produit.subtitle ?? ""));
  const [descCourte, setDescCourte] = useState(String(produit.description ?? ""));
  const [msg, setMsg] = useState("");
  const [charge, setCharge] = useState(false);
  const maj = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  async function envoyerVideo(fichier: File | undefined) {
    if (!fichier) return;
    setMsg("Envoi de la vidéo en cours…");
    const res = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": fichier.type || "video/mp4" }, body: fichier });
    const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !d.url) { setMsg(d.error ?? "Envoi impossible."); return; }
    setMsg("Vidéo envoyée : n'oubliez pas d'enregistrer la fiche.");
    setF((x) => ({ ...x, videos: `${x.videos}${x.videos ? "\n" : ""}${d.url} | ` }));
  }
  async function envoyerImage(fichier: File | undefined, cle: "images" | "resultats" = "images") {
    if (!fichier) return;
    setMsg("");
    const res = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": fichier.type }, body: fichier });
    const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !d.url) { setMsg(d.error ?? "Envoi impossible."); return; }
    setF((x) => ({ ...x, [cle]: [...x[cle], d.url!] }));
  }
  function deplacer(i: number, sens: -1 | 1) {
    const j = i + sens;
    if (j < 0 || j >= f.images.length) return;
    const img = [...f.images];
    [img[i], img[j]] = [img[j]!, img[i]!];
    setF({ ...f, images: img });
  }
  async function enregistrer() {
    setCharge(true); setMsg("");
    const contenu: Contenu = {
      accroche: f.accroche, miseEnAvant: f.miseEnAvant, avantages: lignes(f.avantages),
      raisons: lignes(f.raisons).map((l) => { const [titre, ...r] = l.split("|"); return { titre: (titre ?? "").trim(), texte: r.join("|").trim() }; }),
      description: f.description, ingredients: f.ingredients, utilisation: f.utilisation, precautions: f.precautions,
      faq: lignes(f.faq).map((l) => { const [q, ...r] = l.split("|"); return { q: (q ?? "").trim(), a: r.join("|").trim() }; }),
      avis: lignes(f.avis).map((l) => { const [n, v, note, ...r] = l.split("|"); return { nom: (n ?? "").trim(), ville: (v ?? "").trim(), note: Number(note) || 5, texte: r.join("|").trim() }; }),
      garantieJours: Number(f.garantieJours) || 0, images: f.images,
      etapes: lignes(f.etapes).map((l) => { const [titre, ...r] = l.split("|"); return { titre: (titre ?? "").trim(), texte: r.join("|").trim() }; }),
      chiffres: lignes(f.chiffres).map((l) => { const [valeur, ...r] = l.split("|"); return { valeur: (valeur ?? "").trim(), libelle: r.join("|").trim() }; }), sourceChiffres: f.sourceChiffres,
      comparatif: lignes(f.comparatif).map((l) => { const [critere, nous, ...r] = l.split("|"); return { critere: (critere ?? "").trim(), nous: (nous ?? "").trim(), autres: r.join("|").trim() }; }),
      resultats: f.resultats,
      videos: lignes(f.videos).map((l) => { const [url, ...r] = l.split("|"); return { url: (url ?? "").trim(), titre: r.join("|").trim() }; }),
    };
    const a = await api(`products/${String(produit.id)}`, { method: "PATCH", body: { name: nom, subtitle: soustitre, description: descCourte, content: contenu } });
    setCharge(false);
    if (!a.ok) setMsg(a.data.error ?? "Échec de l'enregistrement."); else { setMsg("Enregistré ✓"); enregistre(); }
  }
  const zone = (k: keyof typeof f, titre: string, aide: string, hauteur = 70) => (
    <label style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 4 }}>
      <span style={{ fontWeight: 700, fontSize: 13 }}>{titre} <span style={{ fontWeight: 400, color: "#777" }}>{aide}</span></span>
      <textarea value={f[k] as string} onChange={(e) => maj(k, e.target.value)} style={{ ...champ, minHeight: hauteur, fontFamily: "inherit", resize: "vertical" }} />
    </label>
  );
  return (
    <div style={{ ...carte, borderColor: VERT, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 16 }}>Fiche de « {nom} » — ce que les clients voient</strong>
        <a href={`/produits/${String(produit.slug)}`} target="_blank" rel="noreferrer" style={{ ...boutonDiscret, textDecoration: "none" }}>Voir la page ↗</a>
      </div>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>Nom du produit</span><input value={nom} onChange={(e) => setNom(e.target.value)} style={champ} /></label>
        <label style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>Sous-titre</span><input value={soustitre} onChange={(e) => setSoustitre(e.target.value)} style={champ} /></label>
        <label style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>Mot à mettre en rouge dans le titre <span style={{ fontWeight: 400, color: "#777" }}>(facultatif)</span></span><input value={f.miseEnAvant} onChange={(e) => maj("miseEnAvant", e.target.value)} style={champ} /></label>
        <label style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>Garantie « satisfait ou remboursé » (jours, 0 = aucune)</span><input type="number" min={0} max={365} value={f.garantieJours} onChange={(e) => maj("garantieJours", e.target.value)} style={champ} /></label>
      </div>
      <label style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>Description courte <span style={{ fontWeight: 400, color: "#777" }}>(à côté du prix)</span></span><textarea value={descCourte} onChange={(e) => setDescCourte(e.target.value)} style={{ ...champ, minHeight: 60, fontFamily: "inherit" }} /></label>
      {zone("accroche", "Phrase d'accroche", "(sous le titre, en haut de page)", 60)}
      {zone("avantages", "Avantages", "— un par ligne (les 3 premiers apparaissent en haut de page)", 110)}
      {zone("raisons", "Raisons de choisir ce produit", "— une par ligne, au format  Titre | Texte  (5 maximum)", 110)}
      {zone("etapes", "Routine / mode d'emploi en étapes", "— une par ligne, au format  Titre | Texte  (6 maximum)", 110)}
      {zone("chiffres", "Chiffres clés", "— un par ligne, au format  Valeur | Libellé  (ex. 91 % | des utilisatrices …). Uniquement des chiffres que vous pouvez PROUVER.", 80)}
      <label style={{ display: "grid", gap: 4 }}><span style={{ fontWeight: 700, fontSize: 13 }}>Source des chiffres <span style={{ fontWeight: 400, color: "#777" }}>(obligatoire : sans source, les chiffres ne sont pas affichés)</span></span><input value={f.sourceChiffres} onChange={(e) => maj("sourceChiffres", e.target.value)} placeholder="ex. test d'usage réalisé en 2026 sur 52 personnes, rapport disponible sur demande" style={champ} /></label>
      {zone("comparatif", "Comparatif avec les autres solutions", "— une ligne par critère : Critère | Ce produit | Les autres. Critères vérifiables uniquement.", 110)}
      {zone("videos", "Vidéos", "— une par ligne : lien YouTube ou Vimeo | titre (facultatif). Vos propres vidéos, ou celles que vous avez le droit d'utiliser.", 80)}
      <div style={{ marginTop: -6 }}><label style={{ ...boutonDiscret, display: "inline-block" }}>+ Envoyer une vidéo MP4 (25 Mo maximum)<input type="file" accept="video/mp4" style={{ display: "none" }} onChange={(e) => { void envoyerVideo(e.target.files?.[0]); e.target.value = ""; }} /></label></div>
      {zone("description", "Description détaillée", "", 90)}
      {zone("ingredients", "Composition", "", 70)}
      {zone("utilisation", "Conseils d'utilisation", "", 70)}
      {zone("precautions", "Précautions", "", 70)}
      {zone("faq", "Questions fréquentes", "— une par ligne, au format  Question | Réponse", 110)}
      {zone("avis", "Avis clients", "— RÉELS uniquement, un par ligne : Nom | Ville | Note (1 à 5) | Texte. La section n'apparaît que s'il y en a.", 110)}
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Photos <span style={{ fontWeight: 400, color: "#777" }}>— la première est la photo principale (PNG, JPEG ou WebP, 3 Mo maximum)</span></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
          {f.images.map((src, i) => (
            <div key={src} style={{ ...carte, padding: 6, width: 110, textAlign: "center" }}>
              <img src={src} alt="" style={{ width: "100%", height: 80, objectFit: "contain" }} />
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 4 }}>
                <button onClick={() => deplacer(i, -1)} style={{ ...boutonDiscret, padding: "2px 7px" }} aria-label="Avancer">←</button>
                <button onClick={() => deplacer(i, 1)} style={{ ...boutonDiscret, padding: "2px 7px" }} aria-label="Reculer">→</button>
                <button onClick={() => setF({ ...f, images: f.images.filter((_, k) => k !== i) })} style={{ ...boutonDiscret, padding: "2px 7px", color: "#b91c1c" }} aria-label="Retirer">✕</button>
              </div>
            </div>
          ))}
          <label style={{ ...boutonDiscret, display: "inline-block" }}>+ Ajouter une photo<input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => { void envoyerImage(e.target.files?.[0]); e.target.value = ""; }} /></label>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Photos de résultats <span style={{ fontWeight: 400, color: "#777" }}>— uniquement avec l'<strong>accord écrit</strong> des personnes photographiées. Jamais de photos reprises d'un autre site.</span></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
          {f.resultats.map((src, i) => (
            <div key={src} style={{ ...carte, padding: 6, width: 110, textAlign: "center" }}>
              <img src={src} alt="" style={{ width: "100%", height: 80, objectFit: "cover" }} />
              <button onClick={() => setF({ ...f, resultats: f.resultats.filter((_, k) => k !== i) })} style={{ ...boutonDiscret, padding: "2px 7px", color: "#b91c1c", marginTop: 4 }} aria-label="Retirer">✕ Retirer</button>
            </div>
          ))}
          <label style={{ ...boutonDiscret, display: "inline-block" }}>+ Ajouter une photo de résultat<input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => { void envoyerImage(e.target.files?.[0], "resultats"); e.target.value = ""; }} /></label>
        </div>
      </div>
      {msg && <div style={{ color: msg.startsWith("Enregistré") ? VERT : "#b91c1c", fontWeight: 700 }}>{msg}</div>}
      <div style={{ display: "flex", gap: 8 }}><button onClick={() => void enregistrer()} disabled={charge || !nom} style={{ ...bouton, opacity: charge ? 0.6 : 1 }}>Enregistrer la fiche</button><button onClick={fermer} style={boutonDiscret}>Fermer</button></div>
    </div>
  );
}

// ---------------------------------------------------------------- Produits
function Produits() {
  const [d, setD] = useState<{ produits: Ligne[]; variantes: Ligne[] } | null>(null);
  const [nouv, setNouv] = useState({ name: "", slug: "", sku: "", label: "", prix: "", prixRevendeur: "" });
  const [pack, setPack] = useState<Record<string, { sku: string; label: string; prix: string; prixRevendeur: string }>>({});
  const [err, setErr] = useState("");
  const [fiche, setFiche] = useState<string | null>(null);
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
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      {d.produits.map((p) => {
        const id = String(p.id);
        const pk = pack[id] ?? { sku: "", label: "", prix: "", prixRevendeur: "" };
        return (
          <div key={id} style={{ ...carte, opacity: p.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div><strong style={{ fontSize: 16 }}>{String(p.name)}</strong> <span style={{ color: "#777", fontSize: 12 }}>/{String(p.slug)}</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setFiche(fiche === id ? null : id)} style={bouton}>{fiche === id ? "Fermer la fiche" : "Modifier la fiche et les photos"}</button>
                <button onClick={() => void maj(`products/${id}`, { active: !p.active })} style={boutonDiscret}>{p.active ? "Retirer de la boutique" : "Remettre en boutique"}</button>
              </div>
            </div>
            {fiche === id && <FicheProduit key={id} produit={p} fermer={() => setFiche(null)} enregistre={charger} />}
            <div style={{ marginTop: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <thead><tr style={{ textAlign: "left", color: "#666", fontSize: 12 }}><th>Pack</th><th>Prix public</th><th>Prix barré</th><th>Prix revendeur</th><th>Description du pack</th><th>Stock</th><th></th></tr></thead>
                <tbody>
                  {d.variantes.filter((v) => v.product_id === p.id).map((v) => (
                    <tr key={String(v.id)} style={{ opacity: v.active ? 1 : 0.5 }}>
                      <td style={{ padding: "6px 8px 6px 0" }}>{String(v.label)} <span style={{ color: "#777", fontSize: 12 }}>{String(v.sku)}</span></td>
                      <td><input defaultValue={String(v.price_fcfa)} onBlur={(e) => Number(e.target.value) !== Number(v.price_fcfa) && void maj(`variants/${String(v.id)}`, { prix: Number(e.target.value) })} style={{ ...champ, width: 100 }} /></td>
                      <td><input defaultValue={v.original_price_fcfa == null ? "" : String(v.original_price_fcfa)} placeholder="aucun" onBlur={(e) => void maj(`variants/${String(v.id)}`, { prixBarre: e.target.value === "" ? null : Number(e.target.value) })} style={{ ...champ, width: 100 }} /></td>
                      <td><input defaultValue={v.reseller_price_fcfa == null ? "" : String(v.reseller_price_fcfa)} placeholder="auto" onBlur={(e) => void maj(`variants/${String(v.id)}`, { prixRevendeur: e.target.value === "" ? null : Number(e.target.value) })} style={{ ...champ, width: 100 }} /></td>
                      <td><input defaultValue={String(v.description ?? "")} placeholder="ex. Cure de 2 mois" onBlur={(e) => void maj(`variants/${String(v.id)}`, { description: e.target.value })} style={{ ...champ, width: 170 }} /></td>
                      <td><strong>{String(v.stock)}</strong></td>
                      <td style={{ whiteSpace: "nowrap" }}><button onClick={() => void maj(`variants/${String(v.id)}`, { populaire: !v.popular })} style={{ ...boutonDiscret, ...(v.popular ? { background: VERT, color: "#fff", borderColor: VERT } : {}) }}>{v.popular ? "★ Populaire" : "☆ Populaire"}</button> <button onClick={() => void maj(`variants/${String(v.id)}`, { active: !v.active })} style={boutonDiscret}>{v.active ? "Désactiver" : "Activer"}</button></td>
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
      <div style={{ ...carte, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8 }}>
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
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
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

// ---------------------------------------------------------------- Expéditions (colis au Cameroun)
const LIB_COLIS: Record<string, string> = { expediee: "Expédié", en_livraison: "En livraison", livree: "Livré", echec: "Échec de livraison", retournee: "Retourné" };
const COULEUR_COLIS: Record<string, string> = { expediee: "#1d4ed8", en_livraison: "#6d28d9", livree: VERT, echec: "#b45309", retournee: "#b91c1c" };
type Transporteur = { id: string; name: string; phone: string | null; notes: string | null; active: boolean; en_cours: number; total: number };

function DetailColis({ id, fermer, recharger }: { id: string; fermer: () => void; recharger: () => void }) {
  type D = { colis: Ligne; items: Ligne[]; evenements: Ligne[]; expediteur: { nom: string; telephone: string; adresse: string } };
  const [d, setD] = useState<D | null>(null);
  const [note, setNote] = useState("");
  const [suivi, setSuivi] = useState("");
  const [transp, setTransp] = useState<Transporteur[]>([]);
  const [msg, setMsg] = useState("");
  const charger = useCallback(() => { void api<D>(`shipments/${id}`).then((r) => { if (r.ok) { setD(r.data); setSuivi(String(r.data.colis.tracking ?? "")); } }); }, [id]);
  useEffect(charger, [charger]);
  useEffect(() => { void api<{ transporteurs: Transporteur[] }>("carriers").then((r) => r.ok && setTransp(r.data.transporteurs.filter((t) => t.active))); }, []);
  async function agir(corps: Record<string, unknown>) {
    setMsg("");
    const r = await api(`shipments/${id}`, { method: "PATCH", body: corps });
    if (!r.ok) { setMsg(r.data.error ?? "Échec."); return; }
    setNote(""); charger(); recharger();
  }
  if (!d) return null;
  const c = d.colis;
  const tel = String(c.phone ?? "").replace(/[^\d]/g, "");
  const lienSuivi = `https://nutrelis.bio/suivi?commande=${String(c.number)}`;
  const message = `Bonjour ${String(c.customer_name)}, votre colis NUTRELIS ${String(c.number)} est ${c.status === "livree" ? "livré. Merci pour votre confiance !" : c.status === "en_livraison" ? "en cours de livraison : le livreur va vous appeler." : "expédié" + (c.carrier_name ? ` avec ${String(c.carrier_name)}` : "") + (c.tracking ? ` (suivi : ${String(c.tracking)})` : "") + "."} Suivi : ${lienSuivi}`;
  return (
    <div style={{ ...carte, marginBottom: 14, borderColor: VERT }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Colis {String(c.number)} <Badge texte={LIB_COLIS[String(c.status)] ?? String(c.status)} couleur={COULEUR_COLIS[String(c.status)] ?? "#555"} /></h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={`/admin/bordereau/${id}`} target="_blank" rel="noreferrer" style={{ ...bouton, textDecoration: "none" }}>🖨️ Bordereau</a>
          <a href={`https://wa.me/${tel}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" style={{ ...boutonDiscret, textDecoration: "none" }}>💬 Prévenir le client</a>
          {c.status === "livree" && <a href={`https://wa.me/${tel}?text=${encodeURIComponent(`Bonjour ${String(c.customer_name)}, merci pour votre commande NUTRELIS ${String(c.number)} ! Votre avis compte beaucoup : donnez-le en 1 minute ici : https://nutrelis.bio/avis?commande=${String(c.number)}`)}`} target="_blank" rel="noreferrer" style={{ ...boutonDiscret, textDecoration: "none" }}>⭐ Demander un avis</a>}
          <button onClick={fermer} style={boutonDiscret}>Fermer</button>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 12 }}>
        <div>
          <strong>{String(c.customer_name)}</strong><br />
          <a href={`tel:+${tel}`} style={{ color: VERT, fontWeight: 700 }}>{String(c.phone)}</a><br />
          {[c.address, c.city].filter(Boolean).join(", ") || "Adresse non renseignée"}
          {c.order_notes ? <><br /><em>« {String(c.order_notes)} »</em></> : null}
        </div>
        <div>
          {d.items.map((i, k) => <div key={k}>{String(i.qty)} × {String(i.name)}</div>)}
          <div style={{ marginTop: 6, fontWeight: 800 }}>Commande : {fcfa(c.total_fcfa)}</div>
          {Number(c.cod_fcfa) > 0
            ? <div style={{ marginTop: 6, color: c.cod_collected ? VERT : "#b91c1c", fontWeight: 800 }}>{c.cod_collected ? `✓ ${fcfa(c.cod_fcfa)} encaissés à la remise` : `À ENCAISSER à la remise : ${fcfa(c.cod_fcfa)}`}</div>
            : <div style={{ marginTop: 6, color: VERT, fontWeight: 700 }}>Déjà payé : rien à encaisser</div>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
        <select value={String(c.carrier_id ?? "")} onChange={(e) => void agir({ transporteurId: e.target.value || null })} style={champ}>
          <option value="">Sans transporteur</option>
          {transp.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input value={suivi} onChange={(e) => setSuivi(e.target.value)} placeholder="N° de suivi / de bordereau" style={{ ...champ, width: 220 }} />
        <button onClick={() => void agir({ suivi })} style={boutonDiscret}>Enregistrer le suivi</button>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>Faire avancer le colis <span style={{ color: "#888" }}>(la note est visible par le client sur la page de suivi)</span> :</div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (facultatif) — ex. « client injoignable, nouvelle tentative demain »" style={{ ...champ, width: "100%", boxSizing: "border-box", marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["expediee", "en_livraison", "livree", "echec", "retournee"] as const).map((s) => (
            <button key={s} onClick={() => void agir({ statut: s, note })} style={{ ...boutonDiscret, ...(c.status === s ? { background: COULEUR_COLIS[s], color: "#fff", borderColor: COULEUR_COLIS[s] } : {}) }}>{LIB_COLIS[s]}</button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: "#666", marginTop: 6 }}>« Livré » marque la commande livrée et, pour un paiement à la livraison, la somme comme encaissée. « Retourné » annule la commande et remet le stock.</div>
      </div>
      <ol style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 6 }}>
        {[...d.evenements].reverse().map((e, i) => (
          <li key={i} style={{ fontSize: 13 }}><strong>{date(e.at)}</strong> — {LIB_COLIS[String(e.status)] ?? String(e.status)}{e.note ? ` · ${String(e.note)}` : ""}{e.admin_name ? <span style={{ color: "#888" }}> ({String(e.admin_name)})</span> : null}</li>
        ))}
      </ol>
      {msg && <div style={{ color: "#b91c1c", marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

function ConfigExpeditions() {
  const [transp, setTransp] = useState<Transporteur[]>([]);
  const [tarifs, setTarifs] = useState<Ligne[]>([]);
  const [nt, setNt] = useState({ name: "", phone: "", notes: "" });
  const [nv, setNv] = useState({ ville: "", quartier: "", fraisFcfa: "", delai: "" });
  const [err, setErr] = useState("");
  const charger = useCallback(() => {
    void api<{ transporteurs: Transporteur[] }>("carriers").then((r) => r.ok && setTransp(r.data.transporteurs));
    void api<{ tarifs: Ligne[] }>("rates").then((r) => r.ok && setTarifs(r.data.tarifs));
  }, []);
  useEffect(charger, [charger]);
  async function appel(chemin: string, methode: string, corps?: unknown) {
    setErr("");
    const r = await api(chemin, { method: methode, body: corps });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else charger();
    return r.ok;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 18 }}>
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      <div>
        <h3 style={{ margin: "0 0 8px" }}>Transporteurs</h3>
        <Tableau lignes={transp as unknown as Ligne[]} colonnes={[
          { titre: "Transporteur", rendu: (l) => <><strong>{String(l.name)}</strong>{l.active ? null : <span style={{ color: "#b91c1c" }}> (désactivé)</span>}<br /><span style={{ color: "#777", fontSize: 12 }}>{[l.phone, l.notes].filter(Boolean).join(" · ")}</span></> },
          { titre: "Colis en cours", rendu: (l) => String(l.en_cours) },
          { titre: "Total expédié", rendu: (l) => String(l.total) },
          { titre: "", rendu: (l) => <button onClick={() => void appel(`carriers/${String(l.id)}`, "PATCH", { active: !l.active })} style={boutonDiscret}>{l.active ? "Désactiver" : "Réactiver"}</button> },
        ]} />
        <div style={{ ...carte, display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <input placeholder="Nom (ex. ATEZ Express, agence de voyage, livreur moto)" value={nt.name} onChange={(e) => setNt({ ...nt, name: e.target.value })} style={{ ...champ, flex: 2, minWidth: 220 }} />
          <input placeholder="Téléphone" value={nt.phone} onChange={(e) => setNt({ ...nt, phone: e.target.value })} style={{ ...champ, width: 150 }} />
          <input placeholder="Note (agence, horaires…)" value={nt.notes} onChange={(e) => setNt({ ...nt, notes: e.target.value })} style={{ ...champ, flex: 1, minWidth: 160 }} />
          <button disabled={!nt.name} onClick={() => void appel("carriers", "POST", nt).then((ok) => ok && setNt({ name: "", phone: "", notes: "" }))} style={bouton}>Ajouter</button>
        </div>
      </div>
      <div>
        <h3 style={{ margin: "0 0 4px" }}>Tarifs de livraison par ville et par quartier</h3>
        <p style={{ margin: "0 0 8px", color: "#666", fontSize: 13 }}>Le client voit les frais dès qu'il saisit sa ville et son quartier. Une ligne sans quartier vaut pour toute la ville ; un quartier a son propre tarif, prioritaire. Sans ligne, le tarif par défaut s'applique (Paramètres).</p>
        <Tableau lignes={tarifs} colonnes={[
          { titre: "Ville", rendu: (l) => <span style={{ opacity: l.active ? 1 : 0.5 }}><strong>{String(l.city)}</strong>{l.district ? <> · {String(l.district)}</> : <span style={{ color: "#777" }}> (toute la ville)</span>}</span> },
          { titre: "Frais (FCFA)", rendu: (l) => <input defaultValue={String(l.fee_fcfa)} onBlur={(e) => Number(e.target.value) !== Number(l.fee_fcfa) && void appel(`rates/${String(l.id)}`, "PATCH", { fraisFcfa: Number(e.target.value) })} style={{ ...champ, width: 100 }} /> },
          { titre: "Délai", rendu: (l) => <input defaultValue={String(l.delay ?? "")} placeholder="ex. 24-48 h" onBlur={(e) => void appel(`rates/${String(l.id)}`, "PATCH", { delai: e.target.value })} style={{ ...champ, width: 130 }} /> },
          { titre: "", rendu: (l) => <div style={{ display: "flex", gap: 6 }}><button onClick={() => void appel(`rates/${String(l.id)}`, "PATCH", { active: !l.active })} style={boutonDiscret}>{l.active ? "Désactiver" : "Activer"}</button><button onClick={() => void appel(`rates/${String(l.id)}`, "DELETE")} style={{ ...boutonDiscret, color: "#b91c1c" }}>Supprimer</button></div> },
        ]} />
        <div style={{ ...carte, display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <input placeholder="Ville (ex. Douala)" value={nv.ville} onChange={(e) => setNv({ ...nv, ville: e.target.value })} style={{ ...champ, flex: 1, minWidth: 150 }} />
          <input placeholder="Quartier (facultatif, ex. Akwa)" value={nv.quartier} onChange={(e) => setNv({ ...nv, quartier: e.target.value })} style={{ ...champ, flex: 1, minWidth: 150 }} />
          <input type="number" min={0} placeholder="Frais (FCFA)" value={nv.fraisFcfa} onChange={(e) => setNv({ ...nv, fraisFcfa: e.target.value })} style={{ ...champ, width: 130 }} />
          <input placeholder="Délai (ex. 24-48 h)" value={nv.delai} onChange={(e) => setNv({ ...nv, delai: e.target.value })} style={{ ...champ, width: 150 }} />
          <button disabled={!nv.ville || nv.fraisFcfa === ""} onClick={() => void appel("rates", "POST", { ville: nv.ville, quartier: nv.quartier, fraisFcfa: Number(nv.fraisFcfa), delai: nv.delai }).then((ok) => ok && setNv({ ville: "", quartier: "", fraisFcfa: "", delai: "" }))} style={bouton}>Ajouter ou mettre à jour</button>
        </div>
      </div>
    </div>
  );
}

function Expeditions() {
  const [vue, setVue] = useState<"a_expedier" | "en_cours" | "livrees" | "incidents" | "config">("a_expedier");
  const [q, setQ] = useState("");
  const [d, setD] = useState<{ compteurs: Ligne; commandes?: Ligne[]; colis?: Ligne[] } | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [expedier, setExpedier] = useState<string | null>(null);
  const [transp, setTransp] = useState<Transporteur[]>([]);
  const [f, setF] = useState({ transporteurId: "", suivi: "", notes: "" });
  const [err, setErr] = useState("");
  const charger = useCallback(() => {
    if (vue === "config") { void api<{ compteurs: Ligne }>("shipments?vue=en_cours").then((r) => r.ok && setD(r.data)); return; }
    void api<{ compteurs: Ligne; commandes?: Ligne[]; colis?: Ligne[] }>(`shipments?vue=${vue}&q=${encodeURIComponent(q)}`).then((r) => r.ok && setD(r.data));
  }, [vue, q]);
  useEffect(charger, [charger]);
  useEffect(() => { void api<{ transporteurs: Transporteur[] }>("carriers").then((r) => r.ok && setTransp(r.data.transporteurs.filter((t) => t.active))); }, []);
  async function creer(orderId: string) {
    setErr("");
    const r = await api<{ id: string }>("shipments", { method: "POST", body: { orderId, transporteurId: f.transporteurId || undefined, suivi: f.suivi, notes: f.notes } });
    if (!r.ok) { setErr(r.data.error ?? "Échec."); return; }
    setExpedier(null); setF({ transporteurId: "", suivi: "", notes: "" }); setVue("en_cours"); setOuvert(r.data.id);
  }
  const c = d?.compteurs;
  const onglets: [typeof vue, string, unknown][] = [["a_expedier", "À expédier", c?.a_expedier], ["en_cours", "En cours", c?.en_cours], ["livrees", "Livrés", c?.livrees], ["incidents", "Incidents et retours", c?.incidents], ["config", "Transporteurs et tarifs", undefined]];
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {onglets.map(([k, t, n]) => (
          <button key={k} onClick={() => { setVue(k); setOuvert(null); setExpedier(null); }} style={{ ...boutonDiscret, ...(vue === k ? { background: VERT, color: "#fff", borderColor: VERT } : {}) }}>
            {t}{n !== undefined && Number(n) > 0 ? ` (${String(n)})` : ""}
          </button>
        ))}
      </div>
      {vue === "config" ? <ConfigExpeditions /> : (
        <>
          <input placeholder="Rechercher (n°, client, téléphone, ville, suivi)" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...champ, width: "100%", boxSizing: "border-box", marginBottom: 12 }} />
          {err && <div style={{ color: "#b91c1c", marginBottom: 8 }}>{err}</div>}
          {ouvert && <DetailColis id={ouvert} fermer={() => setOuvert(null)} recharger={charger} />}
          {vue === "a_expedier" && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 10 }}>
              {(d?.commandes ?? []).length === 0 && <div style={{ ...carte, color: "#777" }}>Aucune commande à expédier. Les commandes en ligne apparaissent ici une fois payées ; celles à la livraison, dès leur création.</div>}
              {(d?.commandes ?? []).map((o) => (
                <div key={String(o.id)} style={carte}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div><strong>{String(o.number)}</strong> · {String(o.customer_name)} · <a href={`tel:${String(o.phone)}`} style={{ color: VERT, fontWeight: 700 }}>{String(o.phone)}</a><br /><span style={{ color: "#555", fontSize: 13 }}>{[o.address, o.city].filter(Boolean).join(", ") || "Adresse non renseignée"}</span></div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800 }}>{fcfa(o.total_fcfa)}</div>
                      {o.payment_status === "payee" ? <Badge texte="Payée" couleur={VERT} /> : <Badge texte={`À encaisser ${fcfa(o.total_fcfa)}`} couleur="#b91c1c" />}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#555", margin: "6px 0" }}>{String(o.resume ?? "")}</div>
                  {expedier === String(o.id) ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <select value={f.transporteurId} onChange={(e) => setF({ ...f, transporteurId: e.target.value })} style={champ}>
                        <option value="">Choisir le transporteur…</option>
                        {transp.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <input placeholder="N° de suivi (facultatif)" value={f.suivi} onChange={(e) => setF({ ...f, suivi: e.target.value })} style={{ ...champ, width: 200 }} />
                      <input placeholder="Note (facultatif)" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} style={{ ...champ, flex: 1, minWidth: 140 }} />
                      <button onClick={() => void creer(String(o.id))} style={bouton}>Confirmer l'expédition</button>
                      <button onClick={() => setExpedier(null)} style={boutonDiscret}>Annuler</button>
                    </div>
                  ) : <button onClick={() => setExpedier(String(o.id))} style={bouton}>📦 Expédier</button>}
                </div>
              ))}
            </div>
          )}
          {vue !== "a_expedier" && (
            <Tableau lignes={d?.colis ?? []} onClic={(l) => setOuvert(String(l.id))} colonnes={[
              { titre: "Colis", rendu: (l) => <><strong>{String(l.number)}</strong><br /><span style={{ color: "#777", fontSize: 12 }}>{date(l.shipped_at)}</span></> },
              { titre: "Destinataire", rendu: (l) => <>{String(l.customer_name)}<br /><span style={{ color: "#777", fontSize: 12 }}>{String(l.phone)}{l.city ? ` · ${String(l.city)}` : ""}</span></> },
              { titre: "Transporteur", rendu: (l) => <>{String(l.carrier_name ?? "—")}{l.tracking ? <><br /><span style={{ color: "#777", fontSize: 12 }}>{String(l.tracking)}</span></> : null}</> },
              { titre: "Statut", rendu: (l) => <Badge texte={LIB_COLIS[String(l.status)] ?? String(l.status)} couleur={COULEUR_COLIS[String(l.status)] ?? "#555"} /> },
              { titre: "À encaisser", rendu: (l) => (Number(l.cod_fcfa) > 0 ? (l.cod_collected ? <span style={{ color: VERT, fontWeight: 700 }}>✓ encaissé</span> : <strong style={{ color: "#b91c1c" }}>{fcfa(l.cod_fcfa)}</strong>) : <span style={{ color: "#888" }}>—</span>) },
            ]} />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Abonnements
function Abonnements() {
  const [d, setD] = useState<{ abonnes: Ligne[]; relanceJours: number; remisePct: number } | null>(null);
  const charger = useCallback(() => { void api<{ abonnes: Ligne[]; relanceJours: number; remisePct: number }>("subscriptions").then((r) => r.ok && setD(r.data)); }, []);
  useEffect(charger, [charger]);
  const jours = (iso: unknown) => Math.floor((Date.now() - new Date(String(iso)).getTime()) / 86_400_000);
  async function basculer(phone: string, resilier: boolean) { await api("subscriptions", { method: "POST", body: { phone, resilier } }); charger(); }
  const lien = (a: Ligne) => {
    const num = String(a.phone).replace(/[^\d]/g, "");
    const msg = `Bonjour ${String(a.nom)}, c'est NUTRELIS. Votre abonnement (-${d?.remisePct ?? 15} % à chaque livraison) : souhaitez-vous recevoir votre prochaine livraison ? Répondez OUI et nous préparons votre commande.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };
  const aRelancer = (d?.abonnes ?? []).filter((a) => !a.resilie && jours(a.derniere) >= (d?.relanceJours ?? 28));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 }}>
      <div style={{ ...carte, background: "#f4fbf6", fontSize: 13.5, color: "#2b312b" }}>
        Un client en abonnement paie <strong>{d?.remisePct ?? 15} % de moins</strong> à chaque livraison (prix calculé par le serveur). Il n'y a pas de prélèvement automatique : <strong>vous le relancez chaque mois</strong> par WhatsApp, il confirme, vous créez la commande. Un abonné est à relancer {d?.relanceJours ?? 28} jours après sa dernière commande.
      </div>
      <div style={{ fontWeight: 700 }}>{aRelancer.length} abonné(s) à relancer · {(d?.abonnes ?? []).filter((a) => !a.resilie).length} actif(s)</div>
      {(d?.abonnes ?? []).length === 0 && <div style={{ ...carte, color: "#777" }}>Aucun abonné pour l'instant.</div>}
      {(d?.abonnes ?? []).map((a) => {
        const j = jours(a.derniere);
        const relance = !a.resilie && j >= (d?.relanceJours ?? 28);
        return (
          <div key={String(a.phone)} style={{ ...carte, opacity: a.resilie ? 0.55 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div><strong>{String(a.nom)}</strong>{a.ville ? ` · ${String(a.ville)}` : ""}<br /><span style={{ color: "#777", fontSize: 12 }}>{String(a.phone)} · {String(a.produits ?? "")}</span></div>
              <div style={{ textAlign: "right" }}>
                {a.resilie ? <Badge texte="Résilié" couleur="#777" /> : relance ? <Badge texte="À relancer" couleur="#b45309" /> : <Badge texte="À jour" couleur={VERT} />}
                <div style={{ color: "#777", fontSize: 12, marginTop: 4 }}>Dernière commande {String(a.derniere_commande)} · il y a {j} j · {String(a.nb_abonnements)} abonnement(s)</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {!a.resilie && <a href={lien(a)} target="_blank" rel="noreferrer" style={{ ...bouton, textDecoration: "none" }}>Relancer sur WhatsApp</a>}
              {a.resilie
                ? <button onClick={() => void basculer(String(a.phone), false)} style={boutonDiscret}>Rétablir</button>
                : <button onClick={() => void basculer(String(a.phone), true)} style={{ ...boutonDiscret, color: "#b91c1c" }}>Résilier</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- Avis clients (vérifiés)
function Avis() {
  const [d, setD] = useState<{ avis: Ligne[]; compteurs: Ligne } | null>(null);
  const [statut, setStatut] = useState("en_attente");
  const [rep, setRep] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const charger = useCallback(() => { void api<{ avis: Ligne[]; compteurs: Ligne }>(`reviews?statut=${statut}`).then((r) => r.ok && setD(r.data)); }, [statut]);
  useEffect(charger, [charger]);
  async function agir(id: string, corps: Record<string, unknown>) {
    setErr("");
    const r = await api(`reviews/${id}`, { method: "PATCH", body: corps });
    if (!r.ok) setErr(r.data.error ?? "Échec."); else charger();
  }
  const onglets: [string, string, unknown][] = [["en_attente", "À valider", d?.compteurs.en_attente], ["publie", "Publiés", d?.compteurs.publies], ["refuse", "Refusés", undefined]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 }}>
      <div style={{ ...carte, background: "#f4fbf6", fontSize: 13.5, color: "#2b312b" }}>
        Ces avis viennent <strong>uniquement de clients dont le colis est livré</strong> (preuve d'achat : numéro de commande et téléphone). Ils ne s'affichent sur la page du produit qu'après votre validation, avec la mention « Achat vérifié ». <strong>Le texte du client ne se modifie pas</strong> : vous pouvez publier, refuser, ou répondre. Pour en recevoir, ouvrez un colis livré (Expéditions) et cliquez sur « Demander un avis » : le client reçoit un lien sur WhatsApp.
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {onglets.map(([k, t, n]) => <button key={k} onClick={() => setStatut(k)} style={{ ...boutonDiscret, ...(statut === k ? { background: VERT, color: "#fff", borderColor: VERT } : {}) }}>{t}{n !== undefined && Number(n) > 0 ? ` (${String(n)})` : ""}</button>)}
      </div>
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      {(d?.avis ?? []).length === 0 && <div style={{ ...carte, color: "#777" }}>Aucun avis dans cette liste.</div>}
      {(d?.avis ?? []).map((a) => {
        const id = String(a.id);
        return (
          <div key={id} style={carte}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div><strong>{String(a.display_name)}</strong>{a.city ? ` · ${String(a.city)}` : ""} <span style={{ color: "#f5a623" }}>{"★".repeat(Number(a.rating))}{"☆".repeat(5 - Number(a.rating))}</span><br /><span style={{ color: "#777", fontSize: 12 }}>{String(a.product_name)} · commande {String(a.number)} · {date(a.created_at)}</span></div>
              <Badge texte={a.status === "publie" ? "Publié" : a.status === "refuse" ? "Refusé" : "À valider"} couleur={a.status === "publie" ? VERT : a.status === "refuse" ? "#b91c1c" : "#b45309"} />
            </div>
            <p style={{ margin: "10px 0", lineHeight: 1.6, whiteSpace: "pre-line" }}>« {String(a.body)} »</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input defaultValue={String(a.shop_reply ?? "")} onChange={(e) => setRep({ ...rep, [id]: e.target.value })} placeholder="Réponse de la boutique (facultatif, affichée sous l'avis)" style={{ ...champ, flex: 1, minWidth: 220 }} />
              <button onClick={() => void agir(id, { reponse: rep[id] ?? String(a.shop_reply ?? "") })} style={boutonDiscret}>Enregistrer la réponse</button>
              {a.status !== "publie" && <button onClick={() => void agir(id, { statut: "publie" })} style={bouton}>✓ Publier</button>}
              {a.status !== "refuse" && <button onClick={() => void agir(id, { statut: "refuse" })} style={{ ...boutonDiscret, color: "#b91c1c" }}>Refuser</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- Clients
function Clients() {
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { void api<{ clients: Ligne[] }>(`customers?q=${encodeURIComponent(q)}`).then((r) => r.ok && setLignes(r.data.clients ?? [])); }, [q]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 }}>
      <input placeholder="Rechercher (nom, téléphone, e-mail, ville)" value={q} onChange={(e) => setQ(e.target.value)} style={champ} />
      <Tableau lignes={lignes} colonnes={[
        { titre: "Client", rendu: (l) => <><strong>{String(l.nom)}</strong><br /><span style={{ color: "#777", fontSize: 12 }}>{[l.ville, l.email].filter(Boolean).join(" · ")}</span></> },
        { titre: "Téléphone", rendu: (l) => <a href={`https://wa.me/${String(l.tel)}`} target="_blank" rel="noreferrer" style={{ color: VERT, fontWeight: 700 }}>{String(l.tel)}</a> },
        { titre: "Commandes", rendu: (l) => String(l.commandes) },
        { titre: "Payé", rendu: (l) => fcfa(l.paye_fcfa) },
        { titre: "À payer", rendu: (l) => <span style={{ color: Number(l.a_payer_fcfa) > 0 ? "#b91c1c" : "inherit", fontWeight: 700 }}>{fcfa(l.a_payer_fcfa)}</span> },
        { titre: "Dernière commande", rendu: (l) => date(l.derniere) },
      ]} />
    </div>
  );
}

// ---------------------------------------------------------------- Rapports
function Rapports() {
  const [jours, setJours] = useState(30);
  const [d, setD] = useState<{ totaux: Ligne; parJour: Ligne[]; produits: Ligne[]; canaux: Ligne[]; moyens: Ligne[] } | null>(null);
  useEffect(() => { void api<{ totaux: Ligne; parJour: Ligne[]; produits: Ligne[]; canaux: Ligne[]; moyens: Ligne[] }>(`reports?jours=${jours}`).then((r) => r.ok && setD(r.data)); }, [jours]);
  if (!d) return <p>Chargement…</p>;
  const max = Math.max(1, ...d.parJour.map((x) => Number(x.encaisse)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[7, 30, 90].map((j) => <button key={j} onClick={() => setJours(j)} style={{ ...boutonDiscret, ...(jours === j ? { background: VERT, color: "#fff", borderColor: VERT } : {}) }}>{j} jours</button>)}
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        {([["Encaissé", fcfa(d.totaux.encaisse)], ["Commandes", String(d.totaux.commandes)], ["Panier moyen", fcfa(d.totaux.panier_moyen)], ["Annulées", String(d.totaux.annulees)]] as const).map(([t, v]) => (
          <div key={t} style={carte}><div style={{ fontSize: 12.5, color: "#666" }}>{t}</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{v}</div></div>
        ))}
      </div>
      <div style={carte}>
        <strong>Encaissements par jour</strong>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130, marginTop: 12, overflowX: "auto" }}>
          {d.parJour.map((x) => (
            <div key={String(x.jour)} title={`${String(x.jour)} : ${fcfa(x.encaisse)} · ${String(x.commandes)} commande(s)`} style={{ flex: "1 0 6px", minWidth: 6, background: Number(x.encaisse) > 0 ? VERT : "#e4e7e2", height: `${Math.max(3, (Number(x.encaisse) / max) * 100)}%`, borderRadius: 3 }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#777", marginTop: 6 }}><span>{String(d.parJour[0]?.jour ?? "")}</span><span>{String(d.parJour[d.parJour.length - 1]?.jour ?? "")}</span></div>
      </div>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div><h3 style={{ margin: "0 0 8px" }}>Produits les plus vendus</h3><Tableau lignes={d.produits} colonnes={[{ titre: "Produit", rendu: (l) => String(l.name) }, { titre: "Qté", rendu: (l) => String(l.quantite) }, { titre: "Chiffre", rendu: (l) => fcfa(l.chiffre_fcfa) }]} /></div>
        <div><h3 style={{ margin: "0 0 8px" }}>Par canal</h3><Tableau lignes={d.canaux} colonnes={[{ titre: "Canal", rendu: (l) => LIB_CANAL[String(l.channel)] ?? String(l.channel) }, { titre: "Commandes", rendu: (l) => String(l.commandes) }, { titre: "Total", rendu: (l) => fcfa(l.total_fcfa) }]} /></div>
        <div><h3 style={{ margin: "0 0 8px" }}>Par moyen de paiement</h3><Tableau lignes={d.moyens} colonnes={[{ titre: "Moyen", rendu: (l) => LIB_MODE[String(l.payment_method)] ?? String(l.payment_method) }, { titre: "Commandes", rendu: (l) => String(l.commandes) }, { titre: "Encaissé", rendu: (l) => fcfa(l.encaisse_fcfa) }]} /></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Mon compte
function MonCompte({ moi, onChange }: { moi: Moi; onChange: () => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
      <div style={{ ...carte, maxWidth: 420 }}>
        <div style={{ fontSize: 12.5, color: "#666" }}>Connecté en tant que</div>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{moi.name}</div>
        <div style={{ color: "#555", fontSize: 14 }}>{moi.email}</div>
        <div style={{ marginTop: 8 }}><Badge texte={moi.role === "proprietaire" ? "Propriétaire" : "Gestionnaire"} couleur={moi.role === "proprietaire" ? VERT : "#1d4ed8"} /></div>
      </div>
      <FormMotDePasse onFait={onChange} />
    </div>
  );
}

// ---------------------------------------------------------------- Utilisateurs (propriétaire)
function Utilisateurs() {
  const [users, setUsers] = useState<Ligne[]>([]);
  const [f, setF] = useState({ name: "", email: "", role: "gestionnaire" });
  const [temp, setTemp] = useState<{ email: string; mdp: string } | null>(null);
  const [err, setErr] = useState("");
  const charger = useCallback(() => { void api<{ users: Ligne[] }>("users").then((r) => r.ok && setUsers(r.data.users ?? [])); }, []);
  useEffect(charger, [charger]);
  async function creer() {
    setErr("");
    const r = await api<{ email: string; motDePasseTemporaire: string }>("users", { method: "POST", body: f });
    if (!r.ok) { setErr(r.data.error ?? "Échec."); return; }
    setTemp({ email: r.data.email, mdp: r.data.motDePasseTemporaire });
    setF({ name: "", email: "", role: "gestionnaire" });
    charger();
  }
  async function agir(id: string, corps: Record<string, unknown>, email: string) {
    setErr("");
    const r = await api<{ motDePasseTemporaire?: string }>(`users/${id}`, { method: "PATCH", body: corps });
    if (!r.ok) { setErr(r.data.error ?? "Échec."); return; }
    if (r.data.motDePasseTemporaire) setTemp({ email, mdp: r.data.motDePasseTemporaire });
    charger();
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
      {temp && (
        <div style={{ ...carte, borderColor: "#f1c27d", background: "#fffaf0" }}>
          <strong>Mot de passe provisoire de {temp.email}</strong>
          <div style={{ fontFamily: "monospace", fontSize: 18, margin: "8px 0", userSelect: "all" }}>{temp.mdp}</div>
          <div style={{ fontSize: 13, color: "#555" }}>Transmettez-le à la personne : il n'est affiché <strong>qu'une seule fois</strong> et elle devra le remplacer à sa première connexion.</div>
          <button onClick={() => setTemp(null)} style={{ ...boutonDiscret, marginTop: 10 }}>J'ai noté le mot de passe</button>
        </div>
      )}
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      <Tableau lignes={users} colonnes={[
        { titre: "Utilisateur", rendu: (l) => <><strong>{String(l.name)}</strong>{l.active ? null : <span style={{ color: "#b91c1c" }}> (désactivé)</span>}<br /><span style={{ color: "#777", fontSize: 12 }}>{String(l.email)}</span></> },
        { titre: "Rôle", rendu: (l) => <Badge texte={l.role === "proprietaire" ? "Propriétaire" : "Gestionnaire"} couleur={l.role === "proprietaire" ? VERT : "#1d4ed8"} /> },
        { titre: "Dernière connexion", rendu: (l) => (l.last_login_at ? date(l.last_login_at) : l.must_change ? "jamais (mot de passe provisoire)" : "—") },
        { titre: "Actions", rendu: (l) => (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => void agir(String(l.id), { reinitialiser: true }, String(l.email))} style={boutonDiscret}>Réinitialiser le mot de passe</button>
            <button onClick={() => void agir(String(l.id), { active: !l.active }, String(l.email))} style={boutonDiscret}>{l.active ? "Désactiver" : "Réactiver"}</button>
            <button onClick={() => void agir(String(l.id), { role: l.role === "proprietaire" ? "gestionnaire" : "proprietaire" }, String(l.email))} style={boutonDiscret}>{l.role === "proprietaire" ? "Rendre gestionnaire" : "Rendre propriétaire"}</button>
          </div>) },
      ]} />
      <div style={{ ...carte, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8 }}>
        <strong>Ajouter un utilisateur</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="Nom" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ ...champ, flex: 1, minWidth: 140 }} />
          <input placeholder="Adresse e-mail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={{ ...champ, flex: 1, minWidth: 180 }} />
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} style={champ}><option value="gestionnaire">Gestionnaire</option><option value="proprietaire">Propriétaire</option></select>
          <button onClick={() => void creer()} disabled={!f.name || !f.email} style={bouton}>Créer le compte</button>
        </div>
        <div style={{ fontSize: 12.5, color: "#666" }}>Gestionnaire : commandes, paiements, clients, stock, produits, revendeurs, rapports. Propriétaire : tout, y compris utilisateurs, paramètres et journal.</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Journal (propriétaire)
const LIB_ACTION: Record<string, string> = {
  connexion: "Connexion", connexion_refusee: "Connexion refusée", changement_mdp: "Mot de passe changé", changement_mdp_refuse: "Changement de mot de passe refusé",
  compte_cree: "Compte créé", compte_desactive: "Compte désactivé", compte_reactive: "Compte réactivé", compte_role: "Rôle modifié", compte_mdp_reinitialise: "Mot de passe réinitialisé",
  commande_statut: "Statut de commande", commande_payee_manuel: "Paiement encaissé à la main", commande_saisie: "Commande saisie", stock: "Mouvement de stock",
  produit_cree: "Produit créé", produit_modifie: "Produit modifié", pack_cree: "Pack créé", pack_modifie: "Pack modifié", revendeur_cree: "Revendeur créé", revendeur_modifie: "Revendeur modifié",
  image_envoyee: "Image envoyée", reglage: "Réglage modifié",
  colis_cree: "Colis créé", colis_modifie: "Colis modifié", colis_statut: "Statut de colis", transporteur_cree: "Transporteur créé", transporteur_modifie: "Transporteur modifié",
  avis_modere: "Avis modéré", tarif_ville: "Tarif de ville", tarif_ville_modifie: "Tarif de ville modifié", tarif_ville_supprime: "Tarif de ville supprimé",
};
function Journal() {
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [action, setAction] = useState("");
  useEffect(() => { void api<{ journal: Ligne[] }>(`journal${action ? `?action=${action}` : ""}`).then((r) => r.ok && setLignes(r.data.journal ?? [])); }, [action]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 }}>
      <select value={action} onChange={(e) => setAction(e.target.value)} style={{ ...champ, maxWidth: 320 }}>
        <option value="">Toutes les actions</option>
        {Object.entries(LIB_ACTION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <Tableau lignes={lignes} colonnes={[
        { titre: "Date", rendu: (l) => date(l.at) },
        { titre: "Qui", rendu: (l) => String(l.admin_name ?? "—") },
        { titre: "Action", rendu: (l) => LIB_ACTION[String(l.action)] ?? String(l.action) },
        { titre: "Détail", rendu: (l) => <span style={{ fontSize: 13, color: "#555", wordBreak: "break-word" }}>{String(l.detail ?? "")}</span> },
      ]} />
    </div>
  );
}

// ---------------------------------------------------------------- Paramètres (propriétaire)
function Parametres() {
  const [regl, setRegl] = useState<{ cle: string; titre: string; aide: string; valeur: string }[]>([]);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  useEffect(() => { void api<{ reglages: { cle: string; titre: string; aide: string; valeur: string }[] }>("settings").then((r) => { if (r.ok) { setRegl(r.data.reglages); setVals(Object.fromEntries(r.data.reglages.map((x) => [x.cle, x.valeur]))); } }); }, []);
  async function enregistrer() {
    setMsg("");
    const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vals) });
    const d = (await r.json().catch(() => ({}))) as { error?: string };
    setMsg(r.ok ? "Enregistré ✓" : d.error ?? "Échec.");
  }
  return (
    <div style={{ ...carte, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14, maxWidth: 640 }}>
      {regl.map((x) => (
        <label key={x.cle} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{x.titre}</span>
          <input value={vals[x.cle] ?? ""} onChange={(e) => setVals({ ...vals, [x.cle]: e.target.value })} style={champ} />
          <span style={{ fontSize: 12.5, color: "#666" }}>{x.aide}</span>
        </label>
      ))}
      {msg && <div style={{ color: msg.startsWith("Enregistré") ? VERT : "#b91c1c", fontWeight: 700 }}>{msg}</div>}
      <div><button onClick={() => void enregistrer()} style={bouton}>Enregistrer les paramètres</button></div>
    </div>
  );
}

// ---------------------------------------------------------------- Page
type Moi = { email: string; name: string; role: "proprietaire" | "gestionnaire"; mustChange: boolean };

const MENU: { id: Onglet; titre: string; icone: string; proprietaire?: boolean; groupe?: string }[] = [
  { id: "tableau", titre: "Tableau de bord", icone: "📊" },
  { id: "commandes", titre: "Commandes", icone: "🧾" },
  { id: "expeditions", titre: "Expéditions", icone: "🚚" },
  { id: "paiements", titre: "Paiements", icone: "💳" },
  { id: "avis", titre: "Avis clients", icone: "⭐" },
  { id: "abonnements", titre: "Abonnements", icone: "🔁" },
  { id: "clients", titre: "Clients", icone: "👥" },
  { id: "stock", titre: "Stock", icone: "📦" },
  { id: "produits", titre: "Produits", icone: "🌿" },
  { id: "revendeurs", titre: "Revendeurs", icone: "🤝" },
  { id: "rapports", titre: "Rapports", icone: "📈" },
  { id: "utilisateurs", titre: "Utilisateurs", icone: "🔑", proprietaire: true, groupe: "Administration" },
  { id: "parametres", titre: "Paramètres", icone: "⚙️", proprietaire: true },
  { id: "journal", titre: "Journal d'activité", icone: "📜", proprietaire: true },
  { id: "compte", titre: "Mon compte", icone: "👤" },
];

export default function Admin() {
  const [moi, setMoi] = useState<Moi | null | "inconnu">("inconnu");
  const [onglet, setOnglet] = useState<Onglet>("tableau");
  const [aTraiter, setATraiter] = useState(0);
  const [aExpedier, setAExpedier] = useState(0);
  const [etroit, setEtroit] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  const charger = useCallback(async () => {
    const r = await api<Moi>("me");
    setMoi(r.ok ? r.data : null);
  }, []);
  useEffect(() => { void charger(); }, [charger]);
  useEffect(() => {
    const f = () => setEtroit(window.innerWidth < 860);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  useEffect(() => {
    if (moi && moi !== "inconnu" && !moi.mustChange) {
      void api<{ chiffres: Ligne }>("stats").then((r) => r.ok && setATraiter(Number(r.data.chiffres.a_traiter)));
      void api<{ compteurs: Ligne }>("shipments?vue=en_cours").then((r) => r.ok && setAExpedier(Number(r.data.compteurs.a_expedier)));
    }
  }, [moi, onglet]);

  if (moi === "inconnu") return <p style={{ padding: 20 }}>Chargement…</p>;
  if (moi === null) return <Connexion onOk={() => void charger()} />;
  if (moi.mustChange) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <FormMotDePasse obligatoire onFait={() => void charger()} />
      </div>
    );
  }

  const proprio = moi.role === "proprietaire";
  const visibles = MENU.filter((m) => !m.proprietaire || proprio);
  const titreOnglet = MENU.find((m) => m.id === onglet)?.titre ?? "";
  const aller = (o: Onglet) => { setOnglet(o); setMenuOuvert(false); };
  const deconnexion = () => void api("logout", { method: "POST" }).then(() => setMoi(null));

  const navigation = (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {visibles.map((m) => (
        <div key={m.id}>
          {m.groupe && <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#8a948a", fontWeight: 700, margin: "14px 10px 6px" }}>{m.groupe.toUpperCase()}</div>}
          <button onClick={() => aller(m.id)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: 0, cursor: "pointer", fontSize: 14, fontWeight: onglet === m.id ? 800 : 600, background: onglet === m.id ? VERT : "transparent", color: onglet === m.id ? "#fff" : "#2b312b" }}>
            <span aria-hidden>{m.icone}</span>
            <span style={{ flex: 1 }}>{m.titre}</span>
            {m.id === "expeditions" && aExpedier > 0 && <span style={{ background: onglet === m.id ? "#fff" : "#b45309", color: onglet === m.id ? VERT : "#fff", borderRadius: 999, padding: "1px 8px", fontSize: 12, fontWeight: 800 }}>{aExpedier}</span>}
            {m.id === "commandes" && aTraiter > 0 && <span style={{ background: onglet === m.id ? "#fff" : "#b91c1c", color: onglet === m.id ? VERT : "#fff", borderRadius: 999, padding: "1px 8px", fontSize: 12, fontWeight: 800 }}>{aTraiter}</span>}
          </button>
        </div>
      ))}
    </nav>
  );

  const contenu = (
    <>
      {onglet === "tableau" && <TableauDeBord ouvrir={aller} />}
      {onglet === "commandes" && <Commandes />}
      {onglet === "expeditions" && <Expeditions />}
      {onglet === "paiements" && <Paiements />}
      {onglet === "avis" && <Avis />}
      {onglet === "abonnements" && <Abonnements />}
      {onglet === "clients" && <Clients />}
      {onglet === "stock" && <Stock />}
      {onglet === "produits" && <Produits />}
      {onglet === "revendeurs" && <Revendeurs />}
      {onglet === "rapports" && <Rapports />}
      {onglet === "utilisateurs" && proprio && <Utilisateurs />}
      {onglet === "parametres" && proprio && <Parametres />}
      {onglet === "journal" && proprio && <Journal />}
      {onglet === "compte" && <MonCompte moi={moi} onChange={() => void charger()} />}
    </>
  );

  const identite = (
    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.4 }}>
      <strong style={{ color: "#1a1a1a" }}>{moi.name}</strong><br />
      <span style={{ fontSize: 12 }}>{proprio ? "Propriétaire" : "Gestionnaire"}</span>
    </div>
  );

  if (etroit) {
    return (
      <div style={{ padding: "0 12px 60px" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#f6f7f5", padding: "10px 0", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #e4e7e2" }}>
          <button onClick={() => setMenuOuvert(!menuOuvert)} style={{ ...boutonDiscret, padding: "8px 12px" }} aria-label="Menu">☰</button>
          <strong style={{ flex: 1, color: VERT }}>{titreOnglet}</strong>
          {aTraiter > 0 && <button onClick={() => aller("commandes")} style={{ ...bouton, padding: "6px 10px", background: "#b91c1c" }}>{aTraiter} à traiter</button>}
        </header>
        {menuOuvert && <div style={{ ...carte, margin: "10px 0" }}>{navigation}<div style={{ borderTop: "1px solid #e4e7e2", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>{identite}<button onClick={deconnexion} style={boutonDiscret}>Déconnexion</button></div></div>}
        <div style={{ marginTop: 14 }}>{contenu}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", minHeight: "100vh" }}>
      <aside style={{ background: "#fff", borderRight: "1px solid #e4e7e2", padding: 16, position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        <div style={{ fontWeight: 900, fontSize: 18, color: VERT, letterSpacing: -0.3 }}>NUTRELIS<div style={{ fontSize: 11, letterSpacing: 2, color: "#8a948a", fontWeight: 700 }}>CONSOLE</div></div>
        <div style={{ flex: 1 }}>{navigation}</div>
        <div style={{ borderTop: "1px solid #e4e7e2", paddingTop: 12, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8 }}>{identite}<button onClick={deconnexion} style={boutonDiscret}>Déconnexion</button></div>
      </aside>
      <main style={{ padding: "22px 28px 80px", maxWidth: 1240 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 18px" }}>{titreOnglet}</h1>
        {contenu}
      </main>
    </div>
  );
}
