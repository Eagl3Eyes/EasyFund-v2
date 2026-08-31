'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock, Users, UserPlus, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, getDaysRemaining, getProgressPercentage, truncate } from '@/lib/utils';
import { getApiUrl } from '@/lib/config';
import type { Campaign } from '@/lib/types';
import { toast } from 'sonner';

interface CampaignCardProps {
  campaign: Campaign;
  onSave?: (id: string) => void;
  saved?: boolean;
  following?: boolean;
  onFollow?: (id: string) => void;
}

export function CampaignCard({ campaign, onSave, saved, following, onFollow }: CampaignCardProps) {
  const progress = getProgressPercentage(campaign.amountRaised, campaign.goal);
  const daysLeft = getDaysRemaining(campaign.deadline);

  return (
    <Card variant="interactive" className="group overflow-hidden">
      <Link href={`/campaign/${campaign.slug}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={campaign.image}
            alt={campaign.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {campaign.category && (
            <div className="absolute left-3 top-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                {campaign.category}
              </Badge>
            </div>
          )}
          {campaign.fundraiserVerified && (
            <div className="absolute right-3 top-3">
              <Badge variant="success" className="bg-success/90 backdrop-blur-sm">
                Verified
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/campaign/${campaign.slug}`}>
          <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
            {campaign.title}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {truncate(campaign.description, 100)}
        </p>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{campaign.fundraiserName}</span>
        </div>

        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <div>
            <span className="font-bold text-primary">{formatCurrency(campaign.amountRaised)}</span>
            <span className="text-muted-foreground"> raised</span>
          </div>
          <span className="text-muted-foreground">{progress}%</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{campaign.supportersCount} supporters</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Goal: {formatCurrency(campaign.goal)}
          </span>
          <div className="flex items-center gap-1">
            {onFollow && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFollow(campaign._id);
                }}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title={following ? 'Unfollow fundraiser' : 'Follow fundraiser'}
              >
                {following ? <UserCheck className="h-4 w-4 text-primary" /> : <UserPlus className="h-4 w-4" />}
              </button>
            )}
            {onSave && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSave(campaign._id);
                }}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
