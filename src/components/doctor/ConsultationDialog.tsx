import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Activity, AlertCircle, FileText, TestTube } from 'lucide-react';
import { LabTestRequestDialog } from './LabTestRequestDialog';
import { LabResultsCard } from './LabResultsCard';
import { PrescriptionDialog } from './PrescriptionDialog';

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueId: string;
  patientId: string;
  patientName: string;
  onSuccess: () => void;
}

export const ConsultationDialog = ({ open, onOpenChange, queueId, patientId, patientName, onSuccess }: ConsultationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vitals, setVitals] = useState<any>(null);
  const [triage, setTriage] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [labTestDialogOpen, setLabTestDialogOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [hasLabResults, setHasLabResults] = useState(false);
  const [showLabResults, setShowLabResults] = useState(false);

  useEffect(() => {
    if (open && patientId) {
      fetchPatientData();
      checkLabResults();
      setShowLabResults(false);
    }
  }, [open, patientId]);

  const checkLabResults = async () => {
    const { data } = await supabase
      .from('lab_orders')
      .select('id')
      .eq('queue_id', queueId)
      .eq('status', 'completed')
      .limit(1);
    
    setHasLabResults((data?.length || 0) > 0);
  };

  const fetchPatientData = async () => {
    // Fetch latest vitals
    const { data: vitalsData } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    setVitals(vitalsData);

    // Fetch latest triage
    const { data: triageData } = await supabase
      .from('triage_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('evaluated_at', { ascending: false })
      .limit(1)
      .single();

    setTriage(triageData);
  };

  const handleSavePrescription = async (medications: any[], prescriptionNotes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          doctor_id: user?.id,
          medications: { medications },
          notes: prescriptionNotes,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Prescription created successfully');
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      toast.error(error.message || 'Failed to create prescription');
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Update queue status to completed
      const { error: queueError } = await supabase
        .from('patient_queue')
        .update({
          queue_status: 'completed',
          time_completed: new Date().toISOString(),
          awaiting_lab_results: false
        })
        .eq('id', queueId);

      if (queueError) throw queueError;

      // Update appointment status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
          notes: notes
        })
        .eq('patient_id', patientId)
        .eq('status', 'checked_in');

      if (appointmentError) throw appointmentError;

      toast.success('Consultation completed');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error completing consultation:', error);
      toast.error(error.message || 'Failed to complete consultation');
    } finally {
      setLoading(false);
    }
  };

  const getTriageBadgeColor = (level: string) => {
    switch (level) {
      case 'RED':
        return 'bg-critical text-white';
      case 'YELLOW':
        return 'bg-urgent text-white';
      case 'GREEN':
        return 'bg-routine text-white';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Consultation - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* View Report Button (if lab results available) */}
          {hasLabResults && !showLabResults && (
            <Button
              variant="default"
              size="lg"
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowLabResults(true)}
            >
              <TestTube className="h-5 w-5" />
              View Lab Report
            </Button>
          )}

          {/* Lab Results (if available and shown) */}
          {hasLabResults && showLabResults && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Lab Test Results</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLabResults(false)}
                >
                  Hide Report
                </Button>
              </div>
              <LabResultsCard patientId={patientId} queueId={queueId} />
            </div>
          )}

          {/* Triage Information */}
          {triage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Triage Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Level:</span>
                    <Badge className={`ml-2 ${getTriageBadgeColor(triage.triage_level)}`}>
                      {triage.triage_level}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <span className="ml-2 font-medium">{triage.triage_score}/10</span>
                  </div>
                </div>
                {triage.risk_factors && triage.risk_factors.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Risk Factors:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {triage.risk_factors.map((factor: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vitals Information */}
          {vitals && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Latest Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {vitals.bp_systolic && (
                    <div>
                      <span className="text-sm text-muted-foreground">Blood Pressure</span>
                      <p className="font-medium">{vitals.bp_systolic}/{vitals.bp_diastolic} mmHg</p>
                    </div>
                  )}
                  {vitals.heart_rate && (
                    <div>
                      <span className="text-sm text-muted-foreground">Heart Rate</span>
                      <p className="font-medium">{vitals.heart_rate} bpm</p>
                    </div>
                  )}
                  {vitals.spo2 && (
                    <div>
                      <span className="text-sm text-muted-foreground">SpO2</span>
                      <p className="font-medium">{vitals.spo2}%</p>
                    </div>
                  )}
                  {vitals.temperature && (
                    <div>
                      <span className="text-sm text-muted-foreground">Temperature</span>
                      <p className="font-medium">{vitals.temperature}°C</p>
                    </div>
                  )}
                  {vitals.weight && (
                    <div>
                      <span className="text-sm text-muted-foreground">Weight</span>
                      <p className="font-medium">{vitals.weight} kg</p>
                    </div>
                  )}
                  {vitals.bmi && (
                    <div>
                      <span className="text-sm text-muted-foreground">BMI</span>
                      <p className="font-medium">{vitals.bmi.toFixed(1)}</p>
                    </div>
                  )}
                </div>
                {vitals.symptoms && vitals.symptoms.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm text-muted-foreground">Symptoms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vitals.symptoms.map((symptom: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Consultation Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Consultation Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter diagnosis, treatment plan, and follow-up instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLabTestDialogOpen(true)}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Request Lab Test
            </Button>
            <Button
              variant="outline"
              onClick={() => setPrescriptionDialogOpen(true)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Write Prescription
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? 'Completing...' : 'End Consultation'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Lab Test Request Dialog */}
      <LabTestRequestDialog
        open={labTestDialogOpen}
        onOpenChange={setLabTestDialogOpen}
        patientId={patientId}
        queueId={queueId}
        onSuccess={() => {
          fetchPatientData();
          onSuccess();
        }}
      />

      {/* Prescription Dialog */}
      <PrescriptionDialog
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
        patientName={patientName}
        onSave={handleSavePrescription}
      />
    </Dialog>
  );
};
