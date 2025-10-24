-- Add awaiting_lab_results column to patient_queue
ALTER TABLE patient_queue 
ADD COLUMN IF NOT EXISTS awaiting_lab_results BOOLEAN DEFAULT FALSE;

-- Add queue_id to lab_orders to link lab requests with patient queue
ALTER TABLE lab_orders
ADD COLUMN IF NOT EXISTS queue_id UUID REFERENCES patient_queue(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_queue_awaiting_lab_results 
ON patient_queue(awaiting_lab_results, queue_status);

CREATE INDEX IF NOT EXISTS idx_lab_orders_queue_id 
ON lab_orders(queue_id);

CREATE INDEX IF NOT EXISTS idx_lab_orders_status 
ON lab_orders(status);