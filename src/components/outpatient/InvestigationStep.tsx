import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pill, FlaskConical, Scan, Scissors, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InvestigationStepProps {
  onStepComplete: () => void;
}

export default function InvestigationStep({ onStepComplete }: InvestigationStepProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderType, setOrderType] = useState<'medicine' | 'lab' | 'radiology' | 'procedure'>('medicine');

  // Order form state
  const [orderDetails, setOrderDetails] = useState<any>({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .select(`
          id,
          token_number,
          patients (id, full_name, phone)
        `)
        .eq('current_step', 'consultation')
        .order('visit_date', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const loadOrders = async (visit: any) => {
    setSelectedVisit(visit);
    try {
      const { data, error } = await supabase
        .from('investigation_orders')
        .select('*')
        .eq('visit_id', visit.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedVisit) return;

    try {
      const { error } = await supabase
        .from('investigation_orders')
        .insert({
          visit_id: selectedVisit.id,
          patient_id: selectedVisit.patients.id,
          doctor_id: user?.id,
          order_type: orderType,
          order_details: orderDetails,
          status: 'ordered'
        });

      if (error) throw error;

      toast.success("Order created successfully");
      setShowOrderDialog(false);
      setOrderDetails({});
      loadOrders(selectedVisit);
      onStepComplete();

      // Update visit step
      await supabase
        .from('outpatient_visits')
        .update({ current_step: 'investigation' })
        .eq('id', selectedVisit.id);
    } catch (error: any) {
      toast.error("Failed to create order: " + error.message);
    }
  };

  const getOrderIcon = (type: string) => {
    switch (type) {
      case 'medicine': return <Pill className="h-4 w-4" />;
      case 'lab': return <FlaskConical className="h-4 w-4" />;
      case 'radiology': return <Scan className="h-4 w-4" />;
      case 'procedure': return <Scissors className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Patient List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Patients</h3>
        <div className="space-y-2 max-h-[700px] overflow-y-auto">
          {patients.map((visit) => (
            <button
              key={visit.id}
              onClick={() => loadOrders(visit)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                selectedVisit?.id === visit.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
              }`}
            >
              <p className="font-medium text-sm">{visit.patients.full_name}</p>
              <p className="text-xs text-muted-foreground">{visit.token_number}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Orders Panel */}
      <Card className="lg:col-span-3 p-6">
        {!selectedVisit ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <FlaskConical className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select a Patient</h3>
            <p className="text-muted-foreground">Choose a patient to manage investigations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedVisit.patients.full_name}</h2>
                <p className="text-muted-foreground">Investigation Orders</p>
              </div>
              <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Order Type</Label>
                      <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medicine">Medicine (Pharmacy)</SelectItem>
                          <SelectItem value="lab">Laboratory Test</SelectItem>
                          <SelectItem value="radiology">Radiology/Imaging</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {orderType === 'medicine' && (
                      <div className="space-y-3">
                        <div>
                          <Label>Medicine Name</Label>
                          <Input
                            value={orderDetails.medicine_name || ''}
                            onChange={(e) => setOrderDetails({...orderDetails, medicine_name: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Dosage</Label>
                          <Input
                            value={orderDetails.dosage || ''}
                            onChange={(e) => setOrderDetails({...orderDetails, dosage: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Frequency</Label>
                          <Input
                            value={orderDetails.frequency || ''}
                            onChange={(e) => setOrderDetails({...orderDetails, frequency: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}

                    {orderType === 'lab' && (
                      <div className="space-y-3">
                        <div>
                          <Label>Test Name</Label>
                          <Select 
                            value={orderDetails.test_name || ''} 
                            onValueChange={(value) => setOrderDetails({...orderDetails, test_name: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cbc">Complete Blood Count (CBC)</SelectItem>
                              <SelectItem value="lft">Liver Function Test (LFT)</SelectItem>
                              <SelectItem value="rft">Renal Function Test (RFT)</SelectItem>
                              <SelectItem value="glucose">Blood Glucose</SelectItem>
                              <SelectItem value="lipid">Lipid Profile</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Select 
                            value={orderDetails.priority || 'routine'} 
                            onValueChange={(value) => setOrderDetails({...orderDetails, priority: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="routine">Routine</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="stat">STAT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {orderType === 'radiology' && (
                      <div className="space-y-3">
                        <div>
                          <Label>Imaging Type</Label>
                          <Select 
                            value={orderDetails.imaging_type || ''} 
                            onValueChange={(value) => setOrderDetails({...orderDetails, imaging_type: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select imaging type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="xray">X-Ray</SelectItem>
                              <SelectItem value="ct">CT Scan</SelectItem>
                              <SelectItem value="mri">MRI</SelectItem>
                              <SelectItem value="ultrasound">Ultrasound</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Body Part/Region</Label>
                          <Input
                            value={orderDetails.body_part || ''}
                            onChange={(e) => setOrderDetails({...orderDetails, body_part: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}

                    {orderType === 'procedure' && (
                      <div className="space-y-3">
                        <div>
                          <Label>Procedure Name</Label>
                          <Input
                            value={orderDetails.procedure_name || ''}
                            onChange={(e) => setOrderDetails({...orderDetails, procedure_name: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={orderDetails.description || ''}
                            onChange={(e) => setOrderDetails({...orderDetails, description: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={orderDetails.notes || ''}
                        onChange={(e) => setOrderDetails({...orderDetails, notes: e.target.value})}
                        className="mt-2"
                      />
                    </div>

                    <Button onClick={handleCreateOrder} className="w-full">
                      Create Order
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Orders List */}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="medicine">Medicines</TabsTrigger>
                <TabsTrigger value="lab">Lab</TabsTrigger>
                <TabsTrigger value="radiology">Radiology</TabsTrigger>
                <TabsTrigger value="procedure">Procedures</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders yet</p>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {getOrderIcon(order.order_type)}
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{order.order_type}</p>
                              <p className="text-sm text-muted-foreground">
                                {JSON.stringify(order.order_details)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {['medicine', 'lab', 'radiology', 'procedure'].map(type => (
                <TabsContent key={type} value={type} className="mt-4">
                  <div className="space-y-3">
                    {orders.filter(o => o.order_type === type).length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No {type} orders</p>
                    ) : (
                      orders.filter(o => o.order_type === type).map((order) => (
                        <Card key={order.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{JSON.stringify(order.order_details)}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </Card>
    </div>
  );
}
