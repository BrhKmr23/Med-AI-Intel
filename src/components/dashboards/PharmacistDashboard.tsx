import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Pill, CheckCircle, Clock, Package, AlertTriangle, FileText, Info, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Prescription {
  id: string;
  patient_id: string;
  medications: any;
  notes: string;
  status: string;
  created_at: string;
  patients: {
    full_name: string;
    phone: string;
  };
}

interface InventoryItem {
  id: string;
  drug_name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  reorder_level: number;
  unit_price: number;
  location: string;
}

interface DrugInteraction {
  id: string;
  drug_a: string;
  drug_b: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

interface ADRReport {
  id: string;
  patient_id: string;
  drug_name: string;
  reaction_description: string;
  severity: 'mild' | 'moderate' | 'severe';
  onset_date: string;
  status: string;
  patients: {
    full_name: string;
    phone: string;
  };
}

interface DrugInfo {
  id: string;
  drug_name: string;
  generic_name: string;
  category: string;
  description: string;
  dosage_forms: string[];
  indications: string;
  contraindications: string;
  side_effects: string[];
  storage_conditions: string;
}

// Validation Schemas
const inventorySchema = z.object({
  drug_name: z.string().trim().min(1, 'Drug name is required').max(200),
  generic_name: z.string().trim().max(200).optional(),
  category: z.string().trim().min(1, 'Category is required').max(100),
  manufacturer: z.string().trim().max(200).optional(),
  batch_number: z.string().trim().min(1, 'Batch number is required').max(50),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or positive'),
  reorder_level: z.number().int().min(0, 'Reorder level must be 0 or positive'),
  unit_price: z.number().min(0, 'Price must be positive'),
  location: z.string().trim().max(100).optional()
});

const drugInteractionSchema = z.object({
  drug_a: z.string().trim().min(1, 'First drug is required').max(200),
  drug_b: z.string().trim().min(1, 'Second drug is required').max(200),
  severity: z.enum(['mild', 'moderate', 'severe']),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  recommendation: z.string().trim().max(1000).optional()
});

const adrReportSchema = z.object({
  patient_id: z.string().uuid('Invalid patient'),
  prescription_id: z.string().uuid().optional(),
  drug_name: z.string().trim().min(1, 'Drug name is required').max(200),
  reaction_description: z.string().trim().min(1, 'Reaction description is required').max(1000),
  severity: z.enum(['mild', 'moderate', 'severe']),
  onset_date: z.string().min(1, 'Onset date is required')
});

const drugInfoSchema = z.object({
  drug_name: z.string().trim().min(1, 'Drug name is required').max(200),
  generic_name: z.string().trim().max(200).optional(),
  category: z.string().trim().min(1, 'Category is required').max(100),
  description: z.string().trim().max(2000).optional(),
  dosage_forms: z.string().trim().min(1, 'At least one dosage form is required').max(500),
  indications: z.string().trim().max(1000).optional(),
  contraindications: z.string().trim().max(1000).optional(),
  side_effects: z.string().trim().max(1000).optional(),
  storage_conditions: z.string().trim().max(500).optional()
});

export const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [adrReports, setADRReports] = useState<ADRReport[]>([]);
  const [drugInfo, setDrugInfo] = useState<DrugInfo[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'inventory' | 'interaction' | 'adr' | 'druginfo' | null>(null);

  useEffect(() => {
    fetchAllData();

    const prescriptionsChannel = supabase
      .channel('prescriptions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => fetchPrescriptions())
      .subscribe();

    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pharmacy_inventory' }, () => fetchInventory())
      .subscribe();

    const adrChannel = supabase
      .channel('adr-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'adr_reports' }, () => fetchADRReports())
      .subscribe();

    return () => {
      supabase.removeChannel(prescriptionsChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(adrChannel);
    };
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPrescriptions(),
      fetchInventory(),
      fetchDrugInteractions(),
      fetchADRReports(),
      fetchDrugInfo(),
      fetchPatients()
    ]);
    setLoading(false);
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, phone')
      .order('full_name', { ascending: true });

    if (!error && data) {
      setPatients(data);
    }
  };

  const fetchPrescriptions = async () => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients:patient_id (
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch prescriptions');
    } else {
      setPrescriptions(data || []);
    }
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('pharmacy_inventory')
      .select('*')
      .order('drug_name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch inventory');
    } else {
      setInventory(data || []);
    }
  };

  const fetchDrugInteractions = async () => {
    const { data, error } = await supabase
      .from('drug_interactions')
      .select('*')
      .order('severity', { ascending: false });

    if (error) {
      toast.error('Failed to fetch drug interactions');
    } else {
      setDrugInteractions((data as DrugInteraction[]) || []);
    }
  };

  const fetchADRReports = async () => {
    const { data, error } = await supabase
      .from('adr_reports')
      .select(`
        *,
        patients:patient_id (
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch ADR reports');
    } else {
      setADRReports((data as ADRReport[]) || []);
    }
  };

  const fetchDrugInfo = async () => {
    const { data, error } = await supabase
      .from('drug_information')
      .select('*')
      .order('drug_name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch drug information');
    } else {
      setDrugInfo(data || []);
    }
  };

  const dispenseMedication = async (prescriptionId: string, prescription: Prescription) => {
    // Check drug interactions
    const medications = prescription.medications?.medications || [];
    const drugNames = medications.map((m: any) => m.name.toLowerCase());
    
    const interactions = drugInteractions.filter(interaction => 
      drugNames.some(drug => interaction.drug_a.toLowerCase().includes(drug) || interaction.drug_b.toLowerCase().includes(drug))
    );

    if (interactions.some(i => i.severity === 'severe')) {
      toast.error('Severe drug interaction detected! Please consult doctor.');
      return;
    }

    // Update inventory
    for (const med of medications) {
      const inventoryItem = inventory.find(item => 
        item.drug_name.toLowerCase().includes(med.name.toLowerCase())
      );
      
      if (inventoryItem && inventoryItem.quantity > 0) {
        await supabase
          .from('pharmacy_inventory')
          .update({ quantity: inventoryItem.quantity - 1 })
          .eq('id', inventoryItem.id);
      }
    }

    // Create billing entry
    const billItems = medications.map((med: any) => {
      const item = inventory.find(i => i.drug_name.toLowerCase().includes(med.name.toLowerCase()));
      return {
        description: med.name,
        quantity: 1,
        unit_price: item?.unit_price || 0,
        total: item?.unit_price || 0
      };
    });

    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    await supabase.from('billing').insert({
      patient_id: prescription.patient_id,
      items: { items: billItems },
      subtotal,
      tax,
      discount: 0,
      total,
      payment_status: 'pending'
    });

    // Update prescription status to dispensed
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('prescriptions')
      .update({
        status: 'dispensed',
        dispensed_at: new Date().toISOString(),
        dispensed_by: user?.id
      })
      .eq('id', prescriptionId);

    if (error) {
      toast.error('Failed to dispense medication');
    } else {
      toast.success('Prescription dispensed successfully! Billing created.');
      fetchPrescriptions();
      fetchInventory();
    }
  };

  const checkInteractions = () => {
    if (selectedDrugs.length < 2) {
      toast.info('Select at least 2 drugs to check interactions');
      return;
    }

    const foundInteractions = drugInteractions.filter(interaction =>
      selectedDrugs.some(drug => interaction.drug_a.toLowerCase().includes(drug.toLowerCase())) &&
      selectedDrugs.some(drug => interaction.drug_b.toLowerCase().includes(drug.toLowerCase()))
    );

    if (foundInteractions.length === 0) {
      toast.success('No interactions found for selected drugs');
    } else {
      toast.warning(`Found ${foundInteractions.length} interaction(s)`);
    }
  };

  const handleAddNew = (type: 'inventory' | 'interaction' | 'adr' | 'druginfo') => {
    setEditingItem(null);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleEdit = (item: any, type: 'inventory' | 'interaction' | 'adr' | 'druginfo') => {
    setEditingItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, type: 'inventory' | 'interaction' | 'adr' | 'druginfo') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    let tableName: string;
    switch (type) {
      case 'inventory': tableName = 'pharmacy_inventory'; break;
      case 'interaction': tableName = 'drug_interactions'; break;
      case 'adr': tableName = 'adr_reports'; break;
      case 'druginfo': tableName = 'drug_information'; break;
    }

    const { error } = await supabase
      .from(tableName as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete item');
    } else {
      toast.success('Item deleted successfully');
      switch (type) {
        case 'inventory': fetchInventory(); break;
        case 'interaction': fetchDrugInteractions(); break;
        case 'adr': fetchADRReports(); break;
        case 'druginfo': fetchDrugInfo(); break;
      }
    }
  };

  const InventoryForm = () => {
    const form = useForm<z.infer<typeof inventorySchema>>({
      resolver: zodResolver(inventorySchema),
      defaultValues: editingItem || {
        drug_name: '',
        generic_name: '',
        category: '',
        manufacturer: '',
        batch_number: '',
        expiry_date: '',
        quantity: 0,
        reorder_level: 10,
        unit_price: 0,
        location: ''
      }
    });

    const onSubmit = async (values: z.infer<typeof inventorySchema>) => {
      const { error } = editingItem
        ? await supabase.from('pharmacy_inventory').update(values as any).eq('id', editingItem.id)
        : await supabase.from('pharmacy_inventory').insert([values as any]);

      if (error) {
        toast.error('Failed to save inventory item');
      } else {
        toast.success(`Inventory item ${editingItem ? 'updated' : 'added'} successfully`);
        setDialogOpen(false);
        fetchInventory();
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="drug_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Drug Name *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="generic_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Generic Name</FormLabel>
              <FormControl><Input {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="manufacturer" render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="batch_number" render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Number *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="expiry_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="quantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="reorder_level" render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Level *</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="unit_price" render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price *</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input {...field} value={field.value || ''} placeholder="e.g., Shelf A1" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <Button type="submit">{editingItem ? 'Update' : 'Add'} Inventory</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const DrugInteractionForm = () => {
    const form = useForm<z.infer<typeof drugInteractionSchema>>({
      resolver: zodResolver(drugInteractionSchema),
      defaultValues: editingItem || {
        drug_a: '',
        drug_b: '',
        severity: 'moderate',
        description: '',
        recommendation: ''
      }
    });

    const onSubmit = async (values: z.infer<typeof drugInteractionSchema>) => {
      const { error } = editingItem
        ? await supabase.from('drug_interactions').update(values as any).eq('id', editingItem.id)
        : await supabase.from('drug_interactions').insert([values as any]);

      if (error) {
        toast.error('Failed to save drug interaction');
      } else {
        toast.success(`Drug interaction ${editingItem ? 'updated' : 'added'} successfully`);
        setDialogOpen(false);
        fetchDrugInteractions();
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="drug_a" render={({ field }) => (
            <FormItem>
              <FormLabel>First Drug *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="drug_b" render={({ field }) => (
            <FormItem>
              <FormLabel>Second Drug *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="severity" render={({ field }) => (
            <FormItem>
              <FormLabel>Severity *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="recommendation" render={({ field }) => (
            <FormItem>
              <FormLabel>Recommendation</FormLabel>
              <FormControl><Textarea {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <Button type="submit">{editingItem ? 'Update' : 'Add'} Interaction</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const ADRReportForm = () => {
    const form = useForm<z.infer<typeof adrReportSchema>>({
      resolver: zodResolver(adrReportSchema),
      defaultValues: editingItem || {
        patient_id: '',
        prescription_id: '',
        drug_name: '',
        reaction_description: '',
        severity: 'moderate',
        onset_date: ''
      }
    });

    const onSubmit = async (values: z.infer<typeof adrReportSchema>) => {
      const user = await supabase.auth.getUser();
      const dataToSubmit = {
        ...values,
        reported_by: user.data.user?.id || '',
        status: 'pending'
      };

      const { error } = editingItem
        ? await supabase.from('adr_reports').update(dataToSubmit as any).eq('id', editingItem.id)
        : await supabase.from('adr_reports').insert([dataToSubmit as any]);

      if (error) {
        toast.error('Failed to save ADR report');
      } else {
        toast.success(`ADR report ${editingItem ? 'updated' : 'submitted'} successfully`);
        setDialogOpen(false);
        fetchADRReports();
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="patient_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Patient *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name} - {patient.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="drug_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Drug Name *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="severity" render={({ field }) => (
            <FormItem>
              <FormLabel>Severity *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="reaction_description" render={({ field }) => (
            <FormItem>
              <FormLabel>Reaction Description *</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="onset_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Onset Date *</FormLabel>
              <FormControl><Input type="datetime-local" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <Button type="submit">{editingItem ? 'Update' : 'Submit'} Report</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const DrugInfoForm = () => {
    const form = useForm<z.infer<typeof drugInfoSchema>>({
      resolver: zodResolver(drugInfoSchema),
      defaultValues: editingItem ? {
        ...editingItem,
        dosage_forms: editingItem.dosage_forms?.join(', ') || '',
        side_effects: editingItem.side_effects?.join(', ') || ''
      } : {
        drug_name: '',
        generic_name: '',
        category: '',
        description: '',
        dosage_forms: '',
        indications: '',
        contraindications: '',
        side_effects: '',
        storage_conditions: ''
      }
    });

    const onSubmit = async (values: z.infer<typeof drugInfoSchema>) => {
      const dataToSubmit = {
        ...values,
        dosage_forms: values.dosage_forms.split(',').map(f => f.trim()).filter(f => f),
        side_effects: values.side_effects ? values.side_effects.split(',').map(s => s.trim()).filter(s => s) : []
      };

      const { error } = editingItem
        ? await supabase.from('drug_information').update(dataToSubmit as any).eq('id', editingItem.id)
        : await supabase.from('drug_information').insert([dataToSubmit as any]);

      if (error) {
        toast.error('Failed to save drug information');
      } else {
        toast.success(`Drug information ${editingItem ? 'updated' : 'added'} successfully`);
        setDialogOpen(false);
        fetchDrugInfo();
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="drug_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Drug Name *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="generic_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Generic Name</FormLabel>
              <FormControl><Input {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="dosage_forms" render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage Forms * (comma-separated)</FormLabel>
              <FormControl><Input {...field} placeholder="e.g., Tablet, Capsule, Syrup" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="indications" render={({ field }) => (
            <FormItem>
              <FormLabel>Indications</FormLabel>
              <FormControl><Textarea {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="contraindications" render={({ field }) => (
            <FormItem>
              <FormLabel>Contraindications</FormLabel>
              <FormControl><Textarea {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="side_effects" render={({ field }) => (
            <FormItem>
              <FormLabel>Side Effects (comma-separated)</FormLabel>
              <FormControl><Input {...field} value={field.value || ''} placeholder="e.g., Nausea, Dizziness, Headache" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="storage_conditions" render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Conditions</FormLabel>
              <FormControl><Input {...field} value={field.value || ''} placeholder="e.g., Store below 25°C" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <Button type="submit">{editingItem ? 'Update' : 'Add'} Drug Info</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;
  const dispensedCount = prescriptions.filter(p => p.status === 'dispensed').length;
  const lowStockCount = inventory.filter(item => item.quantity <= item.reorder_level).length;
  const pendingADRCount = adrReports.filter(r => r.status === 'pending').length;

  const filteredInventory = inventory.filter(item =>
    item.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'destructive';
      case 'moderate': return 'default';
      case 'mild': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout title="Pharmacy Dashboard">
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispensedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending ADR Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingADRCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
          <TabsTrigger value="adr">ADR Reports</TabsTrigger>
          <TabsTrigger value="druginfo">Drug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>E-Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : prescriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No prescriptions yet</p>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div>
                            <p className="font-semibold">{prescription.patients.full_name}</p>
                            <p className="text-sm text-muted-foreground">{prescription.patients.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Medications:</p>
                            <div className="space-y-1 mt-1">
                              {(prescription.medications?.medications || []).map((med: any, idx: number) => (
                                <div key={idx} className="text-sm bg-muted p-2 rounded">
                                  <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency} for {med.duration}
                                </div>
                              ))}
                            </div>
                          </div>
                          {prescription.notes && (
                            <p className="text-sm text-muted-foreground">Notes: {prescription.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(prescription.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={prescription.status === 'dispensed' ? 'default' : 'secondary'}>
                            {prescription.status}
                          </Badge>
                          {prescription.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => dispenseMedication(prescription.id, prescription)}
                            >
                              Dispense & Bill
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Real-Time Inventory</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search drugs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={() => handleAddNew('inventory')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Drug
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.drug_name}</h3>
                          {item.quantity <= item.reorder_level && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.generic_name}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Category:</span> {item.category}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Batch:</span> {item.batch_number}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expiry:</span> {new Date(item.expiry_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span> {item.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col gap-2">
                        <div>
                          <p className="text-2xl font-bold">{item.quantity}</p>
                          <p className="text-sm text-muted-foreground">₹{item.unit_price}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item, 'inventory')}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(item.id, 'inventory')}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Drug Interaction Checker</CardTitle>
                <Button onClick={() => handleAddNew('interaction')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Interaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select onValueChange={(value) => setSelectedDrugs([...selectedDrugs, value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drug" />
                    </SelectTrigger>
                    <SelectContent>
                      {drugInfo.map((drug) => (
                        <SelectItem key={drug.id} value={drug.drug_name}>
                          {drug.drug_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={checkInteractions}>Check</Button>
                </div>
                
                {selectedDrugs.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedDrugs.map((drug, idx) => (
                      <Badge key={idx} variant="outline">
                        {drug}
                        <button onClick={() => setSelectedDrugs(selectedDrugs.filter((_, i) => i !== idx))} className="ml-2">×</button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <h3 className="font-semibold">Known Interactions:</h3>
                  {drugInteractions.map((interaction) => (
                    <Alert key={interaction.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{interaction.drug_a} + {interaction.drug_b}</p>
                            <p className="text-sm">{interaction.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">{interaction.recommendation}</p>
                          </div>
                          <div className="flex gap-2 items-start">
                            <Badge variant={getSeverityColor(interaction.severity)}>{interaction.severity}</Badge>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(interaction, 'interaction')}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(interaction.id, 'interaction')}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adr">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Adverse Drug Reaction Reports</CardTitle>
                <Button onClick={() => handleAddNew('adr')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adrReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{report.patients.full_name}</h3>
                          <Badge variant={getSeverityColor(report.severity)}>{report.severity}</Badge>
                          <Badge variant={report.status === 'pending' ? 'secondary' : 'default'}>{report.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.patients.phone}</p>
                        <div className="mt-2">
                          <p className="text-sm"><span className="font-medium">Drug:</span> {report.drug_name}</p>
                          <p className="text-sm"><span className="font-medium">Reaction:</span> {report.reaction_description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Onset: {new Date(report.onset_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(report, 'adr')}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(report.id, 'adr')}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="druginfo">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Drug Information Module</CardTitle>
                <Button onClick={() => handleAddNew('druginfo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Drug Info
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugInfo.map((drug) => (
                  <div key={drug.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{drug.drug_name}</h3>
                        <p className="text-sm text-muted-foreground">{drug.generic_name}</p>
                        <Badge variant="outline" className="mt-1">{drug.category}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Info className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{drug.drug_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div><h4 className="font-semibold">Generic Name</h4><p className="text-sm">{drug.generic_name}</p></div>
                              <div><h4 className="font-semibold">Description</h4><p className="text-sm">{drug.description}</p></div>
                              <div><h4 className="font-semibold">Dosage Forms</h4><div className="flex gap-2 mt-1">{drug.dosage_forms?.map((form, idx) => (<Badge key={idx} variant="secondary">{form}</Badge>))}</div></div>
                              <div><h4 className="font-semibold">Indications</h4><p className="text-sm">{drug.indications}</p></div>
                              <div><h4 className="font-semibold">Contraindications</h4><p className="text-sm">{drug.contraindications}</p></div>
                              <div><h4 className="font-semibold">Side Effects</h4><div className="flex gap-2 mt-1 flex-wrap">{drug.side_effects?.map((effect, idx) => (<Badge key={idx} variant="outline">{effect}</Badge>))}</div></div>
                              <div><h4 className="font-semibold">Storage</h4><p className="text-sm">{drug.storage_conditions}</p></div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(drug, 'druginfo')}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(drug.id, 'druginfo')}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {dialogType === 'inventory' ? 'Inventory' : dialogType === 'interaction' ? 'Drug Interaction' : dialogType === 'adr' ? 'ADR Report' : 'Drug Information'}
            </DialogTitle>
          </DialogHeader>
          {dialogType === 'inventory' && <InventoryForm />}
          {dialogType === 'interaction' && <DrugInteractionForm />}
          {dialogType === 'adr' && <ADRReportForm />}
          {dialogType === 'druginfo' && <DrugInfoForm />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
