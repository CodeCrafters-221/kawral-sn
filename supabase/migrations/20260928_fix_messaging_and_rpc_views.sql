-- Migration: Ajout des politiques RLS de suppression et modification pour la messagerie
-- et de la fonction RPC increment_views

-- 1. Politiques pour les conversations
DROP POLICY IF EXISTS "Suppression de ses conversations" ON public.conversations;
CREATE POLICY "Suppression de ses conversations" ON public.conversations
    FOR DELETE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 2. Politiques pour les messages
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

-- 3. Fonction RPC pour incrémenter les vues d'une annonce
CREATE OR REPLACE FUNCTION public.increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.listings 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
