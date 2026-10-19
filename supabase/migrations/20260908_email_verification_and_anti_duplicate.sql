-- ==============================================================================
-- Migration : Vérification des emails et prévention des faux emails / doublons
-- Date      : 2026-09-08
-- Cible     : Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Ajout de la colonne email_verified dans public.profiles si elle n'existe pas
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Nettoyage et normalisation préalable des emails existants dans profiles
UPDATE public.profiles
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL;

-- 3. Fonction de validation stricte d'email et blocage des domaines jetables / faux emails
CREATE OR REPLACE FUNCTION public.validate_email_strictly(raw_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    clean_email TEXT;
    domain_part TEXT;
BEGIN
    IF raw_email IS NULL OR TRIM(raw_email) = '' THEN
        RETURN TRUE; -- Les colonnes optionnelles peuvent être NULL
    END IF;

    clean_email := LOWER(TRIM(raw_email));

    -- Validation du format RFC standard (longueur max 254, structure user@domaine.tld)
    IF length(clean_email) > 254 THEN
        RETURN FALSE;
    END IF;

    -- Regex stricte : pas d'espaces, pas de double point consécutif, TLD de 2 à 63 lettres
    IF clean_email !~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$' THEN
        RETURN FALSE;
    END IF;

    IF clean_email LIKE '%..%' THEN
        RETURN FALSE;
    END IF;

    -- Extraction du domaine
    domain_part := split_part(clean_email, '@', 2);

    -- Liste noire des domaines d'emails jetables / temporaires / faux emails courants
    IF domain_part IN (
        'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
        'mailinator.com', 'mailinator.net', 'mailinator2.com', 'suremail.info',
        'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net',
        '10minutemail.com', '10minutemail.net', '10minutemail.org', 'minutemail.com',
        'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net', 'guerrillamailblock.com',
        'trashmail.com', 'trashmail.net', 'trashmail.org', 'trashmail.ws',
        'sharklasers.com', 'dispostable.com', 'getairmail.com', 'throwawaymail.com',
        'fake.com', 'test.com', 'example.com', 'fakemailgenerator.com', 'crazymailing.com',
        'nada.ltd', 'mohmal.com', 'generator.email', 'dropmail.me', 'inboxkitten.com',
        'mytemp.email', 'tempail.com', 'tempr.email', 'discard.email', 'discardmail.com',
        'spam4.me', 'fakemail.net', 'getnada.com', 'emailondeck.com', 'burnermail.io'
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- 4. Trigger de validation et normalisation pour public.profiles
CREATE OR REPLACE FUNCTION public.trg_validate_and_normalize_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IS NOT NULL AND TRIM(NEW.email) <> '' THEN
        NEW.email := LOWER(TRIM(NEW.email));

        IF NOT public.validate_email_strictly(NEW.email) THEN
            RAISE EXCEPTION 'Adresse email invalide ou domaine temporaire non autorisé : %', NEW.email
                USING ERRCODE = 'check_violation';
        END IF;
    ELSE
        NEW.email := NULL;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_email_validation ON public.profiles;
CREATE TRIGGER trg_profiles_email_validation
    BEFORE INSERT OR UPDATE OF email ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_validate_and_normalize_profile_email();

-- 5. Trigger de validation et normalisation pour public.agencies
CREATE OR REPLACE FUNCTION public.trg_validate_and_normalize_agency_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IS NOT NULL AND TRIM(NEW.email) <> '' THEN
        NEW.email := LOWER(TRIM(NEW.email));

        IF NOT public.validate_email_strictly(NEW.email) THEN
            RAISE EXCEPTION 'Adresse email d''agence invalide ou domaine temporaire non autorisé : %', NEW.email
                USING ERRCODE = 'check_violation';
        END IF;
    ELSE
        NEW.email := NULL;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agencies_email_validation ON public.agencies;
CREATE TRIGGER trg_agencies_email_validation
    BEFORE INSERT OR UPDATE OF email ON public.agencies
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_validate_and_normalize_agency_email();

-- 6. Blocage dès l'inscription au niveau auth.users (si permissions Supabase disponibles)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        CREATE OR REPLACE FUNCTION public.trg_validate_auth_user_email()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $auth_fn$
        BEGIN
            IF NEW.email IS NOT NULL AND TRIM(NEW.email) <> '' THEN
                NEW.email := LOWER(TRIM(NEW.email));

                IF NOT public.validate_email_strictly(NEW.email) THEN
                    RAISE EXCEPTION 'Les adresses emails temporaires/jetables ou invalides ne sont pas autorisées sur Kawral.'
                        USING ERRCODE = 'check_violation';
                END IF;
            END IF;
            RETURN NEW;
        END;
        $auth_fn$;

        DROP TRIGGER IF EXISTS trg_auth_users_email_validation ON auth.users;
        CREATE TRIGGER trg_auth_users_email_validation
            BEFORE INSERT OR UPDATE OF email ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.trg_validate_auth_user_email();
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Trigger optionnel sur auth.users ignoré (permissions restreintes selon l''hébergement Supabase).';
END;
$$;

-- 7. Contrainte d'unicité sur l'email dans public.profiles (Anti-doublons / Répétition)
-- Si des doublons existent déjà, on conserve le profil le plus récemment mis à jour
WITH ranked_duplicates AS (
    SELECT id, email,
           ROW_NUMBER() OVER (
               PARTITION BY LOWER(TRIM(email))
               ORDER BY updated_at DESC, created_at DESC
           ) as rn
    FROM public.profiles
    WHERE email IS NOT NULL AND TRIM(email) <> ''
)
UPDATE public.profiles p
SET email = NULL
FROM ranked_duplicates rd
WHERE p.id = rd.id AND rd.rn > 1;

-- Création de l'index d'unicité insensible à la casse
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
    ON public.profiles (LOWER(TRIM(email)))
    WHERE email IS NOT NULL;

-- 8. Synchronisation automatique de la confirmation d'email Supabase Auth -> public.profiles
-- Remplissage initial depuis auth.users si disponible
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        UPDATE public.profiles p
        SET email_verified = (u.email_confirmed_at IS NOT NULL)
        FROM auth.users u
        WHERE p.id = u.id;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Initialisation email_verified depuis auth.users omise';
END;
$$;

-- Trigger sur auth.users pour mettre à jour automatiquement email_verified dans profiles
CREATE OR REPLACE FUNCTION public.sync_auth_user_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
        UPDATE public.profiles
        SET email_verified = TRUE,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        DROP TRIGGER IF EXISTS trg_sync_auth_user_confirmation ON auth.users;
        CREATE TRIGGER trg_sync_auth_user_confirmation
            AFTER UPDATE OF email_confirmed_at ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.sync_auth_user_confirmation();
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Trigger de synchronisation sur auth.users ignoré (permissions restreintes).';
END;
$$;

-- 9. Notification de rechargement du schéma pour PostgREST
NOTIFY pgrst, 'reload schema';
