-- Migration: Ajout du support de la description vocale (audio_description_url & bucket listing-audios)
-- Date: 2026-09-28

-- 1. Ajouter la colonne audio_description_url à la table listings si elle n'existe pas
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS audio_description_url TEXT;

-- 2. Création du bucket Storage dédié aux descriptions audio des annonces
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-audios',
    'listing-audios',
    true,
    20971520, -- 20 Mo max par note vocale
    ARRAY[
        'audio/webm',
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'audio/x-m4a',
        'audio/m4a',
        'audio/aac'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Politiques RLS pour le bucket listing-audios
DROP POLICY IF EXISTS "Lecture publique des audios d'annonces" ON storage.objects;
CREATE POLICY "Lecture publique des audios d'annonces" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-audios');

DROP POLICY IF EXISTS "Upload audios de ses annonces" ON storage.objects;
CREATE POLICY "Upload audios de ses annonces" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-audios'
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

DROP POLICY IF EXISTS "Modification audios de ses annonces" ON storage.objects;
CREATE POLICY "Modification audios de ses annonces" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'listing-audios'
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
        bucket_id = 'listing-audios'
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

DROP POLICY IF EXISTS "Suppression audios de ses annonces" ON storage.objects;
CREATE POLICY "Suppression audios de ses annonces" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'listing-audios'
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

NOTIFY pgrst, 'reload schema';
