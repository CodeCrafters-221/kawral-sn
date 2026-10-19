-- Extension pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table profiles (Utilisateurs et rôles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    banner_url TEXT,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'vendeur', 'agence', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

UPDATE public.profiles AS profiles
SET email = LOWER(TRIM(users.email))
FROM auth.users AS users
WHERE profiles.id = users.id
    AND (profiles.email IS NULL OR profiles.email = '');

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
    ON public.profiles (LOWER(TRIM(email)))
    WHERE email IS NOT NULL;

-- 2. Table agencies (Informations spécifiques aux agences)
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

ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- 3. Table categories (Catégories et sous-catégories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table listings (Cœur de la marketplace)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    audio_description_url TEXT,
    price DECIMAL(12, 2) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'unavailable', 'sold', 'rented', 'archived')),
    views_count INT DEFAULT 0,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table listing_images (Images des annonces)
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table favorites (Annonces sauvegardées)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- 7. Table conversations (Conversations liées aux annonces)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table messages (Messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table appointments (Rendez-vous)
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

-- 10. Disponibilités hebdomadaires des agences
CREATE TABLE IF NOT EXISTS public.agency_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (agency_id, day_of_week)
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

-- Activation Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_availability ENABLE ROW LEVEL SECURITY;

DROP INDEX IF EXISTS appointments_active_host_slot_unique;
CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_host_slot_unique
ON public.appointments (host_id, appointment_date)
WHERE status IN ('pending', 'confirmed');

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
    IF NOT public.is_admin() AND (
        (TG_OP = 'INSERT' AND (NEW.verified = TRUE OR NEW.is_blocked = TRUE))
        OR (TG_OP = 'UPDATE' AND (
            NEW.verified IS DISTINCT FROM OLD.verified
            OR NEW.is_blocked IS DISTINCT FROM OLD.is_blocked
        ))
    ) THEN
        RAISE EXCEPTION 'Seul un administrateur peut modifier le statut de modération d''une agence';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_agency_moderation_fields ON public.agencies;
CREATE TRIGGER protect_agency_moderation_fields
    BEFORE INSERT OR UPDATE ON public.agencies
    FOR EACH ROW EXECUTE FUNCTION public.protect_agency_moderation_fields();

-- Fonction de validation stricte d'email et blocage des faux emails / domaines jetables
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
        RETURN TRUE;
    END IF;

    clean_email := LOWER(TRIM(raw_email));

    IF length(clean_email) > 254 THEN
        RETURN FALSE;
    END IF;

    IF clean_email !~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$' THEN
        RETURN FALSE;
    END IF;

    IF clean_email LIKE '%..%' THEN
        RETURN FALSE;
    END IF;

    domain_part := split_part(clean_email, '@', 2);

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

-- Trigger pour public.profiles
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

-- Trigger pour public.agencies
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

-- Synchronisation de l'état email_verified depuis auth.users
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
    RAISE NOTICE 'Trigger optionnel de confirmation auth.users ignoré.';
END;
$$;

-- Politiques RLS de base
DROP POLICY IF EXISTS "Lecture de ses favoris" ON public.favorites;
CREATE POLICY "Lecture de ses favoris" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Création de ses favoris" ON public.favorites;
CREATE POLICY "Création de ses favoris" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Suppression de ses favoris" ON public.favorites;
CREATE POLICY "Suppression de ses favoris" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Lecture publique des profils" ON public.profiles;
CREATE POLICY "Lecture publique des profils" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertion de son profil" ON public.profiles;
CREATE POLICY "Insertion de son profil" ON public.profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = id
        AND role IN ('client', 'vendeur', 'agence')
    );

DROP POLICY IF EXISTS "Modification de son profil ou par un admin" ON public.profiles;
CREATE POLICY "Modification de son profil ou par un admin" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() = id
            AND role IN ('client', 'vendeur', 'agence')
        )
    );

DROP POLICY IF EXISTS "Lecture publique des catégories" ON public.categories;
CREATE POLICY "Lecture publique des catégories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Création des catégories par un admin" ON public.categories;
CREATE POLICY "Création des catégories par un admin" ON public.categories
    FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Modification des catégories par un admin" ON public.categories;
CREATE POLICY "Modification des catégories par un admin" ON public.categories
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Suppression des catégories par un admin" ON public.categories;
CREATE POLICY "Suppression des catégories par un admin" ON public.categories
    FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Lecture publique des annonces publiées" ON public.listings;
