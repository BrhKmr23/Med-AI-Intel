import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestTube } from 'lucide-react';

interface LabTestRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  queueId: string;
  onSuccess: () => void;
}

const COMMON_TESTS = [
  'Complete Blood Count (CBC)',
  'Urinalysis',
  'Blood Glucose Test'
];

export const LabTestRequestDialog = ({
  open,
  onOpenChange,
  patientId,
  queueId,
  onSuccess
}: LabTestRequestDialogProps) => {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTest, setCustomTest] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestToggle = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test)
        ? prev.filter(t => t !== test)
        : [...prev, test]
    );
  };

  const handleConfirm = async () => {
    const testsToRequest = [...selectedTests];
    if (customTest.trim()) {
      testsToRequest.push(customTest.trim());
    }

    if (testsToRequest.length === 0) {
      toast.error('Please select at least one test or enter a custom test name');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Insert lab orders for each test
      const labOrders = testsToRequest.map(test => ({
        patient_id: patientId,
        queue_id: queueId,
        doctor_id: user?.id,
        test_name: test,
        order_type: 'laboratory',
        priority,
        notes,
        status: 'pending'
      }));

      const { error: labOrderError } = await supabase
        .from('lab_orders')
        .insert(labOrders);

      if (labOrderError) throw labOrderError;

      // Update patient queue status
      const { error: queueError } = await supabase
        .from('patient_queue')
        .update({
          queue_status: 'on_hold',
          awaiting_lab_results: true,
          on_hold_reason: 'Awaiting lab results'
        })
        .eq('id', queueId);

      if (queueError) throw queueError;

      toast.success(`${testsToRequest.length} lab test(s) requested successfully`);
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setSelectedTests([]);
      setCustomTest('');
      setPriority('routine');
      setNotes('');
    } catch (error: any) {
      console.error('Error requesting lab tests:', error);
      toast.error(error.message || 'Failed to request lab tests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Request Lab Tests
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Common Tests */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Common Lab Tests</Label>
            <div className="space-y-2">
              {COMMON_TESTS.map(test => (
                <div key={test} className="flex items-center space-x-2">
                  <Checkbox
                    id={test}
                    checked={selectedTests.includes(test)}
                    onCheckedChange={() => handleTestToggle(test)}
                  />
                  <label
                    htmlFor={test}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {test}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Test */}
          <div className="space-y-2">
            <Label htmlFor="customTest">Custom Test Name</Label>
            <Input
              id="customTest"
              placeholder="Enter custom test name (if not listed above)"
              value={customTest}
              onChange={(e) => setCustomTest(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT (Immediate)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any special instructions or clinical notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Requesting...' : 'Confirm Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};