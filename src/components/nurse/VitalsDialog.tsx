import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';

interface VitalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  patientId: string;
  patientName: string;
  onSuccess: () => void;
}

export const VitalsDialog = ({ open, onOpenChange, appointmentId, patientId, patientName, onSuccess }: VitalsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vitals, setVitals] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    heart_rate: '',
    spo2: '',
    temperature: '',
    respiratory_rate: '',
    weight: '',
    height: '',
    symptoms: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate BMI if height and weight provided
      let bmi = null;
      if (vitals.weight && vitals.height) {
        const heightInMeters = parseFloat(vitals.height) / 100;
        bmi = parseFloat(vitals.weight) / (heightInMeters * heightInMeters);
      }

      // Check for critical values
      const isCritical = 
        (vitals.bp_systolic && (parseInt(vitals.bp_systolic) > 180 || parseInt(vitals.bp_systolic) < 90)) ||
        (vitals.spo2 && parseInt(vitals.spo2) < 92) ||
        (vitals.temperature && parseFloat(vitals.temperature) > 38.5) ||
        (vitals.heart_rate && (parseInt(vitals.heart_rate) > 120 || parseInt(vitals.heart_rate) < 50));

      // Insert vitals
      const symptomsArray = vitals.symptoms ? vitals.symptoms.split(',').map(s => s.trim()) : [];
      
      const { data: vitalsData, error: vitalsError } = await supabase
        .from('vitals')
        .insert({
          patient_id: patientId,
          appointment_id: appointmentId,
          nurse_id: user.id,
          bp_systolic: vitals.bp_systolic ? parseInt(vitals.bp_systolic) : null,
          bp_diastolic: vitals.bp_diastolic ? parseInt(vitals.bp_diastolic) : null,
          heart_rate: vitals.heart_rate ? parseInt(vitals.heart_rate) : null,
          spo2: vitals.spo2 ? parseInt(vitals.spo2) : null,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
          respiratory_rate: vitals.respiratory_rate ? parseInt(vitals.respiratory_rate) : null,
          weight: vitals.weight ? parseFloat(vitals.weight) : null,
          height: vitals.height ? parseFloat(vitals.height) : null,
          bmi: bmi,
          symptoms: symptomsArray,
          is_critical: isCritical,
          created_by: user.id
        })
        .select()
        .single();

      if (vitalsError) throw vitalsError;

      // Calculate triage score
      let triageScore = 0;
      
      // Vital signs scoring
      if (vitals.bp_systolic) {
        const systolic = parseInt(vitals.bp_systolic);
        if (systolic > 180 || systolic < 90) triageScore += 3;
        else if (systolic > 160 || systolic < 100) triageScore += 2;
        else if (systolic > 140 || systolic < 110) triageScore += 1;
      }
      
      if (vitals.heart_rate) {
        const hr = parseInt(vitals.heart_rate);
        if (hr > 120 || hr < 50) triageScore += 2;
        else if (hr > 100 || hr < 60) triageScore += 1;
      }
      
      if (vitals.spo2) {
        const spo2 = parseInt(vitals.spo2);
        if (spo2 < 92) triageScore += 3;
        else if (spo2 < 95) triageScore += 2;
      }
      
      if (vitals.temperature) {
        const temp = parseFloat(vitals.temperature);
        if (temp > 38.5) triageScore += 2;
        else if (temp > 37.8) triageScore += 1;
      }

      // Symptom-based scoring
      const criticalSymptoms = ['chest pain', 'stroke', 'unresponsive', 'seizure', 'unconscious'];
      const urgentSymptoms = ['bleeding', 'severe pain', 'difficulty breathing', 'vomiting'];
      const symptomsLower = vitals.symptoms.toLowerCase();
      
      if (criticalSymptoms.some(s => symptomsLower.includes(s))) {
        triageScore += 4;
      } else if (urgentSymptoms.some(s => symptomsLower.includes(s))) {
        triageScore += 2;
      }

      // Determine triage level
      let triageLevel: 'RED' | 'YELLOW' | 'GREEN';
      if (triageScore >= 6) {
        triageLevel = 'RED';
      } else if (triageScore >= 3) {
        triageLevel = 'YELLOW';
      } else {
        triageLevel = 'GREEN';
      }

      // Insert triage record
      const { data: triageData, error: triageError } = await supabase
        .from('triage_records')
        .insert({
          patient_id: patientId,
          vitals_id: vitalsData.id,
          triage_score: triageScore,
          triage_level: triageLevel,
          computed_level: triageLevel,
          evaluated_by: user.id,
          risk_factors: symptomsArray
        })
        .select()
        .single();

      if (triageError) throw triageError;

      // Get appointment to check department
      const { data: appointment } = await supabase
        .from('appointments')
        .select('department')
        .eq('id', appointmentId)
        .single();

      // Add to patient queue with department from appointment
      const { error: queueError } = await supabase
        .from('patient_queue')
        .insert({
          patient_id: patientId,
          appointment_id: appointmentId,
          triage_id: triageData.id,
          department: appointment?.department || 'Cardiology',
          priority_score: Math.min(triageScore, 5),
          queue_status: 'waiting',
          created_by: user.id
        });

      if (queueError) throw queueError;

      toast.success('Vitals recorded and patient added to queue');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setVitals({
        bp_systolic: '',
        bp_diastolic: '',
        heart_rate: '',
        spo2: '',
        temperature: '',
        respiratory_rate: '',
        weight: '',
        height: '',
        symptoms: ''
      });
    } catch (error: any) {
      console.error('Error recording vitals:', error);
      toast.error(error.message || 'Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Record Vitals - {patientName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bp_systolic">Blood Pressure (Systolic)</Label>
              <Input
                id="bp_systolic"
                type="number"
                placeholder="120"
                value={vitals.bp_systolic}
                onChange={(e) => setVitals({ ...vitals, bp_systolic: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bp_diastolic">Blood Pressure (Diastolic)</Label>
              <Input
                id="bp_diastolic"
                type="number"
                placeholder="80"
                value={vitals.bp_diastolic}
                onChange={(e) => setVitals({ ...vitals, bp_diastolic: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
              <Input
                id="heart_rate"
                type="number"
                placeholder="72"
                value={vitals.heart_rate}
                onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spo2">SpO2 (%)</Label>
              <Input
                id="spo2"
                type="number"
                placeholder="98"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="37.0"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
              <Input
                id="respiratory_rate"
                type="number"
                placeholder="16"
                value={vitals.respiratory_rate}
                onChange={(e) => setVitals({ ...vitals, respiratory_rate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.0"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={vitals.height}
                onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
            <Textarea
              id="symptoms"
              placeholder="fever, cough, headache"
              value={vitals.symptoms}
              onChange={(e) => setVitals({ ...vitals, symptoms: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Vitals'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
