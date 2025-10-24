import { PatientQueueKanban } from '@/components/doctor/PatientQueueKanban';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export const DoctorOperationsView = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Doctor Operations - Patient Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage patient queue, consultations, prescriptions, and lab orders across all doctors.
          </p>
        </CardContent>
      </Card>
      
      <PatientQueueKanban />
    </div>
  );
};
