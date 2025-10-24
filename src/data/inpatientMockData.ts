// Mock data for Inpatient Management System

export interface InpatientBed {
  id: string;
  ward: string;
  bedNumber: string;
  floor: number;
  bedType: 'Regular' | 'Oxygen' | 'Ventilator' | 'Isolation';
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  patientId?: string;
  patientName?: string;
  gender: 'Male' | 'Female' | 'Unisex';
  features: string[];
}

export interface InpatientRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  admissionDate: string;
  diagnosis: string;
  ward: string;
  bedNumber: string;
  attendingDoctor: string;
  nursesAssigned: string[];
  status: 'Stable' | 'Critical' | 'Observation' | 'Recovering';
  dietPlan?: string;
  isolationRequired: boolean;
}

export interface DietOrder {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  dietType: 'Regular' | 'Diabetic' | 'Cardiac' | 'Renal' | 'NPO' | 'Liquid' | 'Soft';
  restrictions: string[];
  allergies: string[];
  specialInstructions: string;
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  calories: number;
  orderedBy: string;
  orderedAt: string;
}

export interface KitchenProduction {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  productionDate: string;
  totalTrays: number;
  dietBreakdown: { [key: string]: number };
  status: 'Planning' | 'In Production' | 'Ready' | 'Dispatched' | 'Completed';
  startTime: string;
  completionTime?: string;
  wastage?: number;
}

export interface PhysioSession {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  sessionType: 'Assessment' | 'Treatment' | 'Reassessment' | 'Discharge';
  scheduledDate: string;
  scheduledTime: string;
  therapist: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  exercises: string[];
  progressNotes?: string;
  painScore?: number;
  mobilityScore?: number;
}

export interface OTSession {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  assessmentType: 'COPM' | 'FIM' | 'Barthel Index' | 'ADL Assessment';
  scheduledDate: string;
  therapist: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  functionalGoals: string[];
  equipment: string[];
  outcomeScore?: number;
  activities: string[];
}

export interface OTSchedule {
  id: string;
  patientName: string;
  age: number;
  surgeon: string;
  procedure: string;
  otRoom: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  anesthesiaType: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  teamMembers: string[];
  equipmentNeeded: string[];
  specialRequirements?: string;
}

export interface ICUPatient {
  id: string;
  patientName: string;
  age: number;
  bedNumber: string;
  diagnosis: string;
  admissionDate: string;
  ventilatorSupport: boolean;
  sedationLevel?: string;
  vitals: {
    hr: number;
    bp: string;
    spo2: number;
    rr: number;
    temp: number;
    map: number;
    cvp?: number;
  };
  ventilatorSettings?: {
    mode: string;
    fio2: number;
    peep: number;
    tidalVolume: number;
  };
  fluidBalance: {
    input: number;
    output: number;
    balance: number;
  };
  ewsScore: number;
  alerts: string[];
}

export interface HealthCheckPackage {
  id: string;
  packageName: string;
  category: 'Executive' | 'Cardiac' | 'Diabetes' | 'Women' | 'Senior Citizen' | 'Basic';
  price: number;
  tests: string[];
  duration: string;
  patientId?: string;
  patientName?: string;
  bookingDate?: string;
  status?: 'Booked' | 'In Progress' | 'Completed' | 'Report Ready';
}

export interface NurseDeployment {
  id: string;
  nurseName: string;
  employeeId: string;
  shift: 'Morning' | 'Evening' | 'Night';
  ward: string;
  patientsAssigned: number;
  acuityScore: number;
  tasks: {
    id: string;
    task: string;
    time: string;
    status: 'Pending' | 'In Progress' | 'Completed';
  }[];
  availability: 'Available' | 'On Duty' | 'Break' | 'Off Duty';
}

export interface DoctorDeployment {
  id: string;
  doctorName: string;
  employeeId: string;
  specialization: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'On-Call';
  department: string;
  patientsUnderCare: number;
  availability: 'Available' | 'Busy' | 'In OT' | 'Emergency' | 'Off Duty';
  contactNumber: string;
  nextAvailableTime?: string;
}

