import { PatientRegistration } from '@/components/reception/PatientRegistration';
import { AppointmentsList } from '@/components/reception/AppointmentsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export const ReceptionOperationsView = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Reception Operations - Registrations & Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage patient registrations, walk-ins, scheduled appointments, and check-ins.
          </p>
        </CardContent>
      </Card>
      
      <PatientRegistration />
      
      <div className="mt-6">
        <AppointmentsList />
      </div>
    </div>
  );
};
