import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { FileText, Bed, Download, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DischargeStepProps {
  onStepComplete: () => void;
}

export default function DischargeStep({ onStepComplete }: DischargeStepProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [admissionRequired, setAdmissionRequired] = useState<string>('no');
  const [dischargeDiagnosis, setDischargeDiagnosis] = useState("");
  const [treatmentSummary, setTreatmentSummary] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .select(`
          id,
          token_number,
          patients (id, full_name, phone),
          consultations (diagnosis, treatment_plan)
        `)
        .eq('current_step', 'results')
        .order('visit_date', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const loadPatientData = (visit: any) => {
    setSelectedVisit(visit);
    if (visit.consultations?.[0]) {
      setDischargeDiagnosis(visit.consultations[0].diagnosis || "");
      setTreatmentSummary(visit.consultations[0].treatment_plan || "");
    }
  };

  const generateDischargePDF = () => {
    if (!selectedVisit) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DISCHARGE SUMMARY', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Hospital Management System - Outpatient Department', pageWidth / 2, 28, { align: 'center' });
    doc.line(10, 32, pageWidth - 10, 32);

    // Patient Information
    let yPos = 42;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 10, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${selectedVisit.patients?.full_name || 'N/A'}`, 10, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, yPos);
    
    yPos += 6;
    doc.text(`Phone: ${selectedVisit.patients?.phone || 'N/A'}`, 10, yPos);
    doc.text(`Token: ${selectedVisit.token_number || 'N/A'}`, pageWidth - 60, yPos);

    // Discharge Details
    yPos += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Discharge Diagnosis:', 10, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const diagnosisLines = doc.splitTextToSize(dischargeDiagnosis || 'Not provided', pageWidth - 20);
    doc.text(diagnosisLines, 10, yPos);
    yPos += diagnosisLines.length * 5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Treatment Summary:', 10, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const treatmentLines = doc.splitTextToSize(treatmentSummary || 'Not provided', pageWidth - 20);
    doc.text(treatmentLines, 10, yPos);
    yPos += treatmentLines.length * 5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Special Instructions / Home Care:', 10, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const instructionLines = doc.splitTextToSize(specialInstructions || 'Follow general post-discharge care', pageWidth - 20);
    doc.text(instructionLines, 10, yPos);

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 30;
    doc.line(10, yPos, pageWidth - 10, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.text('Authorized Doctor\'s Signature: ____________________', 10, yPos);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 70, yPos);

    // Save PDF
    const fileName = `discharge_${selectedVisit.patients?.full_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success("Discharge Summary PDF downloaded successfully");
  };

  const handleSubmit = async () => {
    if (!selectedVisit) return;

    setIsSubmitting(true);
    try {
      // Create discharge summary
      const { error: summaryError } = await supabase
        .from('discharge_summaries')
        .insert({
          visit_id: selectedVisit.id,
          patient_id: selectedVisit.patients.id,
          doctor_id: user?.id,
          admission_required: admissionRequired === 'yes',
          discharge_diagnosis: dischargeDiagnosis,
          treatment_summary: treatmentSummary,
          special_instructions: specialInstructions
        });

      if (summaryError) throw summaryError;

      // Update visit
      const newStatus = admissionRequired === 'yes' ? 'admitted' : 'discharged';
      await supabase
        .from('outpatient_visits')
        .update({ 
          current_step: 'discharge',
          status: newStatus
        })
        .eq('id', selectedVisit.id);

      if (admissionRequired === 'yes') {
        toast.success("Patient marked for admission. Transferring to Inpatient Department...");
      } else {
        // Auto-generate PDF on discharge
        generateDischargePDF();
        toast.success("Discharge completed! PDF generated. Proceed to exit & follow-up.");
      }

      // Reset
      setSelectedVisit(null);
      setAdmissionRequired('no');
      setDischargeDiagnosis("");
      setTreatmentSummary("");
      setSpecialInstructions("");
      
      fetchPatients();
      onStepComplete();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Ready for Discharge</h3>
        <div className="space-y-2 max-h-[700px] overflow-y-auto">
          {patients.map((visit) => (
            <button
              key={visit.id}
              onClick={() => loadPatientData(visit)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                selectedVisit?.id === visit.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
              }`}
            >
              <p className="font-medium text-sm">{visit.patients.full_name}</p>
              <p className="text-xs text-muted-foreground">{visit.token_number}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-3 p-6">
        {!selectedVisit ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select a Patient</h3>
            <p className="text-muted-foreground">Choose a patient for discharge decision</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold">{selectedVisit.patients.full_name}</h2>
              <p className="text-muted-foreground">Discharge Decision</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Decision Point:</strong> Determine if patient requires hospital admission (YES → Inpatient workflow) or can be safely discharged (NO → Exit & Follow-up).
              </AlertDescription>
            </Alert>

            {/* Admission Decision */}
            <Card className="p-6 border-2">
              <Label className="text-xl font-bold mb-4 block">
                Whether to Admit?
              </Label>
              <RadioGroup value={admissionRequired} onValueChange={setAdmissionRequired} className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-semibold">
                      <FileText className="h-5 w-5" />
                      NO - Discharge Patient
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Patient can be safely discharged home with follow-up instructions and medications</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/30 cursor-pointer transition-colors">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-semibold text-orange-900 dark:text-orange-100">
                      <Bed className="h-5 w-5" />
                      YES - Require Admission
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Patient requires inpatient care and will be transferred to Inpatient Department (IPD)</p>
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            {admissionRequired === 'no' && (
              <div className="space-y-4 p-6 border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Discharge Summary
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateDischargePDF}
                    disabled={!dischargeDiagnosis}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Preview PDF
                  </Button>
                </div>
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Complete all fields to generate a comprehensive discharge summary PDF that will be auto-generated upon submission.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <Label>Discharge Diagnosis</Label>
                  <Textarea
                    value={dischargeDiagnosis}
                    onChange={(e) => setDischargeDiagnosis(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Treatment Summary</Label>
                  <Textarea
                    value={treatmentSummary}
                    onChange={(e) => setTreatmentSummary(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Special Instructions</Label>
                  <Textarea
                    placeholder="Home care instructions, warning signs, diet, etc..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {admissionRequired === 'yes' && (
              <Card className="p-4 bg-orange-500/10 border-orange-500">
                <p className="font-medium">Patient will be transferred to Inpatient Department</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Admission records will be created and the patient will be moved to inpatient workflow
                </p>
              </Card>
            )}

            <div className="flex gap-3">
              {admissionRequired === 'no' && dischargeDiagnosis && (
                <Button 
                  variant="outline" 
                  onClick={generateDischargePDF}
                  className="flex-1"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Preview PDF
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !admissionRequired}
                className="flex-1"
                size="lg"
                variant={admissionRequired === 'yes' ? 'default' : 'default'}
              >
                {admissionRequired === 'yes' 
                  ? '🏥 Transfer to Inpatient Department' 
                  : '✓ Complete Discharge & Auto-Generate PDF'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
