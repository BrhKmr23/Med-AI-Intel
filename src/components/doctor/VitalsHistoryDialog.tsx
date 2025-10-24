import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Heart, Thermometer, Wind, Weight, Ruler } from 'lucide-react';
import { format } from 'date-fns';

interface VitalsHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

export const VitalsHistoryDialog = ({ open, onOpenChange, patientId, patientName }: VitalsHistoryDialogProps) => {
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && patientId) {
      fetchVitalsHistory();
    }
  }, [open, patientId]);

  const fetchVitalsHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vitals')
      .select(`
        *,
        nurse:nurse_id(full_name)
      `)
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });

    if (!error && data) {
      setVitalsHistory(data);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Vitals History - {patientName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Activity className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : vitalsHistory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No vitals history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vitalsHistory.map((vital, index) => (
              <Card key={vital.id} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(vital.recorded_at), 'PPpp')}
                      </p>
                      <p className="text-sm font-medium">
                        Recorded by: {vital.nurse?.full_name || 'Unknown'}
                      </p>
                    </div>
                    {vital.is_critical && (
                      <Badge variant="destructive" className="animate-pulse">Critical</Badge>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        Blood Pressure
                      </div>
                      <p className="text-xl font-bold">
                        {vital.bp_systolic}/{vital.bp_diastolic}
                      </p>
                      <p className="text-xs text-muted-foreground">mmHg</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        Heart Rate
                      </div>
                      <p className="text-xl font-bold">{vital.heart_rate}</p>
                      <p className="text-xs text-muted-foreground">bpm</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Wind className="h-4 w-4" />
                        SpO2
                      </div>
                      <p className="text-xl font-bold">{vital.spo2}%</p>
                      <p className="text-xs text-muted-foreground">oxygen</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Thermometer className="h-4 w-4" />
                        Temperature
                      </div>
                      <p className="text-xl font-bold">{vital.temperature}°</p>
                      <p className="text-xs text-muted-foreground">celsius</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Wind className="h-4 w-4" />
                        Respiratory Rate
                      </div>
                      <p className="text-xl font-bold">{vital.respiratory_rate}</p>
                      <p className="text-xs text-muted-foreground">breaths/min</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Weight className="h-4 w-4" />
                        Weight
                      </div>
                      <p className="text-xl font-bold">{vital.weight}</p>
                      <p className="text-xs text-muted-foreground">kg</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Ruler className="h-4 w-4" />
                        Height
                      </div>
                      <p className="text-xl font-bold">{vital.height}</p>
                      <p className="text-xs text-muted-foreground">cm</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        BMI
                      </div>
                      <p className="text-xl font-bold">{vital.bmi}</p>
                      <p className="text-xs text-muted-foreground">kg/m²</p>
                    </div>
                  </div>

                  {vital.symptoms && vital.symptoms.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm font-medium mb-2">Symptoms:</p>
                        <div className="flex flex-wrap gap-2">
                          {vital.symptoms.map((symptom: string, idx: number) => (
                            <Badge key={idx} variant="outline">{symptom}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
