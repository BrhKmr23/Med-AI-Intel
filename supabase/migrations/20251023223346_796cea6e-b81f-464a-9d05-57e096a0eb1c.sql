-- Create pharmacy inventory table
CREATE TABLE public.pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT NOT NULL,
  manufacturer TEXT,
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  unit_price NUMERIC(10,2) NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create drug interactions table
CREATE TABLE public.drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  description TEXT NOT NULL,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ADR reports table
CREATE TABLE public.adr_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) NOT NULL,
  prescription_id UUID REFERENCES public.prescriptions(id),
  drug_name TEXT NOT NULL,
  reaction_description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  onset_date TIMESTAMPTZ NOT NULL,
  reported_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create drug information table
CREATE TABLE public.drug_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL UNIQUE,
  generic_name TEXT,
  category TEXT NOT NULL,
  description TEXT,
  dosage_forms TEXT[],
  indications TEXT,
  contraindications TEXT,
  side_effects TEXT[],
  storage_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacy_inventory
CREATE POLICY "Pharmacists can manage inventory"
ON public.pharmacy_inventory
FOR ALL
USING (has_role(auth.uid(), 'pharmacist') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view inventory"
ON public.pharmacy_inventory
FOR SELECT
USING (true);

-- RLS Policies for drug_interactions
CREATE POLICY "Staff can view drug interactions"
ON public.drug_interactions
FOR SELECT
USING (true);

CREATE POLICY "Pharmacists can manage interactions"
ON public.drug_interactions
FOR ALL
USING (has_role(auth.uid(), 'pharmacist') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for adr_reports
CREATE POLICY "Staff can view ADR reports"
ON public.adr_reports
FOR SELECT
USING (true);

CREATE POLICY "Staff can create ADR reports"
ON public.adr_reports
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Pharmacists can manage ADR reports"
ON public.adr_reports
FOR UPDATE
USING (has_role(auth.uid(), 'pharmacist') OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for drug_information
CREATE POLICY "Staff can view drug information"
ON public.drug_information
FOR SELECT
USING (true);

CREATE POLICY "Pharmacists can manage drug information"
ON public.drug_information
FOR ALL
USING (has_role(auth.uid(), 'pharmacist') OR has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_pharmacy_inventory_updated_at
BEFORE UPDATE ON public.pharmacy_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adr_reports_updated_at
BEFORE UPDATE ON public.adr_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drug_information_updated_at
BEFORE UPDATE ON public.drug_information
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for pharmacy tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.pharmacy_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.adr_reports;