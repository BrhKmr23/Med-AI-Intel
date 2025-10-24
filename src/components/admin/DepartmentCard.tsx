import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface DepartmentCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  metrics: {
    active: number;
    pending: number;
    critical: number;
    completed: number;
  };
  onEnter: () => void;
}

export const DepartmentCard = ({ title, icon: Icon, color, metrics, onEnter }: DepartmentCardProps) => {
  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:scale-105"
      style={{ borderColor: `hsl(${color})` }}
    >
      <CardHeader className="pb-3" style={{ background: `hsl(${color} / 0.05)` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: `hsl(${color} / 0.1)` }}
            >
              <Icon className="h-6 w-6" style={{ color: `hsl(${color})` }} />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {metrics.critical > 0 && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <AlertCircle className="h-3 w-3" />
              {metrics.critical}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <div 
              className="text-2xl font-bold" 
              style={{ color: `hsl(${color})` }}
            >
              {metrics.active}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{metrics.critical}</div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{metrics.completed}</div>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>
        <Button 
          className="w-full gap-2 group-hover:gap-3 transition-all"
          style={{ 
            background: `hsl(${color})`,
            color: 'white'
          }}
          onClick={onEnter}
        >
          Enter Department
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
