-- Add foreign key for outsourced_tests to patients
ALTER TABLE public.outsourced_tests
ADD CONSTRAINT outsourced_tests_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;