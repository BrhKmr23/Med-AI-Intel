import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bed, Activity, Thermometer, Stethoscope, Heart } from 'lucide-react';
import { mockBeds } from '@/data/emergencyMockData';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export const BedAllocation = () => {
  const [selectedBed, setSelectedBed] = useState<string>('');
  const [filterWard, setFilterWard] = useState<string>('all');

  const filteredBeds = filterWard === 'all' 
    ? mockBeds 
    : mockBeds.filter(b => b.ward === filterWard);

  const handleAllocateBed = () => {
    if (!selectedBed) {
      toast({
        title: "Select a Bed",
        description: "Please select an available bed first",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Bed Allocated Successfully",
      description: "Patient transferred to ward. Nursing staff notified.",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      occupied: 'bg-red-500',
      reserved: 'bg-yellow-500',
      maintenance: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getBedTypeIcon = (type: string) => {
    switch(type) {
      case 'ICU': return <Activity className="h-4 w-4" />;
      case 'HDU': return <Heart className="h-4 w-4" />;
      case 'Isolation': return <Thermometer className="h-4 w-4" />;
      default: return <Stethoscope className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Bed Mapping Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Digital Bed Mapping - Real-Time Availability
          </CardTitle>
          <CardDescription>Visual bed allocation and patient tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Panel */}
          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
            <Select value={filterWard} onValueChange={setFilterWard}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="HDU">HDU</SelectItem>
                <SelectItem value="General Ward">General Ward</SelectItem>
                <SelectItem value="Isolation Ward">Isolation Ward</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          {/* Bed Grid */}
          <div className="grid grid-cols-4 gap-4">
            {filteredBeds.map((bed) => (
              <div
                key={bed.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedBed === bed.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : bed.status === 'available'
                    ? 'border-green-200 hover:border-green-500 hover:shadow-md'
                    : 'border-gray-200 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => bed.status === 'available' && setSelectedBed(bed.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getBedTypeIcon(bed.type)}
                    <span className="font-semibold">Bed {bed.bedNumber}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(bed.status)}`} />
                </div>

                <p className="text-xs text-muted-foreground mb-2">{bed.ward}</p>

                <Badge variant="outline" className="text-xs mb-2">
                  {bed.type}
                </Badge>

                <div className="space-y-1 mt-2">
                  {bed.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {bed.status === 'occupied' && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium">Patient: {bed.patientId}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bed Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Category Tagging & Assignment</CardTitle>
          <CardDescription>Assign patient to selected bed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedBed ? (
            <>
              <div className="border rounded-lg p-4 bg-primary/5">
                <h4 className="font-semibold mb-2">Selected Bed Details</h4>
                {(() => {
                  const bed = mockBeds.find(b => b.id === selectedBed);
                  return bed ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bed Number:</span>
                        <span className="font-semibold">{bed.bedNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Ward:</span>
                        <span className="font-semibold">{bed.ward}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Type:</span>
                        <Badge>{bed.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Features:</span>
                        <span className="text-xs">{bed.features.join(', ')}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Patient to Assign</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ER-20231023-003">Ankit Verma - Abdominal pain</SelectItem>
                    <SelectItem value="ER-20231023-004">Suresh Patel - Suspected stroke</SelectItem>
                    <SelectItem value="ER-20231023-002">Priya Sharma - RTA injuries</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Length of Stay</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2-3">2-3 days</SelectItem>
                    <SelectItem value="4-7">4-7 days</SelectItem>
                    <SelectItem value="7+">More than 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleAllocateBed}>
                <Bed className="mr-2 h-4 w-4" />
                Confirm Bed Allocation
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bed className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select an available bed from the map above to begin allocation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bed Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockBeds.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-600">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {mockBeds.filter(b => b.status === 'available').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-600">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {mockBeds.filter(b => b.status === 'occupied').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round((mockBeds.filter(b => b.status === 'occupied').length / mockBeds.length) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
