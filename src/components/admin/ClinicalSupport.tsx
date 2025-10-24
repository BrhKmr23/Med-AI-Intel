import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mortuaryData, transplantData, cssdData, laundryData } from '@/data/itAdminMockData';

export const ClinicalSupport = () => {
  return (
    <Tabs defaultValue="mortuary" className="space-y-4">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="mortuary">Mortuary</TabsTrigger>
        <TabsTrigger value="transplant">Transplant</TabsTrigger>
        <TabsTrigger value="cssd">CSSD</TabsTrigger>
        <TabsTrigger value="laundry">Laundry</TabsTrigger>
      </TabsList>

      <TabsContent value="mortuary">
        <Card>
          <CardHeader>
            <CardTitle>Mortuary Record Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Deceased Name</TableHead>
                  <TableHead>Date of Death</TableHead>
                  <TableHead>Storage Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Release Status</TableHead>
                  <TableHead>Authorized By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mortuaryData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.deceasedName}</TableCell>
                    <TableCell>{record.dateOfDeath}</TableCell>
                    <TableCell>{record.storageLocation}</TableCell>
                    <TableCell>
                      <Badge className={record.status === 'Released' ? 'bg-green-500' : 'bg-blue-500'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        record.releaseStatus === 'Released' ? 'bg-green-500' :
                        record.releaseStatus === 'Approved' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }>
                        {record.releaseStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.authorizedBy}</TableCell>
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

      <TabsContent value="transplant">
        <Card>
          <CardHeader>
            <CardTitle>Transplant Case Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Donor ID</TableHead>
                  <TableHead>Recipient ID</TableHead>
                  <TableHead>Organ Type</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Surgery Date</TableHead>
                  <TableHead>Consent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transplantData.map((transplant) => (
                  <TableRow key={transplant.id}>
                    <TableCell className="font-medium">{transplant.id}</TableCell>
                    <TableCell>{transplant.donorId}</TableCell>
                    <TableCell>{transplant.recipientId}</TableCell>
                    <TableCell>{transplant.organType}</TableCell>
                    <TableCell>{transplant.matchScore}</TableCell>
                    <TableCell>
                      <Badge className={
                        transplant.status === 'Completed' ? 'bg-green-500' :
                        transplant.status === 'Scheduled' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }>
                        {transplant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{transplant.surgeryDate}</TableCell>
                    <TableCell>
                      <Badge className={transplant.consentStatus === 'Obtained' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {transplant.consentStatus}
                      </Badge>
                    </TableCell>
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

      <TabsContent value="cssd">
        <Card>
          <CardHeader>
            <CardTitle>CSSD Workflow Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CSSD ID</TableHead>
                  <TableHead>Instrument Set</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cycle Number</TableHead>
                  <TableHead>Delivery Time</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cssdData.map((cssd) => (
                  <TableRow key={cssd.id}>
                    <TableCell className="font-medium">{cssd.id}</TableCell>
                    <TableCell>{cssd.instrumentSet}</TableCell>
                    <TableCell>{cssd.requestedBy}</TableCell>
                    <TableCell>
                      <Badge className={
                        cssd.status === 'Delivered' ? 'bg-green-500' :
                        cssd.status === 'Sterilized' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }>
                        {cssd.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{cssd.cycleNumber}</TableCell>
                    <TableCell>{cssd.deliveryTime}</TableCell>
                    <TableCell>{cssd.verified ? '✓' : '✗'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Track</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="laundry">
        <Card>
          <CardHeader>
            <CardTitle>Laundry & Linen Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linen ID</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Item Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Soiled Pickup</TableHead>
                  <TableHead>Clean Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laundryData.map((linen) => (
                  <TableRow key={linen.id}>
                    <TableCell className="font-medium">{linen.id}</TableCell>
                    <TableCell>{linen.ward}</TableCell>
                    <TableCell>{linen.itemType}</TableCell>
                    <TableCell>{linen.quantity}</TableCell>
                    <TableCell>{linen.soiledPickup}</TableCell>
                    <TableCell>{linen.cleanDelivery}</TableCell>
                    <TableCell>
                      <Badge className={
                        linen.status === 'Delivered' ? 'bg-green-500' :
                        linen.status === 'In Process' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }>
                        {linen.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {linen.quality !== 'Pending' && (
                        <Badge className={
                          linen.quality === 'Excellent' ? 'bg-green-500' :
                          linen.quality === 'Good' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }>
                          {linen.quality}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Track</Button>
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
