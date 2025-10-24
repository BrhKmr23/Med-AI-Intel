import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skull, FileX, AlertTriangle, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SpecialCases = () => {
  const handleBroughtDeadSubmit = () => {
    toast({
      title: "Brought Dead Case Registered",
      description: "Death certificate generated. Authorities notified.",
    });
  };

  const handleAMASubmit = () => {
    toast({
      title: "AMA Discharge Processed",
      description: "Consent forms signed. Patient discharged against medical advice.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Brought Dead Protocol */}
      <Card className="border-gray-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Skull className="h-5 w-5" />
            Brought Dead Record System
          </CardTitle>
          <CardDescription>Documentation for patients declared dead on arrival</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient / Deceased Name</Label>
              <Input placeholder="Enter name" />
            </div>
            <div className="space-y-2">
              <Label>Age / Gender</Label>
              <div className="flex gap-2">
                <Input placeholder="Age" className="flex-1" type="number" />
                <Select>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brought By (Name & Relation)</Label>
              <Input placeholder="Name and relationship" />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input placeholder="Enter phone number" type="tel" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time of Arrival at Hospital</Label>
            <Input type="datetime-local" />
          </div>

          <div className="space-y-2">
            <Label>Declared Dead At</Label>
            <Input type="datetime-local" />
          </div>

          <div className="space-y-2">
            <Label>Circumstances of Death</Label>
            <Textarea placeholder="Describe how the deceased was found, events leading to death..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Presumed Cause of Death (ICD-10)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select cause" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardiac">Cardiac Arrest</SelectItem>
                <SelectItem value="trauma">Traumatic Injury</SelectItem>
                <SelectItem value="drowning">Drowning</SelectItem>
                <SelectItem value="poisoning">Poisoning</SelectItem>
                <SelectItem value="burns">Burns</SelectItem>
                <SelectItem value="unknown">Unknown / Undetermined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Physical Assessment Findings</Label>
            <Textarea placeholder="Document rigor mortis, livor mortis, body temperature, visible injuries..." rows={3} />
          </div>

          <div className="border rounded-lg p-3 bg-muted/30">
            <h4 className="font-semibold text-sm mb-2">Authority Notifications</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="police-bd" />
                <label htmlFor="police-bd">Police station informed</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="morgue" />
                <label htmlFor="morgue">Morgue transfer arranged</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="family" />
                <label htmlFor="family">Family/NOK counseled</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="autopsy" />
                <label htmlFor="autopsy">Autopsy consent obtained (if required)</label>
              </div>
            </div>
          </div>

          <Button className="w-full" variant="secondary" onClick={handleBroughtDeadSubmit}>
            Generate Death Certificate & Submit Report
          </Button>
        </CardContent>
      </Card>

      {/* Discharge Against Medical Advice (AMA) */}
      <Card className="border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <FileX className="h-5 w-5" />
            Discharge Against Medical Advice (AMA)
          </CardTitle>
          <CardDescription>Workflow automation for LAMA / DAMA cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-orange-500/50 rounded-lg p-3 bg-orange-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800">Warning</p>
                <p className="text-sm text-orange-700">
                  Patient or guardian is requesting discharge against medical advice. Risks have been explained.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Patient Name</Label>
            <Input placeholder="Enter patient name" />
          </div>

          <div className="space-y-2">
            <Label>Emergency Number / MRN</Label>
            <Input placeholder="ER-20231023-XXX" />
          </div>

          <div className="space-y-2">
            <Label>Current Diagnosis</Label>
            <Textarea placeholder="Patient's current medical condition..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Risks Explained to Patient/Guardian</Label>
            <Textarea 
              placeholder="Document all risks explained (e.g., risk of death, worsening condition, incomplete treatment...)" 
              rows={3} 
            />
          </div>

          <div className="space-y-2">
            <Label>Reason for AMA Discharge</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial constraints</SelectItem>
                <SelectItem value="personal">Personal/family reasons</SelectItem>
                <SelectItem value="dissatisfied">Dissatisfied with care</SelectItem>
                <SelectItem value="religious">Religious/cultural reasons</SelectItem>
                <SelectItem value="alternative">Seeking alternative treatment</SelectItem>
                <SelectItem value="other">Other (specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Comments</Label>
            <Textarea placeholder="Any additional relevant information..." rows={2} />
          </div>

          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-semibold mb-3">Consent & Signatures</h4>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Patient / Guardian Signature</Label>
                <div className="border-2 border-dashed rounded h-24 flex items-center justify-center text-muted-foreground">
                  <User className="h-8 w-8" />
                  <span className="ml-2 text-sm">Sign Here (Digital Signature)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Witness Name & Signature</Label>
                <div className="border-2 border-dashed rounded h-24 flex items-center justify-center text-muted-foreground">
                  <User className="h-8 w-8" />
                  <span className="ml-2 text-sm">Witness Signature</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Doctor's Name & Signature</Label>
                <Input placeholder="Dr. [Name]" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded bg-muted/20">
            <input type="checkbox" id="acknowledge" />
            <label htmlFor="acknowledge" className="text-sm">
              I confirm that the patient/guardian has been counseled about the risks and consequences of leaving against medical advice
            </label>
          </div>

          <Button className="w-full" variant="outline" onClick={handleAMASubmit}>
            Generate AMA Form & Process Discharge
          </Button>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-2xl">📋</span>
              MLC Documentation
            </CardTitle>
            <CardDescription className="text-xs">Medico-Legal Cases</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">Available in Treatment Orders</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-2xl">🚑</span>
              Referral Transfer
            </CardTitle>
            <CardDescription className="text-xs">Inter-facility transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs bg-blue-500 text-white">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
