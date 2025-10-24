import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Video, AlertTriangle } from 'lucide-react';
import { complianceData, avDocumentationData } from '@/data/itAdminMockData';

export const ComplianceManagement = () => {
  return (
    <Tabs defaultValue="licenses" className="space-y-4">
      <TabsList>
        <TabsTrigger value="licenses">License Tracker</TabsTrigger>
        <TabsTrigger value="av">AV Documentation</TabsTrigger>
      </TabsList>

      <TabsContent value="licenses">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {complianceData.filter(c => c.status === 'Active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {complianceData.filter(c => c.status === 'Expiring Soon').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Statutory & Regulatory Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License ID</TableHead>
                    <TableHead>License Type</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days to Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium">{license.id}</TableCell>
                      <TableCell>{license.licenseType}</TableCell>
                      <TableCell>{license.issueDate}</TableCell>
                      <TableCell>{license.expiryDate}</TableCell>
                      <TableCell>{license.daysToExpiry} days</TableCell>
                      <TableCell>
                        <Badge className={license.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {license.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Renew</Button>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="av">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AV Documentation & Retrieval</CardTitle>
            <Video className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AV ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avDocumentationData.map((av) => (
                  <TableRow key={av.id}>
                    <TableCell className="font-medium">{av.id}</TableCell>
                    <TableCell>{av.title}</TableCell>
                    <TableCell>{av.type}</TableCell>
                    <TableCell>{av.uploadDate}</TableCell>
                    <TableCell>{av.size}</TableCell>
                    <TableCell>
                      <Badge className={av.access === 'Public' ? 'bg-green-500' : av.access === 'Restricted' ? 'bg-red-500' : 'bg-blue-500'}>
                        {av.access}
                      </Badge>
                    </TableCell>
                    <TableCell>{av.views}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Play</Button>
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
