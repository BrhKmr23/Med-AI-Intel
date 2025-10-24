import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scissors, Clock, Users, CheckCircle } from 'lucide-react';
import { mockOTSchedules } from '@/data/inpatientMockData';

const OTScheduling = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'In Progress':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return '';
    }
  };

  const scheduledCount = mockOTSchedules.filter(s => s.status === 'Scheduled').length;
  const inProgressCount = mockOTSchedules.filter(s => s.status === 'In Progress').length;
  const completedCount = mockOTSchedules.filter(s => s.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Surgeries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{mockOTSchedules.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{scheduledCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{inProgressCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{completedCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OT Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Operation Theatre Schedule</CardTitle>
          <CardDescription>Today's surgical procedures and OT bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Surgeon</TableHead>
                <TableHead>OT Room</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Anesthesia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOTSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.scheduledTime}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{schedule.patientName}</div>
                      <div className="text-sm text-muted-foreground">{schedule.age}Y</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">{schedule.procedure}</TableCell>
                  <TableCell>{schedule.surgeon}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.otRoom}</Badge>
                  </TableCell>
                  <TableCell>{schedule.duration} min</TableCell>
                  <TableCell>{schedule.anesthesiaType}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {schedule.status === 'Scheduled' && (
                        <Button size="sm" variant="outline">Start</Button>
                      )}
                      <Button size="sm" variant="outline">Details</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Surgery Cards */}
      {mockOTSchedules.map((schedule) => (
        <Card key={`details-${schedule.id}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{schedule.patientName} - {schedule.procedure}</CardTitle>
                <CardDescription>
                  {schedule.scheduledDate} at {schedule.scheduledTime} | Duration: {schedule.duration} minutes
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(schedule.status)} text-base px-3 py-1`}>
                {schedule.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Surgery Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Surgeon:</span> {schedule.surgeon}</div>
                    <div><span className="font-medium">OT Room:</span> {schedule.otRoom}</div>
                    <div><span className="font-medium">Anesthesia:</span> {schedule.anesthesiaType}</div>
                    <div><span className="font-medium">Duration:</span> {schedule.duration} minutes</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Patient Information:</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Name:</span> {schedule.patientName}</div>
                    <div><span className="font-medium">Age:</span> {schedule.age} years</div>
                    <div><span className="font-medium">Procedure:</span> {schedule.procedure}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Surgical Team:</h4>
                <div className="flex flex-wrap gap-2">
                  {schedule.teamMembers.map((member, idx) => (
                    <Badge key={idx} variant="secondary">{member}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Equipment Required:</h4>
                <div className="flex flex-wrap gap-2">
                  {schedule.equipmentNeeded.map((equipment, idx) => (
                    <Badge key={idx} variant="outline">{equipment}</Badge>
                  ))}
                </div>
              </div>

              {schedule.specialRequirements && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <span className="font-semibold">Special Requirements: </span>
                  {schedule.specialRequirements}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline">Pre-Op Checklist</Button>
                <Button variant="outline">Anesthesia Chart</Button>
                <Button variant="outline">Post-Op Notes</Button>
                <Button variant="outline">Print Schedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OTScheduling;
