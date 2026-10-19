-- ==============================================================================
-- Migration : Suppression du Rôle Agence & Conservation Clients, Vendeurs, Admin
-- Date      : 2026-10-08
-- Objectif  : 
--   1. Migrer tous les comptes 'agence' existants vers 'vendeur'
--   2. Mettre à jour le trigger handle_new_user() sans logique agence
--   3. Mettre à jour les politiques RLS profiles (uniquement client et vendeur)
--   4. Mettre à jour upgrade_user_to_seller()
-- ==============================================================================

-- 1. Migration des données existantes
UPDATE public.profiles
SET role = 'vendeur',
    updated_at = NOW()
WHERE role = 'agence';

-- 2. Sécurisation RLS sur public.profiles
DROP POLICY IF EXISTS "Insertion de son profil" ON public.profiles;
CREATE POLICY "Insertion de son profil" ON public.profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = id
        AND role IN ('client', 'vendeur')
    );

DROP POLICY IF EXISTS "Modification de son profil ou par un admin" ON public.profiles;
CREATE POLICY "Modification de son profil ou par un admin" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() = id
            AND role IN ('client', 'vendeur')
        )
    );

-- 3. Mise à jour de la fonction trigger handle_new_user()
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
BEGIN
    -- 1. Extraction et normalisation du rôle (uniquement 'vendeur' ou 'client')
    raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'client'));
    IF raw_role IN ('seller', 'vendeur') THEN
        normalized_role := 'vendeur';
    ELSE
        normalized_role := 'client';
    END IF;

    -- 2. Extraction des métadonnées utilisateur
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

    -- 3. Insertion / mise à jour atomique dans public.profiles avec gestion de conflits
    BEGIN
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
            role = CASE 
                WHEN EXCLUDED.role = 'vendeur' THEN 'vendeur'
                ELSE public.profiles.role 
            END,
            email_verified = (NEW.email_confirmed_at IS NOT NULL OR public.profiles.email_verified),
            updated_at = NOW();

    EXCEPTION 
        WHEN unique_violation THEN
            UPDATE public.profiles
            SET full_name = COALESCE(public.profiles.full_name, user_full_name),
                avatar_url = COALESCE(public.profiles.avatar_url, user_avatar),
                role = CASE 
                    WHEN normalized_role = 'vendeur' THEN 'vendeur'
                    ELSE public.profiles.role 
                END,
                email_verified = TRUE,
                updated_at = NOW()
            WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));
        WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user profiles insert exception: %', SQLERRM;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user critical catch-all exception: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Mise à jour de la fonction RPC upgrade_user_to_seller()
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

    UPDATE public.profiles
    SET role = 'vendeur',
        updated_at = NOW()
    WHERE id = v_uid;

    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upgrade_user_to_seller() TO authenticated;

-- 5. Rechargement du schéma API PostgREST
NOTIFY pgrst, 'reload schema';
