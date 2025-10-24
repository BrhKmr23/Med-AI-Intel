import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

export const SearchPatientTab = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearchPatient = async () => {
    if (!searchQuery) {
      toast.error('Please enter patient name or ID');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        appointments(*)
      `)
      .or(`full_name.ilike.%${searchQuery}%,id.eq.${searchQuery}`);

    if (error) {
      toast.error('Search failed');
      setSearchResults([]);
    } else {
      setSearchResults(data || []);
      if (data && data.length === 0) {
        toast.info('No patients found');
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by patient name or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSearchPatient} 
          disabled={loading}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4 mt-4">
          {searchResults.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle className="text-lg">{patient.full_name}</CardTitle>
                <CardDescription>
                  Phone: {patient.phone} | Gender: {patient.gender || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">DOB:</span> {patient.date_of_birth || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Gov ID:</span> {patient.government_id || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {patient.email || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Address:</span> {patient.address || 'N/A'}
                  </p>
                  {patient.appointments && patient.appointments.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-sm mb-2">Recent Appointments:</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.appointments.slice(0, 3).map((apt: any) => (
                          <Badge key={apt.id} variant="outline">
                            {apt.token_number} - {apt.department}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No patients found with this name or ID</p>
        </div>
      )}
    </div>
  );
};
