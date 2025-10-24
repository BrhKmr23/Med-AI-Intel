import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ambulance, MapPin, Navigation, Phone, Clock, Activity } from 'lucide-react';
import { mockAmbulances, mockEmergencyCases } from '@/data/emergencyMockData';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const AmbulanceDispatch = () => {
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>('');
  
  const incomingCases = mockEmergencyCases.filter(c => c.status === 'ambulance');
  const ambulances = mockAmbulances;

  const handleDispatch = () => {
    if (!selectedAmbulance) {
      toast({
        title: "Select Ambulance",
        description: "Please select an ambulance to dispatch",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Ambulance Dispatched",
      description: "ER staff has been alerted. Live tracking initiated.",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      dispatched: 'bg-blue-500',
      'on-scene': 'bg-orange-500',
      transporting: 'bg-purple-500',
      arrived: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Emergency Call Intake */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Phone className="h-5 w-5" />
            Emergency Call Intake
          </CardTitle>
          <CardDescription>Log incoming emergency calls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Caller Name</Label>
              <Input placeholder="Enter caller name" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="Enter phone number" type="tel" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Location / GPS Coordinates</Label>
            <Input placeholder="Enter address or coordinates" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nature of Emergency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiac">Cardiac Emergency</SelectItem>
                  <SelectItem value="trauma">Trauma / Accident</SelectItem>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="obstetric">Obstetric Emergency</SelectItem>
                  <SelectItem value="pediatric">Pediatric Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" variant="destructive">
            <MapPin className="mr-2 h-4 w-4" />
            Calculate Optimal Dispatch
          </Button>
        </CardContent>
      </Card>

      {/* Active Cases with Ambulance En Route */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Live Tracking - Cases En Route
          </CardTitle>
          <CardDescription>Real-time ambulance tracking and ETA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incomingCases.map((emergencyCase) => {
              const assignedAmb = ambulances.find(a => a.assignedCase === emergencyCase.id);
              return (
                <div key={emergencyCase.id} className="border rounded-lg p-4 space-y-3 bg-destructive/5 border-destructive/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{emergencyCase.patientName}</h4>
                      <p className="text-sm text-muted-foreground">{emergencyCase.chiefComplaint}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="destructive">{emergencyCase.triageLevel.toUpperCase()}</Badge>
                        <Badge variant="outline">Score: {emergencyCase.triageScore}/10</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-destructive font-semibold">
                        <Clock className="h-4 w-4" />
                        ETA: {emergencyCase.eta}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{emergencyCase.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">BP</p>
                      <p className="font-semibold">{emergencyCase.vitals.bp}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">HR</p>
                      <p className="font-semibold">{emergencyCase.vitals.hr} bpm</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SpO2</p>
                      <p className={`font-semibold ${emergencyCase.vitals.spo2 < 92 ? 'text-destructive' : ''}`}>
                        {emergencyCase.vitals.spo2}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">GCS</p>
                      <p className="font-semibold">{emergencyCase.vitals.gcs || 'N/A'}</p>
                    </div>
                  </div>

                  {assignedAmb && (
                    <div className="bg-background rounded p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Ambulance className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{assignedAmb.vehicleNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            Crew: {assignedAmb.crew.join(', ')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(assignedAmb.status)}>
                        {assignedAmb.status.toUpperCase().replace('-', ' ')}
                      </Badge>
                    </div>
                  )}

                  <Button className="w-full" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Ambulances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ambulance className="h-5 w-5" />
            Available Ambulances
          </CardTitle>
          <CardDescription>Fleet status and dispatch assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAmbulance === amb.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => amb.status === 'available' && setSelectedAmbulance(amb.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(amb.status)}`} />
                    <div>
                      <p className="font-semibold">{amb.vehicleNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Type: {amb.type} | Crew: {amb.crew.join(', ')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(amb.status)}>
                    {amb.status.toUpperCase().replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {selectedAmbulance && (
            <Button className="w-full mt-4" onClick={handleDispatch}>
              <Activity className="mr-2 h-4 w-4" />
              Dispatch Selected Ambulance
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
