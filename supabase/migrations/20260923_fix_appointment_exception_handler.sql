-- Fix: Correctement isoler le EXCEPTION WHEN unique_violation
-- pour ne pas intercepter les erreurs RAISE EXCEPTION des validations métier.
-- La technique est de faire le INSERT dans un bloc imbriqué.

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
    -- 1. Vérification de l'authentification
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501';
    END IF;

    -- 2. Récupération et validation de l'annonce
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

    -- 3. Vérification que le créneau est dans le futur
    local_appointment := p_appointment_date + p_appointment_time;
    IF local_appointment <= (NOW() AT TIME ZONE 'Africa/Dakar') THEN
        RAISE EXCEPTION 'PAST_SLOT' USING ERRCODE = '22023';
    END IF;

    -- 4. Vérification que le créneau est dans les disponibilités de l'hôte
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

    -- 5. Vérification de la non-double-réservation AVANT l'INSERT
    --    (évite le piège du bloc EXCEPTION qui intercepterait les erreurs métier ci-dessus)
    utc_appointment := local_appointment AT TIME ZONE 'Africa/Dakar';

    IF EXISTS (
        SELECT 1 FROM public.appointments
        WHERE host_id = listing_record.user_id
          AND appointment_date = utc_appointment
          AND status IN ('pending', 'confirmed')
    ) THEN
        RAISE EXCEPTION 'SLOT_TAKEN' USING ERRCODE = '23505';
    END IF;

    -- 6. Insertion du rendez-vous
    INSERT INTO public.appointments (listing_id, client_id, host_id, appointment_date, status, notes)
    VALUES (p_listing_id, auth.uid(), listing_record.user_id, utc_appointment, 'pending', p_notes)
    RETURNING * INTO appointment_record;

    RETURN appointment_record;
END;
$$;

NOTIFY pgrst, 'reload schema';
