import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Loader2, Clock, User, Building2, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  token_number: string;
  patient_id: string;
  patient_name: string;
  department: string;
  appointment_type: string;
  status: string;
  created_at: string;
}

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAppointments = async () => {
    const { data: appointmentsData, error } = await supabase
      .from('appointments')
      .select('id, token_number, patient_id, department, appointment_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      toast.error('Failed to load appointments');
      setLoading(false);
      return;
    }

    // Fetch patient names
    const enrichedAppointments = await Promise.all(
      (appointmentsData || []).map(async (apt) => {
        const { data: patient } = await supabase
          .from('patients')
          .select('full_name')
          .eq('id', apt.patient_id)
          .single();

        return {
          ...apt,
          patient_name: patient?.full_name || 'Unknown'
        };
      })
    );

    setAppointments(enrichedAppointments);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary' as const, label: 'Scheduled' },
      checked_in: { variant: 'default' as const, label: 'Checked In' },
      completed: { variant: 'outline' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (error) {
      toast.error('Failed to cancel appointment');
      return;
    }

    toast.success('Appointment cancelled');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          <CardTitle>Recent Appointments</CardTitle>
        </div>
        <CardDescription>
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No appointments yet</p>
            <p className="text-sm mt-2">Appointments will appear here after registration</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {appointments.map((appointment) => (
              <AccordionItem 
                key={appointment.id} 
                value={appointment.id}
                className="border-2 rounded-lg px-4 hover:shadow-lg transition-all hover:border-purple-300"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 font-bold text-lg">
                      {appointment.token_number}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">{appointment.patient_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                        {getStatusBadge(appointment.status)}
                        <span className="capitalize">{appointment.department}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 pt-4 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Patient Name
                        </div>
                        <div className="font-medium">{appointment.patient_name}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Token Number
                        </div>
                        <div className="font-bold text-xl text-purple-500">{appointment.token_number}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Department
                        </div>
                        <div className="font-medium capitalize">{appointment.department}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Appointment Type</div>
                        <Badge variant="secondary" className="capitalize">
                          {appointment.appointment_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created At
                      </div>
                      <div className="font-medium">{formatDateTime(appointment.created_at)}</div>
                    </div>

                    {appointment.status === 'scheduled' && (
                      <Button 
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Appointment
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
