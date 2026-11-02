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

-- Expéditions de colis au Cameroun : transporteurs, tarifs par ville, colis et leur historique. Idempotent.

CREATE TABLE IF NOT EXISTS carrier (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  phone      TEXT,
  notes      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tarif de livraison par ville (une ville = une ligne, insensible à la casse). Une ville absente de cette table
-- paie le tarif par défaut des réglages (`frais_livraison_fcfa`).
CREATE TABLE IF NOT EXISTS shipping_rate (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city       TEXT NOT NULL,
  fee_fcfa   INTEGER NOT NULL CHECK (fee_fcfa >= 0),
  delay      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Tarif par quartier : `district` vide = tarif de toute la ville ; renseigné = tarif de ce quartier (prioritaire).
ALTER TABLE shipping_rate ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';
DROP INDEX IF EXISTS shipping_rate_city_idx;
CREATE UNIQUE INDEX IF NOT EXISTS shipping_rate_city_district_idx ON shipping_rate (lower(city), lower(district));

-- Un colis par commande. `cod_fcfa` = somme à encaisser auprès du destinataire à la remise (paiement à la livraison).
CREATE TABLE IF NOT EXISTS shipment (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL UNIQUE REFERENCES customer_order(id) ON DELETE CASCADE,
  carrier_id    UUID REFERENCES carrier(id),
  tracking      TEXT,
  status        TEXT NOT NULL DEFAULT 'expediee' CHECK (status IN ('expediee','en_livraison','livree','echec','retournee')),
  cod_fcfa      INTEGER NOT NULL DEFAULT 0 CHECK (cod_fcfa >= 0),
  cod_collected BOOLEAN NOT NULL DEFAULT FALSE,
  notes         TEXT,
  shipped_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shipment_status_idx ON shipment (status, shipped_at DESC);

CREATE TABLE IF NOT EXISTS shipment_event (
  id          BIGSERIAL PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipment(id) ON DELETE CASCADE,
  at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      TEXT NOT NULL,
  note        TEXT,
  admin_name  TEXT
);
CREATE INDEX IF NOT EXISTS shipment_event_idx ON shipment_event (shipment_id, at);

-- Vidéos MP4 envoyées depuis l'administration (25 Mo au plus) : mêmes règles que les images, servies avec « Range » pour iOS.
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_content_type_check;
ALTER TABLE media ADD CONSTRAINT media_content_type_check CHECK (content_type IN ('image/png','image/jpeg','image/webp','video/mp4'));
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_data_check;
ALTER TABLE media ADD CONSTRAINT media_data_check CHECK (octet_length(data) <= 26214400);

-- Avis clients VÉRIFIÉS : un avis n'existe que pour un produit réellement livré à son auteur (commande + téléphone), et ne s'affiche
-- qu'après validation par la boutique. Un avis par produit et par commande. Idempotent.
CREATE TABLE IF NOT EXISTS review (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES customer_order(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 1200),
  display_name TEXT NOT NULL,
  city         TEXT,
  status       TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente','publie','refuse')),
  shop_reply   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ,
  UNIQUE (order_id, product_id)
);
CREATE INDEX IF NOT EXISTS review_product_idx ON review (product_id, status, created_at DESC);

-- Vue pratique : stock courant par variante.
CREATE OR REPLACE VIEW variant_stock AS
SELECT v.id AS variant_id, COALESCE(SUM(m.delta), 0)::int AS stock
FROM variant v LEFT JOIN stock_movement m ON m.variant_id = v.id
GROUP BY v.id;

-- Produit de départ (les 3 packs d'Astaxanthine du site d'origine, prix de la base du 11/05/2026).
-- Abonnement : la ligne (et la commande) sont marquées pour que le prix soit celui d'abonné et que la boutique relance.
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS subscription BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customer_order ADD COLUMN IF NOT EXISTS subscription BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS customer_order_phone_idx ON customer_order (phone);

-- Blog : articles saisis dans la console, rattachés (ou non) à un produit. Sans texte intégral, l'article renvoie vers un lien externe.
CREATE TABLE IF NOT EXISTS blog_post (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'Conseils',
  product_id   UUID REFERENCES product(id) ON DELETE SET NULL,
  image_url    TEXT,
  external_url TEXT,
  published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE blog_post ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE blog_post ADD COLUMN IF NOT EXISTS excerpt_en TEXT;
ALTER TABLE blog_post ADD COLUMN IF NOT EXISTS body_en TEXT;
-- Nombre de produits d'un pack (1, 2 ou 3) : sert à calculer la durée du pack pour la relance d'abonnement.
ALTER TABLE variant ADD COLUMN IF NOT EXISTS units INTEGER NOT NULL DEFAULT 1 CHECK (units >= 1);
UPDATE variant SET units = 2 WHERE sku IN ('NUT-AX-2P', 'GEL-ORANGE-2') AND units = 1;
UPDATE variant SET units = 3 WHERE sku IN ('NUT-AX-3P', 'GEL-ORANGE-3') AND units = 1;
-- Abonnés qui ont résilié (par téléphone) : on ne les relance plus.
CREATE TABLE IF NOT EXISTS subscription_stop (
  phone      TEXT PRIMARY KEY,
  stopped_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Abonnés qui ont résilié (par téléphone) : on ne les relance plus.
CREATE TABLE IF NOT EXISTS subscription_stop (
  phone      TEXT PRIMARY KEY,
  stopped_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Abonnés qui ont résilié (par téléphone) : on ne les relance plus.
CREATE TABLE IF NOT EXISTS subscription_stop (
  phone      TEXT PRIMARY KEY,
  stopped_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- Messages du formulaire de contact (onglet « Messages » de la console)
CREATE TABLE IF NOT EXISTS contact_message (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau','traite')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_message_status_idx ON contact_message (status, created_at DESC);

-- Codes promo, remise sur commande, paniers abandonnés
CREATE TABLE IF NOT EXISTS promo_code (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('percent','fixed')),
  value         INTEGER NOT NULL CHECK (value > 0),
  min_order_fcfa INTEGER NOT NULL DEFAULT 0 CHECK (min_order_fcfa >= 0),
  max_uses      INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count    INTEGER NOT NULL DEFAULT 0,
  starts_at     TIMESTAMPTZ,
  ends_at       TIMESTAMPTZ,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS promo_code_code_idx ON promo_code (upper(code));
ALTER TABLE customer_order ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE customer_order ADD COLUMN IF NOT EXISTS discount_fcfa INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS abandoned_cart (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT NOT NULL,
  name       TEXT,
  email      TEXT,
  city       TEXT,
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_fcfa INTEGER NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'ouvert' CHECK (status IN ('ouvert','relance','recupere')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS abandoned_cart_phone_idx ON abandoned_cart (phone);
CREATE INDEX IF NOT EXISTS abandoned_cart_status_idx ON abandoned_cart (status, updated_at DESC);
