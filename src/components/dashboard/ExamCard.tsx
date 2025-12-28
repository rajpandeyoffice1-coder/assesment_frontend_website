import { Clock, FileText, Play, CheckCircle2, BarChart2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  title: string;
  type: string;
  duration: number;
  questions: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  onStart?: () => void;
  onResume?: () => void;
  onViewResult?: () => void;
}

const typeColors: Record<string, string> = {
  behavioral: 'bg-accent/20 text-accent',
  aptitude: 'bg-primary/20 text-primary',
  knowledge: 'bg-secondary/20 text-secondary',
  intelligence: 'bg-info/20 text-info',
};

const statusConfig = {
  not_started: {
    label: 'Not Started',
    color: 'bg-muted text-muted-foreground',
    icon: FileText,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-warning/20 text-warning',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-success/20 text-success',
    icon: CheckCircle2,
  },
};

export function ExamCard({
  title,
  type,
  duration,
  questions,
  status,
  score,
  onStart,
  onResume,
  onViewResult,
}: ExamCardProps) {
  const StatusIcon = statusConfig[status].icon;

  return (
    <Card variant="glass" className="group hover-lift p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={cn("text-xs font-medium", typeColors[type] || typeColors.aptitude)}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
            <Badge className={cn("text-xs", statusConfig[status].color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig[status].label}
            </Badge>
          </div>

          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {duration} mins
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {questions} questions
            </div>
          </div>

          {status === 'completed' && score !== undefined && (
            <div className="flex items-center gap-2 mt-4">
              <BarChart2 className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">
                Score: {score}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        {status === 'not_started' && onStart && (
          <Button onClick={onStart} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Exam
          </Button>
        )}
        {status === 'in_progress' && onResume && (
          <Button onClick={onResume} variant="warning" className="w-full bg-warning text-warning-foreground hover:bg-warning/90">
            <Play className="w-4 h-4 mr-2" />
            Resume Exam
          </Button>
        )}
        {status === 'completed' && onViewResult && (
          <Button onClick={onViewResult} variant="outline" className="w-full">
            <BarChart2 className="w-4 h-4 mr-2" />
            View Result
          </Button>
        )}
      </div>
    </Card>
  );
}
