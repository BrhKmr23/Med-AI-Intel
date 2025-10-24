import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, TestTube, CheckCircle, Clock, Wrench, AlertTriangle, Download, Edit, Trash2, Plus, Send, Package, Upload, Scan, CheckSquare, FileText } from 'lucide-react';
import { generateLabReportPDF } from '@/utils/pdfGenerator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface LabOrder {
  id: string;
  patient_id: string;
  doctor_id?: string;
  order_type: string;
  test_name: string;
  priority: string;
  status: string;
  results: any;
  notes?: string;
  sample_id?: string;
  sample_collected_at?: string;
  sample_received_at?: string;
  report_url?: string;
  pdf_upload_url?: string;
  critical_findings?: string;
  interpretation?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  patients: {
    full_name: string;
    phone: string;
  };
}

interface Equipment {
  id: string;
  equipment_name: string;
  equipment_type: string;
  model_number?: string;
  serial_number?: string;
  manufacturer?: string;
  location: string;
  status: string;
  next_service_date?: string;
  calibration_due_date?: string;
  notes?: string;
}

interface Maintenance {
  id: string;
  equipment_id: string;
  maintenance_type: string;
  scheduled_date: string;
  completed_date?: string;
  status: string;
  priority: string;
  description?: string;
  work_order_number?: string;
  biomedical_equipment?: {
    equipment_name: string;
  };
}

interface OutsourcedTest {
  id: string;
  patient_id: string;
  test_name: string;
  external_lab_name: string;
  external_lab_email: string;
  sent_at?: string;
  received_at?: string;
  status: string;
  sample_id?: string;
  notes?: string;
  patients: {
    full_name: string;
  };
}

const labOrderSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  order_type: z.string().min(1),
  test_name: z.string().min(1),
  priority: z.enum(['routine', 'urgent', 'stat']),
  notes: z.string().optional(),
  pdf_upload_url: z.string().optional(),
});

const sampleCollectionSchema = z.object({
  sample_id: z.string().min(1),
  sample_collected_at: z.string(),
});

const resultEntrySchema = z.object({
  results: z.string().min(1),
  critical_findings: z.string().optional(),
  interpretation: z.string().optional(),
});

const equipmentSchema = z.object({
  equipment_name: z.string().min(1, "Equipment name required"),
  equipment_type: z.string().min(1, "Type required"),
  model_number: z.string().optional(),
  serial_number: z.string().optional(),
  manufacturer: z.string().optional(),
  location: z.string().min(1, "Location required"),
  status: z.string().min(1, "Status required"),
  notes: z.string().optional(),
});

const maintenanceSchema = z.object({
  equipment_id: z.string().min(1, "Equipment required"),
  maintenance_type: z.string().min(1, "Type required"),
  scheduled_date: z.string().min(1, "Date required"),
  priority: z.string().min(1, "Priority required"),
  description: z.string().optional(),
  work_order_number: z.string().optional(),
});

const outsourcedTestSchema = z.object({
  patient_id: z.string().min(1, "Patient required"),
  test_name: z.string().min(1, "Test name required"),
  external_lab_name: z.string().min(1, "Lab name required"),
  external_lab_email: z.string().email("Invalid email"),
  sample_id: z.string().optional(),
  notes: z.string().optional(),
});

