-- NUTRELIS — commandes, paiements, stock, revendeurs. Idempotent : rejouable sans danger.
-- Base `nexio_nutrelis` (cluster Patroni de NEXIO), rôle `nutrelis_app`, accès via PgBouncer (mode transaction).

CREATE TABLE IF NOT EXISTS product (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  subtitle    TEXT,
  description TEXT,
  image_url   TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Une variante = ce qu'on vend (un pack) : prix public, prix revendeur optionnel, seuil d'alerte de stock.
CREATE TABLE IF NOT EXISTS variant (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  sku                TEXT NOT NULL UNIQUE,
  label              TEXT NOT NULL,
  price_fcfa         INTEGER NOT NULL CHECK (price_fcfa >= 0),
  original_price_fcfa INTEGER CHECK (original_price_fcfa >= 0),
  reseller_price_fcfa INTEGER CHECK (reseller_price_fcfa >= 0),
  low_stock_alert    INTEGER NOT NULL DEFAULT 5,
  active             BOOLEAN NOT NULL DEFAULT TRUE,
  sort               INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LE STOCK EST UN JOURNAL : on n'écrit jamais « il en reste 12 », on écrit « -2 (vente NUT-000042) ».
-- Le stock courant = la somme des mouvements. Rien ne se perd, tout s'explique.
CREATE TABLE IF NOT EXISTS stock_movement (
  id         BIGSERIAL PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES variant(id),
  delta      INTEGER NOT NULL CHECK (delta <> 0),
  reason     TEXT NOT NULL CHECK (reason IN ('initial','reappro','vente','annulation','retour','ajustement','casse')),
  ref        TEXT,
  note       TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stock_movement_variant_idx ON stock_movement (variant_id);

CREATE TABLE IF NOT EXISTS reseller (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  city       TEXT,
  discount_pct INTEGER NOT NULL DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 90),
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE IF NOT EXISTS customer_order (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number         TEXT NOT NULL UNIQUE,
  channel        TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web','revendeur','manuel')),
  reseller_id    UUID REFERENCES reseller(id),
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  city           TEXT,
  address        TEXT,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'nouvelle' CHECK (status IN ('nouvelle','confirmee','expediee','livree','annulee')),
  payment_status TEXT NOT NULL DEFAULT 'en_attente' CHECK (payment_status IN ('en_attente','payee','echouee','a_la_livraison','remboursee')),
  payment_method TEXT NOT NULL DEFAULT 'fapshi' CHECK (payment_method IN ('fapshi','livraison','especes','virement')),
  subtotal_fcfa  INTEGER NOT NULL,
  delivery_fcfa  INTEGER NOT NULL DEFAULT 0,
  total_fcfa     INTEGER NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customer_order_status_idx ON customer_order (status, created_at DESC);
CREATE INDEX IF NOT EXISTS customer_order_reseller_idx ON customer_order (reseller_id);

CREATE TABLE IF NOT EXISTS order_item (
  id          BIGSERIAL PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES customer_order(id) ON DELETE CASCADE,
  variant_id  UUID NOT NULL REFERENCES variant(id),
  name        TEXT NOT NULL,
  unit_fcfa   INTEGER NOT NULL,
  qty         INTEGER NOT NULL CHECK (qty > 0)
);
CREATE INDEX IF NOT EXISTS order_item_order_idx ON order_item (order_id);

CREATE TABLE IF NOT EXISTS payment (
  id              BIGSERIAL PRIMARY KEY,
  order_id        UUID NOT NULL REFERENCES customer_order(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,
  provider_ref    TEXT,
  amount_fcfa     INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente','payee','echouee')),
  provider_status TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_ref_idx ON payment (provider, provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS payment_order_idx ON payment (order_id);

-- Fiche produit « comme l'Astaxanthine » : contenu éditable depuis l'administration (accroche, avantages, raisons, FAQ,
-- avis RÉELS, garantie, images). Pack : description, mise en avant « populaire ». Images : stockées en base (partagées par V0 et NCP).
ALTER TABLE product ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE variant ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE variant ADD COLUMN IF NOT EXISTS popular BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('image/png','image/jpeg','image/webp')),
  data         BYTEA NOT NULL CHECK (octet_length(data) <= 3145728),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Console d'administration : comptes, rôles, journal d'audit, paramètres. Idempotent.

-- Comptes administrateurs. Le mot de passe n'est JAMAIS stocké : seulement son empreinte scrypt (sel aléatoire).
-- `session_version` augmente à chaque changement de mot de passe : toutes les sessions ouvertes deviennent invalides.
CREATE TABLE IF NOT EXISTS admin_user (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('proprietaire','gestionnaire')),
  password_hash   TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  must_change     BOOLEAN NOT NULL DEFAULT FALSE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journal : qui a fait quoi, quand. On y écrit, on n'y modifie rien.
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGSERIAL PRIMARY KEY,
  at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin_id   UUID,
  admin_name TEXT,
  action     TEXT NOT NULL,
  detail     TEXT
);
CREATE INDEX IF NOT EXISTS audit_log_at_idx ON audit_log (at DESC);

-- Réglages de la boutique (clé / valeur).
CREATE TABLE IF NOT EXISTS setting (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vue pratique : stock courant par variante.
CREATE OR REPLACE VIEW variant_stock AS
SELECT v.id AS variant_id, COALESCE(SUM(m.delta), 0)::int AS stock
FROM variant v LEFT JOIN stock_movement m ON m.variant_id = v.id
GROUP BY v.id;

-- Produit de départ (les 3 packs d'Astaxanthine du site d'origine, prix de la base du 11/05/2026).
INSERT INTO product (slug, name, subtitle, description, image_url, sort)
VALUES ('astaxanthine-12mg', 'Astaxanthine 12mg', 'Antioxydant Premium NUTRELIS',
  'L''antioxydant le plus puissant au monde. 6000× plus efficace que la Vitamine C. Formule cliniquement dosée à 12mg.',
  '/images/astaxanthine/img_transparent.png', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO variant (product_id, sku, label, price_fcfa, sort)
SELECT p.id, v.sku, v.label, v.price, v.sort FROM product p
JOIN (VALUES ('NUT-AX-1P','1 Pack - 60 caps',15000,1),('NUT-AX-2P','2 Packs - 120 caps',27000,2),('NUT-AX-3P','3 Packs - 180 caps',36000,3))
  AS v(sku,label,price,sort) ON TRUE
WHERE p.slug = 'astaxanthine-12mg'
ON CONFLICT (sku) DO NOTHING;
