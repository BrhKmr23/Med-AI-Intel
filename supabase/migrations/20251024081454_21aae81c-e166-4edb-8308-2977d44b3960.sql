-- Add patient role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'patient';

-- Update patient_portal_users table structure
ALTER TABLE public.patient_portal_users
  DROP CONSTRAINT IF EXISTS patient_portal_users_id_fkey,
  ADD CONSTRAINT patient_portal_users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint on patient_id
ALTER TABLE public.patient_portal_users
  DROP CONSTRAINT IF EXISTS patient_portal_users_patient_id_key,
  ADD CONSTRAINT patient_portal_users_patient_id_key UNIQUE (patient_id);

-- Add unique constraint on email
ALTER TABLE public.patient_portal_users
  DROP CONSTRAINT IF EXISTS patient_portal_users_email_key,
  ADD CONSTRAINT patient_portal_users_email_key UNIQUE (email);

-- Update RLS policies for patient role
CREATE POLICY "Patients can view own data" ON public.patients
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients can update own profile" ON public.patients
FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

-- Add policies for other patient-related tables
CREATE POLICY "Patients view own vitals" ON public.vitals
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients view own prescriptions" ON public.prescriptions
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients view own lab orders" ON public.lab_orders
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients view own consultations" ON public.consultations
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients view own appointments" ON public.appointments
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients view own billing" ON public.billing
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients view own medical conditions" ON public.medical_conditions
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Patients view own insurance" ON public.insurance_plans
FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT patient_id 
    FROM public.patient_portal_users 
    WHERE id = auth.uid()
  )
);