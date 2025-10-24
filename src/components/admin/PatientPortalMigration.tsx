import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

export const PatientPortalMigration = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createPortalAccess = async () => {
    if (!selectedPatientId || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/patient-login`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      // Assign patient role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'patient',
        });

      if (roleError) throw roleError;

      // Create portal user entry
      const { error: portalError } = await supabase
        .from('patient_portal_users')
        .insert({
          id: authData.user.id,
          patient_id: selectedPatientId,
          email: email,
          is_active: true,
          email_verified: false,
        });

      if (portalError) throw portalError;

      toast.success('Portal access created successfully!');
      setSelectedPatientId('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Portal creation error:', error);
      toast.error(error.message || 'Failed to create portal access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create Patient Portal Access
        </CardTitle>
        <CardDescription>
          Create portal access for existing patients who don't have one yet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            placeholder="Enter patient UUID"
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <Button
          onClick={createPortalAccess}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Portal Access...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Portal Access
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
