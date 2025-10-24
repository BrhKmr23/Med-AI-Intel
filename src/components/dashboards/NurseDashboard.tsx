import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, ClipboardList, CheckCircle, Eye, UserPlus } from 'lucide-react';
import { NurseStation } from '@/components/nurse/NurseStation';
import { PatientRegistration } from '@/components/reception/PatientRegistration';
import { supabase } from '@/integrations/supabase/client';

export const NurseDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    pending: 0,
    critical: 0,
    tasks: 0,
    completed: 0
  });

  useEffect(() => {
    fetchMetrics();

    // Set up realtime subscriptions
    const channel = supabase
      .channel('nurse_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nurse_tasks' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

    // Get patients awaiting vitals (checked in but no vitals recorded)
    const { data: checkedIn } = await supabase
      .from('appointments')
      .select('id, patient_id')
      .eq('status', 'checked_in');

    let pending = 0;
    if (checkedIn) {
      for (const appointment of checkedIn) {
        const { data: vitals } = await supabase
          .from('vitals')
          .select('id')
          .eq('appointment_id', appointment.id)
          .limit(1);
        
        if (!vitals || vitals.length === 0) {
          pending++;
        }
      }
    }

    // Get critical alerts today
    const { data: critical } = await supabase
      .from('vitals')
      .select('*')
      .eq('is_critical', true)
      .gte('recorded_at', today);

    // Get pending tasks
    const { data: tasks } = await supabase
      .from('nurse_tasks')
      .select('*')
      .eq('completed', false);

    // Get completed vitals today
    const { data: completed } = await supabase
      .from('vitals')
      .select('*')
      .gte('recorded_at', today);

    setMetrics({
      pending,
      critical: critical?.length || 0,
      tasks: tasks?.length || 0,
      completed: completed?.length || 0
    });
  };

  return (
    <DashboardLayout title="Nurse Station">
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vitals Pending</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting vitals check</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{metrics.critical}</div>
            <p className="text-xs text-muted-foreground">Abnormal vitals detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tasks}</div>
            <p className="text-xs text-muted-foreground">Pending tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metrics.completed}</div>
            <p className="text-xs text-muted-foreground">Vitals recorded</p>
          </CardContent>
        </Card>
      </div>

      <PatientRegistration />
      
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

      <div className="mt-6">
        <NurseStation />
      </div>
    </DashboardLayout>
  );
};