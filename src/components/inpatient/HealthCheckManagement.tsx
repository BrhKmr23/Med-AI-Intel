import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clipboard, DollarSign, Clock } from 'lucide-react';
import { mockHealthCheckPackages } from '@/data/inpatientMockData';

const HealthCheckManagement = () => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Booked':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'In Progress':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Report Ready':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Executive':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'Cardiac':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Diabetes':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Women':
        return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'Senior Citizen':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Basic':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return '';
    }
  };

  const bookedPackages = mockHealthCheckPackages.filter(p => p.status).length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{mockHealthCheckPackages.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{bookedPackages}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                ₹{mockHealthCheckPackages.reduce((sum, pkg) => sum + pkg.price, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Health Check Packages</CardTitle>
          <CardDescription>Available health check-up packages and bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHealthCheckPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.packageName}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(pkg.category)}>{pkg.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">₹{pkg.price.toLocaleString()}</TableCell>
                  <TableCell>{pkg.duration}</TableCell>
                  <TableCell>{pkg.patientName || '—'}</TableCell>
                  <TableCell>
                    {pkg.status ? (
                      <Badge className={getStatusColor(pkg.status)}>{pkg.status}</Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!pkg.status ? (
                      <Button size="sm" variant="outline">Book Package</Button>
                    ) : (
                      <Button size="sm" variant="outline">View Details</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Package Details */}
      {mockHealthCheckPackages.map((pkg) => (
        <Card key={`details-${pkg.id}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{pkg.packageName}</CardTitle>
                <CardDescription>
                  {pkg.patientName ? `Patient: ${pkg.patientName}` : 'Available for booking'}
                </CardDescription>
              </div>
              <div className="text-right">
              <Badge className={`${getCategoryColor(pkg.category)} text-base px-3 py-1 mb-2`}>
                {pkg.category}
              </Badge>
                <div className="text-2xl font-bold text-primary">₹{pkg.price.toLocaleString()}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Package Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Duration:</span> {pkg.duration}</div>
                    <div><span className="font-medium">Price:</span> ₹{pkg.price.toLocaleString()}</div>
                    {pkg.bookingDate && <div><span className="font-medium">Booking Date:</span> {pkg.bookingDate}</div>}
                    {pkg.status && (
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge className={getStatusColor(pkg.status)}>{pkg.status}</Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tests Included ({pkg.tests.length}):</h4>
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {pkg.tests.map((test, idx) => (
                        <li key={idx}>{test}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {!pkg.status && <Button variant="outline">Book This Package</Button>}
                <Button variant="outline">View Full Details</Button>
                <Button variant="outline">Customize Tests</Button>
                {pkg.status === 'Report Ready' && <Button variant="default">Download Report</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HealthCheckManagement;
