-- Update RLS policy to allow doctors to create patients
DROP POLICY IF EXISTS "Reception and nurses can create patients" ON public.patients;

CREATE POLICY "Staff can create patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'receptionist'::app_role) OR 
  has_role(auth.uid(), 'nurse'::app_role) OR 
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);