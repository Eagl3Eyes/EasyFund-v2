'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DonationAmountSelector } from './donation-amount-selector';
import { formatCurrency, getProgressPercentage } from '@/lib/utils';

interface DonationPanelProps {
  campaignId: string;
  campaignSlug: string;
  title: string;
  raised: number;
  goal: number;
  supportersCount: number;
  deadline: string;
  isCompleted?: boolean;
}

export function DonationPanel({ campaignId, campaignSlug, title, raised, goal, supportersCount, deadline, isCompleted }: DonationPanelProps) {
  const [amount, setAmount] = useState(25);
  const progress = getProgressPercentage(raised, goal);
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm sticky top-24">
      <div className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-primary">{formatCurrency(raised)}</p>
          <p className="text-sm text-muted-foreground">raised of {formatCurrency(goal)} goal</p>
        </div>

        <Progress value={progress} className="h-3" />

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-foreground">{supportersCount}</p>
            <p className="text-xs text-muted-foreground">supporters</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{daysLeft}</p>
            <p className="text-xs text-muted-foreground">days left</p>
          </div>
        </div>

        {!isCompleted ? (
          <>
            <DonationAmountSelector value={amount} onChange={setAmount} />
            <Link href={`/campaign/${campaignSlug}#donate`}>
              <Button className="w-full text-base" size="lg">
                <Heart className="mr-2 h-4 w-4" />
                Support with ${amount}
              </Button>
            </Link>
          </>
        ) : (
          <Button className="w-full" size="lg" disabled>Fully Funded</Button>
        )}

        <Button variant="outline" className="w-full" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share Campaign
        </Button>
      </div>
    </div>
  );
}
