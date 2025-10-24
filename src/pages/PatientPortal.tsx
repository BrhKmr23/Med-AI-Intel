import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePatientAuth } from '@/lib/patientAuth';
import { PatientDashboardLayout } from '@/components/patient/PatientDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Calendar, Activity, FileText, Pill, TestTube, Receipt, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PatientPortal = () => {
  const { user, patientId, loading: authLoading } = usePatientAuth();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);

  useEffect(() => {
    if (patientId && !authLoading) {
      fetchPatientData();
    } else if (!authLoading && !patientId) {
      setLoading(false);
    }
  }, [patientId, authLoading]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient info
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      setPatientData(patient);

      // Fetch appointments
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, profiles(full_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setAppointments(appts || []);

      // Fetch vitals
      const { data: vit } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(10);
      
      setVitals(vit || []);

      // Fetch prescriptions
      const { data: presc } = await supabase
        .from('prescriptions')
        .select('*, profiles(full_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setPrescriptions(presc || []);

      // Fetch lab orders
      const { data: labs } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setLabOrders(labs || []);

      // Fetch consultations
      const { data: consult } = await supabase
        .from('consultations')
        .select('*, profiles(full_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setConsultations(consult || []);

      // Fetch billing
      const { data: bills } = await supabase
        .from('billing')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setBilling(bills || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <PatientDashboardLayout patientName={patientData?.full_name}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PatientDashboardLayout>
    );
  }

  return (
    <PatientDashboardLayout patientName={patientData?.full_name}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="appointments"><Calendar className="h-4 w-4 mr-2" />Appointments</TabsTrigger>
          <TabsTrigger value="vitals"><Activity className="h-4 w-4 mr-2" />Vitals</TabsTrigger>
          <TabsTrigger value="consultations"><FileText className="h-4 w-4 mr-2" />Consultations</TabsTrigger>
          <TabsTrigger value="prescriptions"><Pill className="h-4 w-4 mr-2" />Prescriptions</TabsTrigger>
          <TabsTrigger value="labs"><TestTube className="h-4 w-4 mr-2" />Lab Results</TabsTrigger>
          <TabsTrigger value="billing"><Receipt className="h-4 w-4 mr-2" />Billing</TabsTrigger>
          <TabsTrigger value="history"><Heart className="h-4 w-4 mr-2" />History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{patientData?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{patientData?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{patientData?.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{patientData?.date_of_birth ? format(new Date(patientData.date_of_birth), 'PPP') : 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{patientData?.gender || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{patientData?.blood_group || 'Not specified'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{patientData?.address || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          {(patientData?.allergies?.length > 0 || patientData?.comorbidities?.length > 0) && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Important Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patientData?.allergies?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {patientData.allergies.map((allergy: string, idx: number) => (
                        <Badge key={idx} variant="destructive">{allergy}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patientData?.comorbidities?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Comorbidities</p>
                    <div className="flex flex-wrap gap-2">
                      {patientData.comorbidities.map((condition: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{condition}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Your appointment history</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No appointments found</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <div key={appt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{appt.department}</p>
                          <p className="text-sm text-muted-foreground">Token: {appt.token_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appt.created_at), 'PPp')}
                          </p>
                        </div>
                        <Badge>{appt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Your recorded vital signs</CardDescription>
            </CardHeader>
            <CardContent>
              {vitals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No vitals recorded</p>
              ) : (
                <div className="space-y-4">
                  {vitals.map((vital) => (
                    <div key={vital.id} className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {format(new Date(vital.recorded_at), 'PPp')}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vital.bp_systolic && (
                          <div>
                            <p className="text-sm text-muted-foreground">Blood Pressure</p>
                            <p className="font-medium">{vital.bp_systolic}/{vital.bp_diastolic} mmHg</p>
                          </div>
                        )}
                        {vital.heart_rate && (
                          <div>
                            <p className="text-sm text-muted-foreground">Heart Rate</p>
                            <p className="font-medium">{vital.heart_rate} bpm</p>
                          </div>
                        )}
                        {vital.temperature && (
                          <div>
                            <p className="text-sm text-muted-foreground">Temperature</p>
                            <p className="font-medium">{vital.temperature}°F</p>
                          </div>
                        )}
                        {vital.spo2 && (
                          <div>
                            <p className="text-sm text-muted-foreground">SpO2</p>
                            <p className="font-medium">{vital.spo2}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>Consultations</CardTitle>
              <CardDescription>Your consultation history</CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No consultations found</p>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consult) => (
                    <div key={consult.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{consult.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(consult.created_at), 'PPP')}
                        </p>
                      </div>
                      {consult.diagnosis && (
                        <div>
                          <p className="text-sm font-medium">Diagnosis</p>
                          <p className="text-sm text-muted-foreground">{consult.diagnosis}</p>
                        </div>
                      )}
                      {consult.treatment_plan && (
                        <div>
                          <p className="text-sm font-medium">Treatment Plan</p>
                          <p className="text-sm text-muted-foreground">{consult.treatment_plan}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>Your medication history</CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No prescriptions found</p>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((presc) => (
                    <div key={presc.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{presc.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(presc.created_at), 'PPP')}
                          </p>
                        </div>
                        <Badge variant={presc.status === 'dispensed' ? 'default' : 'secondary'}>
                          {presc.status}
                        </Badge>
                      </div>
                      {presc.medications && (
                        <div className="space-y-2">
                          {Array.isArray(presc.medications) && presc.medications.map((med: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium">{med.name || med.drug_name}</p>
                              <p className="text-muted-foreground">
                                {med.dosage} - {med.frequency} for {med.duration}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Results</CardTitle>
              <CardDescription>Your test results</CardDescription>
            </CardHeader>
            <CardContent>
              {labOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No lab results found</p>
              ) : (
                <div className="space-y-4">
                  {labOrders.map((lab) => (
                    <div key={lab.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{lab.test_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(lab.created_at), 'PPP')}
                          </p>
                        </div>
                        <Badge variant={lab.status === 'completed' ? 'default' : 'secondary'}>
                          {lab.status}
                        </Badge>
                      </div>
                      {lab.critical_findings && (
                        <p className="text-sm text-destructive mt-2">
                          Critical: {lab.critical_findings}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payments</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </CardHeader>
            <CardContent>
              {billing.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No billing records found</p>
              ) : (
                <div className="space-y-4">
                  {billing.map((bill) => (
                    <div key={bill.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Total: ${Number(bill.total).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(bill.created_at), 'PPP')}
                          </p>
                        </div>
                        <Badge variant={bill.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {bill.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Your complete medical history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patientData?.allergies?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {patientData.allergies.map((allergy: string, idx: number) => (
                        <Badge key={idx} variant="destructive">{allergy}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patientData?.comorbidities?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Chronic Conditions</h3>
                    <div className="flex flex-wrap gap-2">
                      {patientData.comorbidities.map((condition: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{condition}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patientData?.emergency_contact_name && (
                  <div>
                    <h3 className="font-medium mb-2">Emergency Contact</h3>
                    <p className="text-sm">{patientData.emergency_contact_name}</p>
                    <p className="text-sm text-muted-foreground">{patientData.emergency_contact_phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PatientDashboardLayout>
  );
};

export default PatientPortal;
