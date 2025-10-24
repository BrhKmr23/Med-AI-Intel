import { DashboardLayout } from '@/components/dashboards/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ambulance, ClipboardList, Stethoscope, FileText, Bed } from 'lucide-react';
import { AmbulanceDispatch } from '@/components/emergency/AmbulanceDispatch';
import { TriageRegistration } from '@/components/emergency/TriageRegistration';
import { TreatmentOrders } from '@/components/emergency/TreatmentOrders';
import { SpecialCases } from '@/components/emergency/SpecialCases';
import { BedAllocation } from '@/components/emergency/BedAllocation';
import { mockEmergencyCases } from '@/data/emergencyMockData';

const Emergency = () => {
  const stats = {
    critical: mockEmergencyCases.filter(c => c.triageLevel === 'red').length,
    urgent: mockEmergencyCases.filter(c => c.triageLevel === 'orange').length,
    enRoute: mockEmergencyCases.filter(c => c.status === 'ambulance').length,
    inTriage: mockEmergencyCases.filter(c => c.status === 'triage').length,
  };

  return (
    <DashboardLayout title="Emergency Department Workflow">
      <div className="space-y-6">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Patients</p>
                  <p className="text-3xl font-bold text-destructive">{stats.critical}</p>
                </div>
                <div className="text-4xl">🚨</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent Cases</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.urgent}</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ambulances En Route</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.enRoute}</p>
                </div>
                <Ambulance className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Triage</p>
                  <p className="text-3xl font-bold text-green-600">{stats.inTriage}</p>
                </div>
                <ClipboardList className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Emergency Workflow */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="dispatch" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dispatch" className="flex items-center gap-2">
                  <Ambulance className="h-4 w-4" />
                  <span className="hidden md:inline">Ambulance Dispatch</span>
                  <span className="md:hidden">Dispatch</span>
                </TabsTrigger>
                <TabsTrigger value="triage" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden md:inline">Triage & Registration</span>
                  <span className="md:hidden">Triage</span>
                </TabsTrigger>
                <TabsTrigger value="treatment" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  <span className="hidden md:inline">Treatment & Orders</span>
                  <span className="md:hidden">Treatment</span>
                </TabsTrigger>
                <TabsTrigger value="special" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">Special Cases</span>
                  <span className="md:hidden">Special</span>
                </TabsTrigger>
                <TabsTrigger value="beds" className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span className="hidden md:inline">Bed Allocation</span>
                  <span className="md:hidden">Beds</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dispatch">
                <AmbulanceDispatch />
              </TabsContent>

              <TabsContent value="triage">
                <TriageRegistration />
              </TabsContent>

              <TabsContent value="treatment">
                <TreatmentOrders />
              </TabsContent>

              <TabsContent value="special">
                <SpecialCases />
              </TabsContent>

              <TabsContent value="beds">
                <BedAllocation />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Emergency;
