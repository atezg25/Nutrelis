# Graph Report - .  (2026-10-06)

## Corpus Check
- 115 files · ~1,173,984 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 255 nodes · 394 edges · 44 communities detected
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 123 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 57 edges
2. `GET()` - 50 edges
3. `PATCH()` - 30 edges
4. `query()` - 16 edges
5. `tx()` - 11 edges
6. `Layout()` - 11 edges
7. `api()` - 11 edges
8. `String()` - 11 edges
9. `adminCourant()` - 10 edges
10. `PUT()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `t()` --calls--> `puce()`  [INFERRED]
  src\lib\contenu.ts → src\app\blog\page.tsx
- `p()` --calls--> `String()`  [INFERRED]
  src\app\produits\astaxanthine-12mg\page.tsx → src\app\admin\page.tsx
- `ajouter()` --calls--> `PATCH()`  [INFERRED]
  src\components\ProductTemplate.tsx → src\app\api\admin\shipments\[id]\route.ts
- `envoyerWhatsApp()` --calls--> `POST()`  [INFERRED]
  src\lib\whatsapp.ts → src\app\api\send-confirmation\route.ts
- `notifierBoutiqueWhatsApp()` --calls--> `POST()`  [INFERRED]
  src\lib\whatsapp.ts → src\app\api\send-confirmation\route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (11): check(), createRateLimiter(), getClientIp(), scheduleCleanup(), chiffres(), commande(), escapeHtml(), GET() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (22): agir(), ajouterPack(), api(), appel(), aRelancerA(), basculer(), chercher(), confirmerCommande() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (13): changerStatutExpedition(), corps(), entier(), erreur(), refuserSiNonAdmin(), refuserSiNonProprietaire(), reponse(), reponseErreur() (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (16): pool(), query(), tx(), appel(), entetes(), fapshiConfigure(), initierPaiement(), verifierPaiement() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (8): nettoyerContenu(), t(), async(), fn(), handlePaiement(), handleScroll(), handleSubmit(), p()

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (10): adminCourant(), connecter(), egal(), hacher(), jetonSession(), journaliser(), motDePasseTemporaire(), secret() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (1): Layout()

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (5): creerExpedition(), ErreurExpedition, modifierExpedition(), ajouter(), L()

### Community 8 - "Community 8"
Cohesion: 0.2
Nodes (6): lireAbonnement(), fraisPourVille(), notifierNouvelleCommande(), ecrireReglage(), lireReglage(), lireReglages()

### Community 9 - "Community 9"
Cohesion: 0.36
Nodes (6): envoyerSms(), formatPhone(), notifierBoutiqueSms(), envoyerWhatsApp(), formatPhone(), notifierBoutiqueWhatsApp()

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (2): HydrationGuard(), useHydrated()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (2): fetchProductByHandle(), fetchProducts()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 15`** (2 nodes): `nexio_writer.js`, `writeFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `MemoireProduit()`, `MemoireProduit.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `Reveler()`, `Reveler.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `construirePacks()`, `packs.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `prixAbonne()`, `abonnement.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `sanitizeHtml()`, `sanitize.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `RootLayout()`, `layout.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `sitemap()`, `sitemap.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `robots()`, `robots.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `AstaxanthineLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `GelLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `NavbarCart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `LanguageSwitcher.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `en.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `fr.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 7`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Why does `String()` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 8`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `POST()` (e.g. with `GET()` and `reponse()`) actually correct?**
  _`POST()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `GET()` (e.g. with `lireReglages()` and `getClientIp()`) actually correct?**
  _`GET()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 20 inferred relationships involving `PATCH()` (e.g. with `refuserSiNonAdmin()` and `erreur()`) actually correct?**
  _`PATCH()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `query()` (e.g. with `ecrireReglage()` and `modifierExpedition()`) actually correct?**
  _`query()` has 13 INFERRED edges - model-reasoned connections that need verification._