import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Activity, Clock, Stethoscope, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VitalsDialog } from './VitalsDialog';

interface PendingPatient {
  id: string;
  patient_id: string;
  patient_name: string;
  token_number: string;
  department: string;
  appointment_type: string;
  checked_in_at: string;
}

export const NurseStation = () => {
  const [patients, setPatients] = useState<PendingPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PendingPatient | null>(null);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingPatients();

    // Set up realtime subscription
    const channel = supabase
      .channel('vitals_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchPendingPatients)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals' }, fetchPendingPatients)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingPatients = async () => {
    // Get all checked-in appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, patient_id, token_number, department, appointment_type, created_at')
      .eq('status', 'checked_in')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load patients');
      setLoading(false);
      return;
    }

    // Filter out patients who already have vitals recorded
    const pendingPatients = [];
    for (const appointment of appointments || []) {
      const { data: vitals } = await supabase
        .from('vitals')
        .select('id')
        .eq('appointment_id', appointment.id)
        .limit(1);

      if (!vitals || vitals.length === 0) {
        const { data: patient } = await supabase
          .from('patients')
          .select('full_name')
          .eq('id', appointment.patient_id)
          .single();

        pendingPatients.push({
          id: appointment.id,
          patient_id: appointment.patient_id,
          patient_name: patient?.full_name || 'Unknown',
          token_number: appointment.token_number,
          department: appointment.department,
          appointment_type: appointment.appointment_type,
          checked_in_at: appointment.created_at
        });
      }
    }

    setPatients(pendingPatients);
    setLoading(false);
  };

  const calculateWaitTime = (checkedInTime: string) => {
    const minutes = Math.floor((Date.now() - new Date(checkedInTime).getTime()) / 60000);
    return minutes;
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
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-500" />
          <CardTitle>Patient Vitals Queue</CardTitle>
        </div>
        <CardDescription>
          {patients.length} patient{patients.length !== 1 ? 's' : ''} awaiting vital signs recording
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {patients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No patients awaiting vitals</p>
            <p className="text-sm mt-2">Checked-in patients will appear here</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {patients.map((patient) => (
              <AccordionItem 
                key={patient.id} 
                value={patient.id}
                className="border-2 rounded-lg px-4 hover:shadow-lg transition-all hover:border-blue-300"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 font-bold text-lg">
                      {patient.token_number}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">{patient.patient_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {patient.department}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {calculateWaitTime(patient.checked_in_at)} min wait
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 pt-4 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Token Number</div>
                        <div className="font-bold text-xl text-blue-500">{patient.token_number}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Appointment Type</div>
                        <Badge variant="secondary" className="capitalize">
                          {patient.appointment_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Department
                        </div>
                        <div className="font-medium capitalize">{patient.department}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Waiting Time
                        </div>
                        <div className="font-medium">{calculateWaitTime(patient.checked_in_at)} minutes</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-2"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setVitalsDialogOpen(true);
                      }}
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Record Vital Signs
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>

      {selectedPatient && (
        <VitalsDialog
          open={vitalsDialogOpen}
          onOpenChange={setVitalsDialogOpen}
          appointmentId={selectedPatient.id}
          patientId={selectedPatient.patient_id}
          patientName={selectedPatient.patient_name}
          onSuccess={fetchPendingPatients}
        />
      )}
    </Card>
  );
};
