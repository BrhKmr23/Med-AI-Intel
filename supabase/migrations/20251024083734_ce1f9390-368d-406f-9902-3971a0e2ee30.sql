-- Drop existing patient_portal_users table and recreate with correct schema
DROP TABLE IF EXISTS public.patient_portal_users CASCADE;

-- Create patient_portal_users with correct foreign key structure
CREATE TABLE public.patient_portal_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(patient_id)
);

-- Enable RLS
ALTER TABLE public.patient_portal_users ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Staff can create portal users" ON public.patient_portal_users;
DROP POLICY IF EXISTS "Staff can view all portal users" ON public.patient_portal_users;
DROP POLICY IF EXISTS "Users can view their own portal account" ON public.patient_portal_users;
DROP POLICY IF EXISTS "Users can update their own portal account" ON public.patient_portal_users;

-- Create RLS policies
CREATE POLICY "Staff can create portal users" 
ON public.patient_portal_users 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'receptionist'::app_role)
);

CREATE POLICY "Staff can view all portal users" 
ON public.patient_portal_users 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'receptionist'::app_role)
);

CREATE POLICY "Users can view their own portal account" 
ON public.patient_portal_users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own portal account" 
ON public.patient_portal_users 
FOR UPDATE 
USING (auth.uid() = id);

-- Add trigger for updated_at
CREATE TRIGGER update_patient_portal_users_updated_at
BEFORE UPDATE ON public.patient_portal_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_patient_portal_users_patient_id ON public.patient_portal_users(patient_id);
CREATE INDEX idx_patient_portal_users_email ON public.patient_portal_users(email);