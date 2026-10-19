-- ============================================================================
-- Gestion des statuts d'annonces (style Facebook Marketplace)
--
-- Problèmes corrigés :
--   1. La contrainte CHECK sur listings.status de la base peut ne pas accepter
--      tous les statuts (unavailable / sold / rented / archived), ce qui faisait
--      échouer le changement de statut ("Impossible de mettre à jour le statut").
--   2. La policy UPDATE dépendait de la table agencies (rôle supprimé) : on la
--      remplace par une règle simple "propriétaire ou admin".
--   3. La lecture publique ne montrait que les annonces 'published' : les annonces
--      vendues / louées / indisponibles disparaissaient de la marketplace au lieu
--      d'afficher le voile « VENDU / LOUÉ / INDISPONIBLE ».
--
-- Script idempotent : peut être relancé sans risque.
-- ============================================================================

-- 1. Contrainte de statut ----------------------------------------------------
DO $$
DECLARE
    c RECORD;
BEGIN
    FOR c IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.listings'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%status%'
    LOOP
        EXECUTE format('ALTER TABLE public.listings DROP CONSTRAINT %I', c.conname);
    END LOOP;
END $$;

ALTER TABLE public.listings
    ADD CONSTRAINT listings_status_check
    CHECK (status IN ('draft', 'published', 'unavailable', 'sold', 'rented', 'archived'));

-- 2. Modification : propriétaire de l'annonce ou admin -----------------------
DROP POLICY IF EXISTS "listings_owner_update" ON public.listings;
DROP POLICY IF EXISTS "Modification de ses annonces" ON public.listings;
CREATE POLICY "listings_owner_update" ON public.listings
    FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 3. Lecture : le public voit les annonces en ligne, vendues, louées ou
--    indisponibles (les brouillons et archives restent privés) ---------------
DROP POLICY IF EXISTS "listings_read_policy" ON public.listings;
DROP POLICY IF EXISTS "Lecture publique des annonces publiées" ON public.listings;
CREATE POLICY "listings_read_policy" ON public.listings
    FOR SELECT USING (
        public.is_admin()
        OR auth.uid() = user_id
        OR status IN ('published', 'unavailable', 'sold', 'rented')
    );

NOTIFY pgrst, 'reload schema';
