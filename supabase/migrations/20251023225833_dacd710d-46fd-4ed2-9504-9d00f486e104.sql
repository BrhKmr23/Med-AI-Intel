-- Enhance lab_orders table with sample tracking
ALTER TABLE public.lab_orders
ADD COLUMN IF NOT EXISTS sample_id TEXT,
ADD COLUMN IF NOT EXISTS sample_collected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sample_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS report_url TEXT;

-- Create biomedical_equipment table
CREATE TABLE IF NOT EXISTS public.biomedical_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  model_number TEXT,
  serial_number TEXT UNIQUE,
  manufacturer TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational',
  last_service_date DATE,
  next_service_date DATE,
  calibration_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create equipment_maintenance table
CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.biomedical_equipment(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  technician_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'routine',
  description TEXT,
  findings TEXT,
  cost NUMERIC,
  work_order_number TEXT,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create outsourced_tests table
CREATE TABLE IF NOT EXISTS public.outsourced_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  external_lab_name TEXT NOT NULL,
  external_lab_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  sample_id TEXT,
  external_report_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.biomedical_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outsourced_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for biomedical_equipment
CREATE POLICY "Lab technicians can view equipment"
ON public.biomedical_equipment FOR SELECT
USING (true);

CREATE POLICY "Lab technicians can manage equipment"
ON public.biomedical_equipment FOR ALL
USING (
  has_role(auth.uid(), 'lab_technician'::app_role) OR 
  has_role(auth.uid(), 'it_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for equipment_maintenance
CREATE POLICY "Lab technicians can view maintenance"
ON public.equipment_maintenance FOR SELECT
USING (true);

CREATE POLICY "Lab technicians can manage maintenance"
ON public.equipment_maintenance FOR ALL
USING (
  has_role(auth.uid(), 'lab_technician'::app_role) OR 
  has_role(auth.uid(), 'it_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for outsourced_tests
CREATE POLICY "Lab technicians can view outsourced tests"
ON public.outsourced_tests FOR SELECT
USING (true);

CREATE POLICY "Lab technicians can manage outsourced tests"
ON public.outsourced_tests FOR ALL
USING (
  has_role(auth.uid(), 'lab_technician'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Triggers for updated_at
CREATE TRIGGER update_biomedical_equipment_updated_at
BEFORE UPDATE ON public.biomedical_equipment
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_maintenance_updated_at
BEFORE UPDATE ON public.equipment_maintenance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outsourced_tests_updated_at
BEFORE UPDATE ON public.outsourced_tests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();