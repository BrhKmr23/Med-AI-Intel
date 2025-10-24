import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string | null;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone');

    if (profilesError) {
      toast.error('Failed to fetch users');
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const usersWithRoles = profiles.map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.id);
      return {
        ...profile,
        email: '',
        role: userRole?.role || null,
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const assignRole = async (userId: string, role: string) => {
    // Delete existing roles for this user first
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Insert new role
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: role as any });

    if (error) {
      toast.error('Failed to assign role');
    } else {
      toast.success('Role assigned successfully');
      fetchUsers();
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'doctor':
        return 'bg-secondary text-secondary-foreground';
      case 'nurse':
        return 'bg-accent text-accent-foreground';
      case 'receptionist':
        return 'bg-muted text-muted-foreground';
      case 'pharmacist':
        return 'bg-green-500 text-white';
      case 'billing_staff':
        return 'bg-blue-500 text-white';
      case 'lab_technician':
        return 'bg-purple-500 text-white';
      case 'it_admin':
        return 'bg-orange-500 text-white';
      case 'patient':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
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
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Assign roles to registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users registered yet</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  {user.role ? (
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  ) : (
                    <Badge variant="outline">NO ROLE</Badge>
                  )}
                  
                  <Select
                    value={user.role || ''}
                    onValueChange={(value) => assignRole(user.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="billing_staff">Billing Staff</SelectItem>
                      <SelectItem value="lab_technician">Lab Technician</SelectItem>
                      <SelectItem value="it_admin">IT Admin</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};