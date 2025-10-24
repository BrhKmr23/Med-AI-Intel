import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, DollarSign, CreditCard, Clock } from 'lucide-react';

interface Bill {
  id: string;
  patient_id: string;
  total: number;
  payment_status: string;
  created_at: string;
  patients: {
    full_name: string;
    phone: string;
  };
  items: any;
}

export const BillingDashboard = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();

    const channel = supabase
      .channel('billing-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'billing'
        },
        () => fetchBills()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBills = async () => {
    const { data, error } = await supabase
      .from('billing')
      .select(`
        *,
        patients:patient_id (
          full_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch bills');
    } else {
      setBills(data || []);
    }
    setLoading(false);
  };

  const markAsPaid = async (billId: string) => {
    const { error } = await supabase
      .from('billing')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', billId);

    if (error) {
      toast.error('Failed to update payment status');
    } else {
      toast.success('Payment recorded successfully');
      fetchBills();
    }
  };

  const pendingAmount = bills
    .filter(b => b.payment_status === 'pending')
    .reduce((sum, b) => sum + Number(b.total), 0);
  const paidAmount = bills
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.total), 0);
  const totalRevenue = bills.reduce((sum, b) => sum + Number(b.total), 0);

  return (
    <DashboardLayout title="Billing Dashboard">
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paidAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bills.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No billing records yet</p>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold">{bill.patients.full_name}</p>
                        <p className="text-sm text-muted-foreground">{bill.patients.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Items:</p>
                        <pre className="text-xs bg-muted p-2 rounded mt-1">
                          {JSON.stringify(bill.items, null, 2)}
                        </pre>
                      </div>
                      <p className="text-lg font-bold text-primary">Total: ₹{Number(bill.total).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bill.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={bill.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {bill.payment_status}
                      </Badge>
                      {bill.payment_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => markAsPaid(bill.id)}
                        >
                          Mark as Paid
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
    </DashboardLayout>
  );
};
