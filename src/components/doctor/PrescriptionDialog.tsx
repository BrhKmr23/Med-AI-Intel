import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pill } from 'lucide-react';
import { toast } from 'sonner';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  onSave: (medications: Medication[], notes: string) => void;
}

export const PrescriptionDialog = ({ open, onOpenChange, patientName, onSave }: PrescriptionDialogProps) => {
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSave = () => {
    const validMedications = medications.filter(m => m.name.trim() !== '');
    
    if (validMedications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    onSave(validMedications, notes);
    setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setNotes('');
    onOpenChange(false);
    toast.success('Prescription saved successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            Write Prescription - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Medications</h3>
              <Button onClick={addMedication} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Medication
              </Button>
            </div>

            <div className="space-y-4">
              {medications.map((medication, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline">Medication {index + 1}</Badge>
                      {medications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Medicine Name *</Label>
                        <Input
                          placeholder="e.g., Paracetamol"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Dosage *</Label>
                        <Input
                          placeholder="e.g., 500mg"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Frequency *</Label>
                        <Input
                          placeholder="e.g., 3 times daily"
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Duration *</Label>
                        <Input
                          placeholder="e.g., 5 days"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Special Instructions</Label>
                        <Input
                          placeholder="e.g., Take after meals"
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Any additional instructions or notes for the patient..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Pill className="h-4 w-4" />
              Save Prescription
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
