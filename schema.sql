CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS utilisateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(150) NOT NULL,
  telephone VARCHAR(20) UNIQUE NOT NULL,
  mot_de_passe_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'membre',
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groupes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(150) NOT NULL,
  description TEXT,
  montant_cotisation NUMERIC(12,2) NOT NULL,
  frequence VARCHAR(20) NOT NULL DEFAULT 'mensuelle',
  createur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS membres_groupe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id UUID NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
  utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  ordre_rotation INTEGER NOT NULL,
  rejoint_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (groupe_id, utilisateur_id),
  UNIQUE (groupe_id, ordre_rotation)
);

CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id UUID NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
  numero_tour INTEGER NOT NULL,
  beneficiaire_id UUID NOT NULL REFERENCES utilisateurs(id),
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'en_cours',
  UNIQUE (groupe_id, numero_tour)
);

CREATE TABLE IF NOT EXISTS cotisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id),
  montant NUMERIC(12,2) NOT NULL,
  preuve_url TEXT,
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  soumis_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  valide_le TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_membres_groupe ON membres_groupe(groupe_id);
CREATE INDEX IF NOT EXISTS idx_tours_groupe ON tours(groupe_id);
CREATE INDEX IF NOT EXISTS idx_cotisations_tour ON cotisations(tour_id);
CREATE INDEX IF NOT EXISTS idx_cotisations_utilisateur ON cotisations(utilisateur_id);
