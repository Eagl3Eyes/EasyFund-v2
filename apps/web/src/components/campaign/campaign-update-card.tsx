'use client';

import { Megaphone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CampaignUpdate {
  _id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
}

interface CampaignUpdateCardProps {
  update: CampaignUpdate;
}

export function CampaignUpdateCard({ update }: CampaignUpdateCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4 text-primary" />
          {update.title}
        </CardTitle>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(update.createdAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{update.content}</p>
        {update.image && (
          <img
            src={update.image}
            alt={update.title}
            className="mt-3 h-48 w-full rounded-lg object-cover"
          />
        )}
      </CardContent>
    </Card>
  );
}