CREATE POLICY "Lecture publique des annonces publiées" ON public.listings
    FOR SELECT USING (
        public.is_admin()
        OR auth.uid() = user_id
        OR (
            status = 'published'
            AND (
                agency_id IS NULL
                OR EXISTS (
                    SELECT 1 FROM public.agencies
                    WHERE agencies.id = listings.agency_id
                      AND agencies.is_blocked = FALSE
                )
            )
        )
    );

DROP POLICY IF EXISTS "Création de ses annonces" ON public.listings;
CREATE POLICY "Création de ses annonces" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Modification de ses annonces" ON public.listings;
CREATE POLICY "Modification de ses annonces" ON public.listings
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Suppression de ses annonces" ON public.listings;
CREATE POLICY "Suppression de ses annonces" ON public.listings
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Lecture publique des images d'annonces" ON public.listing_images;
CREATE POLICY "Lecture publique des images d'annonces" ON public.listing_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion des images de ses annonces" ON public.listing_images;
CREATE POLICY "Gestion des images de ses annonces" ON public.listing_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = listing_images.listing_id
                AND listings.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = listing_images.listing_id
                AND listings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Lecture publique des agences" ON public.agencies;
CREATE POLICY "Lecture publique des agences" ON public.agencies FOR SELECT USING (is_blocked = FALSE OR public.is_admin());

DROP POLICY IF EXISTS "agencies_public_select" ON public.agencies;
CREATE POLICY "agencies_public_select" ON public.agencies
    FOR SELECT USING ((verified = TRUE AND is_blocked = FALSE) OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Création de son agence" ON public.agencies;
CREATE POLICY "Création de son agence" ON public.agencies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Modification de son agence" ON public.agencies;
CREATE POLICY "Modification de son agence" ON public.agencies
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Suppression de son agence" ON public.agencies;
CREATE POLICY "Suppression de son agence" ON public.agencies
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Accès à ses conversations" ON public.conversations;
CREATE POLICY "Accès à ses conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Création de ses conversations" ON public.conversations;
CREATE POLICY "Création de ses conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Mise à jour de ses conversations" ON public.conversations;
CREATE POLICY "Mise à jour de ses conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
    WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Suppression de ses conversations" ON public.conversations;
CREATE POLICY "Suppression de ses conversations" ON public.conversations
    FOR DELETE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Accès aux messages de ses conversations" ON public.messages;
CREATE POLICY "Accès aux messages de ses conversations" ON public.messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.conversations
        WHERE conversations.id = messages.conversation_id
          AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    ));

DROP POLICY IF EXISTS "Envoi de messages dans ses conversations" ON public.messages;
CREATE POLICY "Envoi de messages dans ses conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
              AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Modification de ses messages envoyés" ON public.messages;
CREATE POLICY "Modification de ses messages envoyés" ON public.messages
    FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Suppression de ses messages" ON public.messages;
CREATE POLICY "Suppression de ses messages" ON public.messages
    FOR DELETE USING (
        auth.uid() = sender_id OR EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
              AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Marquer ses messages entrants comme lus" ON public.messages;
CREATE POLICY "Marquer ses messages entrants comme lus" ON public.messages
    FOR UPDATE
    USING (
        is_read = FALSE
        AND sender_id <> auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
              AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
        )
    )
    WITH CHECK (is_read = TRUE);

DROP POLICY IF EXISTS "Accès à ses rendez-vous" ON public.appointments;
CREATE POLICY "Accès à ses rendez-vous" ON public.appointments
    FOR SELECT USING (public.is_admin() OR auth.uid() = client_id OR auth.uid() = host_id);

DROP POLICY IF EXISTS "Création de ses rendez-vous" ON public.appointments;
CREATE POLICY "Création de ses rendez-vous" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Gestion de ses rendez-vous" ON public.appointments;
CREATE POLICY "Gestion de ses rendez-vous" ON public.appointments
    FOR UPDATE
    USING (public.is_admin() OR auth.uid() = host_id OR (auth.uid() = client_id AND status = 'pending'))
    WITH CHECK (public.is_admin() OR auth.uid() = host_id OR (auth.uid() = client_id AND status = 'cancelled'));

DROP POLICY IF EXISTS "Lecture publique des disponibilités agence" ON public.agency_availability;
CREATE POLICY "Lecture publique des disponibilités agence" ON public.agency_availability
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion des disponibilités de son agence" ON public.agency_availability;
CREATE POLICY "Gestion des disponibilités de son agence" ON public.agency_availability
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.agencies
        WHERE agencies.id = agency_availability.agency_id
          AND agencies.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.agencies
        WHERE agencies.id = agency_availability.agency_id
          AND agencies.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "host_availability_public_select" ON public.host_availability;
