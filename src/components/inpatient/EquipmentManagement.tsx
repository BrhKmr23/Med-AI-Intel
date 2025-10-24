import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { mockBiomedicalEquipment } from '@/data/inpatientMockData';

const EquipmentManagement = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Under Maintenance':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Faulty':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Calibration Due':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return '';
    }
  };

  const operationalCount = mockBiomedicalEquipment.filter(e => e.status === 'Operational').length;
  const maintenanceCount = mockBiomedicalEquipment.filter(e => e.status === 'Under Maintenance').length;
  const calibrationDueCount = mockBiomedicalEquipment.filter(e => e.status === 'Calibration Due').length;
  const faultyCount = mockBiomedicalEquipment.filter(e => e.status === 'Faulty').length;

  const isDateSoon = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operational</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{operationalCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{maintenanceCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calibration Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{calibrationDueCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{faultyCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle>Biomedical Equipment Inventory</CardTitle>
          <CardDescription>Complete listing of hospital equipment and maintenance status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBiomedicalEquipment.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell className="font-medium">{equipment.equipmentName}</TableCell>
                  <TableCell>{equipment.equipmentType}</TableCell>
                  <TableCell className="font-mono text-sm">{equipment.serialNumber}</TableCell>
                  <TableCell>{equipment.location}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(equipment.status)}>{equipment.status}</Badge>
                  </TableCell>
                  <TableCell>{equipment.assignedTo || '—'}</TableCell>
                  <TableCell>{new Date(equipment.lastServiceDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className={isDateSoon(equipment.nextServiceDate) ? 'font-bold text-orange-600' : ''}>
                      {new Date(equipment.nextServiceDate).toLocaleDateString()}
                      {isDateSoon(equipment.nextServiceDate) && (
                        <Badge variant="destructive" className="ml-2 text-xs">Soon</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Equipment Details Cards */}
      {mockBiomedicalEquipment.map((equipment) => (
        <Card key={`details-${equipment.id}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{equipment.equipmentName}</CardTitle>
                <CardDescription>{equipment.manufacturer} | {equipment.equipmentType}</CardDescription>
              </div>
              <Badge className={`${getStatusColor(equipment.status)} text-base px-3 py-1`}>
                {equipment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Equipment Information:</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Serial Number:</span> {equipment.serialNumber}</div>
                    <div><span className="font-medium">Manufacturer:</span> {equipment.manufacturer}</div>
                    <div><span className="font-medium">Type:</span> {equipment.equipmentType}</div>
                    <div><span className="font-medium">Location:</span> {equipment.location}</div>
                    {equipment.assignedTo && (
                      <div><span className="font-medium">Assigned To:</span> {equipment.assignedTo}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Maintenance Schedule:</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Last Service:</span> {new Date(equipment.lastServiceDate).toLocaleDateString()}</div>
                    <div>
                      <span className="font-medium">Next Service:</span>{' '}
                      <span className={isDateSoon(equipment.nextServiceDate) ? 'font-bold text-orange-600' : ''}>
                        {new Date(equipment.nextServiceDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Calibration Due:</span>{' '}
                      <span className={isDateSoon(equipment.calibrationDue) ? 'font-bold text-orange-600' : ''}>
                        {new Date(equipment.calibrationDue).toLocaleDateString()}
                      </span>
                    </div>
                    <div><span className="font-medium">Warranty Expiry:</span> {new Date(equipment.warrantyExpiry).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {(isDateSoon(equipment.nextServiceDate) || isDateSoon(equipment.calibrationDue) || equipment.status !== 'Operational') && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 font-semibold text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    Attention Required
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {isDateSoon(equipment.nextServiceDate) && (
                      <li>• Service due within 30 days</li>
                    )}
                    {isDateSoon(equipment.calibrationDue) && (
                      <li>• Calibration due within 30 days</li>
                    )}
                    {equipment.status !== 'Operational' && (
                      <li>• Equipment is {equipment.status.toLowerCase()}</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline">Schedule Service</Button>
                <Button variant="outline">Update Status</Button>
                <Button variant="outline">Service History</Button>
                <Button variant="outline">Generate Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EquipmentManagement;
