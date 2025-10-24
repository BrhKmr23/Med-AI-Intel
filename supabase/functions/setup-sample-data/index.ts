import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting comprehensive sample data creation...')

    // Define all sample staff users with Indian names and role suffixes
    const sampleStaff = [
      // Doctors
      { email: 'rajesh_doctor@hospital.com', full_name: 'Rajesh_doctor Kumar', phone: '+91-9876543201', role: 'doctor', employee_id: 'DOC001', specialization: 'Cardiology', department: 'Cardiology' },
      { email: 'priya_doctor@hospital.com', full_name: 'Priya_doctor Sharma', phone: '+91-9876543202', role: 'doctor', employee_id: 'DOC002', specialization: 'Pediatrics', department: 'Pediatrics' },
      { email: 'amit_doctor@hospital.com', full_name: 'Amit_doctor Patel', phone: '+91-9876543203', role: 'doctor', employee_id: 'DOC003', specialization: 'Orthopedics', department: 'Orthopedics' },
      
      // Nurses
      { email: 'lakshmi_nurse@hospital.com', full_name: 'Lakshmi_nurse Iyer', phone: '+91-9876543211', role: 'nurse', employee_id: 'NUR001', department: 'General Ward' },
      { email: 'kavita_nurse@hospital.com', full_name: 'Kavita_nurse Singh', phone: '+91-9876543212', role: 'nurse', employee_id: 'NUR002', department: 'ICU' },
      { email: 'anjali_nurse@hospital.com', full_name: 'Anjali_nurse Reddy', phone: '+91-9876543213', role: 'nurse', employee_id: 'NUR003', department: 'Emergency' },
      
      // Receptionists
      { email: 'sunita_receptionist@hospital.com', full_name: 'Sunita_receptionist Verma', phone: '+91-9876543221', role: 'receptionist', employee_id: 'REC001', department: 'Front Desk' },
      { email: 'meera_receptionist@hospital.com', full_name: 'Meera_receptionist Desai', phone: '+91-9876543222', role: 'receptionist', employee_id: 'REC002', department: 'Billing' },
      
      // Lab Technicians
      { email: 'ramesh_lab@hospital.com', full_name: 'Ramesh_lab Gupta', phone: '+91-9876543231', role: 'lab_technician', employee_id: 'LAB001', department: 'Laboratory' },
      { email: 'deepak_lab@hospital.com', full_name: 'Deepak_lab Joshi', phone: '+91-9876543232', role: 'lab_technician', employee_id: 'LAB002', department: 'Laboratory' },
      
      // Pharmacists
      { email: 'suresh_pharmacist@hospital.com', full_name: 'Suresh_pharmacist Nair', phone: '+91-9876543241', role: 'pharmacist', employee_id: 'PHA001', department: 'Pharmacy' },
      { email: 'pooja_pharmacist@hospital.com', full_name: 'Pooja_pharmacist Mehta', phone: '+91-9876543242', role: 'pharmacist', employee_id: 'PHA002', department: 'Pharmacy' },
    ]

    console.log('Creating staff auth users...')
    
    const createdStaff: any[] = []
    
    // Create staff auth users
    for (const staff of sampleStaff) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: staff.email,
        password: '12345678',
        email_confirm: true,
        user_metadata: {
          full_name: staff.full_name,
          phone: staff.phone
        }
      })

      if (authError) {
        console.error(`Error creating staff user ${staff.email}:`, authError)
        continue
      }

      const userId = authData.user?.id
      if (!userId) continue

      console.log(`Created staff auth user: ${staff.email}`)

      // Upsert profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: staff.full_name,
          phone: staff.phone,
          employee_id: staff.employee_id,
          department: staff.department,
          specialization: staff.specialization
        }, { onConflict: 'id' })

      if (profileError) {
        console.error(`Error creating profile for ${staff.email}:`, profileError)
      }

      // Upsert role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: staff.role
        }, { onConflict: 'user_id,role' })

      if (roleError) {
        console.error(`Error creating role for ${staff.email}:`, roleError)
      }

      createdStaff.push({ ...staff, userId })
    }

    // Get IDs for different roles
    const doctorIds = createdStaff.filter(s => s.role === 'doctor').map(s => s.userId)
    const nurseIds = createdStaff.filter(s => s.role === 'nurse').map(s => s.userId)
    const receptionistIds = createdStaff.filter(s => s.role === 'receptionist').map(s => s.userId)
    const labTechIds = createdStaff.filter(s => s.role === 'lab_technician').map(s => s.userId)
    const pharmacistIds = createdStaff.filter(s => s.role === 'pharmacist').map(s => s.userId)

    console.log('Creating patient records...')
    
    // Create patient records
    const patientsData = [
      { full_name: 'Rahul_patient Verma', phone: '+91-9123456701', email: 'rahul_patient@email.com', date_of_birth: '1985-03-15', gender: 'Male', blood_group: 'O+', address: 'Mumbai, Maharashtra', government_id: 'AADH1234567801' },
      { full_name: 'Sneha_patient Kapoor', phone: '+91-9123456702', email: 'sneha_patient@email.com', date_of_birth: '1990-07-22', gender: 'Female', blood_group: 'A+', address: 'Delhi, Delhi', allergies: ['Penicillin'], government_id: 'AADH1234567802' },
      { full_name: 'Vikram_patient Singh', phone: '+91-9123456703', email: 'vikram_patient@email.com', date_of_birth: '1978-11-08', gender: 'Male', blood_group: 'B+', address: 'Bangalore, Karnataka', government_id: 'AADH1234567803' },
      { full_name: 'Ananya_patient Reddy', phone: '+91-9123456704', email: 'ananya_patient@email.com', date_of_birth: '1995-05-30', gender: 'Female', blood_group: 'AB+', address: 'Hyderabad, Telangana', allergies: ['Sulfa drugs'], government_id: 'AADH1234567804' },
      { full_name: 'Karthik_patient Iyer', phone: '+91-9123456705', email: 'karthik_patient@email.com', date_of_birth: '1982-09-14', gender: 'Male', blood_group: 'O-', address: 'Chennai, Tamil Nadu', government_id: 'AADH1234567805' },
      { full_name: 'Divya_patient Patel', phone: '+91-9123456706', email: 'divya_patient@email.com', date_of_birth: '1988-12-25', gender: 'Female', blood_group: 'A-', address: 'Ahmedabad, Gujarat', allergies: ['Peanuts'], government_id: 'AADH1234567806' },
      { full_name: 'Rohit_patient Malhotra', phone: '+91-9123456707', email: 'rohit_patient@email.com', date_of_birth: '1975-04-18', gender: 'Male', blood_group: 'B-', address: 'Pune, Maharashtra', comorbidities: ['Diabetes', 'Hypertension'], government_id: 'AADH1234567807' },
      { full_name: 'Neha_patient Gupta', phone: '+91-9123456708', email: 'neha_patient@email.com', date_of_birth: '1992-08-07', gender: 'Female', blood_group: 'AB-', address: 'Kolkata, West Bengal', allergies: ['Latex'], government_id: 'AADH1234567808' },
      { full_name: 'Aditya_patient Rao', phone: '+91-9123456709', email: 'aditya_patient@email.com', date_of_birth: '1980-01-20', gender: 'Male', blood_group: 'O+', address: 'Jaipur, Rajasthan', government_id: 'AADH1234567809' },
      { full_name: 'Ishita_patient Nair', phone: '+91-9123456710', email: 'ishita_patient@email.com', date_of_birth: '1998-06-12', gender: 'Female', blood_group: 'A+', address: 'Kochi, Kerala', allergies: ['Iodine'], government_id: 'AADH1234567810' },
    ]

    const { data: patients, error: patientsError } = await supabaseAdmin
      .from('patients')
      .insert(patientsData.map(p => ({ ...p, created_by: receptionistIds[0] })))
      .select()

    if (patientsError) {
      console.error('Error creating patients:', patientsError)
      throw patientsError
    }

    console.log('Creating patient portal users...')
    
    // Create patient portal auth users (first 3 patients)
    const portalPatientsData = [
      { email: 'rahul_patient@email.com', full_name: 'Rahul_patient Verma', patient: patients[0] },
      { email: 'sneha_patient@email.com', full_name: 'Sneha_patient Kapoor', patient: patients[1] },
      { email: 'vikram_patient@email.com', full_name: 'Vikram_patient Singh', patient: patients[2] },
    ]

    for (const portalPatient of portalPatientsData) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: portalPatient.email,
        password: '12345678',
        email_confirm: true,
        user_metadata: {
          full_name: portalPatient.full_name
        }
      })

      if (authError) {
        console.error(`Error creating portal user ${portalPatient.email}:`, authError)
        continue
      }

      const portalUserId = authData.user?.id
      if (!portalUserId) continue

      console.log(`Created portal user: ${portalPatient.email}`)

      // Create patient_portal_users entry
      const { error: portalError } = await supabaseAdmin
        .from('patient_portal_users')
        .upsert({
          id: portalUserId,
          patient_id: portalPatient.patient.id,
          email: portalPatient.email,
          email_verified: true,
          is_active: true
        }, { onConflict: 'id' })

      if (portalError) {
        console.error(`Error creating portal entry for ${portalPatient.email}:`, portalError)
      }
    }

    console.log('Creating appointments...')
    
    const appointmentsData = [
      { patient_id: patients[0].id, doctor_id: doctorIds[0], department: 'Cardiology', appointment_type: 'Consultation', scheduled_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'scheduled', token_number: 'C001', created_by: receptionistIds[0], payment_status: 'pending' },
      { patient_id: patients[1].id, doctor_id: doctorIds[1], department: 'Pediatrics', appointment_type: 'Follow-up', scheduled_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'scheduled', token_number: 'P001', created_by: receptionistIds[0], payment_status: 'paid' },
      { patient_id: patients[2].id, doctor_id: doctorIds[2], department: 'Orthopedics', appointment_type: 'Consultation', scheduled_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'scheduled', token_number: 'O001', created_by: receptionistIds[1], payment_status: 'pending' },
      { patient_id: patients[3].id, doctor_id: doctorIds[0], department: 'Cardiology', appointment_type: 'Emergency', scheduled_time: new Date().toISOString(), status: 'completed', token_number: 'E001', created_by: receptionistIds[0], payment_status: 'paid' },
    ]

    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .insert(appointmentsData)
      .select()

    if (appointmentsError) {
      console.error('Error creating appointments:', appointmentsError)
    }

    console.log('Creating vitals records...')
    
    const vitalsData = [
      { patient_id: patients[0].id, nurse_id: nurseIds[0], appointment_id: appointments?.[0]?.id, temperature: 98.6, bp_systolic: 120, bp_diastolic: 80, heart_rate: 72, respiratory_rate: 16, spo2: 98, weight: 70, height: 170, bmi: 24.2, created_by: nurseIds[0] },
      { patient_id: patients[1].id, nurse_id: nurseIds[1], appointment_id: appointments?.[1]?.id, temperature: 99.1, bp_systolic: 110, bp_diastolic: 70, heart_rate: 68, respiratory_rate: 18, spo2: 97, weight: 55, height: 160, bmi: 21.5, created_by: nurseIds[1] },
      { patient_id: patients[2].id, nurse_id: nurseIds[2], appointment_id: appointments?.[2]?.id, temperature: 98.4, bp_systolic: 130, bp_diastolic: 85, heart_rate: 75, respiratory_rate: 17, spo2: 99, weight: 80, height: 175, bmi: 26.1, symptoms: ['Knee pain', 'Swelling'], created_by: nurseIds[2] },
      { patient_id: patients[3].id, nurse_id: nurseIds[0], appointment_id: appointments?.[3]?.id, temperature: 100.2, bp_systolic: 140, bp_diastolic: 90, heart_rate: 88, respiratory_rate: 20, spo2: 95, weight: 65, height: 165, bmi: 23.9, is_critical: true, symptoms: ['Chest pain', 'Breathlessness'], created_by: nurseIds[0] },
    ]

    const { data: vitalsRecords, error: vitalsError } = await supabaseAdmin
      .from('vitals')
      .insert(vitalsData)
      .select()

    if (vitalsError) {
      console.error('Error creating vitals:', vitalsError)
    }

    console.log('Creating consultations and prescriptions...')
    
    // Create consultations
    const consultationsData = [{
      patient_id: patients[3].id,
      doctor_id: doctorIds[0],
      appointment_id: appointments?.[3]?.id,
      chief_complaints: 'Chest pain and breathlessness',
      presenting_illness: 'Patient presented with acute chest pain radiating to left arm',
      examination_findings: 'Elevated BP, irregular heartbeat',
      diagnosis: 'Suspected Angina',
      treatment_plan: 'ECG, Blood tests, medication',
      consultation_notes: 'Patient needs immediate cardiac evaluation',
      requires_cross_consultation: true,
      cross_consultation_specialty: 'Cardiology ICU'
    }]
    
    const { data: consultations } = await supabaseAdmin
      .from('consultations')
      .insert(consultationsData)
      .select()
    
    // Create prescriptions
    const prescriptionsData = [{
      patient_id: patients[3].id,
      doctor_id: doctorIds[0],
      appointment_id: appointments?.[3]?.id,
      medications: [
        { drug_name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take after meals' },
        { drug_name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime' }
      ],
      notes: 'Follow up after 2 weeks',
      status: 'dispensed',
      dispensed_by: pharmacistIds[0],
      dispensed_at: new Date().toISOString()
    }]
    
    await supabaseAdmin.from('prescriptions').insert(prescriptionsData)
    
    // Create lab orders
    const labOrdersData = [{
      patient_id: patients[3].id,
      doctor_id: doctorIds[0],
      appointment_id: appointments?.[3]?.id,
      test_name: 'Complete Blood Count',
      order_type: 'Blood Test',
      priority: 'urgent',
      status: 'completed',
      sample_id: 'LAB2025001',
      sample_collected_at: new Date().toISOString(),
      sample_received_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      technician_id: labTechIds[0],
      validated_by: labTechIds[0],
      validated_at: new Date().toISOString(),
      results: {
        'WBC': '8500 cells/mcL',
        'RBC': '5.2 million cells/mcL',
        'Hemoglobin': '14.5 g/dL',
        'Platelets': '250000/mcL'
      }
    }]
    
    await supabaseAdmin.from('lab_orders').insert(labOrdersData)
    
    // Create triage records
    if (vitalsRecords && vitalsRecords.length > 3) {
      const triageData = [{
        patient_id: patients[3].id,
        evaluated_by: nurseIds[0],
        vitals_id: vitalsRecords[3].id,
        triage_score: 85,
        triage_level: 'urgent',
        computed_level: 'urgent',
        priority_notes: 'Cardiac symptoms - immediate attention required',
        risk_factors: ['Chest pain', 'High BP', 'Age']
      }]
      
      await supabaseAdmin.from('triage_records').insert(triageData)
    }
    
    // Create patient queue
    const queueData = [
      { patient_id: patients[0].id, appointment_id: appointments?.[0]?.id, assigned_doctor_id: doctorIds[0], department: 'Cardiology', queue_status: 'waiting', priority_score: 50, position: 1, created_by: receptionistIds[0] },
      { patient_id: patients[1].id, appointment_id: appointments?.[1]?.id, assigned_doctor_id: doctorIds[1], department: 'Pediatrics', queue_status: 'waiting', priority_score: 40, position: 2, created_by: receptionistIds[0] }
    ]
    
    await supabaseAdmin.from('patient_queue').insert(queueData)
    
    // Create outpatient visits
    const opVisitsData = [{
      patient_id: patients[0].id,
      registration_type: 'new',
      token_number: 'OP001',
      current_step: 'consultation',
      status: 'in_progress',
      created_by: receptionistIds[0]
    }]
    
    await supabaseAdmin.from('outpatient_visits').insert(opVisitsData)
    
    // Create billing records
    const billingData = [{
      patient_id: patients[3].id,
      appointment_id: appointments?.[3]?.id,
      items: [
        { description: 'Consultation Fee', quantity: 1, unit_price: 500, total: 500 },
        { description: 'ECG', quantity: 1, unit_price: 300, total: 300 },
        { description: 'Blood Tests', quantity: 1, unit_price: 800, total: 800 }
      ],
      subtotal: 1600,
      tax: 288,
      total: 1888,
      payment_status: 'paid',
      payment_method: 'card',
      paid_at: new Date().toISOString(),
      created_by: receptionistIds[0]
    }]
    
    await supabaseAdmin.from('billing').insert(billingData)
    
    // Create medical conditions
    const medicalConditionsData = [
      { patient_id: patients[6].id, diagnosis_name: 'Type 2 Diabetes Mellitus', diagnosis_code: 'E11', severity: 'moderate', status: 'active', start_date: '2020-01-15', provider_id: doctorIds[0], notes: 'Patient on oral hypoglycemics' },
      { patient_id: patients[6].id, diagnosis_name: 'Essential Hypertension', diagnosis_code: 'I10', severity: 'mild', status: 'active', start_date: '2021-06-20', provider_id: doctorIds[0], notes: 'Controlled with medication' }
    ]
    
    await supabaseAdmin.from('medical_conditions').insert(medicalConditionsData)
    
    // Create nurse tasks
    const nurseTasksData = [
      { patient_id: patients[0].id, nurse_id: nurseIds[0], task_type: 'medication', task_description: 'Administer morning medications', scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
      { patient_id: patients[1].id, nurse_id: nurseIds[1], task_type: 'vitals', task_description: 'Check and record vitals', scheduled_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() }
    ]
    
    await supabaseAdmin.from('nurse_tasks').insert(nurseTasksData)
    
    // Create insurance plans
    const insuranceData = [{
      patient_id: patients[0].id,
      provider_name: 'Star Health Insurance',
      policy_number: 'SHI2024001',
      plan_type: 'Individual',
      effective_date: '2024-01-01',
      expiry_date: '2025-01-01',
      coverage_details: { sum_insured: 500000, copay_percentage: 10 },
      is_active: true
    }]
    
    await supabaseAdmin.from('insurance_plans').insert(insuranceData)
    
    // Create patient feedback
    const feedbackData = [{
      patient_id: patients[3].id,
      rating: 5,
      feedback_category: 'Doctor',
      feedback_text: 'Excellent care and prompt treatment'
    }]
    
    await supabaseAdmin.from('patient_feedback').insert(feedbackData)

    console.log('Creating pharmacy inventory...')
    
    const inventoryData = [
      { drug_name: 'Paracetamol', generic_name: 'Acetaminophen', category: 'Analgesic', manufacturer: 'Cipla', batch_number: 'PAR2024001', quantity: 500, unit_price: 2.5, expiry_date: '2025-12-31', location: 'Shelf A1', reorder_level: 100 },
      { drug_name: 'Amoxicillin', generic_name: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'Dr Reddys', batch_number: 'AMX2024001', quantity: 300, unit_price: 15.0, expiry_date: '2025-08-31', location: 'Shelf B2', reorder_level: 50 },
      { drug_name: 'Metformin', generic_name: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'Sun Pharma', batch_number: 'MET2024001', quantity: 400, unit_price: 8.5, expiry_date: '2026-03-31', location: 'Shelf C1', reorder_level: 50 },
      { drug_name: 'Atorvastatin', generic_name: 'Atorvastatin Calcium', category: 'Statin', manufacturer: 'Lupin', batch_number: 'ATO2024001', quantity: 200, unit_price: 12.0, expiry_date: '2025-11-30', location: 'Shelf D3', reorder_level: 30 },
      { drug_name: 'Aspirin', generic_name: 'Acetylsalicylic Acid', category: 'Antiplatelet', manufacturer: 'Ranbaxy', batch_number: 'ASP2024001', quantity: 600, unit_price: 3.0, expiry_date: '2026-01-31', location: 'Shelf A2', reorder_level: 100 },
      { drug_name: 'Clopidogrel', generic_name: 'Clopidogrel Bisulfate', category: 'Antiplatelet', manufacturer: 'Cipla', batch_number: 'CLO2024001', quantity: 150, unit_price: 25.0, expiry_date: '2025-10-31', location: 'Shelf D4', reorder_level: 25 },
      { drug_name: 'Omeprazole', generic_name: 'Omeprazole', category: 'Proton Pump Inhibitor', manufacturer: 'Torrent', batch_number: 'OME2024001', quantity: 350, unit_price: 6.5, expiry_date: '2025-09-30', location: 'Shelf E1', reorder_level: 60 },
      { drug_name: 'Amlodipine', generic_name: 'Amlodipine Besylate', category: 'Calcium Channel Blocker', manufacturer: 'Alkem', batch_number: 'AML2024001', quantity: 280, unit_price: 9.0, expiry_date: '2026-02-28', location: 'Shelf C2', reorder_level: 40 },
    ]

    await supabaseAdmin.from('pharmacy_inventory').insert(inventoryData)
    
    // Create drug information
    const drugInfoData = [{
      drug_name: 'Aspirin',
      generic_name: 'Acetylsalicylic Acid',
      category: 'Antiplatelet',
      description: 'Used to prevent blood clots and reduce risk of heart attack',
      indications: 'Cardiovascular disease prevention, pain relief',
      contraindications: 'Bleeding disorders, peptic ulcer disease',
      side_effects: ['Stomach upset', 'Bleeding risk', 'Allergic reactions'],
      dosage_forms: ['75mg tablets', '150mg tablets'],
      storage_conditions: 'Store at room temperature, away from moisture'
    }]
    
    await supabaseAdmin.from('drug_information').insert(drugInfoData)
    
    // Create drug interactions
    const drugInteractionsData = [{
      drug_a: 'Aspirin',
      drug_b: 'Clopidogrel',
      severity: 'moderate',
      description: 'Increased bleeding risk when used together',
      recommendation: 'Monitor for signs of bleeding, use with caution'
    }]
    
    await supabaseAdmin.from('drug_interactions').insert(drugInteractionsData)
    
    // Create biomedical equipment
    const equipmentData = [
      { equipment_name: 'ECG Machine', equipment_type: 'Diagnostic', model_number: 'ECG-5000', serial_number: 'SN2024ECG001', manufacturer: 'Philips', location: 'Cardiology Department', status: 'operational', purchase_date: '2023-01-15', warranty_expiry: '2026-01-15', last_service_date: '2024-11-01', next_service_date: '2025-05-01', calibration_due_date: '2025-07-01' },
      { equipment_name: 'X-Ray Machine', equipment_type: 'Imaging', model_number: 'XR-3000', serial_number: 'SN2024XR001', manufacturer: 'Siemens', location: 'Radiology', status: 'operational', purchase_date: '2022-06-10', warranty_expiry: '2025-06-10', last_service_date: '2024-10-15', next_service_date: '2025-04-15' }
    ]
    
    await supabaseAdmin.from('biomedical_equipment').insert(equipmentData)

    console.log('Sample data creation completed successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Comprehensive sample data created successfully',
        staff_created: createdStaff.length,
        patients_created: patients.length,
        portal_users_created: 3,
        appointments_created: appointments?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in setup-sample-data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
