import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboards/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BedDouble, Users, Activity, Utensils, ChefHat, Heart, Scissors, Stethoscope, UserCog, Wrench, Clipboard } from 'lucide-react';
import WardManagement from '@/components/inpatient/WardManagement';
import ICUMonitoring from '@/components/inpatient/ICUMonitoring';
import DietNutrition from '@/components/inpatient/DietNutrition';
import KitchenOperations from '@/components/inpatient/KitchenOperations';
import TherapyManagement from '@/components/inpatient/TherapyManagement';
import OTScheduling from '@/components/inpatient/OTScheduling';
import HealthCheckManagement from '@/components/inpatient/HealthCheckManagement';
import StaffDeployment from '@/components/inpatient/StaffDeployment';
import EquipmentManagement from '@/components/inpatient/EquipmentManagement';
import { mockInpatientBeds, mockInpatientRecords, mockICUPatients } from '@/data/inpatientMockData';

const Inpatient = () => {
  const [activeTab, setActiveTab] = useState('ward');

  const occupiedBeds = mockInpatientBeds.filter(b => b.status === 'Occupied').length;
  const totalBeds = mockInpatientBeds.length;
  const criticalPatients = mockInpatientRecords.filter(p => p.status === 'Critical').length;
  const icuPatients = mockICUPatients.length;

  return (
    <DashboardLayout title="Inpatient Management Workflow">
      <div className="space-y-6">
        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BedDouble className="h-4 w-4" />
                Total Beds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalBeds}</div>
              <div className="text-xs text-muted-foreground mt-1">Occupied: {occupiedBeds}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Inpatients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{mockInpatientRecords.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Active admissions</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Critical Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalPatients}</div>
              <div className="text-xs text-muted-foreground mt-1">Require immediate attention</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                ICU Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{icuPatients}</div>
              <div className="text-xs text-muted-foreground mt-1">In intensive care</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto">
            <TabsTrigger value="ward" className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              <span className="hidden sm:inline">Ward</span>
            </TabsTrigger>
            <TabsTrigger value="icu" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">ICU</span>
            </TabsTrigger>
            <TabsTrigger value="diet" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Diet</span>
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Kitchen</span>
            </TabsTrigger>
            <TabsTrigger value="therapy" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Therapy</span>
            </TabsTrigger>
            <TabsTrigger value="ot" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              <span className="hidden sm:inline">OT</span>
            </TabsTrigger>
            <TabsTrigger value="healthcheck" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span className="hidden sm:inline">MHC</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Equipment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ward" className="mt-6">
            <WardManagement />
          </TabsContent>

          <TabsContent value="icu" className="mt-6">
            <ICUMonitoring />
          </TabsContent>

          <TabsContent value="diet" className="mt-6">
            <DietNutrition />
          </TabsContent>

          <TabsContent value="kitchen" className="mt-6">
            <KitchenOperations />
          </TabsContent>

          <TabsContent value="therapy" className="mt-6">
            <TherapyManagement />
          </TabsContent>

          <TabsContent value="ot" className="mt-6">
            <OTScheduling />
          </TabsContent>

          <TabsContent value="healthcheck" className="mt-6">
            <HealthCheckManagement />
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
            <StaffDeployment />
          </TabsContent>

          <TabsContent value="equipment" className="mt-6">
            <EquipmentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Inpatient;
