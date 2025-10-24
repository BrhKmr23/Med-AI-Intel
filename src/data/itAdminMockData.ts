// Mock data for IT Admin modules

export const biomedicalEquipmentData = [
  { id: 'BME001', name: 'MRI Scanner', department: 'Radiology', status: 'operational', lastService: '2024-01-15', nextService: '2024-04-15', condition: 'Excellent' },
  { id: 'BME002', name: 'Ventilator', department: 'ICU', status: 'maintenance', lastService: '2024-02-10', nextService: '2024-03-10', condition: 'Good' },
  { id: 'BME003', name: 'X-Ray Machine', department: 'Radiology', status: 'operational', lastService: '2024-01-20', nextService: '2024-04-20', condition: 'Good' },
  { id: 'BME004', name: 'ECG Monitor', department: 'Cardiology', status: 'breakdown', lastService: '2024-02-01', nextService: '2024-03-01', condition: 'Fair' },
];

export const medicalGasData = [
  { id: 'GAS001', gasType: 'Oxygen', ward: 'ICU-A', requested: '500 L', allocated: '500 L', consumed: '450 L', status: 'Active' },
  { id: 'GAS002', gasType: 'Nitrous Oxide', ward: 'OT-1', requested: '200 L', allocated: '200 L', consumed: '180 L', status: 'Active' },
  { id: 'GAS003', gasType: 'Oxygen', ward: 'Ward-3', requested: '300 L', allocated: '300 L', consumed: '290 L', status: 'Low Stock' },
  { id: 'GAS004', gasType: 'Medical Air', ward: 'ICU-B', requested: '400 L', allocated: '400 L', consumed: '350 L', status: 'Active' },
];

export const patientPorterData = [
  { id: 'PT001', patientName: 'John Doe', from: 'Ward-2', to: 'Radiology', porter: 'Porter A', status: 'In Transit', eta: '5 mins' },
  { id: 'PT002', patientName: 'Jane Smith', from: 'ICU', to: 'OT-1', porter: 'Porter B', status: 'Pending', eta: '10 mins' },
  { id: 'PT003', patientName: 'Mike Johnson', from: 'ER', to: 'Ward-5', porter: 'Porter C', status: 'Completed', eta: '-' },
];

export const feedbackData = [
  { id: 'FB001', patient: 'Sarah Williams', department: 'OPD', rating: 5, sentiment: 'Positive', status: 'Resolved', date: '2024-01-20' },
  { id: 'FB002', patient: 'Robert Brown', department: 'Emergency', rating: 3, sentiment: 'Neutral', status: 'Pending', date: '2024-01-21' },
  { id: 'FB003', patient: 'Emily Davis', department: 'IPD', rating: 2, sentiment: 'Negative', status: 'In Progress', date: '2024-01-22' },
  { id: 'FB004', patient: 'David Wilson', department: 'Lab', rating: 5, sentiment: 'Positive', status: 'Resolved', date: '2024-01-23' },
];

export const outsourcedTestData = [
  { id: 'OT001', patientName: 'Alice Cooper', testName: 'MRI Brain', lab: 'City Diagnostics', status: 'Received', date: '2024-01-20', critical: false },
  { id: 'OT002', patientName: 'Bob Martin', testName: 'PET Scan', lab: 'Metro Labs', status: 'Pending', date: '2024-01-21', critical: true },
  { id: 'OT003', patientName: 'Carol White', testName: 'Genetic Test', lab: 'BioLab', status: 'Integrated', date: '2024-01-19', critical: false },
];

export const dischargeProcessData = [
  { id: 'DC001', patientName: 'Tom Harris', pharmacy: 'Cleared', billing: 'Cleared', nursing: 'Pending', status: 'In Progress', dischargeTime: 'Pending' },
  { id: 'DC002', patientName: 'Lisa Anderson', pharmacy: 'Cleared', billing: 'Cleared', nursing: 'Cleared', status: 'Approved', dischargeTime: '2024-01-20 14:30' },
  { id: 'DC003', patientName: 'Mark Taylor', pharmacy: 'Pending', billing: 'Cleared', nursing: 'Cleared', status: 'In Progress', dischargeTime: 'Pending' },
];

export const dischargeSummaryData = [
  { id: 'DS001', patientName: 'Chris Evans', admission: '2024-01-10', discharge: '2024-01-20', diagnosis: 'Pneumonia', status: 'Generated', qrCode: true },
  { id: 'DS002', patientName: 'Natalie Port', admission: '2024-01-15', discharge: '2024-01-22', diagnosis: 'Fracture', status: 'Pending', qrCode: false },
];

export const complianceData = [
  { id: 'LIC001', licenseType: 'Medical License', issueDate: '2023-01-15', expiryDate: '2025-01-15', status: 'Active', daysToExpiry: 365 },
  { id: 'LIC002', licenseType: 'Fire Safety', issueDate: '2023-06-01', expiryDate: '2024-06-01', status: 'Expiring Soon', daysToExpiry: 45 },
  { id: 'LIC003', licenseType: 'Bio-Medical Waste', issueDate: '2023-03-10', expiryDate: '2024-03-10', status: 'Active', daysToExpiry: 120 },
  { id: 'LIC004', licenseType: 'Drug License', issueDate: '2022-12-01', expiryDate: '2024-12-01', status: 'Active', daysToExpiry: 280 },
];

export const avDocumentationData = [
  { id: 'AV001', title: 'Surgical Procedure - Appendectomy', type: 'Video', uploadDate: '2024-01-10', size: '450 MB', access: 'Restricted', views: 25 },
  { id: 'AV002', title: 'Training - CPR Guidelines', type: 'Video', uploadDate: '2024-01-15', size: '120 MB', access: 'All Staff', views: 150 },
  { id: 'AV003', title: 'Patient Education - Diabetes', type: 'Video', uploadDate: '2024-01-18', size: '80 MB', access: 'Public', views: 320 },
];

