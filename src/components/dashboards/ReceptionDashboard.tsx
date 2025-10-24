import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Calendar, Clock, CheckCircle, Eye } from 'lucide-react';
import { PatientRegistration } from '@/components/reception/PatientRegistration';
import { AppointmentsList } from '@/components/reception/AppointmentsList';
import { supabase } from '@/integrations/supabase/client';

export const ReceptionDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    walkIns: 0,
    scheduled: 0,
    pending: 0,
    checkedIn: 0
  });

  useEffect(() => {
    fetchMetrics();

    // Set up realtime subscription
    const channel = supabase
      .channel('appointments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

    // Get walk-ins today
    const { data: walkIns } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_type', 'walk-in')
      .gte('created_at', today);

    // Get scheduled appointments today
    const { data: scheduled } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_type', 'scheduled')
      .gte('created_at', today);

    // Get pending check-ins
    const { data: pending } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'scheduled')
      .gte('created_at', today);

    // Get checked in today
    const { data: checkedIn } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'checked_in')
      .gte('created_at', today);

    setMetrics({
      walkIns: walkIns?.length || 0,
      scheduled: scheduled?.length || 0,
      pending: pending?.length || 0,
      checkedIn: checkedIn?.length || 0
    });
  };

  return (
    <DashboardLayout title="Reception Desk">
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Walk-ins Today</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.walkIns}</div>
            <p className="text-xs text-muted-foreground">New registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.scheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground">Waiting to check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metrics.checkedIn}</div>
            <p className="text-xs text-muted-foreground">Checked in today</p>
          </CardContent>
        </Card>
      </div>

      <PatientRegistration />
      
      <div className="mt-6">
        <AppointmentsList />
      </div>

      <Card className="mt-6 border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Registered Patients
            </CardTitle>
            <Button
              onClick={() => navigate('/patients')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View All Patients
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 text-center py-8">
          <p className="text-muted-foreground mb-4">View complete patient registry</p>
          <Button
            variant="outline"
            onClick={() => navigate('/patients')}
          >
            Go to Patient List
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};
