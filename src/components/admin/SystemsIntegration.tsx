import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { outsourcedTestData, dischargeProcessData, dischargeSummaryData } from '@/data/itAdminMockData';

export const SystemsIntegration = () => {
  return (
    <Tabs defaultValue="outsourced" className="space-y-4">
      <TabsList>
        <TabsTrigger value="outsourced">Outsourced Tests</TabsTrigger>
        <TabsTrigger value="discharge">Discharge Process</TabsTrigger>
        <TabsTrigger value="summary">Discharge Summary</TabsTrigger>
      </TabsList>

      <TabsContent value="outsourced">
        <Card>
          <CardHeader>
            <CardTitle>Outsourced Test Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>External Lab</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Critical</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outsourcedTestData.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.id}</TableCell>
                    <TableCell>{test.patientName}</TableCell>
                    <TableCell>{test.testName}</TableCell>
                    <TableCell>{test.lab}</TableCell>
                    <TableCell>
                      <Badge className={test.status === 'Integrated' ? 'bg-green-500' : test.status === 'Received' ? 'bg-blue-500' : 'bg-yellow-500'}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell>
                      {test.critical && <Badge className="bg-red-500">Critical</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="discharge">
        <Card>
          <CardHeader>
            <CardTitle>Discharge Process Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Discharge ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Nursing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Discharge Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dischargeProcessData.map((discharge) => (
                  <TableRow key={discharge.id}>
                    <TableCell className="font-medium">{discharge.id}</TableCell>
                    <TableCell>{discharge.patientName}</TableCell>
                    <TableCell>
                      <Badge className={discharge.pharmacy === 'Cleared' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {discharge.pharmacy}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={discharge.billing === 'Cleared' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {discharge.billing}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={discharge.nursing === 'Cleared' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {discharge.nursing}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={discharge.status === 'Approved' ? 'bg-green-500' : 'bg-blue-500'}>
                        {discharge.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{discharge.dischargeTime}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>Discharge Summary Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Summary ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Discharge Date</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dischargeSummaryData.map((summary) => (
                  <TableRow key={summary.id}>
                    <TableCell className="font-medium">{summary.id}</TableCell>
                    <TableCell>{summary.patientName}</TableCell>
                    <TableCell>{summary.admission}</TableCell>
                    <TableCell>{summary.discharge}</TableCell>
                    <TableCell>{summary.diagnosis}</TableCell>
                    <TableCell>
                      <Badge className={summary.status === 'Generated' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {summary.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {summary.qrCode ? '✓' : '✗'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
