-- Private, conversation-scoped Broadcast delivery for the messaging UI.
CREATE INDEX IF NOT EXISTS conversations_buyer_id_idx
    ON public.conversations (buyer_id);
CREATE INDEX IF NOT EXISTS conversations_seller_id_idx
    ON public.conversations (seller_id);
CREATE INDEX IF NOT EXISTS messages_conversation_created_at_idx
    ON public.messages (conversation_id, created_at);

CREATE OR REPLACE FUNCTION public.broadcast_message_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, realtime
AS $$
BEGIN
    PERFORM realtime.broadcast_changes(
        'conversation:' || COALESCE(NEW.conversation_id, OLD.conversation_id)::text,
        TG_OP,
        TG_OP,
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        NEW,
        OLD
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS messages_broadcast_changes ON public.messages;
CREATE TRIGGER messages_broadcast_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.broadcast_message_changes();

DROP POLICY IF EXISTS "Conversation participants can receive broadcasts" ON realtime.messages;
CREATE POLICY "Conversation participants can receive broadcasts"
    ON realtime.messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.conversations
            WHERE 'conversation:' || conversations.id::text = realtime.topic()
              AND (
                  conversations.buyer_id = auth.uid()
                  OR conversations.seller_id = auth.uid()
              )
        )
    );

DROP POLICY IF EXISTS "Conversation participants can send broadcasts" ON realtime.messages;
CREATE POLICY "Conversation participants can send broadcasts"
    ON realtime.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.conversations
            WHERE 'conversation:' || conversations.id::text = realtime.topic()
              AND (
                  conversations.buyer_id = auth.uid()
                  OR conversations.seller_id = auth.uid()
              )
        )
    );