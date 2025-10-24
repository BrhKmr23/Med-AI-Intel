import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PatientData {
  full_name: string;
  phone: string;
  date_of_birth: string | null;
  gender: string | null;
  government_id: string | null;
  blood_group: string | null;
}

interface VitalsData {
  bp_systolic: number | null;
  bp_diastolic: number | null;
  heart_rate: number | null;
  spo2: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  weight: number | null;
  height: number | null;
  recorded_at: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface LabReportData {
  patientName: string;
  testName: string;
  sampleId: string;
  results: any;
  notes?: string;
}

export const generateCaseSheetPDF = (
  patient: PatientData,
  vitals: VitalsData | null,
  diagnosis: string,
  medications: Medication[],
  notes: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('CASE SHEET', pageWidth / 2, 20, { align: 'center' });

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // Patient Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 15, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const patientInfo = [
    ['Name', patient.full_name],
    ['Phone', patient.phone],
    ['Date of Birth', patient.date_of_birth || 'N/A'],
    ['Gender', patient.gender || 'N/A'],
    ['Government ID', patient.government_id || 'N/A'],
    ['Blood Group', patient.blood_group || 'N/A']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: patientInfo,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 15, right: 15 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Vitals
  if (vitals) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Vital Signs', 15, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const vitalsInfo = [
      ['Blood Pressure', vitals.bp_systolic && vitals.bp_diastolic ? `${vitals.bp_systolic}/${vitals.bp_diastolic} mmHg` : 'N/A'],
      ['Heart Rate', vitals.heart_rate ? `${vitals.heart_rate} bpm` : 'N/A'],
      ['SpO2', vitals.spo2 ? `${vitals.spo2}%` : 'N/A'],
      ['Temperature', vitals.temperature ? `${vitals.temperature}°F` : 'N/A'],
      ['Respiratory Rate', vitals.respiratory_rate ? `${vitals.respiratory_rate} /min` : 'N/A'],
      ['Weight', vitals.weight ? `${vitals.weight} kg` : 'N/A'],
      ['Height', vitals.height ? `${vitals.height} cm` : 'N/A']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: vitalsInfo,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Diagnosis
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Diagnosis', 15, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const diagnosisLines = doc.splitTextToSize(diagnosis, pageWidth - 30);
  doc.text(diagnosisLines, 15, yPos);
  yPos += diagnosisLines.length * 7 + 10;

  // Prescription
  if (medications.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Prescription', 15, yPos);
    yPos += 10;

    const medicationRows = medications.map((med, index) => [
      (index + 1).toString(),
      med.name,
      med.dosage,
      med.frequency,
      med.duration,
      med.instructions
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: medicationRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Notes
  if (notes) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes', 15, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(notes, pageWidth - 30);
    doc.text(notesLines, 15, yPos);
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`case-sheet-${patient.full_name.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
};

export const generateLabReportPDF = (data: LabReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('LABORATORY REPORT', pageWidth / 2, 20, { align: 'center' });

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // Report Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Information', 15, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const reportInfo = [
    ['Patient Name', data.patientName],
    ['Test Name', data.testName],
    ['Sample ID', data.sampleId],
    ['Report Date', new Date().toLocaleDateString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: reportInfo,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 15, right: 15 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Test Results
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Results', 15, yPos);
  yPos += 10;

  const resultsData = typeof data.results === 'object' 
    ? Object.entries(data.results).map(([key, value]) => [key, String(value)])
    : [['Result', String(data.results)]];

  autoTable(doc, {
    startY: yPos,
    head: [['Parameter', 'Value']],
    body: resultsData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 15, right: 15 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Notes
  if (data.notes) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', 15, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(data.notes, pageWidth - 30);
    doc.text(notesLines, 15, yPos);
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`lab-report-${data.sampleId}-${Date.now()}.pdf`);
};