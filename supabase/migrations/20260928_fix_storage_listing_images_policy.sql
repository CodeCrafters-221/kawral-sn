-- Migration: Assouplissement de la politique RLS Storage pour listing-images
-- Permet aux utilisateurs d'uploader des photos lors du wizard de création avant insertion de l'annonce en base

DROP POLICY IF EXISTS "Upload images de ses annonces" ON storage.objects;
CREATE POLICY "Upload images de ses annonces" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images'
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
        bucket_id = 'listing-images'
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
        bucket_id = 'listing-images'
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
        bucket_id = 'listing-images'
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
