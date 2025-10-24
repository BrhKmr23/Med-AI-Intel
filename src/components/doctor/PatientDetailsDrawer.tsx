import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, Activity, FileText, Pill, History, 
  Calendar, Phone, Mail, MapPin, Heart,
  AlertCircle, Edit, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { VitalsHistoryDialog } from './VitalsHistoryDialog';
import { PrescriptionDialog } from './PrescriptionDialog';
import { generateCaseSheetPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

interface PatientDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  queueId: string;
}

export const PatientDetailsDrawer = ({ open, onOpenChange, patientId, queueId }: PatientDetailsDrawerProps) => {
  const [patient, setPatient] = useState<any>(null);
  const [latestVitals, setLatestVitals] = useState<any>(null);
  const [triage, setTriage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vitalsHistoryOpen, setVitalsHistoryOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [consultation, setConsultation] = useState({ diagnosis: '', notes: '', treatment: '' });
  const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    if (open && patientId) {
      fetchPatientData();
    }
  }, [open, patientId]);

  const fetchPatientData = async () => {
    setLoading(true);

    // Fetch patient details
    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    // Fetch latest vitals
    const { data: vitalsData } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch triage
    const { data: queueData } = await supabase
      .from('patient_queue')
      .select('triage_id')
      .eq('id', queueId)
      .single();

    if (queueData?.triage_id) {
      const { data: triageData } = await supabase
        .from('triage_records')
        .select('*')
        .eq('id', queueData.triage_id)
        .single();
      setTriage(triageData);
    }

    setPatient(patientData);
    setLatestVitals(vitalsData);
    setLoading(false);
  };

  const handleSavePrescription = async (medications: any[], notes: string) => {
    setSavedPrescriptions(medications);
    const prescriptionData = {
      patient_id: patientId,
      medications,
      additional_notes: notes,
      prescribed_at: new Date().toISOString()
    };

    console.log('Prescription saved:', prescriptionData);
    toast.success('Prescription saved successfully');
  };

  const handleDownloadCaseSheet = () => {
    if (!patient) return;
    
    generateCaseSheetPDF(
      patient,
      latestVitals,
      consultation.diagnosis,
      savedPrescriptions,
      consultation.notes
    );
    
    toast.success('Case sheet downloaded successfully');
  };

  const handleCompleteConsultation = async () => {
    const { error: queueError } = await supabase
      .from('patient_queue')
      .update({ 
        queue_status: 'completed',
        time_completed: new Date().toISOString()
      })
      .eq('id', queueId);

    if (queueError) {
      toast.error('Failed to complete consultation');
      return;
    }

    toast.success('Consultation completed');
    onOpenChange(false);
  };

  const getTriageBadge = (level: string) => {
    const colors = {
      RED: 'bg-red-500 text-white',
      YELLOW: 'bg-yellow-500 text-white',
      GREEN: 'bg-green-500 text-white'
    };
    return <Badge className={colors[level as keyof typeof colors] || ''}>{level}</Badge>;
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {patient?.full_name}
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="consultation">Notes</TabsTrigger>
              <TabsTrigger value="prescription">Rx</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{patient?.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">
                        {patient?.date_of_birth 
                          ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
                          : 'N/A'
                        } years
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </p>
                      <p className="font-medium">{patient?.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="font-medium">{patient?.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Address
                      </p>
                      <p className="font-medium">{patient?.address || 'N/A'}</p>
                    </div>
                  </div>

                  {patient?.allergies && patient.allergies.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Allergies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {patient.allergies.map((allergy: string, idx: number) => (
                            <Badge key={idx} variant="destructive">{allergy}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {patient?.comorbidities && patient.comorbidities.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Comorbidities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {patient.comorbidities.map((condition: string, idx: number) => (
                            <Badge key={idx} variant="outline">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {triage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Triage Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Level</span>
                      {getTriageBadge(triage.triage_level)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <Badge variant="outline">{triage.triage_score}/10</Badge>
                    </div>
                    {triage.priority_notes && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-1">Notes</p>
                          <p className="text-sm text-muted-foreground">{triage.priority_notes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="vitals" className="space-y-4">
              {latestVitals ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Latest Vitals
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setVitalsHistoryOpen(true)}
                        className="gap-2"
                      >
                        <History className="h-4 w-4" />
                        View History
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recorded: {format(new Date(latestVitals.recorded_at), 'PPpp')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">BP</p>
                        <p className="text-xl font-bold">
                          {latestVitals.bp_systolic}/{latestVitals.bp_diastolic}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Heart Rate</p>
                        <p className="text-xl font-bold">{latestVitals.heart_rate} bpm</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">SpO2</p>
                        <p className="text-xl font-bold">{latestVitals.spo2}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Temperature</p>
                        <p className="text-xl font-bold">{latestVitals.temperature}°C</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No vitals recorded yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="consultation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Consultation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Diagnosis</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-md border bg-background"
                      placeholder="Enter diagnosis..."
                      value={consultation.diagnosis}
                      onChange={(e) => setConsultation({ ...consultation, diagnosis: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Treatment Plan</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-md border bg-background"
                      placeholder="Enter treatment plan..."
                      value={consultation.treatment}
                      onChange={(e) => setConsultation({ ...consultation, treatment: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Notes</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-md border bg-background"
                      placeholder="Enter additional notes..."
                      value={consultation.notes}
                      onChange={(e) => setConsultation({ ...consultation, notes: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescription" className="space-y-4">
              <Card>
                <CardContent className="py-12 text-center">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Write prescription for {patient?.full_name}</p>
                  <Button onClick={() => setPrescriptionOpen(true)} className="gap-2">
                    <Pill className="h-4 w-4" />
                    Write Prescription
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 gap-2" 
              onClick={handleDownloadCaseSheet}
            >
              <Download className="h-4 w-4" />
              Download Case Sheet
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={handleCompleteConsultation}
            >
              <FileText className="h-4 w-4" />
              Complete Consultation
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <VitalsHistoryDialog
        open={vitalsHistoryOpen}
        onOpenChange={setVitalsHistoryOpen}
        patientId={patientId}
        patientName={patient?.full_name || ''}
      />

      <PrescriptionDialog
        open={prescriptionOpen}
        onOpenChange={setPrescriptionOpen}
        patientName={patient?.full_name || ''}
        onSave={handleSavePrescription}
      />
    </>
  );
};
