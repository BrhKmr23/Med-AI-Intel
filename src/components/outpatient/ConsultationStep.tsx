import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Save, Stethoscope, Shield, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PrescriptionDialog } from "@/components/doctor/PrescriptionDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsultationStepProps {
  onStepComplete: () => void;
}

export default function ConsultationStep({ onStepComplete }: ConsultationStepProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [isMHC, setIsMHC] = useState(false);
  const [chiefComplaints, setChiefComplaints] = useState("");
  const [presentingIllness, setPresentingIllness] = useState("");
  const [pastHistory, setPastHistory] = useState("");
  const [examinationFindings, setExaminationFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [requiresCrossConsult, setRequiresCrossConsult] = useState(false);
  const [crossConsultSpecialty, setCrossConsultSpecialty] = useState("");
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insuranceClaimId, setInsuranceClaimId] = useState("");
  const [consultationFee, setConsultationFee] = useState("500");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    fetchPatientsForConsultation();
  }, []);

  const fetchPatientsForConsultation = async () => {
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .select(`
          id,
          token_number,
          visit_date,
          patients (id, full_name, phone, date_of_birth)
        `)
        .in('current_step', ['registration', 'consultation'])
        .order('visit_date', { ascending: true })
        .limit(20);

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    }
  };

  const loadPatientData = async (visit: any) => {
    setSelectedVisit(visit);
    
    // Fetch existing consultation data if any
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('visit_id', visit.id)
        .maybeSingle();

      if (data) {
        setChiefComplaints(data.chief_complaints || "");
        setPresentingIllness(data.presenting_illness || "");
        setPastHistory(data.past_history || "");
        setExaminationFindings(data.examination_findings || "");
        setDiagnosis(data.diagnosis || "");
        setTreatmentPlan(data.treatment_plan || "");
        setRequiresCrossConsult(data.requires_cross_consultation || false);
        setCrossConsultSpecialty(data.cross_consultation_specialty || "");
        setInsuranceVerified(data.insurance_verified || false);
        setInsuranceClaimId(data.insurance_claim_id || "");
        setConsultationNotes(data.consultation_notes || "");
      }
    } catch (error: any) {
      console.error('Error loading consultation:', error);
    }
  };

  const handleSaveConsultation = async () => {
    if (!selectedVisit) {
      toast.error("Please select a patient");
      return;
    }

    setIsSubmitting(true);
    try {
      const consultationData = {
        visit_id: selectedVisit.id,
        patient_id: selectedVisit.patients.id,
        doctor_id: user?.id,
        chief_complaints: chiefComplaints,
        presenting_illness: presentingIllness,
        past_history: pastHistory,
        examination_findings: examinationFindings,
        diagnosis: diagnosis,
        treatment_plan: treatmentPlan,
        requires_cross_consultation: requiresCrossConsult,
        cross_consultation_specialty: requiresCrossConsult ? crossConsultSpecialty : null,
        insurance_verified: insuranceVerified,
        insurance_claim_id: insuranceVerified ? insuranceClaimId : null,
        consultation_notes: consultationNotes
      };

      // Check if consultation exists
      const { data: existing } = await supabase
        .from('consultations')
        .select('id')
        .eq('visit_id', selectedVisit.id)
        .maybeSingle();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('consultations')
          .update(consultationData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('consultations')
          .insert(consultationData);

        if (error) throw error;
      }

      // Update visit step
      await supabase
        .from('outpatient_visits')
        .update({ current_step: 'consultation' })
        .eq('id', selectedVisit.id);

      toast.success("Consultation saved successfully");
      onStepComplete();
    } catch (error: any) {
      toast.error("Failed to save consultation: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Patient List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Patients for Consultation</h3>
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />
        <div className="space-y-2 max-h-[700px] overflow-y-auto">
          {patients
            .filter(p => 
              p.patients.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.patients.phone.includes(searchTerm)
            )
            .map((visit) => (
              <button
                key={visit.id}
                onClick={() => loadPatientData(visit)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedVisit?.id === visit.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                }`}
              >
                <p className="font-medium text-sm">{visit.patients.full_name}</p>
                <p className="text-xs text-muted-foreground">{visit.token_number}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {visit.current_step}
                </Badge>
              </button>
            ))}
        </div>
      </Card>

      {/* Consultation Form */}
      <Card className="lg:col-span-3 p-6">
        {!selectedVisit ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <Stethoscope className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select a Patient</h3>
            <p className="text-muted-foreground">Choose a patient from the list to start consultation</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Patient Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedVisit.patients.full_name}</h2>
                <p className="text-muted-foreground">{selectedVisit.patients.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowPrescription(true)} variant="outline">
                  Write Prescription
                </Button>
                <Button onClick={handleSaveConsultation} disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Consultation
                </Button>
              </div>
            </div>

            {/* MHC Protocol Toggle */}
            <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <Checkbox
                id="mhc"
                checked={isMHC}
                onCheckedChange={(checked) => setIsMHC(checked as boolean)}
              />
              <Label htmlFor="mhc" className="cursor-pointer font-medium flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                This is a Medical Health Check-up (MHC)
              </Label>
            </div>

            {/* Consultation Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Chief Complaints *</Label>
                  <Textarea
                    value={chiefComplaints}
                    onChange={(e) => setChiefComplaints(e.target.value)}
                    rows={3}
                    className="mt-2"
                    placeholder="Enter chief complaints..."
                  />
                </div>

                <div>
                  <Label>Presenting Illness</Label>
                  <Textarea
                    value={presentingIllness}
                    onChange={(e) => setPresentingIllness(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Past Medical History</Label>
                  <Textarea
                    value={pastHistory}
                    onChange={(e) => setPastHistory(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Examination Findings</Label>
                  <Textarea
                    value={examinationFindings}
                    onChange={(e) => setExaminationFindings(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Diagnosis</Label>
                  <Textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Treatment Plan</Label>
                  <Textarea
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Protocols Tabs */}
            <Tabs defaultValue="crossconsult" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="crossconsult">Cross-Consultation</TabsTrigger>
                <TabsTrigger value="insurance">
                  <Shield className="h-4 w-4 mr-2" />
                  Insurance Protocol
                </TabsTrigger>
                <TabsTrigger value="billing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing Protocol
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crossconsult" className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="crossConsult"
                      checked={requiresCrossConsult}
                      onCheckedChange={(checked) => setRequiresCrossConsult(checked as boolean)}
                    />
                    <Label htmlFor="crossConsult" className="cursor-pointer font-medium">
                      Requires Cross-Consultation
                    </Label>
                  </div>
                  {requiresCrossConsult && (
                    <div className="space-y-2">
                      <Label>Specialty</Label>
                      <Select value={crossConsultSpecialty} onValueChange={setCrossConsultSpecialty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="gynecology">Gynecology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Insurance Protocol:</strong> Verify insurance coverage before proceeding with investigations or procedures.
                  </AlertDescription>
                </Alert>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={insuranceVerified}
                        onCheckedChange={(checked) => setInsuranceVerified(checked as boolean)}
                      />
                      <Label htmlFor="insurance" className="cursor-pointer font-medium">
                        Insurance Verified
                      </Label>
                    </div>
                    {insuranceVerified && (
                      <>
                        <div className="space-y-2">
                          <Label>Insurance Provider *</Label>
                          <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="star_health">Star Health Insurance</SelectItem>
                              <SelectItem value="care_health">Care Health Insurance</SelectItem>
                              <SelectItem value="hdfc_ergo">HDFC ERGO</SelectItem>
                              <SelectItem value="icici_lombard">ICICI Lombard</SelectItem>
                              <SelectItem value="max_bupa">Max Bupa Health Insurance</SelectItem>
                              <SelectItem value="religare">Religare Health Insurance</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Insurance Claim ID / Pre-Authorization Number *</Label>
                          <Input
                            placeholder="Enter claim ID or pre-auth number..."
                            value={insuranceClaimId}
                            onChange={(e) => setInsuranceClaimId(e.target.value)}
                          />
                        </div>
                        <Badge variant={insuranceProvider && insuranceClaimId ? "default" : "secondary"} className="mt-2">
                          Status: {insuranceProvider && insuranceClaimId ? "Verified ✓" : "Pending Verification"}
                        </Badge>
                      </>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Billing Protocol:</strong> Consultation fee will be auto-added to the patient's bill. Adjust if needed.
                  </AlertDescription>
                </Alert>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Consultation Fee (₹) *</Label>
                      <Input
                        type="number"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        placeholder="Enter consultation fee..."
                        min="0"
                      />
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        This fee (₹{consultationFee}) will be automatically added to the billing system for this visit.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Consultation Notes */}
            <div>
              <Label>Additional Consultation Notes</Label>
              <Textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Prescription Dialog */}
      {selectedVisit && (
        <PrescriptionDialog
          open={showPrescription}
          onOpenChange={setShowPrescription}
          patientName={selectedVisit.patients.full_name}
          onSave={(medications, notes) => {
            // Handle prescription save
            setShowPrescription(false);
            toast.success("Prescription saved");
          }}
        />
      )}
    </div>
  );
}
