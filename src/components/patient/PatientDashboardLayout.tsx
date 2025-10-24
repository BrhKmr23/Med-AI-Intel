import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { usePatientAuth } from '@/lib/patientAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface PatientDashboardLayoutProps {
  children: ReactNode;
  patientName?: string;
}

export const PatientDashboardLayout = ({ children, patientName }: PatientDashboardLayoutProps) => {
  const { signOut } = usePatientAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/patient-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Patient Portal</h1>
                {patientName && (
                  <p className="text-sm text-muted-foreground">Welcome, {patientName}</p>
                )}
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
