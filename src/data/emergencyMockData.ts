export interface EmergencyCase {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mrn?: string;
  emergencyNumber: string;
  chiefComplaint: string;
  arrivalTime: string;
  status: 'ambulance' | 'triage' | 'treatment' | 'admitted' | 'discharged';
  triageLevel: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  triageScore: number;
  vitals: {
    bp: string;
    hr: number;
    rr: number;
    temp: number;
    spo2: number;
    gcs?: number;
    painScore?: number;
  };
  location?: string;
  eta?: string;
  isMLC: boolean;
  isAMA: boolean;
  isBroughtDead: boolean;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: 'ALS' | 'BLS';
  status: 'available' | 'dispatched' | 'on-scene' | 'transporting' | 'arrived';
  crew: string[];
  currentLocation: { lat: number; lng: number };
  assignedCase?: string;
}

export interface Bed {
  id: string;
  bedNumber: string;
  ward: string;
  type: 'ICU' | 'HDU' | 'General' | 'Isolation';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  patientId?: string;
  features: string[];
}

export const mockEmergencyCases: EmergencyCase[] = [
  {
    id: 'ER-20231023-001',
    patientName: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    mrn: 'MRN-2023-5678',
    emergencyNumber: 'ER-20231023-001',
    chiefComplaint: 'Chest pain, shortness of breath',
    arrivalTime: '14:30',
    status: 'ambulance',
    triageLevel: 'red',
    triageScore: 9,
    vitals: {
      bp: '160/95',
      hr: 115,
      rr: 24,
      temp: 37.2,
      spo2: 91,
      gcs: 15,
      painScore: 8
    },
    location: 'MG Road, 2.5 km away',
    eta: '8 minutes',
    isMLC: false,
    isAMA: false,
    isBroughtDead: false
  },
  {
    id: 'ER-20231023-002',
    patientName: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    emergencyNumber: 'ER-20231023-002',
    chiefComplaint: 'Road traffic accident - Multiple injuries',
    arrivalTime: '15:10',
    status: 'triage',
    triageLevel: 'orange',
    triageScore: 7,
    vitals: {
      bp: '110/70',
      hr: 98,
      rr: 20,
      temp: 36.8,
      spo2: 95,
      gcs: 14,
      painScore: 7
    },
    isMLC: true,
    isAMA: false,
    isBroughtDead: false
  },
  {
    id: 'ER-20231023-003',
    patientName: 'Ankit Verma',
    age: 35,
    gender: 'Male',
    mrn: 'MRN-2023-9012',
    emergencyNumber: 'ER-20231023-003',
    chiefComplaint: 'Severe abdominal pain',
    arrivalTime: '16:20',
    status: 'treatment',
    triageLevel: 'yellow',
    triageScore: 5,
    vitals: {
      bp: '125/80',
      hr: 88,
      rr: 18,
      temp: 37.8,
      spo2: 98,
      painScore: 6
    },
    isMLC: false,
    isAMA: false,
    isBroughtDead: false
  },
  {
    id: 'ER-20231023-004',
    patientName: 'Suresh Patel',
    age: 62,
    gender: 'Male',
    emergencyNumber: 'ER-20231023-004',
    chiefComplaint: 'Unresponsive - Suspected stroke',
    arrivalTime: '13:45',
    status: 'treatment',
    triageLevel: 'red',
    triageScore: 10,
    vitals: {
      bp: '180/110',
      hr: 105,
      rr: 22,
      temp: 37.0,
      spo2: 89,
      gcs: 8
    },
    isMLC: false,
    isAMA: false,
    isBroughtDead: false
  },
  {
    id: 'ER-20231023-005',
    patientName: 'Meera Singh',
    age: 19,
    gender: 'Female',
    emergencyNumber: 'ER-20231023-005',
    chiefComplaint: 'Minor laceration - Left hand',
    arrivalTime: '17:00',
    status: 'triage',
    triageLevel: 'green',
    triageScore: 2,
    vitals: {
      bp: '118/75',
      hr: 76,
      rr: 16,
      temp: 36.6,
      spo2: 99,
      painScore: 3
    },
    isMLC: false,
    isAMA: false,
    isBroughtDead: false
  }
];

export const mockAmbulances: Ambulance[] = [
  {
    id: 'AMB-001',
    vehicleNumber: 'KA-01-ER-1234',
    type: 'ALS',
    status: 'transporting',
    crew: ['Dr. Amit Shah', 'Paramedic Ravi Kumar'],
    currentLocation: { lat: 12.9716, lng: 77.5946 },
    assignedCase: 'ER-20231023-001'
  },
  {
    id: 'AMB-002',
    vehicleNumber: 'KA-01-ER-5678',
    type: 'BLS',
    status: 'available',
    crew: ['Paramedic Sunil Rao', 'EMT Priya Nair'],
    currentLocation: { lat: 12.9716, lng: 77.5946 }
  },
  {
    id: 'AMB-003',
    vehicleNumber: 'KA-01-ER-9012',
    type: 'ALS',
    status: 'on-scene',
    crew: ['Dr. Neha Gupta', 'Paramedic Anil Kumar'],
    currentLocation: { lat: 12.9816, lng: 77.6046 }
  }
];

export const mockBeds: Bed[] = [
  {
    id: 'ICU-101',
    bedNumber: '101',
    ward: 'ICU',
    type: 'ICU',
    status: 'available',
    features: ['Ventilator', 'Cardiac Monitor', 'Oxygen']
  },
  {
    id: 'ICU-102',
    bedNumber: '102',
    ward: 'ICU',
    type: 'ICU',
    status: 'occupied',
    patientId: 'ER-20231023-004',
    features: ['Ventilator', 'Cardiac Monitor', 'Oxygen']
  },
  {
    id: 'HDU-201',
    bedNumber: '201',
    ward: 'HDU',
    type: 'HDU',
    status: 'available',
    features: ['Cardiac Monitor', 'Oxygen']
  },
  {
    id: 'GEN-301',
    bedNumber: '301',
    ward: 'General Ward',
    type: 'General',
    status: 'available',
    features: ['Oxygen']
  },
  {
    id: 'ISO-401',
    bedNumber: '401',
    ward: 'Isolation Ward',
    type: 'Isolation',
    status: 'maintenance',
    features: ['Negative Pressure', 'Oxygen', 'Monitor']
  }
];

export const triageLevelConfig = {
  red: {
    label: 'Critical',
    description: 'Immediate life-threatening',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: '🚨'
  },
  orange: {
    label: 'Urgent',
    description: 'Potential for deterioration',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: '⚠️'
  },
  yellow: {
    label: 'Semi-Urgent',
    description: 'Stable condition',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: '⚡'
  },
  green: {
    label: 'Non-Urgent',
    description: 'Minor condition',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: '✓'
  },
  blue: {
    label: 'Fast-Track',
    description: 'Quick discharge',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: '→'
  }
};
