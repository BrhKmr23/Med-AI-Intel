import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientRegistration } from "@/components/reception/PatientRegistration";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Ticket } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegistrationStepProps {
  onStepComplete: () => void;
}

export default function RegistrationStep({ onStepComplete }: RegistrationStepProps) {
  const [queueData, setQueueData] = useState<any[]>([]);
  const [stats, setStats] = useState({ waiting: 0, avgWaitTime: 0 });
  
  const generateToken = (department: string = 'GEN') => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const seq = String(queueData.length + 1).padStart(3, '0');
    return `OPD-${department}-${dateStr}-${seq}`;
  };

  useEffect(() => {
    fetchQueueData();
    
    const channel = supabase
      .channel('registration-queue')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'outpatient_visits'
        },
        () => {
          fetchQueueData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueueData = async () => {
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .select(`
          id,
          token_number,
          visit_date,
          registration_type,
          patients (full_name, phone)
        `)
        .eq('current_step', 'registration')
        .order('visit_date', { ascending: true });

      if (error) throw error;
      
      setQueueData(data || []);
      // Calculate average wait time: 5 minutes per patient in queue
      const avgWait = data && data.length > 0 ? Math.round(data.length * 5) : 0;
      setStats({
        waiting: data?.length || 0,
        avgWaitTime: avgWait
      });
    } catch (error: any) {
      console.error('Error fetching queue:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Ticket className="h-4 w-4" />
        <AlertDescription>
          <strong>Registration Protocol & Queue Manager:</strong> E-Tokens are auto-generated in format OPD-[DEPT]-[DATE]-[SEQ]. Online pre-registered patients can skip the physical queue.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Waiting for Registration</p>
              <p className="text-2xl font-bold">{stats.waiting}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              <p className="text-2xl font-bold">{stats.avgWaitTime} min</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Ticket className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Next Token</p>
              <p className="text-lg font-bold font-mono">{generateToken()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Forms */}
        <Card className="lg:col-span-2 p-6">
          <Tabs defaultValue="new">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="online">Online Pre-Registered</TabsTrigger>
              <TabsTrigger value="new">New Walk-In</TabsTrigger>
              <TabsTrigger value="existing">Existing Walk-In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="online" className="mt-4">
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>Online Registration Path:</strong> Search and verify pre-registered patients. They skip the physical queue.
                </AlertDescription>
              </Alert>
              <PatientRegistration />
            </TabsContent>
            
            <TabsContent value="new" className="mt-4">
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>Walk-In Counter:</strong> New patient registration. Token will be auto-generated: <span className="font-mono font-semibold">{generateToken()}</span>
                </AlertDescription>
              </Alert>
              <PatientRegistration />
            </TabsContent>
            
            <TabsContent value="existing" className="mt-4">
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>Existing Patient:</strong> Search and register for today's visit. Token: <span className="font-mono font-semibold">{generateToken()}</span>
                </AlertDescription>
              </Alert>
              <PatientRegistration />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Queue Display */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Registration Queue</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {queueData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No patients in registration queue</p>
              </div>
            ) : (
              queueData.map((item, index) => (
                <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-base px-2">#{index + 1}</Badge>
                      {item.token_number && (
                        <Badge className="font-mono">{item.token_number}</Badge>
                      )}
                    </div>
                    <Badge variant={item.registration_type === 'online' ? 'default' : 'secondary'} className="text-xs">
                      {item.registration_type || 'walk-in'}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm">{item.patients?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{item.patients?.phone}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.visit_date).toLocaleTimeString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      ~{(index + 1) * 5} min
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
