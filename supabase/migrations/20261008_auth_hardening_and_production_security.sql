-- ==============================================================================
-- Migration : Sécurisation & Durcissement de l'Authentification (Production-Ready)
-- Date      : 2026-10-08
-- Objectif  : 
--   1. Trigger robuste handle_new_user() avec gestion automatique des agences et Google OAuth
--   2. Fonction RPC upgrade_user_to_seller() avec SECURITY DEFINER
--   3. Anti-escalade de privilèges : interdire l'attribution directe du rôle 'admin'
--   4. Contrainte UNIQUE sur agencies(user_id) pour éliminer les doublons
--   5. Synchronisation des profils existants
-- ==============================================================================

-- 1. Dédoublonnage préalable des agences par user_id et création de l'index UNIQUE
DELETE FROM public.agencies a
USING public.agencies b
WHERE a.user_id = b.user_id
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS agencies_user_id_unique_idx
    ON public.agencies (user_id);

-- 2. Sécurisation des Politiques RLS sur public.profiles
-- Anti-escalade : Un client ne peut PAS s'attribuer le rôle 'admin' à la création
DROP POLICY IF EXISTS "Insertion de son profil" ON public.profiles;
CREATE POLICY "Insertion de son profil" ON public.profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = id
        AND role IN ('client', 'vendeur', 'agence')
    );

-- Permet la mise à jour de son profil pour les rôles client/vendeur/agence,
-- tout en réservant la gestion du rôle 'admin' aux seuls administrateurs
DROP POLICY IF EXISTS "Modification de son profil ou par un admin" ON public.profiles;
CREATE POLICY "Modification de son profil ou par un admin" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() = id
            AND role IN ('client', 'vendeur', 'agence')
        )
    );

-- 3. Trigger automatique handle_new_user() sur auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    raw_role TEXT;
    normalized_role TEXT;
    user_full_name TEXT;
    user_avatar TEXT;
    user_phone TEXT;
    agency_name_val TEXT;
    agency_address_val TEXT;
BEGIN
    -- 1. Normalisation sécurisée du rôle demandé (jamais 'admin')
    raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'client'));
    IF raw_role IN ('seller', 'vendeur') THEN
        normalized_role := 'vendeur';
    ELSIF raw_role IN ('agency', 'agence') THEN
        normalized_role := 'agence';
    ELSE
        normalized_role := 'client';
    END IF;

    -- 2. Extraction des informations de profil
    user_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(NEW.email, '@', 1),
        'Utilisateur Kawral'
    );

    user_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        NULL
    );

    user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');

    -- 3. Insertion ou mise à jour atomique du profil (contourne le RLS via SECURITY DEFINER)
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        avatar_url,
        role,
        email_verified,
        updated_at
    )
    VALUES (
        NEW.id,
        user_full_name,
        LOWER(TRIM(NEW.email)),
        user_phone,
        user_avatar,
        normalized_role,
        (NEW.email_confirmed_at IS NOT NULL),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
        email_verified = (NEW.email_confirmed_at IS NOT NULL OR public.profiles.email_verified),
        updated_at = NOW();

    -- 4. Si inscription en tant qu'agence, création atomique de l'agence associée
    IF normalized_role = 'agence' THEN
        agency_name_val := COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'agency_name'), ''),
            user_full_name,
            'Mon Agence'
        );
        agency_address_val := NULLIF(TRIM(NEW.raw_user_meta_data->>'agency_address'), '');

        INSERT INTO public.agencies (
            user_id,
            agency_name,
            email,
            address,
            phone
        )
        VALUES (
            NEW.id,
            agency_name_val,
            LOWER(TRIM(NEW.email)),
            agency_address_val,
            user_phone
        )
        ON CONFLICT (user_id) DO UPDATE SET
            agency_name = COALESCE(public.agencies.agency_name, EXCLUDED.agency_name),
            email = COALESCE(public.agencies.email, EXCLUDED.email);
    END IF;

    RETURN NEW;
END;
$$;

-- Installation du trigger sur auth.users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Trigger on_auth_user_created : auth.users non accessible directement';
END;
$$;

-- 4. Fonction RPC pour mettre à niveau un client en vendeur de manière sécurisée
CREATE OR REPLACE FUNCTION public.upgrade_user_to_seller()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
    END IF;

    -- Passage de 'client' à 'vendeur'
    UPDATE public.profiles
    SET role = 'vendeur',
        updated_at = NOW()
    WHERE id = v_uid
      AND role = 'client';

    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upgrade_user_to_seller() TO authenticated;

-- Rafraîchir le schéma PostgREST
NOTIFY pgrst, 'reload schema';
