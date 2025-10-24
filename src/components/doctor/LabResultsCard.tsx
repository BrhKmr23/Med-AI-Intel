import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestTube, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface LabResultsCardProps {
  patientId: string;
  queueId: string;
}

interface LabResult {
  id: string;
  test_name: string;
  status: string;
  priority: string;
  results: any;
  interpretation?: string;
  critical_findings?: string;
  pdf_upload_url?: string;
  completed_at?: string;
  created_at: string;
}

export const LabResultsCard = ({ patientId, queueId }: LabResultsCardProps) => {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabResults();
  }, [queueId]);

  const fetchLabResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('queue_id', queueId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLabResults(data || []);
    } catch (error) {
      console.error('Error fetching lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (pdfUrl: string, testName: string) => {
    // In a real implementation, this would download from Supabase Storage
    toast.info('PDF download functionality - would download: ' + testName);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return 'bg-red-500 text-white';
      case 'urgent':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Loading lab results...</p>
        </CardContent>
      </Card>
    );
  }

  if (labResults.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Lab Test Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {labResults.map((result) => (
          <Card key={result.id} className="border-l-4 border-l-primary">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">{result.test_name}</h4>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {result.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(result.priority)}>
                      {result.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {result.pdf_upload_url && result.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(result.pdf_upload_url!, result.test_name)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Report
                  </Button>
                )}
              </div>

              {result.status === 'completed' && (
                <>
                  {result.critical_findings && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Critical Findings:</strong> {result.critical_findings}
                      </AlertDescription>
                    </Alert>
                  )}

                  {result.interpretation && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Interpretation:</p>
                      <p className="text-sm text-muted-foreground">{result.interpretation}</p>
                    </div>
                  )}

                  {result.results && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Results:</p>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-xs whitespace-pre-wrap">
                          {typeof result.results === 'string' 
                            ? result.results 
                            : JSON.stringify(result.results, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              )}

              {result.status === 'pending' && (
                <p className="text-sm text-muted-foreground">
                  Test requested - awaiting lab processing
                </p>
              )}

              {result.status === 'in_progress' && (
                <p className="text-sm text-muted-foreground">
                  Test in progress - results pending
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};