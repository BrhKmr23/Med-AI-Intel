import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const BillingOperationsView = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPending: 0, totalPaid: 0, totalOverdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: billData } = await supabase
      .from('billing')
      .select(`
        *,
        patients (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    const pending = billData?.filter(b => b.payment_status === 'pending') || [];
    const paid = billData?.filter(b => b.payment_status === 'paid') || [];
    const overdue = billData?.filter(b => b.payment_status === 'overdue') || [];

    const totalPending = pending.reduce((sum, b) => sum + Number(b.total), 0);
    const totalPaid = paid.reduce((sum, b) => sum + Number(b.total), 0);
    const totalOverdue = overdue.reduce((sum, b) => sum + Number(b.total), 0);

    setBills(billData || []);
    setStats({ totalPending, totalPaid, totalOverdue });
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-white';
      case 'pending': return 'bg-orange-500 text-white';
      case 'overdue': return 'bg-destructive text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Billing Operations - Payments & Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage patient billing, payments, insurance claims, and revenue tracking.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              ${stats.totalPending.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Paid Today
              <TrendingUp className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${stats.totalPaid.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${stats.totalOverdue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading billing records...</p>
          ) : bills.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No billing records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono text-xs">{bill.id.substring(0, 8)}</TableCell>
                    <TableCell>{bill.patients?.full_name}</TableCell>
                    <TableCell className="font-bold">${Number(bill.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(bill.payment_status)}>
                        {bill.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{bill.payment_method || 'N/A'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(bill.created_at).toLocaleDateString()}
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
