import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/55">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          {icon && (
            <div className="rounded-lg bg-[#0ef695]/10 p-3 text-[#0ef695]">{icon}</div>
          )}
        </div>
        {change !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            {change > 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : change < 0 ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <Minus className="h-4 w-4 text-white/55" />
            )}
            <span
              className={
                change > 0 ? 'text-[#0ef695]' : change < 0 ? 'text-red-400' : 'text-white/55'
              }
            >
              {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="text-white/55">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
