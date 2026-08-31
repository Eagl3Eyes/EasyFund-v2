'use client';

import { Check, Trophy } from 'lucide-react';

interface Milestone {
  title: string;
  amount: number;
  description: string;
  reached: boolean;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  amountRaised: number;
  goal: number;
}

export function MilestoneTracker({ milestones, amountRaised, goal }: MilestoneTrackerProps) {
  const percentage = goal > 0 ? Math.min(100, (amountRaised / goal) * 100) : 0;

  const displayMilestones =
    milestones.length > 0
      ? milestones
      : [
          { title: '25% Funded', amount: goal * 0.25, description: 'Quarter way there!', reached: percentage >= 25 },
          { title: '50% Funded', amount: goal * 0.5, description: 'Halfway!', reached: percentage >= 50 },
          { title: '75% Funded', amount: goal * 0.75, description: 'Almost there!', reached: percentage >= 75 },
          { title: 'Fully Funded', amount: goal, description: 'Goal reached!', reached: percentage >= 100 },
        ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        Milestones
      </h3>
      <div className="space-y-2">
        {displayMilestones.map((milestone, i) => {
          const milestoneReached = milestone.reached || amountRaised >= milestone.amount;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                milestoneReached ? 'border-[#0ef695]/20 bg-[#0ef695]/5 dark:border-[#0ef695]/20 dark:bg-[#0ef695]/5' : ''
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  milestoneReached
                    ? 'bg-[#0ef695] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {milestoneReached ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{Math.round((milestone.amount / goal) * 100)}%</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">{milestone.description}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                ${milestone.amount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
