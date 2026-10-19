-- Allow each participant to mark only incoming messages as read.
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