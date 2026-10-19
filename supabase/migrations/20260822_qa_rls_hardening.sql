-- QA hardening: appointment status transitions and blocked agency actions.

DROP POLICY IF EXISTS "agencies_public_select" ON public.agencies;
CREATE POLICY "agencies_public_select" ON public.agencies
    FOR SELECT USING ((verified = TRUE AND is_blocked = FALSE) OR user_id = auth.uid() OR is_admin());

CREATE OR REPLACE FUNCTION public.protect_appointment_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_admin() AND auth.uid() = NEW.client_id THEN
        IF OLD.client_id IS DISTINCT FROM NEW.client_id
            OR OLD.host_id IS DISTINCT FROM NEW.host_id
            OR OLD.listing_id IS DISTINCT FROM NEW.listing_id
            OR OLD.appointment_date IS DISTINCT FROM NEW.appointment_date
            OR OLD.notes IS DISTINCT FROM NEW.notes
            OR OLD.status <> 'pending'
            OR NEW.status <> 'cancelled' THEN
            RAISE EXCEPTION 'Un client peut uniquement annuler un rendez-vous en attente';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_appointment_updates ON public.appointments;
CREATE TRIGGER protect_appointment_updates
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.protect_appointment_updates();

DROP POLICY IF EXISTS "appointments_participant_update" ON public.appointments;
DROP POLICY IF EXISTS "Gestion de ses rendez-vous" ON public.appointments;
CREATE POLICY "appointments_participant_update" ON public.appointments
    FOR UPDATE
    USING (
        is_admin()
        OR auth.uid() = host_id
        OR (auth.uid() = client_id AND status = 'pending')
    )
    WITH CHECK (
        is_admin()
        OR auth.uid() = host_id
        OR (auth.uid() = client_id AND status = 'cancelled')
    );

DROP POLICY IF EXISTS "listings_owner_insert" ON public.listings;
DROP POLICY IF EXISTS "Création de ses annonces" ON public.listings;
CREATE POLICY "listings_owner_insert" ON public.listings
    FOR INSERT WITH CHECK (
                auth.uid() = user_id
                AND NOT EXISTS (
                        SELECT 1 FROM public.agencies
                        WHERE agencies.user_id = auth.uid()
                            AND agencies.is_blocked = TRUE
                )
        OR (
            agency_id IN (
                SELECT agencies.id FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = FALSE
            )
        )
    );

DROP POLICY IF EXISTS "listings_owner_update" ON public.listings;
DROP POLICY IF EXISTS "Modification de ses annonces" ON public.listings;
CREATE POLICY "listings_owner_update" ON public.listings
    FOR UPDATE USING (
        is_admin()
        OR (
            auth.uid() = user_id
            AND NOT EXISTS (
                SELECT 1 FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = TRUE
            )
        )
        OR (
            agency_id IN (
                SELECT agencies.id FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = FALSE
            )
        )
    )
    WITH CHECK (
        is_admin()
        OR (
            auth.uid() = user_id
            AND NOT EXISTS (
                SELECT 1 FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = TRUE
            )
        )
        OR (
            agency_id IN (
                SELECT agencies.id FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = FALSE
            )
        )
    );

DROP POLICY IF EXISTS "listings_owner_delete" ON public.listings;
DROP POLICY IF EXISTS "Suppression de ses annonces" ON public.listings;
CREATE POLICY "listings_owner_delete" ON public.listings
    FOR DELETE USING (
        is_admin()
        OR (
            auth.uid() = user_id
            AND NOT EXISTS (
                SELECT 1 FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = TRUE
            )
        )
        OR (
            agency_id IN (
                SELECT agencies.id FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = FALSE
            )
        )
    );

DROP POLICY IF EXISTS "listings_read_policy" ON public.listings;
DROP POLICY IF EXISTS "Lecture publique des annonces publiées" ON public.listings;
CREATE POLICY "listings_read_policy" ON public.listings
    FOR SELECT USING (
        is_admin()
        OR (
            auth.uid() = user_id
            AND NOT EXISTS (
                SELECT 1 FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = TRUE
            )
        )
        OR (
            agency_id IN (
                SELECT agencies.id FROM public.agencies
                WHERE agencies.user_id = auth.uid()
                  AND agencies.is_blocked = FALSE
            )
        )
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

NOTIFY pgrst, 'reload schema';