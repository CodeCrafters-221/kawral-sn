-- Google OAuth creates the initial profile through the auth-user trigger before
-- the browser returns to the application. Allow an authenticated client to opt
-- into the seller or agency role selected during that onboarding flow, while
-- keeping administrator privileges server-controlled.

DROP POLICY IF EXISTS "Modification de son profil ou par un admin" ON public.profiles;

CREATE POLICY "Modification de son profil ou par un admin" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        public.is_admin()
        OR (
            auth.uid() = id
            AND role IN ('client', 'vendeur', 'agence')
        )
    );
