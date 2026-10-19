-- ==============================================================================
-- Migration : Sécurisation Absolue du Trigger handle_new_user() (Exception-Safe)
-- Date      : 2026-10-08
-- Objectif  : 
--   1. Rendre le trigger sur auth.users 100% non-bloquant via EXCEPTION WHEN OTHERS
--   2. Gérer gracieusement les conflits d'emails déjà existants dans public.profiles
--   3. Éviter toute interruption de la connexion OAuth Google
-- ==============================================================================

-- Assurer l'existence de la colonne email_verified dans public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

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
    -- 1. Extraction et normalisation sécurisée du rôle
    raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'client'));
    IF raw_role IN ('seller', 'vendeur') THEN
        normalized_role := 'vendeur';
    ELSIF raw_role IN ('agency', 'agence') THEN
        normalized_role := 'agence';
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
                WHEN EXCLUDED.role IN ('vendeur', 'agence') THEN EXCLUDED.role 
                ELSE public.profiles.role 
            END,
            email_verified = (NEW.email_confirmed_at IS NOT NULL OR public.profiles.email_verified),
            updated_at = NOW();

    EXCEPTION 
        WHEN unique_violation THEN
            -- En cas de conflit sur l'email unique (ex: compte créé auparavant avec mot de passe)
            UPDATE public.profiles
            SET full_name = COALESCE(public.profiles.full_name, user_full_name),
                avatar_url = COALESCE(public.profiles.avatar_url, user_avatar),
                role = CASE 
                    WHEN normalized_role IN ('vendeur', 'agence') THEN normalized_role 
                    ELSE public.profiles.role 
                END,
                email_verified = TRUE,
                updated_at = NOW()
            WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));
        WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user profiles insert exception: %', SQLERRM;
    END;

    -- 4. Si inscription en tant qu'agence, création atomique de l'agence
    IF normalized_role = 'agence' THEN
        BEGIN
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
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user agency insert exception: %', SQLERRM;
        END;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Garantie de résilience absolue : le trigger ne bloque JAMAIS la transaction dans auth.users
    RAISE WARNING 'handle_new_user critical catch-all exception: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Réinstallation du trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
