'use client';

import { Heart, User } from 'lucide-react';

interface Supporter {
  _id: string;
  donorName?: string;
  donorEmail?: string;
  amount: number;
  anonymous: boolean;
  message?: string;
  createdAt: string;
}

interface SupporterListProps {
  supporters: Supporter[];
  maxDisplay?: number;
}

export function SupporterList({ supporters, maxDisplay = 10 }: SupporterListProps) {
  const displaySupporters = supporters.slice(0, maxDisplay);
  const hasMore = supporters.length > maxDisplay;

  if (supporters.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center">
        <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Be the first to support this campaign!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">
        Supporters ({supporters.length})
      </h3>
      <div className="space-y-2">
        {displaySupporters.map((supporter) => (
          <div
            key={supporter._id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {supporter.anonymous ? (
                  '?'
                ) : (
                  (supporter.donorName || supporter.donorEmail || 'A').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {supporter.anonymous ? 'Anonymous' : supporter.donorName || supporter.donorEmail?.split('@')[0] || 'Supporter'}
                </p>
                {supporter.message && (
                  <p className="text-xs text-muted-foreground line-clamp-1">&ldquo;{supporter.message}&rdquo;</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">${supporter.amount}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(supporter.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <p className="text-center text-sm text-muted-foreground">
          And {supporters.length - maxDisplay} more supporters
        </p>
      )}
    </div>
  );
}
