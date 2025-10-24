import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Clock, User, TestTube, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PatientDetailsDrawer } from './PatientDetailsDrawer';
import { ConsultationDialog } from './ConsultationDialog';

interface QueuePatient {
  id: string;
  patient_id: string;
  queue_status: string;
  priority_score: number;
  position: number;
  time_enqueued: string;
  department: string;
  triage_level: string;
  patient_name: string;
  token_number: string;
  awaiting_lab_results?: boolean;
}

export const PatientQueueKanban = () => {
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [patientsWithResults, setPatientsWithResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel('queue_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_queue' }, fetchQueue)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_orders' }, fetchQueue)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueue = async () => {
    const { data: queueData, error } = await supabase
      .from('patient_queue')
      .select(`
        id,
        patient_id,
        queue_status,
        priority_score,
        position,
        time_enqueued,
        department,
        triage_id,
        awaiting_lab_results
      `)
      .in('queue_status', ['waiting', 'in_progress', 'on_hold'])
      .order('priority_score', { ascending: false })
      .order('time_enqueued', { ascending: true });

    if (error) {
      toast.error('Failed to load patient queue');
      setLoading(false);
      return;
    }

    const enrichedData = await Promise.all(
      (queueData || []).map(async (item) => {
        const { data: patient } = await supabase
          .from('patients')
          .select('full_name')
          .eq('id', item.patient_id)
          .single();

        const { data: appointment } = await supabase
          .from('appointments')
          .select('token_number')
          .eq('patient_id', item.patient_id)
          .eq('status', 'checked_in')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: triage } = await supabase
          .from('triage_records')
          .select('triage_level')
          .eq('id', item.triage_id)
          .single();

        return {
          ...item,
          patient_name: patient?.full_name || 'Unknown',
          token_number: appointment?.token_number || 'N/A',
          triage_level: triage?.triage_level || 'GREEN'
        };
      })
    );

    const uniqueDepts = Array.from(new Set(enrichedData.map(p => p.department)));
    setDepartments(uniqueDepts);
    setPatients(enrichedData);
    
    // Check which patients have all lab orders completed
    await checkLabResultsStatus(enrichedData);
    
    setLoading(false);
  };

  const checkLabResultsStatus = async (queuePatients: QueuePatient[]) => {
    const patientsWithCompletedResults = new Set<string>();
    
    for (const patient of queuePatients.filter(p => p.awaiting_lab_results)) {
      const { data: labOrders } = await supabase
        .from('lab_orders')
        .select('id, status')
        .eq('queue_id', patient.id);
      
      if (labOrders && labOrders.length > 0) {
        const allCompleted = labOrders.every(order => order.status === 'completed');
        if (allCompleted) {
          patientsWithCompletedResults.add(patient.id);
        }
      }
    }
    
    setPatientsWithResults(patientsWithCompletedResults);
  };

  const getTriageBadgeColor = (level: string) => {
    switch (level) {
      case 'RED': return 'bg-red-500 text-white hover:bg-red-600';
      case 'YELLOW': return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'GREEN': return 'bg-green-500 text-white hover:bg-green-600';
      default: return 'bg-muted';
    }
  };

  const calculateWaitTime = (enqueuedTime: string) => {
    const minutes = Math.floor((Date.now() - new Date(enqueuedTime).getTime()) / 60000);
    return minutes;
  };

  const handlePatientClick = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  const handleStartConsultation = async (e: React.MouseEvent, patient: QueuePatient) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('patient_queue')
      .update({ 
        queue_status: 'in_progress',
        time_started: new Date().toISOString()
      })
      .eq('id', patient.id);

    if (error) {
      toast.error('Failed to start consultation');
      return;
    }

    toast.success('Consultation started');
    setSelectedPatient(patient);
    setConsultationOpen(true);
    fetchQueue();
  };

  const handleReconsult = async (e: React.MouseEvent, patient: QueuePatient) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('patient_queue')
      .update({ 
        queue_status: 'in_progress',
        time_started: new Date().toISOString()
      })
      .eq('id', patient.id);

    if (error) {
      toast.error('Failed to start consultation');
      return;
    }

    setSelectedPatient(patient);
    setConsultationOpen(true);
    fetchQueue();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Activity className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="text-2xl">Patient Queue - Department View</CardTitle>
          <p className="text-sm text-muted-foreground">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} in queue
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No patients in queue</p>
              <p className="text-sm mt-2">Patients will appear here after check-in and vitals</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* Waiting for Results Column */}
              <div className="flex-shrink-0 w-80">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      Waiting for Results
                    </CardTitle>
                    <Badge variant="outline" className="bg-background w-fit">
                      {patients.filter(p => p.awaiting_lab_results && p.queue_status === 'on_hold').length} Patients
                    </Badge>
                  </CardHeader>
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-3">
                      {patients.filter(p => p.awaiting_lab_results && p.queue_status === 'on_hold').length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          No patients awaiting results
                        </p>
                      ) : (
                        patients.filter(p => p.awaiting_lab_results && p.queue_status === 'on_hold').map((patient) => (
                          <Card 
                            key={patient.id}
                            className="cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-yellow-500"
                            onClick={() => handlePatientClick(patient)}
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="font-mono">
                                    {patient.token_number}
                                  </Badge>
                                  <Badge className="bg-yellow-500 text-white">
                                    Lab Pending
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <p className="font-semibold">{patient.patient_name}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Waiting {calculateWaitTime(patient.time_enqueued)} min</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              {/* Results Ready Column */}
              <div className="flex-shrink-0 w-80">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-green-500/20 to-green-500/5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Results Ready
                    </CardTitle>
                    <Badge variant="outline" className="bg-background w-fit">
                      {patients.filter(p => p.awaiting_lab_results && patientsWithResults.has(p.id)).length} Patients
                    </Badge>
                  </CardHeader>
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-3">
                      {patients.filter(p => p.awaiting_lab_results && patientsWithResults.has(p.id)).length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          Patients will appear here when lab results are completed
                        </p>
                      ) : (
                        patients.filter(p => p.awaiting_lab_results && patientsWithResults.has(p.id)).map((patient) => (
                          <Card 
                            key={patient.id}
                            className="cursor-pointer hover:shadow-xl transition-all border-l-4 border-l-green-500"
                            onClick={() => handlePatientClick(patient)}
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="font-mono">
                                    {patient.token_number}
                                  </Badge>
                                  <Badge className="bg-green-500 text-white">
                                    Results Ready
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <p className="font-semibold">{patient.patient_name}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Waiting {calculateWaitTime(patient.time_enqueued)} min</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={(e) => handleReconsult(e, patient)}
                              >
                                Re-consult Patient
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              {departments.map((dept) => {
                const deptPatients = patients.filter(p => 
                  p.department === dept && 
                  !p.awaiting_lab_results &&
                  p.queue_status !== 'on_hold'
                );
                const waitingCount = deptPatients.filter(p => p.queue_status === 'waiting').length;
                const inProgressCount = deptPatients.filter(p => p.queue_status === 'in_progress').length;

                return (
                  <div key={dept} className="flex-shrink-0 w-80">
                    <Card className="border-2 shadow-lg">
                      <CardHeader className="pb-3 bg-gradient-to-br from-primary/20 to-primary/5">
                        <CardTitle className="text-lg capitalize">{dept}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="bg-background">
                            {waitingCount} Waiting
                          </Badge>
                          <Badge variant="default">
                            {inProgressCount} In Progress
                          </Badge>
                        </div>
                      </CardHeader>
                      <ScrollArea className="h-[600px]">
                        <div className="p-4 space-y-3">
                          {deptPatients.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">
                              No patients
                            </p>
                          ) : (
                            deptPatients.map((patient) => (
                              <Card 
                                key={patient.id}
                                className="cursor-pointer hover:shadow-xl transition-all border-l-4 hover:scale-105"
                                style={{ 
                                  borderLeftColor: 
                                    patient.triage_level === 'RED' ? '#ef4444' :
                                    patient.triage_level === 'YELLOW' ? '#eab308' :
                                    '#22c55e'
                                }}
                                onClick={() => handlePatientClick(patient)}
                              >
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="font-mono">
                                        {patient.token_number}
                                      </Badge>
                                      <Badge className={getTriageBadgeColor(patient.triage_level)}>
                                        {patient.triage_level}
                                      </Badge>
                                    </div>
                                    {patient.queue_status === 'in_progress' && (
                                      <Badge variant="default" className="animate-pulse">
                                        In Progress
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <p className="font-semibold">{patient.patient_name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>Waiting {calculateWaitTime(patient.time_enqueued)} min</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      Priority: {patient.priority_score}/5
                                    </Badge>
                                  </div>

                                  {patient.queue_status === 'waiting' && (
                                    <Button
                                      size="sm"
                                      className="w-full"
                                      onClick={(e) => handleStartConsultation(e, patient)}
                                    >
                                      Start Consultation
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          <PatientDetailsDrawer
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            patientId={selectedPatient.patient_id}
            queueId={selectedPatient.id}
          />
          <ConsultationDialog
            open={consultationOpen}
            onOpenChange={setConsultationOpen}
            queueId={selectedPatient.id}
            patientId={selectedPatient.patient_id}
            patientName={selectedPatient.patient_name}
            onSuccess={() => {
              fetchQueue();
              setConsultationOpen(false);
            }}
          />
        </>
      )}
    </>
  );
};
