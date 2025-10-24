-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE app_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist');

-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Create triage level enum
CREATE TYPE triage_level AS ENUM ('RED', 'YELLOW', 'GREEN');

-- Create queue status enum
CREATE TYPE queue_status AS ENUM ('waiting', 'in_progress', 'completed', 'on_hold');

-- User Roles Table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- User Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  specialization TEXT,
  employee_id TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Patients Table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  government_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_group TEXT,
  allergies TEXT[],
  comorbidities TEXT[],
  is_pregnant BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Appointments Table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id),
  department TEXT NOT NULL,
  appointment_type TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ,
  status appointment_status DEFAULT 'scheduled',
  token_number TEXT,
  payment_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Vitals Table
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  nurse_id UUID REFERENCES auth.users(id) NOT NULL,
  doctor_id UUID REFERENCES auth.users(id),
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  heart_rate INTEGER,
  spo2 INTEGER,
  temperature DECIMAL(4,1),
  respiratory_rate INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(4,1),
  symptoms TEXT[],
  is_critical BOOLEAN DEFAULT false,
  is_retaken BOOLEAN DEFAULT false,
  retake_reason TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Triage Records Table
CREATE TABLE public.triage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  vitals_id UUID REFERENCES public.vitals(id) ON DELETE CASCADE,
  triage_level triage_level NOT NULL,
  triage_score INTEGER NOT NULL,
  computed_level triage_level NOT NULL,
  manual_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  risk_factors TEXT[],
  priority_notes TEXT,
  evaluated_by UUID REFERENCES auth.users(id) NOT NULL,
  evaluated_at TIMESTAMPTZ DEFAULT now()
);

-- Queue Management Table
CREATE TABLE public.patient_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  triage_id UUID REFERENCES public.triage_records(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  assigned_doctor_id UUID REFERENCES auth.users(id),
  queue_status queue_status DEFAULT 'waiting',
  priority_score INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  time_enqueued TIMESTAMPTZ DEFAULT now(),
  time_started TIMESTAMPTZ,
  time_completed TIMESTAMPTZ,
  wait_time_minutes INTEGER,
  on_hold_reason TEXT,
  escalated BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Nurse Tasks Table
CREATE TABLE public.nurse_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  nurse_id UUID REFERENCES auth.users(id) NOT NULL,
  task_type TEXT NOT NULL,
  task_description TEXT,
  scheduled_time TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurse_tasks ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id;
$$;

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for patients
CREATE POLICY "Staff can view all patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reception and nurses can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Staff can update patients"
  ON public.patients FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for appointments
CREATE POLICY "Staff can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reception can manage appointments"
  ON public.appointments FOR ALL
  USING (
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for vitals
CREATE POLICY "Staff can view vitals"
  ON public.vitals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nurses and doctors can create vitals"
  ON public.vitals FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Nurses and doctors can update vitals"
  ON public.vitals FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for triage_records
CREATE POLICY "Staff can view triage records"
  ON public.triage_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nurses and doctors can create triage"
  ON public.triage_records FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Nurses and doctors can update triage"
  ON public.triage_records FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for patient_queue
CREATE POLICY "Staff can view queue"
  ON public.patient_queue FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage queue"
  ON public.patient_queue FOR ALL
  USING (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for nurse_tasks
CREATE POLICY "Nurses can view their tasks"
  ON public.nurse_tasks FOR SELECT
  USING (
    nurse_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Nurses can create tasks"
  ON public.nurse_tasks FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Nurses can update their tasks"
  ON public.nurse_tasks FOR UPDATE
  USING (
    nurse_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();