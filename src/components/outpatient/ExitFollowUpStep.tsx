import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Home, MessageSquare, CreditCard, CheckCircle2, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExitFollowUpStepProps {
  onStepComplete: () => void;
}

export default function ExitFollowUpStep({ onStepComplete }: ExitFollowUpStepProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  
  // Follow-up state
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpDepartment, setFollowUpDepartment] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  
  // Home healthcare state
  const [requiresHomecare, setRequiresHomecare] = useState(false);
  const [homecareServiceType, setHomecareServiceType] = useState("");
  const [homecareFrequency, setHomecareFrequency] = useState("");
  const [homecareDuration, setHomecareDuration] = useState("");
  
  // Feedback state (multi-category)
  const [doctorRating, setDoctorRating] = useState(5);
  const [nurseRating, setNurseRating] = useState(5);
  const [pharmacyRating, setPharmacyRating] = useState(5);
  const [labRating, setLabRating] = useState(5);
  const [facilityRating, setFacilityRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  
  // Billing state
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [billAmount, setBillAmount] = useState("1500");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('outpatient_visits')
        .select(`
          id,
          token_number,
          patients (id, full_name, phone)
        `)
        .eq('current_step', 'discharge')
        .eq('status', 'discharged')
        .order('visit_date', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const handleCompleteExit = async () => {
    if (!selectedVisit) return;

    setIsSubmitting(true);
    try {
      // Create follow-up appointment if needed
      if (requiresFollowUp && followUpDate) {
        await supabase
          .from('appointments')
          .insert({
            patient_id: selectedVisit.patients.id,
            scheduled_time: followUpDate,
            department: followUpDepartment || 'General',
            appointment_type: 'follow-up',
            notes: followUpNotes,
            status: 'scheduled'
          });
        toast.success("Follow-up appointment scheduled");
      }

      // Save multi-category feedback
      if (overallRating > 0 || feedbackText) {
        const feedbackData = {
          visit_id: selectedVisit.id,
          patient_id: selectedVisit.patients.id,
          rating: overallRating,
          feedback_text: `Doctor: ${doctorRating}/5 | Nurse: ${nurseRating}/5 | Pharmacy: ${pharmacyRating}/5 | Lab: ${labRating}/5 | Facility: ${facilityRating}/5 | Overall: ${overallRating}/5 - ${feedbackText}`,
          feedback_category: 'overall'
        };
        await supabase.from('patient_feedback').insert(feedbackData);
      }

      // Create billing record
      const { error: billingError } = await supabase
        .from('billing')
        .insert({
          patient_id: selectedVisit.patients.id,
          appointment_id: selectedVisit.id,
          items: [{ description: 'Consultation & Services', amount: parseFloat(billAmount) }],
          subtotal: parseFloat(billAmount),
          tax: 0,
          discount: 0,
          total: parseFloat(billAmount),
          payment_method: paymentMethod,
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        });

      if (billingError) throw billingError;

      // Update visit to completed
      await supabase
        .from('outpatient_visits')
        .update({ 
          current_step: 'exit',
          status: 'completed'
        })
        .eq('id', selectedVisit.id);

      toast.success("✓ Patient exit completed successfully! All protocols executed.");
      
      // Reset all fields
      setSelectedVisit(null);
      setRequiresFollowUp(false);
      setFollowUpDate("");
      setFollowUpDepartment("");
      setFollowUpNotes("");
      setRequiresHomecare(false);
      setHomecareServiceType("");
      setHomecareFrequency("");
      setHomecareDuration("");
      setDoctorRating(5);
      setNurseRating(5);
      setPharmacyRating(5);
      setLabRating(5);
      setFacilityRating(5);
      setOverallRating(5);
      setFeedbackText("");
      setPaymentMethod("cash");
      setBillAmount("1500");
      
      fetchPatients();
      onStepComplete();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Discharged Patients</h3>
        <div className="space-y-2 max-h-[700px] overflow-y-auto">
          {patients.map((visit) => (
            <button
              key={visit.id}
              onClick={() => setSelectedVisit(visit)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                selectedVisit?.id === visit.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
              }`}
            >
              <p className="font-medium text-sm">{visit.patients.full_name}</p>
              <p className="text-xs text-muted-foreground">{visit.token_number}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-3 p-6">
        {!selectedVisit ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select a Patient</h3>
            <p className="text-muted-foreground">Choose a patient to complete exit process</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold">{selectedVisit.patients.full_name}</h2>
              <p className="text-muted-foreground">Exit & Follow-up</p>
            </div>

            {/* Follow-up Appointment */}
            <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-lg">Follow-Up Appointment Scheduler</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="followup"
                    checked={requiresFollowUp}
                    onCheckedChange={(checked) => setRequiresFollowUp(checked as boolean)}
                  />
                  <Label htmlFor="followup" className="cursor-pointer font-medium">
                    Requires Follow-up Appointment
                  </Label>
                </div>
                {requiresFollowUp && (
                  <>
                    <Alert>
                      <Calendar className="h-4 w-4" />
                      <AlertDescription>
                        Patient will receive SMS/Email reminders for the scheduled follow-up appointment.
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Follow-up Date & Time *</Label>
                        <Input
                          type="datetime-local"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Department *</Label>
                        <Select value={followUpDepartment} onValueChange={setFollowUpDepartment}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Medicine</SelectItem>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="orthopedics">Orthopedics</SelectItem>
                            <SelectItem value="neurology">Neurology</SelectItem>
                            <SelectItem value="pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="gynecology">Gynecology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Follow-up Reason / Instructions</Label>
                      <Textarea
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        placeholder="E.g., Review test results, Monitor treatment progress, Post-surgery checkup..."
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Home Healthcare Services */}
            <Card className="p-6 border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-lg">Home Healthcare Services</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="homecare"
                    checked={requiresHomecare}
                    onCheckedChange={(checked) => setRequiresHomecare(checked as boolean)}
                  />
                  <Label htmlFor="homecare" className="cursor-pointer font-medium">
                    Requires Home Healthcare
                  </Label>
                </div>
                {requiresHomecare && (
                  <>
                    <Alert>
                      <Home className="h-4 w-4" />
                      <AlertDescription>
                        We'll contact you to confirm the schedule and arrange the home healthcare provider.
                      </AlertDescription>
                    </Alert>
                    <div>
                      <Label>Service Type *</Label>
                      <Select value={homecareServiceType} onValueChange={setHomecareServiceType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nursing">Nursing Care</SelectItem>
                          <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                          <SelectItem value="dietician">Dietician Consultation</SelectItem>
                          <SelectItem value="wound_care">Wound Care</SelectItem>
                          <SelectItem value="elderly_care">Elderly Care</SelectItem>
                          <SelectItem value="post_surgery">Post-Surgery Care</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Frequency *</Label>
                        <Select value={homecareFrequency} onValueChange={setHomecareFrequency}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="twice_weekly">Twice Weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as_needed">As Needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Duration *</Label>
                        <Select value={homecareDuration} onValueChange={setHomecareDuration}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1_week">1 Week</SelectItem>
                            <SelectItem value="2_weeks">2 Weeks</SelectItem>
                            <SelectItem value="1_month">1 Month</SelectItem>
                            <SelectItem value="3_months">3 Months</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Multi-Category Feedback */}
            <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-lg">Feedback Protocol - Patient Satisfaction Survey</h3>
              </div>
              <Alert className="mb-4">
                <Star className="h-4 w-4" />
                <AlertDescription>
                  Your feedback helps us improve our services. Please rate each service area (1-5 stars, 5 being excellent).
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Doctor Consultation', value: doctorRating, setter: setDoctorRating, icon: User },
                  { label: 'Nurse Service', value: nurseRating, setter: setNurseRating },
                  { label: 'Pharmacy Service', value: pharmacyRating, setter: setPharmacyRating },
                  { label: 'Lab Service', value: labRating, setter: setLabRating },
                  { label: 'Facility Cleanliness', value: facilityRating, setter: setFacilityRating },
                  { label: 'Overall Experience', value: overallRating, setter: setOverallRating },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => item.setter(rating)}
                          className={`text-xl transition-colors ${
                            rating <= item.value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Label>Additional Comments / Suggestions</Label>
                <Textarea
                  placeholder="Share your experience and suggestions for improvement..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </Card>

            {/* Final Billing Protocol */}
            <Card className="p-6 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-6 w-6 text-yellow-600" />
                <h3 className="font-semibold text-lg">Final Billing Protocol - Payment Confirmation</h3>
              </div>
              <Alert className="mb-4">
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  <strong>Billing Protocol:</strong> All charges have been calculated. Confirm payment method and amount to complete exit.
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Total Bill Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="Enter final amount..."
                    min="0"
                    className="mt-2 text-xl font-bold"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Includes: Consultation + Investigations + Medicines + Procedures
                  </p>
                </div>
                <div>
                  <Label className="text-base font-semibold">Payment Method *</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3 space-y-2">
                    {[
                      { value: 'cash', label: '💵 Cash Payment' },
                      { value: 'card', label: '💳 Credit/Debit Card' },
                      { value: 'insurance', label: '🏥 Insurance Claim' },
                      { value: 'online', label: '📱 Online Payment (UPI/Net Banking)' },
                    ].map((method) => (
                      <div key={method.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                        <RadioGroupItem value={method.value} id={method.value} />
                        <Label htmlFor={method.value} className="flex-1 cursor-pointer font-medium">
                          {method.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 border-2 border-green-500 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        ₹{billAmount} - {paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <Badge className="bg-green-600 text-white text-base px-3 py-1">PAID ✓</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleCompleteExit}
              disabled={isSubmitting || !billAmount}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="h-6 w-6 mr-2" />
              ✓ Complete Visit & Exit Patient (Execute All Protocols)
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