export interface BiomedicalEquipment {
  id: string;
  equipmentName: string;
  equipmentType: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  status: 'Operational' | 'Under Maintenance' | 'Faulty' | 'Calibration Due';
  lastServiceDate: string;
  nextServiceDate: string;
  calibrationDue: string;
  assignedTo?: string;
  warrantyExpiry: string;
}

// Mock Data
export const mockInpatientBeds: InpatientBed[] = [
  {
    id: 'bed-1',
    ward: 'General Ward A',
    bedNumber: 'GWA-101',
    floor: 1,
    bedType: 'Regular',
    status: 'Occupied',
    patientId: 'IP-001',
    patientName: 'John Doe',
    gender: 'Male',
    features: ['Monitor', 'Oxygen Port']
  },
  {
    id: 'bed-2',
    ward: 'General Ward A',
    bedNumber: 'GWA-102',
    floor: 1,
    bedType: 'Oxygen',
    status: 'Occupied',
    patientId: 'IP-002',
    patientName: 'Jane Smith',
    gender: 'Female',
    features: ['Monitor', 'Oxygen Port', 'Suction']
  },
  {
    id: 'bed-3',
    ward: 'ICU',
    bedNumber: 'ICU-201',
    floor: 2,
    bedType: 'Ventilator',
    status: 'Occupied',
    patientId: 'IP-003',
    patientName: 'Robert Johnson',
    gender: 'Male',
    features: ['Advanced Monitor', 'Ventilator', 'Central Line', 'Infusion Pumps']
  },
  {
    id: 'bed-4',
    ward: 'ICU',
    bedNumber: 'ICU-202',
    floor: 2,
    bedType: 'Ventilator',
    status: 'Available',
    gender: 'Unisex',
    features: ['Advanced Monitor', 'Ventilator', 'Central Line']
  },
  {
    id: 'bed-5',
    ward: 'Isolation Ward',
    bedNumber: 'ISO-301',
    floor: 3,
    bedType: 'Isolation',
    status: 'Reserved',
    gender: 'Unisex',
    features: ['HEPA Filter', 'Negative Pressure', 'Monitor', 'Oxygen']
  }
];

export const mockInpatientRecords: InpatientRecord[] = [
  {
    id: 'IP-001',
    patientId: 'PAT-12345',
    patientName: 'John Doe',
    age: 58,
    gender: 'Male',
    admissionDate: '2024-01-20T10:30:00',
    diagnosis: 'Acute Myocardial Infarction',
    ward: 'General Ward A',
    bedNumber: 'GWA-101',
    attendingDoctor: 'Dr. Sarah Williams',
    nursesAssigned: ['Nurse Mary', 'Nurse Tom'],
    status: 'Stable',
    dietPlan: 'Cardiac',
    isolationRequired: false
  },
  {
    id: 'IP-002',
    patientId: 'PAT-12346',
    patientName: 'Jane Smith',
    age: 45,
    gender: 'Female',
    admissionDate: '2024-01-21T14:00:00',
    diagnosis: 'Diabetic Ketoacidosis',
    ward: 'General Ward A',
    bedNumber: 'GWA-102',
    attendingDoctor: 'Dr. Michael Chen',
    nursesAssigned: ['Nurse Lisa', 'Nurse John'],
    status: 'Observation',
    dietPlan: 'Diabetic',
    isolationRequired: false
  },
  {
    id: 'IP-003',
    patientId: 'PAT-12347',
    patientName: 'Robert Johnson',
    age: 62,
    gender: 'Male',
    admissionDate: '2024-01-19T08:00:00',
    diagnosis: 'Severe Pneumonia with Respiratory Failure',
    ward: 'ICU',
    bedNumber: 'ICU-201',
    attendingDoctor: 'Dr. Emily Davis',
    nursesAssigned: ['Nurse Rachel', 'Nurse David'],
    status: 'Critical',
    dietPlan: 'NPO',
    isolationRequired: true
  }
];

