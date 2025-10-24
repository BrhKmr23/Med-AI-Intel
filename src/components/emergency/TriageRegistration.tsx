import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, User, Heart, Activity, Clock, Flag } from 'lucide-react';
import { mockEmergencyCases, triageLevelConfig } from '@/data/emergencyMockData';
import { toast } from '@/hooks/use-toast';

export const TriageRegistration = () => {
  const triageCases = mockEmergencyCases.filter(c => c.status === 'triage');

  const handleCompleteTriage = () => {
    toast({
      title: "Triage Completed",
      description: "Patient added to priority queue. Doctor alerted.",
    });
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Triage Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            AI-Powered Triage Assessment
          </CardTitle>
          <CardDescription>Risk scoring and priority assignment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient Name</Label>
              <Input placeholder="Enter patient name" />
            </div>
            <div className="space-y-2">
              <Label>Age / Gender</Label>
              <div className="flex gap-2">
                <Input placeholder="Age" className="flex-1" type="number" />
                <Input placeholder="Gender" className="flex-1" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chief Complaint</Label>
            <Textarea placeholder="Describe primary symptoms..." rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Blood Pressure</Label>
              <Input placeholder="120/80" />
            </div>
            <div className="space-y-2">
              <Label>Heart Rate (bpm)</Label>
              <Input placeholder="75" type="number" />
            </div>
            <div className="space-y-2">
              <Label>SpO2 (%)</Label>
              <Input placeholder="98" type="number" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Respiratory Rate</Label>
              <Input placeholder="16" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Temperature (°C)</Label>
              <Input placeholder="36.8" type="number" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Pain Score (0-10)</Label>
              <Input placeholder="0" type="number" min="0" max="10" />
            </div>
          </div>

          <Button className="w-full" onClick={handleCompleteTriage}>
            <Activity className="mr-2 h-4 w-4" />
            Calculate Triage Score & Priority
          </Button>
        </CardContent>
      </Card>

      {/* Priority Queue Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Priority Queue
          </CardTitle>
          <CardDescription>Patients sorted by triage level and wait time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {triageCases.map((patient) => {
              const config = triageLevelConfig[patient.triageLevel];
              const waitTime = Math.floor((Date.now() - new Date(`2023-10-23 ${patient.arrivalTime}`).getTime()) / 60000);
              
              return (
                <div
                  key={patient.id}
                  className={`border rounded-lg p-4 ${config.color}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{patient.patientName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {patient.age}Y / {patient.gender}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{patient.chiefComplaint}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={config.color}>
                          {config.icon} {config.label} - Score: {patient.triageScore}
                        </Badge>
                        {patient.isMLC && (
                          <Badge variant="destructive">🚔 MLC</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          Wait: {waitTime} min
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Arrived: {patient.arrivalTime}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">BP</p>
                      <p className="font-semibold text-sm">{patient.vitals.bp}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">HR</p>
                      <p className="font-semibold text-sm">{patient.vitals.hr}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">RR</p>
                      <p className="font-semibold text-sm">{patient.vitals.rr}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SpO2</p>
                      <p className={`font-semibold text-sm ${patient.vitals.spo2 < 92 ? 'text-destructive' : ''}`}>
                        {patient.vitals.spo2}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Temp</p>
                      <p className="font-semibold text-sm">{patient.vitals.temp}°C</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <User className="mr-2 h-4 w-4" />
                      Complete Registration
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Heart className="mr-2 h-4 w-4" />
                      Assign to Doctor
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Automated Alerts */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Critical Alerts
          </CardTitle>
          <CardDescription>System-generated alerts for high-risk patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border border-destructive/50 rounded-lg p-3 bg-destructive/5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🚨</div>
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Suspected Sepsis Protocol</p>
                  <p className="text-sm text-muted-foreground">Patient: Priya Sharma | Triage Score: 7</p>
                  <p className="text-xs mt-1">HR &gt; 90, Temp &gt; 38°C, Suspected infection source</p>
                </div>
              </div>
            </div>

            <div className="border border-orange-500/50 rounded-lg p-3 bg-orange-50">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <p className="font-semibold text-orange-600">Chest Pain Protocol</p>
                  <p className="text-sm text-muted-foreground">Patient: Rajesh Kumar | Triage Score: 9</p>
                  <p className="text-xs mt-1">Cardiac panel ordered. ECG pending.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