export const housekeepingData = [
  { id: 'HK001', area: 'ICU-A', task: 'Deep Cleaning', assignedTo: 'Team A', status: 'In Progress', priority: 'High', scheduled: '2024-01-20 08:00' },
  { id: 'HK002', area: 'OT-2', task: 'Waste Collection', assignedTo: 'Team B', status: 'Completed', priority: 'Critical', scheduled: '2024-01-20 07:00' },
  { id: 'HK003', area: 'Ward-5', task: 'Routine Cleaning', assignedTo: 'Team C', status: 'Pending', priority: 'Medium', scheduled: '2024-01-20 10:00' },
  { id: 'HK004', area: 'Lab', task: 'Bio-Waste Disposal', assignedTo: 'Team D', status: 'In Progress', priority: 'High', scheduled: '2024-01-20 09:00' },
];

export const complaintsData = [
  { id: 'CMP001', category: 'Service Quality', department: 'OPD', priority: 'Medium', status: 'In Progress', submittedBy: 'John Doe', date: '2024-01-20' },
  { id: 'CMP002', category: 'Facility Issue', department: 'Ward-3', priority: 'High', status: 'Pending', submittedBy: 'Jane Smith', date: '2024-01-21' },
  { id: 'CMP003', category: 'Staff Behavior', department: 'Emergency', priority: 'Critical', status: 'Escalated', submittedBy: 'Mike Johnson', date: '2024-01-22' },
  { id: 'CMP004', category: 'Billing', department: 'Billing', priority: 'Low', status: 'Resolved', submittedBy: 'Sarah Williams', date: '2024-01-19' },
];

export const itManagementData = [
  { id: 'IT001', ticketType: 'Hardware', issue: 'Printer Not Working', department: 'OPD', priority: 'Medium', status: 'In Progress', assignedTo: 'Tech A', sla: '2h remaining' },
  { id: 'IT002', ticketType: 'Software', issue: 'EMR System Slow', department: 'Ward-2', priority: 'High', status: 'Pending', assignedTo: 'Tech B', sla: '1h remaining' },
  { id: 'IT003', ticketType: 'Network', issue: 'WiFi Down', department: 'ICU', priority: 'Critical', status: 'Escalated', assignedTo: 'Tech C', sla: 'Overdue' },
  { id: 'IT004', ticketType: 'Hardware', issue: 'Monitor Replacement', department: 'Lab', priority: 'Low', status: 'Resolved', assignedTo: 'Tech D', sla: 'Met' },
];

export const mortuaryData = [
  { id: 'MOR001', deceasedName: 'Patient A', dateOfDeath: '2024-01-18', storageLocation: 'Bay 1', status: 'Stored', releaseStatus: 'Pending', authorizedBy: 'Dr. Smith' },
  { id: 'MOR002', deceasedName: 'Patient B', dateOfDeath: '2024-01-19', storageLocation: 'Bay 3', status: 'Stored', releaseStatus: 'Approved', authorizedBy: 'Dr. Johnson' },
  { id: 'MOR003', deceasedName: 'Patient C', dateOfDeath: '2024-01-20', storageLocation: 'Bay 2', status: 'Released', releaseStatus: 'Released', authorizedBy: 'Dr. Williams' },
];

export const transplantData = [
  { id: 'TR001', donorId: 'D001', recipientId: 'R001', organType: 'Kidney', matchScore: '95%', status: 'Scheduled', surgeryDate: '2024-01-25', consentStatus: 'Obtained' },
  { id: 'TR002', donorId: 'D002', recipientId: 'R002', organType: 'Liver', matchScore: '88%', status: 'Matching', surgeryDate: 'TBD', consentStatus: 'Pending' },
  { id: 'TR003', donorId: 'D003', recipientId: 'R003', organType: 'Heart', matchScore: '92%', status: 'Completed', surgeryDate: '2024-01-20', consentStatus: 'Obtained' },
];

export const cssdData = [
  { id: 'CSSD001', instrumentSet: 'General Surgery Kit', requestedBy: 'OT-1', status: 'Sterilized', cycleNumber: 'C2024-0120', deliveryTime: '2024-01-20 08:00', verified: true },
  { id: 'CSSD002', instrumentSet: 'Orthopedic Set', requestedBy: 'OT-2', status: 'In Process', cycleNumber: 'C2024-0121', deliveryTime: 'Pending', verified: false },
  { id: 'CSSD003', instrumentSet: 'Dental Kit', requestedBy: 'Dental OT', status: 'Delivered', cycleNumber: 'C2024-0119', deliveryTime: '2024-01-19 14:00', verified: true },
];

export const laundryData = [
  { id: 'LN001', ward: 'ICU-A', itemType: 'Bed Sheets', quantity: 50, soiledPickup: '2024-01-20 06:00', cleanDelivery: '2024-01-20 14:00', status: 'Delivered', quality: 'Good' },
  { id: 'LN002', ward: 'Ward-3', itemType: 'Patient Gowns', quantity: 30, soiledPickup: '2024-01-20 07:00', cleanDelivery: 'Pending', status: 'In Process', quality: 'Pending' },
  { id: 'LN003', ward: 'OT-1', itemType: 'Surgical Drapes', quantity: 20, soiledPickup: '2024-01-20 08:00', cleanDelivery: 'Pending', status: 'Cleaning', quality: 'Pending' },
  { id: 'LN004', ward: 'Ward-5', itemType: 'Towels', quantity: 40, soiledPickup: '2024-01-19 18:00', cleanDelivery: '2024-01-20 10:00', status: 'Delivered', quality: 'Excellent' },
];
