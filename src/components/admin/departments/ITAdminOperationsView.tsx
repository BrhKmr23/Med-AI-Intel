import { UserManagement } from '@/components/admin/UserManagement';
import { SampleDataSetup } from '@/components/admin/SampleDataSetup';
import { PatientPortalMigration } from '@/components/admin/PatientPortalMigration';
import { BiomedicalEquipment } from '@/components/admin/BiomedicalEquipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ITAdminOperationsView = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            IT Administration - System Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage users, system configuration, equipment, security, and integrations.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="data">Sample Data</TabsTrigger>
          <TabsTrigger value="portal">Patient Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <BiomedicalEquipment />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <SampleDataSetup />
        </TabsContent>

        <TabsContent value="portal" className="mt-6">
          <PatientPortalMigration />
        </TabsContent>
      </Tabs>

      <Card className="border-2 border-blue-500/20">
        <CardHeader className="bg-blue-500/5">
          <CardTitle className="flex items-center gap-2 text-blue-500">
            <Shield className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">Operational</div>
              <p className="text-sm text-muted-foreground">Database</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">Active</div>
              <p className="text-sm text-muted-foreground">Authentication</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">Secure</div>
              <p className="text-sm text-muted-foreground">Configuration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
