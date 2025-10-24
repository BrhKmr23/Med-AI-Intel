import { NurseStation } from '@/components/nurse/NurseStation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export const NurseOperationsView = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Nurse Operations - Vitals & Patient Care
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor vitals recording, patient care tasks, and critical alerts across all nursing staff.
          </p>
        </CardContent>
      </Card>
      
      <NurseStation />
    </div>
  );
};
