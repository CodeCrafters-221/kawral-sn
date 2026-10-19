-- Apply this migration in the Supabase SQL Editor before using the admin agency actions.

ALTER TABLE public.agencies
    ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

NOTIFY pgrst, 'reload schema';

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

DROP POLICY IF EXISTS "Lecture publique des agences" ON public.agencies;
CREATE POLICY "Lecture publique des agences" ON public.agencies
    FOR SELECT USING (is_blocked = FALSE OR public.is_admin());

DROP POLICY IF EXISTS "Modification de son agence" ON public.agencies;
CREATE POLICY "Modification de son agence" ON public.agencies
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());