export const mockDietOrders: DietOrder[] = [
  {
    id: 'diet-001',
    patientId: 'IP-001',
    patientName: 'John Doe',
    bedNumber: 'GWA-101',
    dietType: 'Cardiac',
    restrictions: ['Low Sodium', 'Low Fat', 'Low Cholesterol'],
    allergies: ['Shellfish'],
    specialInstructions: 'Small frequent meals, avoid caffeine',
    mealPlan: {
      breakfast: 'Oatmeal, boiled egg whites, apple',
      lunch: 'Grilled chicken breast, steamed vegetables, brown rice',
      dinner: 'Baked fish, salad, quinoa',
      snacks: 'Fruits, nuts (unsalted)'
    },
    calories: 1800,
    orderedBy: 'Dr. Sarah Williams',
    orderedAt: '2024-01-20T11:00:00'
  },
  {
    id: 'diet-002',
    patientId: 'IP-002',
    patientName: 'Jane Smith',
    bedNumber: 'GWA-102',
    dietType: 'Diabetic',
    restrictions: ['Low Carb', 'No Sugar', 'High Fiber'],
    allergies: [],
    specialInstructions: 'Monitor blood sugar before and after meals',
    mealPlan: {
      breakfast: 'Whole grain toast, scrambled eggs, berries',
      lunch: 'Grilled turkey, mixed salad, lentil soup',
      dinner: 'Baked chicken, broccoli, cauliflower rice',
      snacks: 'Greek yogurt, cucumber sticks'
    },
    calories: 1600,
    orderedBy: 'Dr. Michael Chen',
    orderedAt: '2024-01-21T15:00:00'
  },
  {
    id: 'diet-003',
    patientId: 'IP-003',
    patientName: 'Robert Johnson',
    bedNumber: 'ICU-201',
    dietType: 'NPO',
    restrictions: ['Nothing by mouth'],
    allergies: ['Penicillin'],
    specialInstructions: 'Enteral feeding via NG tube - 1500ml formula/day',
    mealPlan: {
      breakfast: 'Enteral nutrition formula',
      lunch: 'Enteral nutrition formula',
      dinner: 'Enteral nutrition formula',
      snacks: 'N/A'
    },
    calories: 1500,
    orderedBy: 'Dr. Emily Davis',
    orderedAt: '2024-01-19T09:00:00'
  }
];

export const mockKitchenProduction: KitchenProduction[] = [
  {
    id: 'prod-001',
    mealType: 'Breakfast',
    productionDate: '2024-01-23',
    totalTrays: 45,
    dietBreakdown: {
      Regular: 20,
      Diabetic: 12,
      Cardiac: 8,
      Renal: 3,
      Liquid: 2
    },
    status: 'Completed',
    startTime: '06:00',
    completionTime: '07:30',
    wastage: 2
  },
  {
    id: 'prod-002',
    mealType: 'Lunch',
    productionDate: '2024-01-23',
    totalTrays: 48,
    dietBreakdown: {
      Regular: 22,
      Diabetic: 13,
      Cardiac: 9,
      Renal: 2,
      Soft: 2
    },
    status: 'In Production',
    startTime: '10:00'
  }
];

export const mockPhysioSessions: PhysioSession[] = [
  {
    id: 'physio-001',
    patientId: 'IP-001',
    patientName: 'John Doe',
    bedNumber: 'GWA-101',
    sessionType: 'Treatment',
    scheduledDate: '2024-01-23',
    scheduledTime: '10:00',
    therapist: 'PT. James Wilson',
    status: 'Scheduled',
    exercises: ['Chest physiotherapy', 'Breathing exercises', 'Passive ROM - upper limbs']
  },
  {
    id: 'physio-002',
    patientId: 'IP-002',
    patientName: 'Jane Smith',
    bedNumber: 'GWA-102',
    sessionType: 'Assessment',
    scheduledDate: '2024-01-23',
    scheduledTime: '11:30',
    therapist: 'PT. Maria Garcia',
    status: 'In Progress',
    exercises: ['Initial mobility assessment', 'Gait analysis'],
    painScore: 3,
    mobilityScore: 7
  }
];

