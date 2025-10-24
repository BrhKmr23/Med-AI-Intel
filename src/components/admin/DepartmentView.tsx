import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DepartmentViewProps {
  title: string;
  icon: LucideIcon;
  color: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const DepartmentView = ({ title, icon: Icon, color, isOpen, onClose, children }: DepartmentViewProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      <div 
        className="h-16 border-b flex items-center justify-between px-6"
        style={{ background: `hsl(${color} / 0.1)` }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-background/50"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Command Center</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold" style={{ color: `hsl(${color})` }}>
              {title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ background: `hsl(${color} / 0.2)` }}
          >
            <Icon className="h-6 w-6" style={{ color: `hsl(${color})` }} />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
};
