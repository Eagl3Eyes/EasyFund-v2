'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CampaignProgressProps {
  raised: number;
  goal: number;
  className?: string;
  showMilestones?: boolean;
}

const MILESTONES = [25, 50, 75, 100];

export function CampaignProgress({ raised, goal, className, showMilestones = true }: CampaignProgressProps) {
  const percentage = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className={cn('w-full', className)}>
      <Progress
        value={percentage}
        className="h-3"
        indicatorClassName={cn(
          'transition-all duration-700',
          percentage >= 100 ? 'bg-success' : percentage >= 75 ? 'bg-primary' : 'bg-primary'
        )}
      />

      {showMilestones && (
        <div className="relative mt-2 h-6">
          {MILESTONES.map((milestone) => (
            <div
              key={milestone}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${milestone}%` }}
            >
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  percentage >= milestone ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
              <span
                className={cn(
                  'mt-1 text-[10px]',
                  percentage >= milestone ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {milestone}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
