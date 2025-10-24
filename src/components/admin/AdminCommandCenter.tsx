import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentView } from './DepartmentView';
import { 
  Stethoscope, 
  Heart, 
  UserPlus, 
  Microscope, 
  Pill, 
  DollarSign, 
  Server,
  Activity,
  TrendingUp
} from 'lucide-react';
import { 
  fetchDoctorMetrics, 
  fetchNurseMetrics, 
  fetchReceptionMetrics,
  fetchLabMetrics,
  fetchPharmacyMetrics,
  fetchBillingMetrics,
  fetchITMetrics,
  DepartmentMetrics
} from '@/lib/adminMetrics';
import { supabase } from '@/integrations/supabase/client';
import { DoctorOperationsView } from './departments/DoctorOperationsView';
import { NurseOperationsView } from './departments/NurseOperationsView';
import { ReceptionOperationsView } from './departments/ReceptionOperationsView';
import { LabOperationsView } from './departments/LabOperationsView';
import { PharmacyOperationsView } from './departments/PharmacyOperationsView';
import { BillingOperationsView } from './departments/BillingOperationsView';
import { ITAdminOperationsView } from './departments/ITAdminOperationsView';

type DepartmentType = 'doctor' | 'nurse' | 'reception' | 'lab' | 'pharmacy' | 'billing' | 'it' | null;

const emptyMetrics: DepartmentMetrics = { active: 0, pending: 0, critical: 0, completed: 0 };

export const AdminCommandCenter = () => {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentType>(null);
  const [metrics, setMetrics] = useState({
    doctor: emptyMetrics,
    nurse: emptyMetrics,
    reception: emptyMetrics,
    lab: emptyMetrics,
    pharmacy: emptyMetrics,
    billing: emptyMetrics,
    it: emptyMetrics,
  });

  const [hospitalStats, setHospitalStats] = useState({
    totalStaff: 0,
    patientsToday: 0,
    criticalAlerts: 0,
  });

  useEffect(() => {
    fetchAllMetrics();
    fetchHospitalStats();

    // Set up realtime subscriptions for auto-refresh
    const channel = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_queue' }, fetchAllMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAllMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals' }, fetchAllMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_orders' }, fetchAllMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, fetchAllMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'billing' }, fetchAllMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, fetchHospitalStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchHospitalStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllMetrics = async () => {
    const [doctor, nurse, reception, lab, pharmacy, billing, it] = await Promise.all([
      fetchDoctorMetrics(),
      fetchNurseMetrics(),
      fetchReceptionMetrics(),
      fetchLabMetrics(),
      fetchPharmacyMetrics(),
      fetchBillingMetrics(),
      fetchITMetrics(),
    ]);

    setMetrics({ doctor, nurse, reception, lab, pharmacy, billing, it });
  };

  const fetchHospitalStats = async () => {
    const { data: roles } = await supabase.from('user_roles').select('role');
    
    const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const { data: patients } = await supabase
      .from('patients')
      .select('*')
      .gte('created_at', today);

    const { data: critical } = await supabase
      .from('vitals')
      .select('*')
      .eq('is_critical', true)
      .gte('recorded_at', today);

    setHospitalStats({
      totalStaff: roles?.length || 0,
      patientsToday: patients?.length || 0,
      criticalAlerts: critical?.length || 0,
    });
  };

  const departments = [
    { 
      id: 'doctor' as DepartmentType, 
      title: 'Doctors', 
      icon: Stethoscope, 
      color: '217 91% 60%',
      metrics: metrics.doctor,
      view: <DoctorOperationsView />
    },
    { 
      id: 'nurse' as DepartmentType, 
      title: 'Nurses', 
      icon: Heart, 
      color: '142 76% 36%',
      metrics: metrics.nurse,
      view: <NurseOperationsView />
    },
    { 
      id: 'reception' as DepartmentType, 
      title: 'Reception', 
      icon: UserPlus, 
      color: '262 83% 58%',
      metrics: metrics.reception,
      view: <ReceptionOperationsView />
    },
    { 
      id: 'lab' as DepartmentType, 
      title: 'Laboratory', 
      icon: Microscope, 
      color: '199 89% 48%',
      metrics: metrics.lab,
      view: <LabOperationsView />
    },
    { 
      id: 'pharmacy' as DepartmentType, 
      title: 'Pharmacy', 
      icon: Pill, 
      color: '173 58% 39%',
      metrics: metrics.pharmacy,
      view: <PharmacyOperationsView />
    },
    { 
      id: 'billing' as DepartmentType, 
      title: 'Billing', 
      icon: DollarSign, 
      color: '43 96% 56%',
      metrics: metrics.billing,
      view: <BillingOperationsView />
    },
    { 
      id: 'it' as DepartmentType, 
      title: 'IT Administration', 
      icon: Server, 
      color: '221 83% 53%',
      metrics: metrics.it,
      view: <ITAdminOperationsView />
    },
  ];

  const activeDept = departments.find(d => d.id === activeDepartment);

  return (
    <>
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Hospital Command Center
          </h1>
          <p className="text-muted-foreground">
            Unified oversight and management of all hospital departments
          </p>
        </div>

        {/* Hospital-Wide Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{hospitalStats.totalStaff}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Active across all departments
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Patients Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{hospitalStats.patientsToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered today
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-destructive" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{hospitalStats.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Department Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              title={dept.title}
              icon={dept.icon}
              color={dept.color}
              metrics={dept.metrics}
              onEnter={() => setActiveDepartment(dept.id)}
            />
          ))}
        </div>
      </div>

      {/* Department View */}
      {activeDept && (
        <DepartmentView
          title={activeDept.title}
          icon={activeDept.icon}
          color={activeDept.color}
          isOpen={activeDepartment !== null}
          onClose={() => setActiveDepartment(null)}
        >
          {activeDept.view}
        </DepartmentView>
      )}
    </>
  );
};
