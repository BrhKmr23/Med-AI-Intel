-- Add validation and PDF upload fields to lab_orders
ALTER TABLE public.lab_orders
ADD COLUMN IF NOT EXISTS validated_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pdf_upload_url text,
ADD COLUMN IF NOT EXISTS critical_findings text,
ADD COLUMN IF NOT EXISTS interpretation text;

-- Add index for queue management
CREATE INDEX IF NOT EXISTS idx_lab_orders_status_priority ON public.lab_orders(status, priority, created_at);

-- Add index for sample tracking
CREATE INDEX IF NOT EXISTS idx_lab_orders_sample_id ON public.lab_orders(sample_id);