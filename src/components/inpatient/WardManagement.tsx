import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BedDouble, Users, Activity, Clock } from 'lucide-react';
import { mockInpatientBeds, mockInpatientRecords } from '@/data/inpatientMockData';

const WardManagement = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Occupied':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Reserved':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Maintenance':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return '';
    }
  };

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Observation':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Stable':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Recovering':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return '';
    }
  };

  const occupiedBeds = mockInpatientBeds.filter(b => b.status === 'Occupied').length;
  const totalBeds = mockInpatientBeds.length;
  const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{totalBeds}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{occupiedBeds}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{totalBeds - occupiedBeds}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{occupancyRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bed Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bed Status Overview</CardTitle>
          <CardDescription>Real-time bed allocation across all wards</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bed Number</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInpatientBeds.map((bed) => (
                <TableRow key={bed.id}>
                  <TableCell className="font-medium">{bed.bedNumber}</TableCell>
                  <TableCell>{bed.ward}</TableCell>
                  <TableCell>Floor {bed.floor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{bed.bedType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bed.status)}>{bed.status}</Badge>
                  </TableCell>
                  <TableCell>{bed.patientName || '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {bed.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {bed.status === 'Available' ? (
                      <Button size="sm" variant="outline">Assign</Button>
                    ) : bed.status === 'Occupied' ? (
                      <Button size="sm" variant="outline">View Patient</Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inpatients</CardTitle>
          <CardDescription>All patients currently admitted in the hospital</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age/Gender</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Ward/Bed</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diet</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInpatientRecords.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>{patient.patientName}</TableCell>
                  <TableCell>{patient.age}Y / {patient.gender}</TableCell>
                  <TableCell className="max-w-xs">{patient.diagnosis}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{patient.ward}</div>
                      <div className="text-muted-foreground">{patient.bedNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.attendingDoctor}</TableCell>
                  <TableCell>
                    <Badge className={getPatientStatusColor(patient.status)}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{patient.dietPlan}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Transfer</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WardManagement;
