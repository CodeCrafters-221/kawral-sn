export const SUPABASE_SQL_SCHEMA = `-- Extension pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    banner_url TEXT,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'vendeur', 'agence', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
    ON public.profiles (LOWER(TRIM(email)))
    WHERE email IS NOT NULL;

-- 2. Table agencies
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agency_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS agencies_user_id_unique_idx
    ON public.agencies (user_id);

-- 3. Table categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table listings
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'unavailable', 'sold', 'rented', 'archived')),
    views_count INT DEFAULT 0,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table listing_images
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- 7. Table conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Table agency_availability
CREATE TABLE IF NOT EXISTS public.agency_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agency_id, day_of_week)
);

-- 11. Disponibilités de tous les hôtes (agences et vendeurs)
CREATE TABLE IF NOT EXISTS public.host_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (host_id, day_of_week),
    CHECK (start_time < end_time)
);

-- RLS & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_availability ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.protect_agency_moderation_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() AND ((TG_OP = 'INSERT' AND (NEW.verified = TRUE OR NEW.is_blocked = TRUE)) OR (TG_OP = 'UPDATE' AND (NEW.verified IS DISTINCT FROM OLD.verified OR NEW.is_blocked IS DISTINCT FROM OLD.is_blocked))) THEN
        RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de modération d''une agence';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_agency_moderation_fields ON public.agencies;
CREATE TRIGGER protect_agency_moderation_fields
    BEFORE INSERT OR UPDATE ON public.agencies
    FOR EACH ROW EXECUTE FUNCTION public.protect_agency_moderation_fields();

-- Validation stricte des emails et blocage des domaines jetables
CREATE OR REPLACE FUNCTION public.validate_email_strictly(raw_email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    clean_email TEXT;
    domain_part TEXT;
BEGIN
    IF raw_email IS NULL OR TRIM(raw_email) = '' THEN RETURN TRUE; END IF;
    clean_email := LOWER(TRIM(raw_email));
    IF length(clean_email) > 254 OR clean_email !~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$' OR clean_email LIKE '%..%' THEN
        RETURN FALSE;
    END IF;
    domain_part := split_part(clean_email, '@', 2);
    IF domain_part IN ('yopmail.com', 'yopmail.fr', 'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com', 'trashmail.com', 'sharklasers.com', 'dispostable.com', 'getairmail.com', 'throwawaymail.com', 'fake.com', 'test.com', 'example.com') THEN
        RETURN FALSE;
    END IF;
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_validate_and_normalize_profile_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NEW.email IS NOT NULL AND TRIM(NEW.email) <> '' THEN
        NEW.email := LOWER(TRIM(NEW.email));
        IF NOT public.validate_email_strictly(NEW.email) THEN
            RAISE EXCEPTION 'Adresse email invalide ou domaine temporaire non autorisé : %', NEW.email USING ERRCODE = 'check_violation';
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
    FOR EACH ROW EXECUTE FUNCTION public.trg_validate_and_normalize_profile_email();

CREATE POLICY "Lecture publique des profils" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Insertion de son profil" ON public.profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = id
        AND role IN ('client', 'vendeur', 'agence')
    );
CREATE POLICY "Modification de son profil ou par un admin" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() = id
            AND role IN ('client', 'vendeur', 'agence')
        )
    );
CREATE POLICY "Lecture publique des catégories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Création des catégories par un admin" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Modification des catégories par un admin" ON public.categories FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Suppression des catégories par un admin" ON public.categories FOR DELETE USING (public.is_admin());
CREATE POLICY "Lecture publique des annonces publiées" ON public.listings FOR SELECT USING (public.is_admin() OR status = 'published');
CREATE POLICY "Lecture publique des images d'annonces" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "Lecture publique des disponibilités" ON public.agency_availability FOR SELECT USING (true);
CREATE POLICY "Les agences modifient leurs disponibilités" ON public.agency_availability FOR ALL USING (
  agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid())
);

-- Fonction pour incrémenter les vues sans bypasser toutes les règles de sécurité
CREATE OR REPLACE FUNCTION public.increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.listings 
  SET views_count = COALESCE(views_count, 0) + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction RPC pour mettre à niveau un client en vendeur de manière sécurisée
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
    WHERE id = v_uid
      AND role = 'client';

    RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upgrade_user_to_seller() TO authenticated;
`;

export const SUPABASE_TABLES = [
	"profiles",
	"agencies",
	"categories",
	"listings",
	"listing_images",
	"favorites",
	"conversations",
	"messages",
	"appointments",
];