CREATE POLICY "host_availability_public_select" ON public.host_availability
    FOR SELECT USING (is_active = TRUE OR host_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "host_availability_owner_write" ON public.host_availability;
CREATE POLICY "host_availability_owner_write" ON public.host_availability
    FOR ALL USING (host_id = auth.uid() OR public.is_admin())
    WITH CHECK (host_id = auth.uid() OR public.is_admin());

-- 11. Buckets Storage utilisés par l'application
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('listing-images', 'listing-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('agency-assets', 'agency-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('listing-audios', 'listing-audios', true, 20971520, ARRAY['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies Storage : les URLs sont publiques, mais l'écriture reste propriétaire.
DROP POLICY IF EXISTS "Lecture publique des images Storage" ON storage.objects;
CREATE POLICY "Lecture publique des images Storage" ON storage.objects
    FOR SELECT USING (bucket_id IN ('listing-images', 'avatars', 'agency-assets', 'listing-audios'));

DROP POLICY IF EXISTS "Upload de ses assets Storage" ON storage.objects;
CREATE POLICY "Upload de ses assets Storage" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id IN ('avatars', 'agency-assets')
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Modification de ses assets Storage" ON storage.objects;
CREATE POLICY "Modification de ses assets Storage" ON storage.objects
    FOR UPDATE USING (
        bucket_id IN ('avatars', 'agency-assets')
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id IN ('avatars', 'agency-assets')
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Suppression de ses assets Storage" ON storage.objects;
CREATE POLICY "Suppression de ses assets Storage" ON storage.objects
    FOR DELETE USING (
        bucket_id IN ('avatars', 'agency-assets')
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Upload images de ses annonces" ON storage.objects;
CREATE POLICY "Upload images de ses annonces" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id IN ('listing-images', 'listing-audios')
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1
                FROM public.listings
                WHERE listings.user_id = auth.uid()
                    AND listings.id::text = (storage.foldername(name))[2]
            )
        )
    );

DROP POLICY IF EXISTS "Modification images de ses annonces" ON storage.objects;
CREATE POLICY "Modification images de ses annonces" ON storage.objects
    FOR UPDATE USING (
        bucket_id IN ('listing-images', 'listing-audios')
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1
                FROM public.listings
                WHERE listings.user_id = auth.uid()
                    AND listings.id::text = (storage.foldername(name))[2]
            )
        )
    )
    WITH CHECK (
        bucket_id IN ('listing-images', 'listing-audios')
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1
                FROM public.listings
                WHERE listings.user_id = auth.uid()
                    AND listings.id::text = (storage.foldername(name))[2]
            )
        )
    );

DROP POLICY IF EXISTS "Suppression images de ses annonces" ON storage.objects;
CREATE POLICY "Suppression images de ses annonces" ON storage.objects
    FOR DELETE USING (
        bucket_id IN ('listing-images', 'listing-audios')
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1
                FROM public.listings
                WHERE listings.user_id = auth.uid()
                    AND listings.id::text = (storage.foldername(name))[2]
            )
        )
    );

-- 12. Fonction RPC pour incrémenter les vues d'une annonce
CREATE OR REPLACE FUNCTION public.increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.listings 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;

-- 13. Fonctions RPC pour la gestion des rendez-vous et disponibilités
CREATE OR REPLACE FUNCTION public.get_listing_host(p_listing_id UUID)
RETURNS TABLE (host_id UUID, agency_id UUID, is_blocked BOOLEAN)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT listings.user_id, listings.agency_id, COALESCE(agencies.is_blocked, FALSE)
    FROM public.listings AS listings
    LEFT JOIN public.agencies AS agencies ON agencies.id = listings.agency_id
    WHERE listings.id = p_listing_id
      AND listings.status = 'published';
$$;

