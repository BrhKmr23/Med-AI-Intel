import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Stethoscope, CheckCircle, Clock } from 'lucide-react';
import { mockNurseDeployment, mockDoctorDeployment } from '@/data/inpatientMockData';

const StaffDeployment = () => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'On Duty':
      case 'Busy':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'In OT':
      case 'Emergency':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Break':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Off Duty':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return '';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nurses On Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{mockNurseDeployment.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doctors Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{mockDoctorDeployment.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">
                {mockNurseDeployment.reduce((sum, n) => sum + n.patientsAssigned, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {mockNurseDeployment.reduce((sum, n) => sum + n.tasks.filter(t => t.status === 'Completed').length, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nurses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nurses">Nursing Deployment</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Deployment</TabsTrigger>
        </TabsList>

        {/* Nursing Deployment Tab */}
        <TabsContent value="nurses">
          <Card>
            <CardHeader>
              <CardTitle>Nursing Staff Roster</CardTitle>
              <CardDescription>Current shift assignments and task management</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Acuity Score</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockNurseDeployment.map((nurse) => (
                    <TableRow key={nurse.id}>
                      <TableCell className="font-medium">{nurse.nurseName}</TableCell>
                      <TableCell>{nurse.employeeId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{nurse.shift}</Badge>
                      </TableCell>
                      <TableCell>{nurse.ward}</TableCell>
                      <TableCell className="text-center font-semibold">{nurse.patientsAssigned}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{nurse.acuityScore}</span>
                          <Badge variant="secondary" className="text-xs">
                            {nurse.acuityScore > 20 ? 'High' : nurse.acuityScore > 15 ? 'Medium' : 'Low'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAvailabilityColor(nurse.availability)}>{nurse.availability}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Tasks</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Nurse Task Details */}
          {mockNurseDeployment.map((nurse) => (
            <Card key={`tasks-${nurse.id}`} className="mt-4">
              <CardHeader>
                <CardTitle>{nurse.nurseName} - Task List</CardTitle>
                <CardDescription>
                  {nurse.ward} | Shift: {nurse.shift} | Patients: {nurse.patientsAssigned}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nurse.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{task.task}</div>
                          <div className="text-sm text-muted-foreground">Time: {task.time}</div>
                        </div>
                      </div>
                      <Badge className={getTaskStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">Add Task</Button>
                  <Button size="sm" variant="outline">Generate Handoff Report</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Doctor Deployment Tab */}
        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Deployment Schedule</CardTitle>
              <CardDescription>Current availability and patient assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Next Available</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDoctorDeployment.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.doctorName}</TableCell>
                      <TableCell>{doctor.employeeId}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doctor.shift}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{doctor.patientsUnderCare}</TableCell>
                      <TableCell>
                        <Badge className={getAvailabilityColor(doctor.availability)}>{doctor.availability}</Badge>
                      </TableCell>
                      <TableCell>{doctor.nextAvailableTime}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Contact</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Doctor Details Cards */}
          {mockDoctorDeployment.map((doctor) => (
            <Card key={`details-${doctor.id}`} className="mt-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{doctor.doctorName}</CardTitle>
                    <CardDescription>{doctor.specialization} | {doctor.department}</CardDescription>
                  </div>
                  <Badge className={`${getAvailabilityColor(doctor.availability)} text-base px-3 py-1`}>
                    {doctor.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Employee ID:</span> {doctor.employeeId}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Current Shift:</span> <Badge variant="outline">{doctor.shift}</Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Patients Under Care:</span> <span className="font-bold text-lg">{doctor.patientsUnderCare}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Contact:</span> {doctor.contactNumber}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Next Available:</span> {doctor.nextAvailableTime}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Department:</span> {doctor.department}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">View Patient List</Button>
                  <Button size="sm" variant="outline">Update Schedule</Button>
                  <Button size="sm" variant="outline">Emergency Assignment</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffDeployment;
