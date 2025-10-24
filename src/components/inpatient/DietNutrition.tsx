import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Utensils, AlertCircle, ChefHat } from 'lucide-react';
import { mockDietOrders } from '@/data/inpatientMockData';

const DietNutrition = () => {
  const getDietColor = (dietType: string) => {
    switch (dietType) {
      case 'Regular':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Diabetic':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Cardiac':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Renal':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'NPO':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Liquid':
        return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      case 'Soft':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Diet Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{mockDietOrders.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Special Diets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">
                {mockDietOrders.filter(d => d.dietType !== 'Regular').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Allergy Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                {mockDietOrders.filter(d => d.allergies.length > 0).length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NPO Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">
                {mockDietOrders.filter(d => d.dietType === 'NPO').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diet Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Diet Orders</CardTitle>
          <CardDescription>Current dietary prescriptions for all inpatients</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Bed</TableHead>
                <TableHead>Diet Type</TableHead>
                <TableHead>Restrictions</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Ordered By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDietOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.patientName}</TableCell>
                  <TableCell>{order.bedNumber}</TableCell>
                  <TableCell>
                    <Badge className={getDietColor(order.dietType)}>{order.dietType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {order.restrictions.map((restriction, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {order.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{order.calories} kcal</TableCell>
                  <TableCell className="text-sm">{order.orderedBy}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Meal Plans */}
      {mockDietOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{order.patientName} - Meal Plan</CardTitle>
                <CardDescription>Bed: {order.bedNumber} | Diet: {order.dietType}</CardDescription>
              </div>
              <Badge className={`${getDietColor(order.dietType)} text-base px-3 py-1`}>
                {order.dietType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.specialInstructions && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Special Instructions
                  </div>
                  <p className="text-sm mt-1">{order.specialInstructions}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-orange-600" />
                    Breakfast
                  </div>
                  <p className="text-sm">{order.mealPlan.breakfast}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-blue-600" />
                    Lunch
                  </div>
                  <p className="text-sm">{order.mealPlan.lunch}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-purple-600" />
                    Dinner
                  </div>
                  <p className="text-sm">{order.mealPlan.dinner}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-green-600" />
                    Snacks
                  </div>
                  <p className="text-sm">{order.mealPlan.snacks}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="outline">Edit Diet Plan</Button>
                <Button variant="outline">Print Tray Label</Button>
                <Button variant="outline">Nutrition Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DietNutrition;
