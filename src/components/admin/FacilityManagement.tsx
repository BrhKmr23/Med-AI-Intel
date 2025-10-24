import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, AlertCircle } from 'lucide-react';
import { housekeepingData, complaintsData } from '@/data/itAdminMockData';

export const FacilityManagement = () => {
  return (
    <Tabs defaultValue="housekeeping" className="space-y-4">
      <TabsList>
        <TabsTrigger value="housekeeping">Housekeeping & Waste</TabsTrigger>
        <TabsTrigger value="complaints">Complaints Tracker</TabsTrigger>
      </TabsList>

      <TabsContent value="housekeeping">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Trash2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {housekeepingData.filter(h => h.status === 'In Progress').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Tasks</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {housekeepingData.filter(h => h.priority === 'Critical').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <Trash2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {housekeepingData.filter(h => h.status === 'Completed').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Housekeeping & Bio-Medical Waste Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {housekeepingData.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>{task.area}</TableCell>
                      <TableCell>{task.task}</TableCell>
                      <TableCell>{task.assignedTo}</TableCell>
                      <TableCell>
                        <Badge className={
                          task.priority === 'Critical' ? 'bg-red-500' :
                          task.priority === 'High' ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          task.status === 'Completed' ? 'bg-green-500' :
                          task.status === 'In Progress' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.scheduled}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Verify</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="complaints">
        <Card>
          <CardHeader>
            <CardTitle>Complaints & Issue Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaintsData.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.id}</TableCell>
                    <TableCell>{complaint.category}</TableCell>
                    <TableCell>{complaint.department}</TableCell>
                    <TableCell>
                      <Badge className={
                        complaint.priority === 'Critical' ? 'bg-red-500' :
                        complaint.priority === 'High' ? 'bg-orange-500' :
                        complaint.priority === 'Medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        complaint.status === 'Resolved' ? 'bg-green-500' :
                        complaint.status === 'Escalated' ? 'bg-red-500' :
                        complaint.status === 'In Progress' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{complaint.submittedBy}</TableCell>
                    <TableCell>{complaint.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Resolve</Button>
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
