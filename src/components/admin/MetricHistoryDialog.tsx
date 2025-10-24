import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { Loader2, TrendingUp } from 'lucide-react';

interface MetricHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricType: 'staff' | 'doctors' | 'nurses' | 'patients';
  metricTitle: string;
}

export const MetricHistoryDialog = ({ open, onOpenChange, metricType, metricTitle }: MetricHistoryDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateValue, setSelectedDateValue] = useState(0);

  useEffect(() => {
    if (open) {
      fetchHistoryData();
    }
  }, [open]);

  useEffect(() => {
    if (date && historyData.length > 0) {
      const dateStr = format(date, 'MMM dd');
      const dayData = historyData.find(d => d.date === dateStr);
      setSelectedDateValue(dayData?.value || 0);
    }
  }, [date, historyData]);

  const fetchHistoryData = async () => {
    setLoading(true);
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const data = [];

    for (const day of last7Days) {
      const startOfDay = new Date(day.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(day.setHours(23, 59, 59, 999)).toISOString();
      let count = 0;

      if (metricType === 'patients') {
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
        count = patients?.length || 0;
      } else {
        const roleFilter = metricType === 'doctors' ? 'doctor' : metricType === 'nurses' ? 'nurse' : null;
        
        let query = supabase
          .from('user_roles')
          .select('id')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
        
        if (roleFilter) {
          query = query.eq('role', roleFilter);
        }
        
        const { data: roles } = await query;
        count = roles?.length || 0;
      }

      data.push({
        date: format(day, 'MMM dd'),
        value: count
      });
    }

    setHistoryData(data);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {metricTitle} History
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Last 7 Days History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {historyData.map((day, index) => (
                    <div 
                      key={index}
                      className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 hover:shadow-lg transition-all"
                    >
                      <div className="text-xs text-muted-foreground mb-1">{day.date}</div>
                      <div className="text-2xl font-bold text-primary">{day.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Select Date</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => date > new Date()}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Date Value</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {selectedDateValue}
                  </div>
                  <p className="text-muted-foreground">
                    {date ? format(date, 'MMMM dd, yyyy') : 'Select a date'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
