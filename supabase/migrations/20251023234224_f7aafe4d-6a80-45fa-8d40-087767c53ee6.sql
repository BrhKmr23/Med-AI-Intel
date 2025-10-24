-- Create outpatient visits tracking table
CREATE TABLE public.outpatient_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  token_number TEXT,
  registration_type TEXT CHECK (registration_type IN ('online', 'walkin')),
  entry_triage_notes TEXT,
  is_emergency BOOLEAN DEFAULT FALSE,
  current_step TEXT CHECK (current_step IN ('entry', 'registration', 'consultation', 'investigation', 'results', 'discharge', 'exit')) DEFAULT 'entry',
  status TEXT CHECK (status IN ('in_progress', 'completed', 'transferred_to_emergency', 'admitted')) DEFAULT 'in_progress',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.outpatient_visits(id),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  chief_complaints TEXT,
  presenting_illness TEXT,
  past_history TEXT,
  examination_findings TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  requires_cross_consultation BOOLEAN DEFAULT FALSE,
  cross_consultation_specialty TEXT,
  insurance_verified BOOLEAN DEFAULT FALSE,
  insurance_claim_id TEXT,
  consultation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investigation orders table
CREATE TABLE public.investigation_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.outpatient_visits(id),
  consultation_id UUID REFERENCES public.consultations(id),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) NOT NULL,
  order_type TEXT CHECK (order_type IN ('medicine', 'lab', 'radiology', 'procedure')),
  order_details JSONB NOT NULL,
  status TEXT CHECK (status IN ('ordered', 'in_progress', 'completed', 'cancelled')) DEFAULT 'ordered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create discharge summaries table
CREATE TABLE public.discharge_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.outpatient_visits(id),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) NOT NULL,
  admission_required BOOLEAN DEFAULT FALSE,
  discharge_diagnosis TEXT,
  treatment_summary TEXT,
  medications_prescribed JSONB,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  home_healthcare_required BOOLEAN DEFAULT FALSE,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient feedback table
CREATE TABLE public.patient_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.outpatient_visits(id),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  feedback_category TEXT CHECK (feedback_category IN ('doctor', 'nurse', 'pharmacy', 'lab', 'billing', 'facility', 'overall')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.outpatient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outpatient_visits
CREATE POLICY "Staff can view all outpatient visits"
ON public.outpatient_visits FOR SELECT
USING (true);

CREATE POLICY "Staff can create outpatient visits"
ON public.outpatient_visits FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'receptionist'::app_role) OR 
  has_role(auth.uid(), 'nurse'::app_role) OR 
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Staff can update outpatient visits"
ON public.outpatient_visits FOR UPDATE
USING (
  has_role(auth.uid(), 'receptionist'::app_role) OR 
  has_role(auth.uid(), 'nurse'::app_role) OR 
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for consultations
CREATE POLICY "Staff can view consultations"
ON public.consultations FOR SELECT
USING (true);

CREATE POLICY "Doctors can create consultations"
ON public.consultations FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Doctors can update consultations"
ON public.consultations FOR UPDATE
USING (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for investigation_orders
CREATE POLICY "Staff can view investigation orders"
ON public.investigation_orders FOR SELECT
USING (true);

CREATE POLICY "Doctors can create investigation orders"
ON public.investigation_orders FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Staff can update investigation orders"
ON public.investigation_orders FOR UPDATE
USING (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'lab_technician'::app_role) OR 
  has_role(auth.uid(), 'pharmacist'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for discharge_summaries
CREATE POLICY "Staff can view discharge summaries"
ON public.discharge_summaries FOR SELECT
USING (true);

CREATE POLICY "Doctors can create discharge summaries"
ON public.discharge_summaries FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for patient_feedback
CREATE POLICY "Staff can view feedback"
ON public.patient_feedback FOR SELECT
USING (true);

CREATE POLICY "Staff can create feedback"
ON public.patient_feedback FOR INSERT
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_outpatient_visits_updated_at
BEFORE UPDATE ON public.outpatient_visits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.outpatient_visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investigation_orders;