export const LabTechnicianDashboard = () => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [outsourcedTests, setOutsourcedTests] = useState<OutsourcedTest[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'order' | 'equipment' | 'maintenance' | 'outsourced' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editingLabOrder, setEditingLabOrder] = useState<any>(null);

  const labOrderForm = useForm({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      patient_id: "",
      doctor_id: "",
      order_type: "",
      test_name: "",
      priority: "routine" as const,
      notes: "",
      pdf_upload_url: "",
    },
  });

  const sampleCollectionForm = useForm({
    resolver: zodResolver(sampleCollectionSchema),
    defaultValues: {
      sample_id: "",
      sample_collected_at: new Date().toISOString().slice(0, 16),
    },
  });

  const resultEntryForm = useForm({
    resolver: zodResolver(resultEntrySchema),
    defaultValues: {
      results: "",
      critical_findings: "",
      interpretation: "",
    },
  });

  useEffect(() => {
    fetchOrders();
    fetchEquipment();
    fetchMaintenance();
    fetchOutsourcedTests();
    fetchPatients();
    fetchDoctors();

    const ordersChannel = supabase.channel('lab-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_orders' }, () => fetchOrders())
      .subscribe();

    const equipmentChannel = supabase.channel('equipment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'biomedical_equipment' }, () => fetchEquipment())
      .subscribe();

    const maintenanceChannel = supabase.channel('maintenance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_maintenance' }, () => fetchMaintenance())
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(equipmentChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('lab_orders')
      .select(`*, patients:patient_id (full_name, phone)`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch lab orders');
    else setOrders(data || []);
    setLoading(false);
  };

  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from('biomedical_equipment')
      .select('*')
      .order('equipment_name');
    if (error) toast.error('Failed to fetch equipment');
    else setEquipment(data || []);
  };

  const fetchMaintenance = async () => {
    const { data, error } = await supabase
      .from('equipment_maintenance')
      .select(`*, biomedical_equipment (equipment_name)`)
      .order('scheduled_date', { ascending: false });
    if (error) toast.error('Failed to fetch maintenance records');
    else setMaintenance(data || []);
  };

  const fetchOutsourcedTests = async () => {
    const { data, error } = await supabase
      .from('outsourced_tests')
      .select(`*, patients (full_name)`)
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch outsourced tests');
    else setOutsourcedTests(data || []);
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('id, full_name');
    if (error) toast.error('Failed to fetch patients');
    else setPatients(data || []);
  };

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', (await supabase.from('user_roles').select('user_id').eq('role', 'doctor')).data?.map(r => r.user_id) || []);
    if (error) toast.error('Failed to fetch doctors');
    else setDoctors(data || []);
  };

  const handleGenerateReport = async (order: LabOrder) => {
    try {
      await generateLabReportPDF({
        patientName: order.patients.full_name,
        testName: order.test_name,
        sampleId: order.sample_id || 'N/A',
        results: order.results || {},
        notes: order.notes || '',
      });
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleSaveLabOrder = async (values: z.infer<typeof labOrderSchema>) => {
    try {
      let uploadUrl = values.pdf_upload_url;
      
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `lab-orders/${fileName}`;
        toast('Uploading PDF...');
        uploadUrl = filePath;
      }

      if (editingLabOrder) {
        const { error } = await supabase
          .from('lab_orders')
          .update({ ...values, pdf_upload_url: uploadUrl } as any)
          .eq('id', editingLabOrder.id);

        if (error) throw error;
        toast.success('Lab order updated successfully');
      } else {
        const { error } = await supabase
          .from('lab_orders')
          .insert([{ ...values, pdf_upload_url: uploadUrl, status: 'pending' } as any]);

        if (error) throw error;
        toast.success('Lab order created successfully');
      }
      
      setEditingLabOrder(null);
      labOrderForm.reset();
      setPdfFile(null);
      fetchOrders();
    } catch (error: any) {
      toast.error('Error saving lab order: ' + error.message);
    }
  };

  const handleDeleteLabOrder = async (id: string) => {
    const { error } = await supabase.from('lab_orders').delete().eq('id', id);
    if (error) toast.error('Failed to delete order');
    else {
      toast.success('Order deleted');
      fetchOrders();
    }
  };

  const handleCollectSample = async (values: z.infer<typeof sampleCollectionSchema>) => {
    try {
      const { error } = await supabase
        .from('lab_orders')
        .update({
          sample_id: values.sample_id,
          sample_collected_at: values.sample_collected_at,
          sample_received_at: new Date().toISOString(),
          status: 'in_progress',
        })
        .eq('id', selectedOrder!.id);

      if (error) throw error;

      toast.success('Sample collection logged successfully');
      setCollectionDialogOpen(false);
      sampleCollectionForm.reset();
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error('Error logging sample collection: ' + error.message);
    }
  };

  const handleSaveResults = async (values: z.infer<typeof resultEntrySchema>) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const { error } = await supabase
        .from('lab_orders')
        .update({
          results: JSON.parse(values.results),
          critical_findings: values.critical_findings,
          interpretation: values.interpretation,
          status: 'completed',
          completed_at: new Date().toISOString(),
          technician_id: user?.id,
        })
        .eq('id', selectedOrder!.id);

      if (error) throw error;

      // Auto-create billing entry
      await createBillingEntry(selectedOrder!);

      toast.success('Results saved successfully');
      setResultDialogOpen(false);
      resultEntryForm.reset();
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error('Error saving results: ' + error.message);
    }
  };

  const handleValidateOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('lab_orders')
        .update({
          validated_by: user?.id,
          validated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrder!.id);

      if (error) throw error;

      toast.success('Lab order validated and signed off successfully');
      setValidationDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast.error('Error validating order: ' + error.message);
    }
  };

  const createBillingEntry = async (order: LabOrder) => {
    try {
      const testPrices: any = {
        'Blood Test': 500,
        'Urine Culture': 800,
        'X-Ray': 1200,
        'CT Scan': 5000,
        'MRI': 8000,
        'ECG': 300,
      };

      const amount = testPrices[order.test_name] || 1000;
      
      const { error } = await supabase
        .from('billing')
        .insert({
          patient_id: order.patient_id,
          items: [{ 
            name: order.test_name, 
            quantity: 1, 
            price: amount 
          }],
          subtotal: amount,
          tax: amount * 0.05,
          total: amount * 1.05,
          payment_status: 'pending',
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error creating billing entry:', error);
    }
  };

  const handleSaveEquipment = async (values: z.infer<typeof equipmentSchema>) => {
    if (isEditing && selectedItem) {
      const { error } = await supabase
        .from('biomedical_equipment')
        .update(values as any)
        .eq('id', selectedItem.id);
      if (error) toast.error('Failed to update equipment');
      else toast.success('Equipment updated');
    } else {
      const { error } = await supabase.from('biomedical_equipment').insert([values as any]);
      if (error) toast.error('Failed to add equipment');
      else toast.success('Equipment added');
    }
    setDialogType(null);
    setSelectedItem(null);
    setIsEditing(false);
    fetchEquipment();
  };

  const handleDeleteEquipment = async (id: string) => {
    const { error } = await supabase.from('biomedical_equipment').delete().eq('id', id);
    if (error) toast.error('Failed to delete equipment');
    else {
      toast.success('Equipment deleted');
      fetchEquipment();
    }
  };

  const handleSaveMaintenance = async (values: z.infer<typeof maintenanceSchema>) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (isEditing && selectedItem) {
      const { error } = await supabase
        .from('equipment_maintenance')
        .update({ ...values, technician_id: user?.id } as any)
        .eq('id', selectedItem.id);
      if (error) toast.error('Failed to update maintenance');
      else toast.success('Maintenance updated');
    } else {
      const { error } = await supabase
        .from('equipment_maintenance')
        .insert([{ ...values, technician_id: user?.id } as any]);
      if (error) toast.error('Failed to add maintenance');
      else toast.success('Maintenance added');
    }
    setDialogType(null);
    setSelectedItem(null);
    setIsEditing(false);
    fetchMaintenance();
  };

  const handleDeleteMaintenance = async (id: string) => {
    const { error } = await supabase.from('equipment_maintenance').delete().eq('id', id);
    if (error) toast.error('Failed to delete maintenance');
    else {
      toast.success('Maintenance deleted');
      fetchMaintenance();
    }
  };

  const handleSaveOutsourcedTest = async (values: z.infer<typeof outsourcedTestSchema>) => {
    if (isEditing && selectedItem) {
      const { error } = await supabase
        .from('outsourced_tests')
        .update(values as any)
        .eq('id', selectedItem.id);
      if (error) toast.error('Failed to update test');
      else toast.success('Test updated');
    } else {
      const { error } = await supabase
        .from('outsourced_tests')
        .insert([{ ...values, sent_at: new Date().toISOString() } as any]);
      if (error) toast.error('Failed to add test');
      else toast.success('Test added');
    }
    setDialogType(null);
    setSelectedItem(null);
    setIsEditing(false);
    fetchOutsourcedTests();
  };

  const handleDeleteOutsourcedTest = async (id: string) => {
    const { error } = await supabase.from('outsourced_tests').delete().eq('id', id);
    if (error) toast.error('Failed to delete test');
    else {
      toast.success('Test deleted');
      fetchOutsourcedTests();
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const maintenanceAlerts = maintenance.filter(m => m.status === 'pending' && new Date(m.scheduled_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;
  const equipmentIssues = equipment.filter(e => e.status !== 'operational').length;

  const EquipmentForm = () => {
    const form = useForm<z.infer<typeof equipmentSchema>>({
      resolver: zodResolver(equipmentSchema),
      defaultValues: isEditing ? selectedItem : {},
    });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveEquipment)} className="space-y-4">
          <FormField control={form.control} name="equipment_name" render={({ field }) => (
            <FormItem><FormLabel>Equipment Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="equipment_type" render={({ field }) => (
            <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="model_number" render={({ field }) => (
            <FormItem><FormLabel>Model Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="serial_number" render={({ field }) => (
            <FormItem><FormLabel>Serial Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="manufacturer" render={({ field }) => (
            <FormItem><FormLabel>Manufacturer</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="operational">Operational</SelectItem><SelectItem value="under_maintenance">Under Maintenance</SelectItem><SelectItem value="out_of_service">Out of Service</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const MaintenanceForm = () => {
    const form = useForm<z.infer<typeof maintenanceSchema>>({
      resolver: zodResolver(maintenanceSchema),
      defaultValues: isEditing ? selectedItem : {},
    });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveMaintenance)} className="space-y-4">
          <FormField control={form.control} name="equipment_id" render={({ field }) => (
            <FormItem><FormLabel>Equipment</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{equipment.map(e => <SelectItem key={e.id} value={e.id}>{e.equipment_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="maintenance_type" render={({ field }) => (
            <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} placeholder="Preventive, Corrective, Calibration" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="scheduled_date" render={({ field }) => (
            <FormItem><FormLabel>Scheduled Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="routine">Routine</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="work_order_number" render={({ field }) => (
            <FormItem><FormLabel>Work Order #</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const OutsourcedTestForm = () => {
    const form = useForm<z.infer<typeof outsourcedTestSchema>>({
      resolver: zodResolver(outsourcedTestSchema),
      defaultValues: isEditing ? selectedItem : {},
    });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveOutsourcedTest)} className="space-y-4">
          <FormField control={form.control} name="patient_id" render={({ field }) => (
            <FormItem><FormLabel>Patient</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="test_name" render={({ field }) => (
            <FormItem><FormLabel>Test Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="external_lab_name" render={({ field }) => (
            <FormItem><FormLabel>External Lab Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="external_lab_email" render={({ field }) => (
            <FormItem><FormLabel>External Lab Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="sample_id" render={({ field }) => (
            <FormItem><FormLabel>Sample ID</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Lab Technician Dashboard">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Lab Technician Dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Lab Technician Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Issues</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipmentIssues}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="orders">All Lab Orders</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="outsourced">Outsourced Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  New Lab Test Requests
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {orders.filter(o => o.status === 'pending').length} pending request(s)
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {orders.filter(o => o.status === 'pending').length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending lab test requests</p>
                  </div>
                ) : (
                  orders.filter(o => o.status === 'pending').map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">{order.patients?.full_name}</p>
                              <p className="text-sm text-muted-foreground">{order.patients?.phone}</p>
                            </div>
                            <Badge 
                              variant={
                                order.priority === 'stat' ? 'destructive' : 
                                order.priority === 'urgent' ? 'default' : 
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {order.priority?.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm"><strong>Test:</strong> {order.test_name}</p>
                            {order.notes && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {order.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setCollectionDialogOpen(true);
                              }}
                              className="flex-1"
                            >
                              <Scan className="h-4 w-4 mr-2" />
                              Start Test
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Test Request Queue</h3>
              <Dialog open={!!editingLabOrder} onOpenChange={(open) => !open && setEditingLabOrder(null)}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingLabOrder({});
                    labOrderForm.reset();
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lab Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingLabOrder?.id ? 'Edit' : 'Add'} Lab Order</DialogTitle>
                  </DialogHeader>
                  <Form {...labOrderForm}>
                    <form onSubmit={labOrderForm.handleSubmit(handleSaveLabOrder)} className="space-y-4">
                      <FormField
                        control={labOrderForm.control}
                        name="patient_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {patients.map((patient) => (
                                  <SelectItem key={patient.id} value={patient.id}>
                                    {patient.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={labOrderForm.control}
                        name="doctor_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doctor</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select doctor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {doctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={labOrderForm.control}
                        name="order_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="lab_test">Lab Test</SelectItem>
                                <SelectItem value="imaging">Imaging</SelectItem>
                                <SelectItem value="pathology">Pathology</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={labOrderForm.control}
                        name="test_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={labOrderForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="stat">STAT</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={labOrderForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Label>Upload Lab Order PDF (Optional)</Label>
                        <Input 
                          type="file" 
                          accept=".pdf"
                          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        />
                        {pdfFile && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {pdfFile.name}
                          </p>
                        )}
                      </div>

                      <DialogFooter>
                        <Button type="submit">Save Lab Order</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sample ID</TableHead>
                    <TableHead>Validated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.patients?.full_name}</TableCell>
                      <TableCell>{order.test_name}</TableCell>
                      <TableCell>
                        <Badge variant={order.priority === 'stat' ? 'destructive' : order.priority === 'urgent' ? 'default' : 'secondary'}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'default' : order.status === 'in_progress' ? 'outline' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.sample_id || '-'}</TableCell>
                      <TableCell>
                        {order.validated_at ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setCollectionDialogOpen(true);
                              }}
                            >
                              <Scan className="h-4 w-4 mr-1" />
                              Collect
                            </Button>
                          )}
                          {order.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setResultDialogOpen(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Results
                            </Button>
                          )}
                          {order.status === 'completed' && !order.validated_at && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setValidationDialogOpen(true);
                              }}
                            >
                              <CheckSquare className="h-4 w-4 mr-1" />
                              Validate
                            </Button>
                          )}
                          {order.status === 'completed' && order.results && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => await handleGenerateReport(order)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingLabOrder(order);
                              labOrderForm.reset({
                                patient_id: order.patient_id,
                                doctor_id: order.doctor_id || '',
                                order_type: order.order_type,
                                test_name: order.test_name,
                                priority: order.priority as any,
                                notes: order.notes || '',
                                pdf_upload_url: order.pdf_upload_url || '',
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLabOrder(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Sample Collection Dialog */}
            <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sample Collection</DialogTitle>
                </DialogHeader>
                <Form {...sampleCollectionForm}>
                  <form onSubmit={sampleCollectionForm.handleSubmit(handleCollectSample)} className="space-y-4">
                    <FormField
                      control={sampleCollectionForm.control}
                      name="sample_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sample ID / Barcode</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Scan or enter sample ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sampleCollectionForm.control}
                      name="sample_collected_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Collection Time</FormLabel>
                          <FormControl>
                            <Input {...field} type="datetime-local" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Log Sample Collection</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Result Entry Dialog */}
            <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enter Lab Results & Complete Test</DialogTitle>
                </DialogHeader>
                <Form {...resultEntryForm}>
                  <form onSubmit={resultEntryForm.handleSubmit(handleSaveResults)} className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Enter test results, upload report PDF (optional), and mark as done to notify the doctor.
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={resultEntryForm.control}
                      name="results"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Results (JSON format) *</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder='{"hemoglobin": "14.5", "wbc": "7500", "rbc": "5.2"}' rows={5} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <Label>Upload Lab Report PDF (Optional)</Label>
                      <Input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      />
                      {pdfFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {pdfFile.name}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={resultEntryForm.control}
                      name="critical_findings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Critical Findings (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ''} placeholder="Enter any critical findings that require immediate attention" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resultEntryForm.control}
                      name="interpretation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interpretation (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ''} placeholder="Enter result interpretation and analysis" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setResultDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Done
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Validation Dialog */}
            <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Validate Lab Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    By validating this order, you are digitally signing off on the results and making them available to the doctor via the patient's EHR.
                  </p>
                  {selectedOrder && (
                    <div className="space-y-2">
                      <p><strong>Patient:</strong> {selectedOrder.patients?.full_name}</p>
                      <p><strong>Test:</strong> {selectedOrder.test_name}</p>
                      <p><strong>Results:</strong> {JSON.stringify(selectedOrder.results)}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleValidateOrder}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Validate & Sign Off
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Biomedical Equipment</h3>
              <Dialog open={dialogType === 'equipment'} onOpenChange={(open) => !open && setDialogType(null)}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setDialogType('equipment'); setIsEditing(false); setSelectedItem(null); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit' : 'Add'} Equipment</DialogTitle>
                  </DialogHeader>
                  <EquipmentForm />
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.equipment_name}</TableCell>
                      <TableCell>{item.equipment_type}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'operational' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setIsEditing(true); setDialogType('equipment'); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteEquipment(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Maintenance Records</h3>
              <Dialog open={dialogType === 'maintenance'} onOpenChange={(open) => !open && setDialogType(null)}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setDialogType('maintenance'); setIsEditing(false); setSelectedItem(null); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Maintenance
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit' : 'Add'} Maintenance</DialogTitle>
                  </DialogHeader>
                  <MaintenanceForm />
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.biomedical_equipment?.equipment_name}</TableCell>
                      <TableCell>{item.maintenance_type}</TableCell>
                      <TableCell>{new Date(item.scheduled_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={item.priority === 'critical' ? 'destructive' : 'default'}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedItem(item); setIsEditing(true); setDialogType('maintenance'); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMaintenance(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="outsourced" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Outsourced Tests</h3>
              <Dialog open={dialogType === 'outsourced'} onOpenChange={(open) => !open && setDialogType(null)}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setDialogType('outsourced'); setIsEditing(false); setSelectedItem(null); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Outsourced Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit' : 'Add'} Outsourced Test</DialogTitle>
                  </DialogHeader>
                  <OutsourcedTestForm />
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>External Lab</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outsourcedTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.patients?.full_name}</TableCell>
                      <TableCell>{test.test_name}</TableCell>
                      <TableCell>{test.external_lab_name}</TableCell>
                      <TableCell>
                        <Badge variant={test.status === 'received' ? 'default' : 'secondary'}>
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedItem(test); setIsEditing(true); setDialogType('outsourced'); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteOutsourcedTest(test.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};