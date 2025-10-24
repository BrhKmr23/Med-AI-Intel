import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Pill, Beaker, X, ClipboardList, AlertCircle } from 'lucide-react';
import { mockEmergencyCases } from '@/data/emergencyMockData';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const TreatmentOrders = () => {
  const [mlcDialogOpen, setMlcDialogOpen] = useState(false);
  const treatmentCases = mockEmergencyCases.filter(c => c.status === 'treatment');

  const handleOrderLab = () => {
    toast({
      title: "Lab Order Sent",
      description: "Order sent to laboratory. STAT processing initiated.",
    });
  };

  const handleOrderImaging = () => {
    toast({
      title: "Imaging Order Sent",
      description: "Radiology department notified. Patient transport arranged.",
    });
  };

  const handleMedicationOrder = () => {
    toast({
      title: "Medication Ordered",
      description: "Order sent to pharmacy. Nurse will administer.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Patient Case Dashboard */}
      <div className="grid grid-cols-3 gap-4">
        {treatmentCases.map((patient) => (
          <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{patient.patientName}</CardTitle>
                  <CardDescription className="text-xs">{patient.emergencyNumber}</CardDescription>
                </div>
                <Badge variant={patient.triageLevel === 'red' ? 'destructive' : 'default'}>
                  {patient.triageLevel.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{patient.chiefComplaint}</p>
              <div className="flex gap-2 text-xs">
                {patient.isMLC && <Badge variant="destructive" className="text-xs">MLC</Badge>}
                <Badge variant="outline" className="text-xs">Score: {patient.triageScore}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Treatment Orders Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Treatment Orders & Assessment
          </CardTitle>
          <CardDescription>Doctor's orders and disposition decision</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assessment">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="investigations">Investigations</TabsTrigger>
              <TabsTrigger value="disposition">Disposition</TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="space-y-4">
              <div className="space-y-2">
                <Label>History of Present Illness (HPI)</Label>
                <Textarea placeholder="Document presenting complaint, onset, duration, associated symptoms..." rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Physical Examination</Label>
                <Textarea placeholder="General appearance, vitals, system examination findings..." rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Initial Diagnosis (ICD-10)</Label>
                <Input placeholder="Search and select diagnosis code..." />
              </div>

              <div className="space-y-2">
                <Label>Differential Diagnoses</Label>
                <Textarea placeholder="List possible alternative diagnoses..." rows={2} />
              </div>
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medication Name</Label>
                  <Input placeholder="Search medication..." />
                </div>
                <div className="space-y-2">
                  <Label>Dose & Route</Label>
                  <Input placeholder="e.g., 500mg IV" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input placeholder="e.g., STAT, Q6H" />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input placeholder="e.g., 3 days" />
                </div>
              </div>

              <Button onClick={handleMedicationOrder} className="w-full">
                <Pill className="mr-2 h-4 w-4" />
                Add Medication Order
              </Button>

              <div className="border rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-sm">Current Orders</h4>
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <div>
                    <p className="text-sm font-medium">Morphine 5mg IV</p>
                    <p className="text-xs text-muted-foreground">STAT - For pain</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <div>
                    <p className="text-sm font-medium">NS 1000ml IV</p>
                    <p className="text-xs text-muted-foreground">Over 1 hour</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="investigations" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  STAT Laboratory Orders
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleOrderLab}>
                    CBC with Differential
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderLab}>
                    Cardiac Panel (Troponin, CK-MB)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderLab}>
                    Electrolytes & RFT
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderLab}>
                    Liver Function Tests
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderLab}>
                    Coagulation Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderLab}>
                    Blood Culture
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Imaging Orders
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleOrderImaging}>
                    Chest X-Ray (AP/PA)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderImaging}>
                    CT Scan - Head
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderImaging}>
                    CT Scan - Abdomen
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderImaging}>
                    Ultrasound - Abdomen
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderImaging}>
                    ECG (12-Lead)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOrderImaging}>
                    Echocardiography
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3 bg-muted/30">
                <h4 className="font-semibold text-sm mb-2">Order Tracking</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>CBC with Differential</span>
                    <Badge variant="outline" className="bg-orange-500 text-white">Processing</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cardiac Panel</span>
                    <Badge variant="outline" className="bg-green-500 text-white">Result Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Chest X-Ray</span>
                    <Badge variant="outline" className="bg-blue-500 text-white">Patient Sent</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="disposition" className="space-y-4">
              <div className="space-y-2">
                <Label>Final Disposition Decision</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <span className="text-lg mb-1">🏥</span>
                    <span className="font-semibold">Admit to Ward</span>
                    <span className="text-xs text-muted-foreground">General care</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <span className="text-lg mb-1">🏥</span>
                    <span className="font-semibold">Admit to ICU</span>
                    <span className="text-xs text-muted-foreground">Critical care</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <span className="text-lg mb-1">👁️</span>
                    <span className="font-semibold">Observation</span>
                    <span className="text-xs text-muted-foreground">&lt; 24 hours</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <span className="text-lg mb-1">🏠</span>
                    <span className="font-semibold">Discharge</span>
                    <span className="text-xs text-muted-foreground">With follow-up</span>
                  </Button>
                </div>
              </div>

              <Dialog open={mlcDialogOpen} onOpenChange={setMlcDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Register as Medico-Legal Case (MLC)
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>MLC Documentation System</DialogTitle>
                    <DialogDescription>
                      Medico-Legal Case registration and documentation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                      <Label>Case Type</Label>
                      <Input placeholder="e.g., RTA, Assault, Poisoning" />
                    </div>

                    <div className="space-y-2">
                      <Label>Injury Description</Label>
                      <Textarea placeholder="Describe injuries, mechanism, evidence..." rows={4} />
                    </div>

                    <div className="space-y-2">
                      <Label>Police Station Notified</Label>
                      <Input placeholder="Enter police station name" />
                    </div>

                    <div className="space-y-2">
                      <Label>FIR Number (if available)</Label>
                      <Input placeholder="Enter FIR number" />
                    </div>

                    <div className="border rounded-lg p-3 bg-muted/30">
                      <h4 className="font-semibold text-sm mb-2">Evidence Checklist</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="photos" />
                          <label htmlFor="photos">Injury photographs taken</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="clothes" />
                          <label htmlFor="clothes">Clothing preserved</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="samples" />
                          <label htmlFor="samples">Biological samples collected</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="police" />
                          <label htmlFor="police">Police intimation form signed</label>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => {
                      toast({
                        title: "MLC Registered",
                        description: "Police notification sent. Secure audit trail initiated.",
                      });
                      setMlcDialogOpen(false);
                    }}>
                      Submit MLC Documentation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
