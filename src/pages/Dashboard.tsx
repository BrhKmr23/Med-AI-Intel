import { useAuth } from '@/lib/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { DoctorDashboard } from '@/components/dashboards/DoctorDashboard';
import { NurseDashboard } from '@/components/dashboards/NurseDashboard';
import { ReceptionDashboard } from '@/components/dashboards/ReceptionDashboard';
import { PharmacistDashboard } from '@/components/dashboards/PharmacistDashboard';
import { BillingDashboard } from '@/components/dashboards/BillingDashboard';
import { LabTechnicianDashboard } from '@/components/dashboards/LabTechnicianDashboard';
import { ITAdminDashboard } from '@/components/dashboards/ITAdminDashboard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to logout');
    } else {
      toast.success('Logged out successfully');
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center max-w-md space-y-6 p-8 rounded-lg border-2 shadow-lg bg-card">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Role Not Assigned</h1>
            <p className="text-muted-foreground">
              Please contact an administrator to assign you a role (Admin, Doctor, Nurse, or Receptionist).
            </p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="gap-2 w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'receptionist':
      return <ReceptionDashboard />;
    case 'pharmacist':
      return <PharmacistDashboard />;
    case 'billing_staff':
      return <BillingDashboard />;
    case 'lab_technician':
      return <LabTechnicianDashboard />;
    case 'it_admin':
      return <ITAdminDashboard />;
    case 'patient':
      return <Navigate to="/patient-portal" replace />;
    default:
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
          <div className="text-center max-w-md space-y-6 p-8 rounded-lg border-2 shadow-lg bg-card">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-destructive">Unknown Role</h1>
              <p className="text-muted-foreground mt-2">Please contact support.</p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="gap-2 w-full"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      );
  }
};

export default Dashboard;