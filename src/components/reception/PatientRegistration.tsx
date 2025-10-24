import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, Search } from 'lucide-react';
import { SearchPatientTab } from './SearchPatientTab';

export const PatientRegistration = () => {
  const [loading, setLoading] = useState(false);
  
  // Registration form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [department, setDepartment] = useState('');
  const [appointmentType, setAppointmentType] = useState('walk-in');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  
  // Portal access fields
  const [createPortalAccess, setCreatePortalAccess] = useState(false);
  const [portalPassword, setPortalPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phone || !department) {
      toast.error('Please fill in required fields');
      return;
    }

    if (createPortalAccess) {
      if (!email) {
        toast.error('Email is required for portal access');
        return;
      }
      if (!portalPassword || portalPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (portalPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    // Check for duplicate by phone
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('phone', phone)
      .maybeSingle();

    if (existingPatient) {
      toast.error(`Patient already registered: ${existingPatient.full_name}`);
      setLoading(false);
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        setLoading(false);
        return;
      }

      // Create patient
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          full_name: fullName,
          phone: phone,
          government_id: governmentId || null,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          address: address || null,
          email: email || null,
          created_by: user.id
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Create appointment
      const tokenNumber = `TKN${Date.now().toString().slice(-6)}`;
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          department: department,
          appointment_type: appointmentType,
          status: 'checked_in',
          token_number: tokenNumber,
          created_by: user.id
        });

      if (appointmentError) throw appointmentError;

      // Create portal access if requested
      if (createPortalAccess && email && portalPassword) {
        try {
          // Step 1: Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: portalPassword,
            options: {
              emailRedirectTo: `${window.location.origin}/patient-login`,
            },
          });

          if (authError) throw authError;
          if (!authData.user) throw new Error('No user returned from signup');

          // Step 2: Assign patient role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'patient',
            });

          if (roleError) throw roleError;

          // Step 3: Create patient_portal_users entry
          const { error: portalError } = await supabase
            .from('patient_portal_users')
            .insert({
              id: authData.user.id, // This is the auth.users id
              patient_id: patient.id,
              email: email,
              is_active: true,
              email_verified: false,
            });

          if (portalError) throw portalError;

          toast.success(`Portal access created! Login: ${email}`);
        } catch (portalError: any) {
          console.error('Portal creation error:', portalError);
          toast.error('Patient registered but portal access failed: ' + portalError.message);
        }
      }

      toast.success(`Patient registered! Token: ${tokenNumber}`);
      
      // Reset form
      setFullName('');
      setPhone('');
      setGovernmentId('');
      setDateOfBirth('');
      setGender('');
      setDepartment('');
      setAddress('');
      setEmail('');
      setCreatePortalAccess(false);
      setPortalPassword('');
      setConfirmPassword('');
      setLoading(false);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register patient');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Registration & Appointments</CardTitle>
        <CardDescription>Register new patients or search existing records</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="register">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="register">
              <UserPlus className="h-4 w-4 mr-2" />
              New Patient
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search Patient
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name *</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gov-id">Government ID</Label>
                  <Input
                    id="gov-id"
                    value={governmentId}
                    onChange={(e) => setGovernmentId(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="portal-access"
                    checked={createPortalAccess}
                    onCheckedChange={(checked) => setCreatePortalAccess(checked as boolean)}
                  />
                  <Label htmlFor="portal-access" className="font-medium cursor-pointer">
                    Create Patient Portal Access
                  </Label>
                </div>

                {createPortalAccess && (
                  <div className="space-y-4 pl-6 border-l-2">
                    <div className="space-y-2">
                      <Label htmlFor="portal-email">Portal Email *</Label>
                      <Input
                        id="portal-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        required={createPortalAccess}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portal-password">Portal Password *</Label>
                      <Input
                        id="portal-password"
                        type="password"
                        value={portalPassword}
                        onChange={(e) => setPortalPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required={createPortalAccess}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password *</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required={createPortalAccess}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in</SelectItem>
                    <SelectItem value="scheduled">Scheduled Appointment</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register & Check-in'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="search">
            <SearchPatientTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};