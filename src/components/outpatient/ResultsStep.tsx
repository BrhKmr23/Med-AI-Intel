import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ResultsStepProps {
  onStepComplete: () => void;
}

export default function ResultsStep({ onStepComplete }: ResultsStepProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .select(`
          id,
          token_number,
          patients (id, full_name, phone)
        `)
        .eq('current_step', 'investigation')
        .order('visit_date', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const loadResults = async (visit: any) => {
    setSelectedVisit(visit);
    try {
      const { data, error } = await supabase
        .from('investigation_orders')
        .select('*')
        .eq('visit_id', visit.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const handleProceedToDischarge = async () => {
    if (!selectedVisit) return;

    try {
      await supabase
        .from('outpatient_visits')
        .update({ current_step: 'results' })
        .eq('id', selectedVisit.id);

      toast.success("Ready for discharge decision");
      onStepComplete();
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'ordered': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const allCompleted = orders.every(o => o.status === 'completed');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Patients with Results</h3>
        <div className="space-y-2 max-h-[700px] overflow-y-auto">
          {patients.map((visit) => (
            <button
              key={visit.id}
              onClick={() => loadResults(visit)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                selectedVisit?.id === visit.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
              }`}
            >
              <p className="font-medium text-sm">{visit.patients.full_name}</p>
              <p className="text-xs text-muted-foreground">{visit.token_number}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-3 p-6">
        {!selectedVisit ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select a Patient</h3>
            <p className="text-muted-foreground">Choose a patient to review results</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedVisit.patients.full_name}</h2>
                <p className="text-muted-foreground">Results Review</p>
              </div>
              <Button 
                onClick={handleProceedToDischarge}
                disabled={!allCompleted}
              >
                Proceed to Discharge
              </Button>
            </div>

            {!allCompleted && (
              <Card className="p-4 bg-yellow-500/10 border-yellow-500">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm font-medium">Waiting for all results to be completed</p>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Investigation Results</h3>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders found</p>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold capitalize">{order.order_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify(order.order_details)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    {order.status === 'completed' && (
                      <div className="mt-3 p-3 bg-green-500/10 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Results Available</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed at: {new Date(order.completed_at || order.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="followup"
                  checked={requiresFollowUp}
                  onCheckedChange={(checked) => setRequiresFollowUp(checked as boolean)}
                />
                <Label htmlFor="followup" className="cursor-pointer flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Requires Follow-up</span>
                </Label>
              </div>
              {requiresFollowUp && (
                <Textarea
                  placeholder="Follow-up instructions and date..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  rows={3}
                />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
