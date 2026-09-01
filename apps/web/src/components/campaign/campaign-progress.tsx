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
        className="h-3 bg-white/10"
        indicatorClassName={cn(
          'transition-all duration-700',
          percentage >= 100 ? 'bg-[#0ef695]' : percentage >= 75 ? 'bg-[#0ef695]' : 'bg-[#0ef695]'
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
                  percentage >= milestone ? 'bg-[#0ef695]' : 'bg-white/20'
                )}
              />
              <span
                className={cn(
                  'mt-1 text-[10px]',
                  percentage >= milestone ? 'text-[#0ef695] font-medium' : 'text-white/40'
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
