import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, AlertTriangle, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
}

interface EntryTriageFormProps {
  onStepComplete: () => void;
}

export default function EntryTriageForm({ onStepComplete }: EntryTriageFormProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEmergency, setIsEmergency] = useState<string>('no');
  const [triageNotes, setTriageNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .select(`
          id,
          token_number,
          visit_date,
          is_emergency,
          current_step,
          patients (full_name, phone)
        `)
        .eq('current_step', 'entry')
        .order('visit_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching entries:', error);
    }
  };

  const searchPatients = async () => {
    if (!searchTerm.trim()) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone, date_of_birth')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error("Failed to search patients");
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (isEmergency === 'yes') {
      toast.success("Emergency case flagged! Redirecting to Emergency Department...", {
        duration: 3000
      });
      setTimeout(() => {
        window.location.href = '/emergency';
      }, 1500);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .insert({
          patient_id: selectedPatient.id,
          is_emergency: false,
          entry_triage_notes: triageNotes,
          current_step: 'entry',
          status: 'in_progress',
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Patient entry recorded. Proceed to Registration");

      // Reset form
      setSelectedPatient(null);
      setTriageNotes("");
      setIsEmergency('no');
      setSearchTerm("");
      setPatients([]);
      
      fetchRecentEntries();
      onStepComplete();
    } catch (error: any) {
      toast.error("Failed to record entry: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Entry Form */}
      <Card className="lg:col-span-2 p-6">
        <h2 className="text-2xl font-bold mb-4">Patient Entry & Triage</h2>
        
        <div className="space-y-6">
          {/* Patient Search */}
          <div>
            <Label>Search Patient</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPatients()}
              />
              <Button onClick={searchPatients} variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {patients.length > 0 && (
              <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setPatients([]);
                    }}
                    className="w-full p-3 text-left hover:bg-accent border-b last:border-b-0"
                  >
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Patient */}
          {selectedPatient && (
            <Card className="p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selectedPatient.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  Change
                </Button>
              </div>
            </Card>
          )}

          {/* Emergency Check */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Whether Emergency?</Label>
            <RadioGroup value={isEmergency} onValueChange={setIsEmergency} className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="no" id="no-emergency" />
                <Label htmlFor="no-emergency" className="flex-1 cursor-pointer font-medium">
                  NO - Regular Outpatient (OPD)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border-2 border-destructive bg-destructive/5 rounded-lg hover:bg-destructive/10 cursor-pointer">
                <RadioGroupItem value="yes" id="yes-emergency" />
                <Label htmlFor="yes-emergency" className="flex-1 cursor-pointer font-medium text-destructive">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    YES - Emergency (Redirect to Emergency Workflow)
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {isEmergency === 'yes' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>EMERGENCY PROTOCOL:</strong> This patient will be immediately redirected to the Emergency Department workflow upon submission.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Triage Notes */}
          <div>
            <Label>Triage Notes</Label>
            <Textarea
              placeholder="Enter initial assessment notes..."
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedPatient || isSubmitting}
            className="w-full"
            size="lg"
            variant={isEmergency === 'yes' ? 'destructive' : 'default'}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isEmergency === 'yes' ? "⚠️ FLAG AS EMERGENCY & TRANSFER" : "Record Entry & Proceed to Registration"}
          </Button>
        </div>
      </Card>

      {/* Recent Entries */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent entries</p>
          ) : (
            recentEntries.map((entry) => (
              <Card key={entry.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{entry.patients?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{entry.patients?.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.visit_date).toLocaleTimeString()}
                    </p>
                  </div>
                  {entry.is_emergency && (
                    <Badge variant="destructive" className="text-xs">
                      Emergency
                    </Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
