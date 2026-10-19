-- Migration: Fix admin appointment visibility & default host availability fallback
-- Date: 2026-09-28

-- 1. Permettre aux administrateurs de consulter tous les rendez-vous
DROP POLICY IF EXISTS "Accès à ses rendez-vous" ON public.appointments;
CREATE POLICY "Accès à ses rendez-vous" ON public.appointments
    FOR SELECT USING (public.is_admin() OR auth.uid() = client_id OR auth.uid() = host_id);

-- 2. Fonction RPC pour récupérer l'hôte d'une annonce
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

-- 3. Fonction RPC pour calculer les créneaux disponibles avec fallback sur des horaires par défaut
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

-- 4. Fonction RPC pour créer un rendez-vous avec vérification compatible fallback
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
        -- Horaires par défaut : Lundi au Samedi de 09:00 à 18:00
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

NOTIFY pgrst, 'reload schema';
