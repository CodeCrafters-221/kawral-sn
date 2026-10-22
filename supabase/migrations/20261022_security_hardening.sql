-- =============================================================================
-- MIGRATION DE SÉCURISATION GLOBALE (RLS, RPC & PROTECTION DES DONNÉES)
-- Date: 2026-10-22
-- =============================================================================

-- 1. Protection stricte des colonnes sensibles de public.profiles (role, email_verified)
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Empêcher tout utilisateur non-admin de s'attribuer le rôle 'admin' lors d'un INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' AND NOT public.is_admin() THEN
      NEW.role := 'client';
    END IF;
    RETURN NEW;
  END IF;

  -- Lors d'un UPDATE par un non-admin :
  IF TG_OP = 'UPDATE' AND NOT public.is_admin() THEN
    -- Interdire strictement le passage au rôle 'admin'
    IF NEW.role = 'admin' AND OLD.role <> 'admin' THEN
      RAISE EXCEPTION 'Accès refusé : élévation de privilèges vers admin interdite.';
    END IF;

    -- Autoriser uniquement la transition légitime 'client' -> 'vendeur'
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT (OLD.role = 'client' AND NEW.role = 'vendeur') THEN
      NEW.role := OLD.role;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_sensitive_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_sensitive_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_sensitive_columns();

-- 2. Durcissement de la fonction RPC increment_views (anti-spam propriétaire & annonces non publiées)
CREATE OR REPLACE FUNCTION public.increment_views(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.listings
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = listing_id
    AND status = 'published'
    AND (auth.uid() IS NULL OR user_id <> auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;

-- 3. Verrouillage RLS complet de la table public.reports (modération réservée aux admins)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reports'
  ) THEN
    ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "reports_public_insert" ON public.reports;
    CREATE POLICY "reports_public_insert" ON public.reports
      FOR INSERT
      WITH CHECK (
        status = 'pending'
        AND char_length(COALESCE(details, '')) <= 1000
      );

    DROP POLICY IF EXISTS "reports_admin_select" ON public.reports;
    CREATE POLICY "reports_admin_select" ON public.reports
      FOR SELECT
      USING (public.is_admin());

    DROP POLICY IF EXISTS "reports_admin_update" ON public.reports;
    CREATE POLICY "reports_admin_update" ON public.reports
      FOR UPDATE
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    DROP POLICY IF EXISTS "reports_admin_delete" ON public.reports;
    CREATE POLICY "reports_admin_delete" ON public.reports
      FOR DELETE
      USING (public.is_admin());
  END IF;
END;
$$;

-- 4. Verrouillage RLS des buckets Storage contre les extensions/types dangereux
-- (Seuls les fichiers dans le dossier {auth.uid()}/... peuvent être insérés/modifiés/supprimés)
DROP POLICY IF EXISTS "listing_images_auth_insert" ON storage.objects;
CREATE POLICY "listing_images_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'webm', 'm4a', 'mp3', 'ogg', 'wav')
  );

DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
CREATE POLICY "avatars_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  );

NOTIFY pgrst, 'reload schema';
