import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePatientAuth } from '@/lib/patientAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedPatientRouteProps {
  children: ReactNode;
}

export const ProtectedPatientRoute = ({ children }: ProtectedPatientRouteProps) => {
  const { user, patientId, loading } = usePatientAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !patientId)) {
      setShouldRedirect(true);
    } else {
      setShouldRedirect(false);
    }
  }, [user, patientId, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/patient-login" replace />;
  }

  return <>{children}</>;
};
