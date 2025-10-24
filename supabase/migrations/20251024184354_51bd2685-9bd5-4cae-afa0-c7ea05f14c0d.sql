-- Expand who can create patient portal users to include nurses
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'patient_portal_users' 
      AND policyname = 'Staff can create portal users'
  ) THEN
    DROP POLICY "Staff can create portal users" ON public.patient_portal_users;
  END IF;
END $$;

CREATE POLICY "Staff can create portal users"
ON public.patient_portal_users
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'receptionist')
  OR public.has_role(auth.uid(), 'nurse')
);

-- Allow receptionists and nurses to assign only the 'patient' role
-- This ensures existing flows that insert into user_roles succeed
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_roles' 
      AND policyname = 'Reception & nurses can assign patient role'
  ) THEN
    CREATE POLICY "Reception & nurses can assign patient role"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
      role = 'patient'
      AND (
        public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'receptionist')
        OR public.has_role(auth.uid(), 'nurse')
      )
    );
  END IF;
END $$;
