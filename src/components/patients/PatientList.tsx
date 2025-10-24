import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Phone, Calendar, IdCard, User, MapPin, Mail, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  date_of_birth: string | null;
  gender: string | null;
  government_id: string | null;
  address: string | null;
  email: string | null;
  created_at: string;
}

export const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToQueue, setAddingToQueue] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        () => {
          fetchPatients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, phone, date_of_birth, gender, government_id, address, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load patients');
      setLoading(false);
      return;
    }

    setPatients(data || []);
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddToVitalsQueue = async (patientId: string) => {
    setAddingToQueue(patientId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Generate token number
      const tokenNumber = `T${Math.floor(Math.random() * 9000) + 1000}`;
      
      // Create appointment with checked_in status
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          status: 'checked_in',
          appointment_type: 'walk-in',
          department: 'Cardiology',
          token_number: tokenNumber,
          scheduled_time: new Date().toISOString(),
          created_by: user.id
        });

      if (error) throw error;

      toast.success('Patient added to vitals queue (Cardiology)');
    } catch (error: any) {
      console.error('Error adding patient to queue:', error);
      toast.error('Failed to add patient to vitals queue');
    } finally {
      setAddingToQueue(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Registered Patients</CardTitle>
        </div>
        <CardDescription>
          {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {patients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No patients registered yet</p>
            <p className="text-sm mt-2">Register patients using the form above</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {patients.map((patient) => (
              <AccordionItem 
                key={patient.id} 
                value={patient.id}
                className="border rounded-lg px-4 hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">{patient.full_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                        {patient.gender && (
                          <Badge variant="outline" className="capitalize">
                            {patient.gender}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 pt-4 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Date of Birth
                        </div>
                        <div className="font-medium">{formatDate(patient.date_of_birth)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <IdCard className="h-3 w-3" />
                          Government ID
                        </div>
                        <div className="font-medium">
                          {patient.government_id || <span className="text-muted-foreground">N/A</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </div>
                        <div className="font-medium">
                          {patient.email || <span className="text-muted-foreground">N/A</span>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Registered
                        </div>
                        <div className="font-medium">{formatDate(patient.created_at)}</div>
                      </div>
                    </div>

                    {patient.address && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Address
                        </div>
                        <div className="font-medium">{patient.address}</div>
                      </div>
                    )}

                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleAddToVitalsQueue(patient.id)}
                      disabled={addingToQueue === patient.id}
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      {addingToQueue === patient.id ? 'Adding...' : 'Add to Vitals Queue'}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
