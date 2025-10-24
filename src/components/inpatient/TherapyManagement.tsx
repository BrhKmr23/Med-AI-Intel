import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Heart, Calendar } from 'lucide-react';
import { mockPhysioSessions, mockOTSessions } from '@/data/inpatientMockData';

const TherapyManagement = () => {
  const getSessionStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Physio Sessions Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{mockPhysioSessions.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">OT Sessions Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-2xl font-bold text-pink-600">{mockOTSessions.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">
                {[...mockPhysioSessions, ...mockOTSessions].filter(s => s.status === 'In Progress').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {[...mockPhysioSessions, ...mockOTSessions].filter(s => s.status === 'Completed').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="physio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="physio">Physiotherapy</TabsTrigger>
          <TabsTrigger value="ot">Occupational Therapy</TabsTrigger>
        </TabsList>

        {/* Physiotherapy Tab */}
        <TabsContent value="physio">
          <Card>
            <CardHeader>
              <CardTitle>Physiotherapy Sessions</CardTitle>
              <CardDescription>Scheduled and ongoing physiotherapy treatments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Session Type</TableHead>
                    <TableHead>Therapist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Exercises</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPhysioSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.scheduledTime}</TableCell>
                      <TableCell>{session.patientName}</TableCell>
                      <TableCell>{session.bedNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.sessionType}</Badge>
                      </TableCell>
                      <TableCell>{session.therapist}</TableCell>
                      <TableCell>
                        <Badge className={getSessionStatusColor(session.status)}>{session.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <ul className="text-sm space-y-1">
                            {session.exercises.map((exercise, idx) => (
                              <li key={idx}>• {exercise}</li>
                            ))}
                          </ul>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {session.status === 'Scheduled' && (
                            <Button size="sm" variant="outline">Start Session</Button>
                          )}
                          {session.status === 'In Progress' && (
                            <Button size="sm" variant="outline">Complete</Button>
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

          {/* Progress Notes */}
          {mockPhysioSessions.filter(s => s.progressNotes).map((session) => (
            <Card key={`notes-${session.id}`} className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">{session.patientName} - Progress Notes</CardTitle>
                <CardDescription>Session on {session.scheduledDate} at {session.scheduledTime}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                      <div className="text-sm font-medium text-muted-foreground">Pain Score</div>
                      <div className="text-2xl font-bold text-blue-600">{session.painScore}/10</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                      <div className="text-sm font-medium text-muted-foreground">Mobility Score</div>
                      <div className="text-2xl font-bold text-green-600">{session.mobilityScore}/10</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Notes:</h4>
                    <p className="text-sm">{session.progressNotes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Occupational Therapy Tab */}
        <TabsContent value="ot">
          <Card>
            <CardHeader>
              <CardTitle>Occupational Therapy Sessions</CardTitle>
              <CardDescription>Functional assessments and ADL training</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Assessment Type</TableHead>
                    <TableHead>Therapist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Goals</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOTSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.scheduledDate}</TableCell>
                      <TableCell>{session.patientName}</TableCell>
                      <TableCell>{session.bedNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.assessmentType}</Badge>
                      </TableCell>
                      <TableCell>{session.therapist}</TableCell>
                      <TableCell>
                        <Badge className={getSessionStatusColor(session.status)}>{session.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <ul className="text-sm space-y-1">
                          {session.functionalGoals.map((goal, idx) => (
                            <li key={idx}>• {goal}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* OT Session Details */}
          {mockOTSessions.map((session) => (
            <Card key={`details-${session.id}`} className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">{session.patientName} - Treatment Plan</CardTitle>
                <CardDescription>Assessment: {session.assessmentType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Functional Goals:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {session.functionalGoals.map((goal, idx) => (
                        <li key={idx}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Activities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.activities.map((activity, idx) => (
                        <Badge key={idx} variant="secondary">{activity}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Equipment Needed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.equipment.map((equip, idx) => (
                        <Badge key={idx} variant="outline">{equip}</Badge>
                      ))}
                    </div>
                  </div>
                  {session.outcomeScore && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded">
                      <span className="font-medium">Outcome Score: </span>
                      <span className="text-lg font-bold text-purple-600">{session.outcomeScore}/10</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TherapyManagement;