GRANT EXECUTE ON FUNCTION public.get_listing_host(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_available_appointment_slots(
    p_listing_id UUID,
    p_date DATE
)
RETURNS TABLE (slot TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH listing_host AS (
        SELECT host_id, agency_id, is_blocked
        FROM public.get_listing_host(p_listing_id)
    ),
    host_has_availability AS (
        SELECT 1 FROM public.host_availability, listing_host
        WHERE host_availability.host_id = listing_host.host_id
    ),
    availability AS (
        SELECT host_availability.start_time, host_availability.end_time
        FROM public.host_availability, listing_host
        WHERE host_availability.host_id = listing_host.host_id
          AND host_availability.day_of_week = EXTRACT(DOW FROM p_date)::SMALLINT
          AND host_availability.is_active = TRUE
          AND listing_host.is_blocked = FALSE
        UNION ALL
        -- Horaires par défaut (Lundi au Samedi 09:00 - 18:00) si l'hôte n'a pas configuré d'horaires personnalisés
        SELECT '09:00'::TIME, '18:00'::TIME
        FROM listing_host
        WHERE NOT EXISTS (SELECT 1 FROM host_has_availability)
          AND EXTRACT(DOW FROM p_date)::SMALLINT BETWEEN 1 AND 6
          AND listing_host.is_blocked = FALSE
    ),
    candidate_slots AS (
        SELECT generate_series(
            p_date + availability.start_time,
            p_date + availability.end_time - INTERVAL '1 hour',
            INTERVAL '1 hour'
        ) AS local_slot
        FROM availability
    )
    SELECT TO_CHAR(candidate_slots.local_slot, 'HH24:MI')
    FROM candidate_slots, listing_host
    WHERE candidate_slots.local_slot > NOW() AT TIME ZONE 'Africa/Dakar'
      AND NOT EXISTS (
          SELECT 1
          FROM public.appointments
          WHERE appointments.host_id = listing_host.host_id
            AND appointments.status IN ('pending', 'confirmed')
            AND appointments.appointment_date AT TIME ZONE 'Africa/Dakar' = candidate_slots.local_slot
      )
    ORDER BY candidate_slots.local_slot;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_appointment_slots(UUID, DATE) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_appointment_request(
    p_listing_id UUID,
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_notes TEXT DEFAULT NULL
)
RETURNS public.appointments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    listing_record RECORD;
    appointment_record public.appointments;
    local_appointment TIMESTAMP;
    utc_appointment TIMESTAMP WITH TIME ZONE;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
    END IF;

    SELECT listings.user_id, listings.agency_id, listings.status,
           COALESCE(agencies.is_blocked, FALSE) AS is_blocked
    INTO listing_record
    FROM public.listings AS listings
    LEFT JOIN public.agencies AS agencies ON agencies.id = listings.agency_id
    WHERE listings.id = p_listing_id;

    IF NOT FOUND OR listing_record.status <> 'published' THEN
        RAISE EXCEPTION 'LISTING_UNAVAILABLE' USING ERRCODE = '22023';
    END IF;
    IF listing_record.is_blocked THEN
        RAISE EXCEPTION 'HOST_BLOCKED' USING ERRCODE = '22023';
    END IF;
    IF listing_record.user_id = auth.uid() THEN
        RAISE EXCEPTION 'HOST_CANNOT_BOOK' USING ERRCODE = '22023';
    END IF;

    local_appointment := p_appointment_date + p_appointment_time;
    IF local_appointment <= (NOW() AT TIME ZONE 'Africa/Dakar') THEN
        RAISE EXCEPTION 'PAST_SLOT' USING ERRCODE = '22023';
    END IF;

    IF EXISTS (SELECT 1 FROM public.host_availability WHERE host_id = listing_record.user_id) THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.host_availability
            WHERE host_id = listing_record.user_id
              AND day_of_week = EXTRACT(DOW FROM p_appointment_date)::SMALLINT
              AND is_active = TRUE
              AND p_appointment_time >= start_time
              AND p_appointment_time < end_time
        ) THEN
            RAISE EXCEPTION 'SLOT_UNAVAILABLE' USING ERRCODE = '22023';
        END IF;
    ELSE
        -- Horaires par défaut si non configuré : Lundi au Samedi de 09:00 à 18:00
        IF EXTRACT(DOW FROM p_appointment_date)::SMALLINT NOT BETWEEN 1 AND 6
           OR p_appointment_time < '09:00'::TIME
           OR p_appointment_time >= '18:00'::TIME THEN
            RAISE EXCEPTION 'SLOT_UNAVAILABLE' USING ERRCODE = '22023';
        END IF;
    END IF;

    utc_appointment := local_appointment AT TIME ZONE 'Africa/Dakar';
    INSERT INTO public.appointments (listing_id, client_id, host_id, appointment_date, status, notes)
    VALUES (p_listing_id, auth.uid(), listing_record.user_id, utc_appointment, 'pending', p_notes)
    RETURNING * INTO appointment_record;

    RETURN appointment_record;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'SLOT_TAKEN' USING ERRCODE = '23505';
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_appointment_request(UUID, DATE, TIME, TEXT) TO authenticated;

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


