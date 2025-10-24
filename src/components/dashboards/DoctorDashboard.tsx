import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { PatientQueueKanban } from '@/components/doctor/PatientQueueKanban';
import { supabase } from '@/integrations/supabase/client';

export const DoctorDashboard = () => {
  const [metrics, setMetrics] = useState({
    waiting: 0,
    critical: 0,
    avgWaitTime: 0,
    completed: 0
  });

  useEffect(() => {
    fetchMetrics();

    // Set up realtime subscriptions
    const queueChannel = supabase
      .channel('queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_queue' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
    };
  }, []);

  const fetchMetrics = async () => {
    // Get waiting patients
    const { data: waitingPatients } = await supabase
      .from('patient_queue')
      .select('*')
      .eq('queue_status', 'waiting');

    // Get critical cases
    const { data: criticalCases } = await supabase
      .from('vitals')
      .select('*')
      .eq('is_critical', true)
      .gte('recorded_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    // Get completed today
    const { data: completed } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'completed')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    // Calculate average wait time
    const { data: queueData } = await supabase
      .from('patient_queue')
      .select('time_enqueued, time_started')
      .not('time_started', 'is', null);

    let avgWait = 0;
    if (queueData && queueData.length > 0) {
      const totalWait = queueData.reduce((acc, item) => {
        const wait = new Date(item.time_started).getTime() - new Date(item.time_enqueued).getTime();
        return acc + wait;
      }, 0);
      avgWait = Math.round(totalWait / queueData.length / 60000); // Convert to minutes
    }

    setMetrics({
      waiting: waitingPatients?.length || 0,
      critical: criticalCases?.length || 0,
      avgWaitTime: avgWait,
      completed: completed?.length || 0
    });
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="mb-8">
        <PatientQueueKanban />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients Waiting</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics.waiting}</div>
            <p className="text-xs text-muted-foreground mt-1">In your queue</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{metrics.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{metrics.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground mt-1">Current average</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{metrics.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Consultations done</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
