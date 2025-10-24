-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  medications JSONB NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  dispensed_by UUID,
  dispensed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lab orders table
CREATE TABLE IF NOT EXISTS public.lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  order_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  priority TEXT DEFAULT 'routine',
  status TEXT DEFAULT 'pending',
  results JSONB,
  notes TEXT,
  technician_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  insurance_claim_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescriptions
CREATE POLICY "Staff can view prescriptions"
  ON public.prescriptions FOR SELECT
  USING (true);

CREATE POLICY "Doctors can create prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Pharmacists can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (has_role(auth.uid(), 'pharmacist') OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for lab orders
CREATE POLICY "Staff can view lab orders"
  ON public.lab_orders FOR SELECT
  USING (true);

CREATE POLICY "Doctors can create lab orders"
  ON public.lab_orders FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Lab technicians can update orders"
  ON public.lab_orders FOR UPDATE
  USING (has_role(auth.uid(), 'lab_technician') OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for billing
CREATE POLICY "Staff can view billing"
  ON public.billing FOR SELECT
  USING (true);

CREATE POLICY "Billing staff can manage billing"
  ON public.billing FOR ALL
  USING (has_role(auth.uid(), 'billing_staff') OR has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_orders_updated_at
  BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at
  BEFORE UPDATE ON public.billing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();