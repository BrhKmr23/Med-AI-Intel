import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  ClipboardCheck, 
  UserPlus, 
  Stethoscope, 
  FlaskConical, 
  FileText, 
  LogOut,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import EntryTriageForm from "@/components/outpatient/EntryTriageForm";
import RegistrationStep from "@/components/outpatient/RegistrationStep";
import ConsultationStep from "@/components/outpatient/ConsultationStep";
import InvestigationStep from "@/components/outpatient/InvestigationStep";
import ResultsStep from "@/components/outpatient/ResultsStep";
import DischargeStep from "@/components/outpatient/DischargeStep";
import ExitFollowUpStep from "@/components/outpatient/ExitFollowUpStep";

interface WorkflowStats {
  total_today: number;
  in_progress: number;
  completed: number;
  at_entry: number;
  at_registration: number;
  at_consultation: number;
  at_investigation: number;
  at_results: number;
  at_discharge: number;
  at_exit: number;
}

const workflowSteps = [
  { id: 'entry', label: 'Entry & Triage', icon: ClipboardCheck, color: 'bg-blue-500' },
  { id: 'registration', label: 'Registration', icon: UserPlus, color: 'bg-green-500' },
  { id: 'consultation', label: 'Consultation', icon: Stethoscope, color: 'bg-purple-500' },
  { id: 'investigation', label: 'Investigation', icon: FlaskConical, color: 'bg-yellow-500' },
  { id: 'results', label: 'Results', icon: Activity, color: 'bg-orange-500' },
  { id: 'discharge', label: 'Discharge', icon: FileText, color: 'bg-red-500' },
  { id: 'exit', label: 'Exit & Follow-up', icon: LogOut, color: 'bg-indigo-500' }
];

export default function OutpatientWorkflow() {
  const { user, userRole } = useAuth();
  const [currentStep, setCurrentStep] = useState('entry');
  const [stats, setStats] = useState<WorkflowStats>({
    total_today: 0,
    in_progress: 0,
    completed: 0,
    at_entry: 0,
    at_registration: 0,
    at_consultation: 0,
    at_investigation: 0,
    at_results: 0,
    at_discharge: 0,
    at_exit: 0
  });

  useEffect(() => {
    fetchStats();
    
    const channel = supabase
      .channel('outpatient-visits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'outpatient_visits'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: visits, error } = await supabase
        .from('outpatient_visits')
        .select('current_step, status')
        .gte('visit_date', `${today}T00:00:00`)
        .lte('visit_date', `${today}T23:59:59`);

      if (error) throw error;

      const newStats: WorkflowStats = {
        total_today: visits?.length || 0,
        in_progress: visits?.filter(v => v.status === 'in_progress').length || 0,
        completed: visits?.filter(v => v.status === 'completed').length || 0,
        at_entry: visits?.filter(v => v.current_step === 'entry').length || 0,
        at_registration: visits?.filter(v => v.current_step === 'registration').length || 0,
        at_consultation: visits?.filter(v => v.current_step === 'consultation').length || 0,
        at_investigation: visits?.filter(v => v.current_step === 'investigation').length || 0,
        at_results: visits?.filter(v => v.current_step === 'results').length || 0,
        at_discharge: visits?.filter(v => v.current_step === 'discharge').length || 0,
        at_exit: visits?.filter(v => v.current_step === 'exit').length || 0
      };

      setStats(newStats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Outpatient Workflow</h1>
          <p className="text-muted-foreground">Manage patient journey from entry to exit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Visits Today</p>
              <p className="text-2xl font-bold text-foreground">{stats.total_today}</p>
            </div>
            <Activity className="h-8 w-8 text-primary" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              <p className="text-2xl font-bold text-foreground">24 min</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Workflow Steps</h2>
        <div className="flex items-center justify-between gap-2">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const stepStats = stats[`at_${step.id}` as keyof WorkflowStats] || 0;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all flex-1 ${
                    isActive ? 'bg-primary/10 border-2 border-primary' : 'hover:bg-accent'
                  }`}
                >
                  <div className={`p-3 rounded-full ${step.color} bg-opacity-20`}>
                    <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-xs font-medium text-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {stepStats}
                  </Badge>
                </button>
                {index < workflowSteps.length - 1 && (
                  <div className="h-0.5 bg-border flex-1 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
        <TabsList className="hidden">
          {workflowSteps.map(step => (
            <TabsTrigger key={step.id} value={step.id}>{step.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="entry" className="mt-0">
          <EntryTriageForm onStepComplete={() => fetchStats()} />
        </TabsContent>

        <TabsContent value="registration" className="mt-0">
          <RegistrationStep onStepComplete={() => fetchStats()} />
        </TabsContent>

        <TabsContent value="consultation" className="mt-0">
          <ConsultationStep onStepComplete={() => fetchStats()} />
        </TabsContent>

        <TabsContent value="investigation" className="mt-0">
          <InvestigationStep onStepComplete={() => fetchStats()} />
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          <ResultsStep onStepComplete={() => fetchStats()} />
        </TabsContent>

        <TabsContent value="discharge" className="mt-0">
          <DischargeStep onStepComplete={() => fetchStats()} />
        </TabsContent>

        <TabsContent value="exit" className="mt-0">
          <ExitFollowUpStep onStepComplete={() => fetchStats()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}