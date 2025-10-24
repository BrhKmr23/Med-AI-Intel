import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChefHat, Clock, TrendingUp, Trash2 } from 'lucide-react';
import { mockKitchenProduction, mockDietOrders } from '@/data/inpatientMockData';

const KitchenOperations = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'In Production':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Ready':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Dispatched':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Completed':
        return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
      default:
        return '';
    }
  };

  const totalTraysToday = mockKitchenProduction.reduce((sum, prod) => sum + prod.totalTrays, 0);
  const completedTrays = mockKitchenProduction.filter(p => p.status === 'Completed').reduce((sum, prod) => sum + prod.totalTrays, 0);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trays Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{totalTraysToday}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{completedTrays}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">
                {mockKitchenProduction.filter(p => p.status === 'In Production').reduce((sum, prod) => sum + prod.totalTrays, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wastage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                {mockKitchenProduction.reduce((sum, prod) => sum + (prod.wastage || 0), 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Production Schedule</CardTitle>
          <CardDescription>Today's meal production planning and tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockKitchenProduction.map((production) => (
              <Card key={production.id} className="border-2">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{production.mealType}</CardTitle>
                      <CardDescription>
                        Start Time: {production.startTime} 
                        {production.completionTime && ` | Completed: ${production.completionTime}`}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(production.status)}>{production.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Total Trays: {production.totalTrays}</span>
                        <span className="text-sm text-muted-foreground">
                          {production.status === 'In Production' ? '65% Complete' : production.status === 'Completed' ? '100% Complete' : '0% Complete'}
                        </span>
                      </div>
                      <Progress value={production.status === 'In Production' ? 65 : production.status === 'Completed' ? 100 : 0} className="h-2" />
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Diet Breakdown:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(production.dietBreakdown).map(([diet, count]) => (
                          <div key={diet} className="p-2 bg-muted rounded text-center">
                            <div className="text-xs text-muted-foreground">{diet}</div>
                            <div className="text-lg font-bold">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {production.wastage !== undefined && production.wastage > 0 && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                        <span className="font-medium text-red-600">Wastage: {production.wastage} trays</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {production.status === 'In Production' && (
                        <>
                          <Button size="sm" variant="outline">Update Progress</Button>
                          <Button size="sm" variant="outline">Mark Complete</Button>
                        </>
                      )}
                      {production.status === 'Completed' && (
                        <Button size="sm" variant="outline">View Report</Button>
                      )}
                      <Button size="sm" variant="outline">Production Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diet Order Summary for Kitchen */}
      <Card>
        <CardHeader>
          <CardTitle>Current Diet Order Summary</CardTitle>
          <CardDescription>Active diet prescriptions for production planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              mockDietOrders.reduce((acc, order) => {
                acc[order.dietType] = (acc[order.dietType] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([dietType, count]) => (
              <Card key={dietType} className="border-2">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground mt-1">{dietType} Diet</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-2">Special Requirements:</h4>
            <ul className="space-y-1 text-sm">
              {mockDietOrders.filter(o => o.allergies.length > 0).map(order => (
                <li key={order.id} className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Allergy</Badge>
                  <span>{order.patientName} ({order.bedNumber}): {order.allergies.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KitchenOperations;