export const mockOTSessions: OTSession[] = [
  {
    id: 'ot-001',
    patientId: 'IP-001',
    patientName: 'John Doe',
    bedNumber: 'GWA-101',
    assessmentType: 'FIM',
    scheduledDate: '2024-01-23',
    therapist: 'OT. Rebecca Lee',
    status: 'Scheduled',
    functionalGoals: ['Independent bathing', 'Dressing with minimal assistance'],
    equipment: ['Walker', 'Adaptive clothing'],
    activities: ['ADL training', 'Energy conservation techniques']
  }
];

export const mockOTSchedules: OTSchedule[] = [
  {
    id: 'ots-001',
    patientName: 'Michael Brown',
    age: 55,
    surgeon: 'Dr. Anderson',
    procedure: 'Laparoscopic Cholecystectomy',
    otRoom: 'OT-1',
    scheduledDate: '2024-01-23',
    scheduledTime: '08:00',
    duration: 120,
    anesthesiaType: 'General',
    status: 'Scheduled',
    teamMembers: ['Dr. Anderson', 'Anesthetist Dr. Kumar', 'Nurse Sarah', 'Technician John'],
    equipmentNeeded: ['Laparoscope', 'Cautery', 'Suction']
  },
  {
    id: 'ots-002',
    patientName: 'Patricia Wilson',
    age: 42,
    surgeon: 'Dr. Martinez',
    procedure: 'Appendectomy',
    otRoom: 'OT-2',
    scheduledDate: '2024-01-23',
    scheduledTime: '10:30',
    duration: 90,
    anesthesiaType: 'General',
    status: 'In Progress',
    teamMembers: ['Dr. Martinez', 'Anesthetist Dr. Patel', 'Nurse Emma', 'Technician Mike'],
    equipmentNeeded: ['Standard surgical set', 'Suction', 'Cautery']
  }
];

export const mockICUPatients: ICUPatient[] = [
  {
    id: 'icu-001',
    patientName: 'Robert Johnson',
    age: 62,
    bedNumber: 'ICU-201',
    diagnosis: 'Severe Pneumonia with Respiratory Failure',
    admissionDate: '2024-01-19',
    ventilatorSupport: true,
    sedationLevel: 'RASS -2',
    vitals: {
      hr: 95,
      bp: '125/78',
      spo2: 94,
      rr: 18,
      temp: 38.2,
      map: 93,
      cvp: 10
    },
    ventilatorSettings: {
      mode: 'SIMV',
      fio2: 60,
      peep: 8,
      tidalVolume: 450
    },
    fluidBalance: {
      input: 2500,
      output: 1800,
      balance: 700
    },
    ewsScore: 6,
    alerts: ['High fever', 'Elevated WBC count']
  }
];

export const mockHealthCheckPackages: HealthCheckPackage[] = [
  {
    id: 'pkg-001',
    packageName: 'Executive Health Checkup',
    category: 'Executive',
    price: 8500,
    tests: ['CBC', 'Lipid Profile', 'LFT', 'RFT', 'Thyroid Profile', 'HbA1c', 'Chest X-Ray', 'ECG', 'USG Abdomen', 'Stress Test'],
    duration: '4-5 hours',
    patientId: 'PAT-67890',
    patientName: 'David Lee',
    bookingDate: '2024-01-23',
    status: 'In Progress'
  },
  {
    id: 'pkg-002',
    packageName: 'Cardiac Health Checkup',
    category: 'Cardiac',
    price: 6500,
    tests: ['CBC', 'Lipid Profile', 'ECG', '2D Echo', 'Stress Test', 'Troponin', 'NT-proBNP'],
    duration: '3-4 hours'
  }
];

