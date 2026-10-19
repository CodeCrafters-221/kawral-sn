-- Appointment availability and concurrency hardening.

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

ALTER TABLE public.host_availability ENABLE ROW LEVEL SECURITY;

INSERT INTO public.host_availability (host_id, agency_id, day_of_week, start_time, end_time, is_active)
SELECT agencies.user_id, availability.agency_id, availability.day_of_week,
       availability.start_time, availability.end_time, availability.is_active
FROM public.agency_availability AS availability
JOIN public.agencies AS agencies ON agencies.id = availability.agency_id
ON CONFLICT (host_id, day_of_week) DO UPDATE SET
    agency_id = EXCLUDED.agency_id,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

DROP POLICY IF EXISTS "host_availability_public_select" ON public.host_availability;
CREATE POLICY "host_availability_public_select" ON public.host_availability
    FOR SELECT USING (is_active = TRUE OR host_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "host_availability_owner_write" ON public.host_availability;
CREATE POLICY "host_availability_owner_write" ON public.host_availability
    FOR ALL USING (host_id = auth.uid() OR public.is_admin())
    WITH CHECK (host_id = auth.uid() OR public.is_admin());

WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (
        PARTITION BY host_id, appointment_date
        ORDER BY created_at, id
    ) AS row_number
    FROM public.appointments
    WHERE status IN ('pending', 'confirmed')
)
DELETE FROM public.appointments
WHERE id IN (SELECT id FROM ranked WHERE row_number > 1);

CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_host_slot_unique
ON public.appointments (host_id, appointment_date)
WHERE status IN ('pending', 'confirmed');

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
    availability AS (
        SELECT host_availability.start_time, host_availability.end_time
        FROM public.host_availability, listing_host
        WHERE host_availability.host_id = listing_host.host_id
          AND host_availability.day_of_week = EXTRACT(DOW FROM p_date)::SMALLINT
          AND host_availability.is_active = TRUE
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

DROP POLICY IF EXISTS "appointments_client_insert" ON public.appointments;
DROP POLICY IF EXISTS "Création de ses rendez-vous" ON public.appointments;
CREATE POLICY "appointments_client_insert" ON public.appointments
    FOR INSERT WITH CHECK (
        client_id = auth.uid()
        AND client_id <> host_id
        AND EXISTS (
            SELECT 1 FROM public.listings AS listings
            LEFT JOIN public.agencies AS agencies ON agencies.id = listings.agency_id
            WHERE listings.id = appointments.listing_id
              AND listings.status = 'published'
              AND listings.user_id = appointments.host_id
              AND COALESCE(agencies.is_blocked, FALSE) = FALSE
        )
    );

NOTIFY pgrst, 'reload schema';
