import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pill, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const PharmacyOperationsView = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: prescData } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients (full_name),
        profiles!prescriptions_doctor_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(15);

    const { data: invData } = await supabase
      .from('pharmacy_inventory')
      .select('*')
      .lt('quantity', 20)
      .order('quantity', { ascending: true })
      .limit(10);
    
    setPrescriptions(prescData || []);
    setInventory(invData || []);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispensed': return 'bg-success text-white';
      case 'pending': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Pharmacy Operations - Prescriptions & Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage prescription dispensing, inventory levels, drug information, and interactions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">All items well stocked</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.drug_name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-bold text-destructive">{item.quantity}</TableCell>
                    <TableCell>{item.reorder_level}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Low Stock</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading prescriptions...</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No prescriptions found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((presc) => (
                  <TableRow key={presc.id}>
                    <TableCell>{presc.patients?.full_name}</TableCell>
                    <TableCell>{presc.profiles?.full_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(presc.status)}>
                        {presc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(presc.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
