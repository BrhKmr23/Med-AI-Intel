import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
}

export const PatientQueue = () => {
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);

  useEffect(() => {
    fetchQueue();

    // Set up realtime subscription
    const channel = supabase
      .channel('queue_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_queue' }, fetchQueue)
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
        triage_id
      `)
      .in('queue_status', ['waiting', 'in_progress'])
      .order('priority_score', { ascending: false })
      .order('time_enqueued', { ascending: true });

    if (error) {
      toast.error('Failed to load patient queue');
      setLoading(false);
      return;
    }

    // Fetch patient and triage details
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

    setPatients(enrichedData);
    setLoading(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'waiting':
        return <Badge variant="outline">Waiting</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateWaitTime = (enqueuedTime: string) => {
    const minutes = Math.floor((Date.now() - new Date(enqueuedTime).getTime()) / 60000);
    return minutes;
  };

  const handleStartConsultation = async (patient: QueuePatient) => {
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
    setConsultationDialogOpen(true);
    toast.success('Consultation started');
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
    <Card>
      <CardHeader>
        <CardTitle>Patient Queue</CardTitle>
        <CardDescription>
          {patients.length} patient{patients.length !== 1 ? 's' : ''} in queue - Prioritized by triage level and wait time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No patients in queue</p>
            <p className="text-sm mt-2">Patients will appear here after check-in and vitals</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Triage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.token_number}</TableCell>
                    <TableCell>{patient.patient_name}</TableCell>
                    <TableCell className="capitalize">{patient.department}</TableCell>
                    <TableCell>
                      <Badge className={getTriageBadgeColor(patient.triage_level)}>
                        {patient.triage_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.priority_score}/5</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {calculateWaitTime(patient.time_enqueued)} min
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(patient.queue_status)}</TableCell>
                    <TableCell>
                      {patient.queue_status === 'waiting' ? (
                        <Button
                          size="sm"
                          onClick={() => handleStartConsultation(patient)}
                        >
                          Start
                        </Button>
                      ) : patient.queue_status === 'in_progress' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setConsultationDialogOpen(true);
                          }}
                        >
                          Continue
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedPatient && (
        <ConsultationDialog
          open={consultationDialogOpen}
          onOpenChange={setConsultationDialogOpen}
          queueId={selectedPatient.id}
          patientId={selectedPatient.patient_id}
          patientName={selectedPatient.patient_name}
          onSuccess={fetchQueue}
        />
      )}
    </Card>
  );
};
