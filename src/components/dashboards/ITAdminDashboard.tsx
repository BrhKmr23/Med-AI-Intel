import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { BiomedicalEquipment } from '@/components/admin/BiomedicalEquipment';
import { MedicalGasTracking } from '@/components/admin/MedicalGasTracking';
import { PatientPorter } from '@/components/admin/PatientPorter';
import { FeedbackManagement } from '@/components/admin/FeedbackManagement';
import { SystemsIntegration } from '@/components/admin/SystemsIntegration';
import { ComplianceManagement } from '@/components/admin/ComplianceManagement';
import { FacilityManagement } from '@/components/admin/FacilityManagement';
import { ITServiceManagement } from '@/components/admin/ITServiceManagement';
import { ClinicalSupport } from '@/components/admin/ClinicalSupport';
import { Settings, Database, Shield, Activity } from 'lucide-react';

export const ITAdminDashboard = () => {
  return (
    <DashboardLayout title="IT Administration">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">RLS enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Optimal</div>
            <p className="text-xs text-muted-foreground">All settings configured</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="gas">Gas</TabsTrigger>
          <TabsTrigger value="porter">Porter</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="facility">Facility</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Core system configuration and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Backend Type</p>
                      <p className="text-sm text-muted-foreground">Lovable Cloud (PostgreSQL)</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Authentication</p>
                      <p className="text-sm text-muted-foreground">Enabled</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Real-time Updates</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">API Status</p>
                      <p className="text-sm text-muted-foreground">Running</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security & Access Control</CardTitle>
                <CardDescription>Row-level security and access policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">✓ Row-Level Security (RLS) enabled on all tables</p>
                  <p className="text-sm">✓ Role-based access control configured</p>
                  <p className="text-sm">✓ Secure authentication with email verification</p>
                  <p className="text-sm">✓ Database functions use security definer</p>
                </div>
              </CardContent>
            </Card>

            <ITServiceManagement />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="equipment">
          <BiomedicalEquipment />
        </TabsContent>

        <TabsContent value="gas">
          <MedicalGasTracking />
        </TabsContent>

        <TabsContent value="porter">
          <PatientPorter />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackManagement />
        </TabsContent>

        <TabsContent value="integration">
          <SystemsIntegration />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceManagement />
        </TabsContent>

        <TabsContent value="facility">
          <FacilityManagement />
        </TabsContent>

        <TabsContent value="clinical">
          <ClinicalSupport />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};
