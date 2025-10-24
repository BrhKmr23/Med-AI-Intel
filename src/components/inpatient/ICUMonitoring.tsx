import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Activity, Thermometer, Wind, AlertTriangle } from 'lucide-react';
import { mockICUPatients } from '@/data/inpatientMockData';

const ICUMonitoring = () => {
  const patient = mockICUPatients[0];

  const getEWSColor = (score: number) => {
    if (score >= 7) return 'text-red-600';
    if (score >= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{patient.patientName}</CardTitle>
              <CardDescription className="text-base mt-2">
                Age: {patient.age} | Bed: <span className="font-semibold">{patient.bedNumber}</span>
              </CardDescription>
              <div className="mt-2 text-sm">
                <span className="font-medium">Diagnosis:</span> {patient.diagnosis}
              </div>
              <div className="text-sm text-muted-foreground">
                Admitted: {new Date(patient.admissionDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">Early Warning Score</div>
              <div className={`text-4xl font-bold ${getEWSColor(patient.ewsScore)}`}>
                {patient.ewsScore}
              </div>
              <Badge className={patient.ewsScore >= 7 ? 'bg-red-500' : patient.ewsScore >= 5 ? 'bg-orange-500' : 'bg-green-500'}>
                {patient.ewsScore >= 7 ? 'High Risk' : patient.ewsScore >= 5 ? 'Medium Risk' : 'Low Risk'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {patient.alerts && patient.alerts.length > 0 && (
        <Card className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patient.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">{alert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{patient.vitals.hr}</div>
            <div className="text-sm text-muted-foreground">BPM</div>
            <Progress value={patient.vitals.hr > 100 ? 80 : 60} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{patient.vitals.bp}</div>
            <div className="text-sm text-muted-foreground">mmHg | MAP: {patient.vitals.map}</div>
            <Progress value={70} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-cyan-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="h-4 w-4 text-cyan-500" />
              SpO2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{patient.vitals.spo2}%</div>
            <div className="text-sm text-muted-foreground">Oxygen Saturation</div>
            <Progress value={patient.vitals.spo2} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-orange-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{patient.vitals.temp}°C</div>
            <div className="text-sm text-muted-foreground">Body Temperature</div>
            <Progress value={patient.vitals.temp > 38 ? 80 : 60} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Respiratory Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{patient.vitals.rr}</div>
            <div className="text-sm text-muted-foreground">breaths/min</div>
            <Progress value={60} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-teal-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CVP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{patient.vitals.cvp}</div>
            <div className="text-sm text-muted-foreground">cm H₂O</div>
            <Progress value={50} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Ventilator Settings */}
      {patient.ventilatorSupport && patient.ventilatorSettings && (
        <Card className="border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-green-500" />
              Ventilator Settings
            </CardTitle>
            <CardDescription>Mechanical ventilation parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Mode</div>
                <div className="text-2xl font-bold text-green-600">{patient.ventilatorSettings.mode}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">FiO₂</div>
                <div className="text-2xl font-bold text-green-600">{patient.ventilatorSettings.fio2}%</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">PEEP</div>
                <div className="text-2xl font-bold text-green-600">{patient.ventilatorSettings.peep}</div>
                <div className="text-xs text-muted-foreground">cm H₂O</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Tidal Volume</div>
                <div className="text-2xl font-bold text-green-600">{patient.ventilatorSettings.tidalVolume}</div>
                <div className="text-xs text-muted-foreground">mL</div>
              </div>
            </div>
            {patient.sedationLevel && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                <span className="font-medium">Sedation Level:</span> <Badge variant="outline">{patient.sedationLevel}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fluid Balance */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Fluid Balance</CardTitle>
          <CardDescription>Intake vs Output monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
              <div className="text-sm font-medium text-muted-foreground">Input</div>
              <div className="text-3xl font-bold text-blue-600">{patient.fluidBalance.input}</div>
              <div className="text-xs text-muted-foreground">mL</div>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-center">
              <div className="text-sm font-medium text-muted-foreground">Output</div>
              <div className="text-3xl font-bold text-orange-600">{patient.fluidBalance.output}</div>
              <div className="text-xs text-muted-foreground">mL</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
              <div className="text-sm font-medium text-muted-foreground">Balance</div>
              <div className={`text-3xl font-bold ${patient.fluidBalance.balance > 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {patient.fluidBalance.balance > 0 ? '+' : ''}{patient.fluidBalance.balance}
              </div>
              <div className="text-xs text-muted-foreground">mL</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ICUMonitoring;