export const mockNurseDeployment: NurseDeployment[] = [
  {
    id: 'nurse-001',
    nurseName: 'Nurse Mary Johnson',
    employeeId: 'N-1001',
    shift: 'Morning',
    ward: 'General Ward A',
    patientsAssigned: 6,
    acuityScore: 18,
    tasks: [
      { id: 't1', task: 'Vitals check - GWA-101', time: '08:00', status: 'Completed' },
      { id: 't2', task: 'Medication administration - GWA-102', time: '09:00', status: 'Completed' },
      { id: 't3', task: 'Wound dressing - GWA-103', time: '10:30', status: 'In Progress' },
      { id: 't4', task: 'IV line change - GWA-101', time: '14:00', status: 'Pending' }
    ],
    availability: 'On Duty'
  },
  {
    id: 'nurse-002',
    nurseName: 'Nurse Rachel Adams',
    employeeId: 'N-1002',
    shift: 'Morning',
    ward: 'ICU',
    patientsAssigned: 2,
    acuityScore: 24,
    tasks: [
      { id: 't5', task: 'Ventilator check - ICU-201', time: '08:00', status: 'Completed' },
      { id: 't6', task: 'Suction - ICU-201', time: '10:00', status: 'Completed' },
      { id: 't7', task: 'Central line dressing - ICU-202', time: '12:00', status: 'Pending' }
    ],
    availability: 'On Duty'
  }
];

export const mockDoctorDeployment: DoctorDeployment[] = [
  {
    id: 'doc-001',
    doctorName: 'Dr. Sarah Williams',
    employeeId: 'D-2001',
    specialization: 'Cardiology',
    shift: 'Morning',
    department: 'Cardiology',
    patientsUnderCare: 12,
    availability: 'Available',
    contactNumber: '+1-555-0101',
    nextAvailableTime: 'Now'
  },
  {
    id: 'doc-002',
    doctorName: 'Dr. Michael Chen',
    employeeId: 'D-2002',
    specialization: 'Endocrinology',
    shift: 'Morning',
    department: 'Internal Medicine',
    patientsUnderCare: 10,
    availability: 'Busy',
    contactNumber: '+1-555-0102',
    nextAvailableTime: '11:30 AM'
  },
  {
    id: 'doc-003',
    doctorName: 'Dr. Anderson',
    employeeId: 'D-2003',
    specialization: 'General Surgery',
    shift: 'Morning',
    department: 'Surgery',
    patientsUnderCare: 8,
    availability: 'In OT',
    contactNumber: '+1-555-0103',
    nextAvailableTime: '12:00 PM'
  }
];

export const mockBiomedicalEquipment: BiomedicalEquipment[] = [
  {
    id: 'eq-001',
    equipmentName: 'Ventilator',
    equipmentType: 'Life Support',
    manufacturer: 'Medtronic',
    serialNumber: 'VNT-2023-001',
    location: 'ICU-201',
    status: 'Operational',
    lastServiceDate: '2024-01-10',
    nextServiceDate: '2024-04-10',
    calibrationDue: '2024-07-10',
    assignedTo: 'Robert Johnson',
    warrantyExpiry: '2025-06-15'
  },
  {
    id: 'eq-002',
    equipmentName: 'Patient Monitor',
    equipmentType: 'Monitoring',
    manufacturer: 'Philips',
    serialNumber: 'MON-2023-015',
    location: 'GWA-101',
    status: 'Operational',
    lastServiceDate: '2024-01-05',
    nextServiceDate: '2024-04-05',
    calibrationDue: '2024-10-05',
    assignedTo: 'John Doe',
    warrantyExpiry: '2026-03-20'
  },
  {
    id: 'eq-003',
    equipmentName: 'Infusion Pump',
    equipmentType: 'Infusion System',
    manufacturer: 'B. Braun',
    serialNumber: 'INF-2023-042',
    location: 'ICU-202',
    status: 'Calibration Due',
    lastServiceDate: '2023-12-20',
    nextServiceDate: '2024-03-20',
    calibrationDue: '2024-01-25',
    warrantyExpiry: '2025-12-31'
  },
  {
    id: 'eq-004',
    equipmentName: 'Defibrillator',
    equipmentType: 'Emergency',
    manufacturer: 'Zoll',
    serialNumber: 'DEF-2023-008',
    location: 'Emergency Cart - Floor 2',
    status: 'Under Maintenance',
    lastServiceDate: '2024-01-15',
    nextServiceDate: '2024-07-15',
    calibrationDue: '2024-07-15',
    warrantyExpiry: '2026-01-30'
  }
];
