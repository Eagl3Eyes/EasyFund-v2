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
    <Card variant="interactive" className="group overflow-hidden border-white/[0.08]">
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
              <Badge variant="secondary" className="bg-[#071324]/80 backdrop-blur-sm text-white/80 border-white/[0.08]">
                {campaign.category}
              </Badge>
            </div>
          )}
          {campaign.fundraiserVerified && (
            <div className="absolute right-3 top-3">
              <Badge variant="success" className="bg-[#0ef695]/20 text-[#0ef695] backdrop-blur-sm border-transparent">
                Verified
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/campaign/${campaign.slug}`}>
          <h3 className="text-lg font-semibold leading-tight text-white line-clamp-2 hover:text-[#0ef695] transition-colors">
            {campaign.title}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-white/55 line-clamp-2">
          {truncate(campaign.description, 100)}
        </p>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-medium text-white/80">{campaign.fundraiserName}</span>
        </div>

        <div className="mt-4">
          <Progress value={progress} className="h-2 bg-white/10" />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <div>
            <span className="font-bold text-[#0ef695]">{formatCurrency(campaign.amountRaised)}</span>
            <span className="text-white/40"> raised</span>
          </div>
          <span className="text-white/50">{progress}%</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-white/40">
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
          <span className="text-xs text-white/40">
            Goal: {formatCurrency(campaign.goal)}
          </span>
          <div className="flex items-center gap-1">
            {onFollow && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFollow(campaign._id);
                }}
                className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                aria-label={following ? 'Unfollow fundraiser' : 'Follow fundraiser'}
              >
                {following ? <UserCheck className="h-4 w-4 text-[#0ef695]" /> : <UserPlus className="h-4 w-4" />}
              </button>
            )}
            {onSave && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSave(campaign._id);
                }}
                className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                aria-label={saved ? 'Remove from saved' : 'Save campaign'}
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
