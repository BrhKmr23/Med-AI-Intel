-- Insert 20 sample patients
DO $$
DECLARE
  patient_names TEXT[] := ARRAY[
    'John Anderson', 'Emma Thompson', 'Michael Chen', 'Sarah Martinez', 'Robert Wilson',
    'Jennifer Lee', 'David Garcia', 'Lisa Rodriguez', 'James Taylor', 'Amanda White',
    'Christopher Brown', 'Michelle Davis', 'Daniel Miller', 'Jessica Moore', 'Matthew Johnson',
    'Ashley Williams', 'Joshua Harris', 'Stephanie Clark', 'Brandon Lewis', 'Nicole Walker'
  ];
  i INT;
BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO patients (full_name, phone, date_of_birth, gender, blood_group, address, email, emergency_contact_name, emergency_contact_phone, allergies, comorbidities, government_id)
    VALUES (
      patient_names[i],
      '+1555' || LPAD(i::TEXT, 6, '0'),
      (CURRENT_DATE - (i * 365 + (random() * 3650)::INT)),
      CASE WHEN i % 2 = 0 THEN 'Male' ELSE 'Female' END,
      (ARRAY['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])[1 + floor(random() * 8)::INT],
      i || '00 Main Street, City ' || CHR(64 + i),
      'patient' || i || '@email.com',
      'Emergency Contact ' || i,
      '+1666' || LPAD(i::TEXT, 6, '0'),
      CASE WHEN i % 3 = 0 THEN ARRAY['Penicillin'] WHEN i % 5 = 0 THEN ARRAY['Sulfa drugs'] ELSE ARRAY[]::TEXT[] END,
      CASE WHEN i % 4 = 0 THEN ARRAY['Hypertension'] WHEN i % 6 = 0 THEN ARRAY['Diabetes Type 2'] ELSE ARRAY[]::TEXT[] END,
      'GOV' || LPAD(i::TEXT, 5, '0')
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;