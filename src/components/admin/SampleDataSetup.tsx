import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Database, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const SampleDataSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSetupData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-sample-data', {
        body: {}
      });

      if (error) {
        throw error;
      }

      setResult(data);
      toast.success('Sample data created successfully!');
    } catch (error: any) {
      console.error('Error setting up sample data:', error);
      toast.error(error.message || 'Failed to setup sample data');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sample Data Setup
        </CardTitle>
        <CardDescription>
          Create artificial data for testing with Indian names and role-based naming
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This will create sample users with password "12345678" for testing purposes only.
            <br />
            <strong>Staff accounts:</strong> Doctors, Nurses, Receptionists, Lab Technicians, Pharmacists
            <br />
            <strong>Patient accounts:</strong> 3 patient portal users (arjun_patient, divya_patient, vikram_patient)
            <br />
            All staff names include role suffix (e.g., Rajesh_doctor, Lakshmi_nurse)
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleSetupData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up data...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Create Sample Data
            </>
          )}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
