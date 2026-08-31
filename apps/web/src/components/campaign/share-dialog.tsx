'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareDialogProps {
  title: string;
  slug: string;
  description?: string;
  children: React.ReactNode;
}

export function ShareDialog({ title, slug, description, children }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/campaign/${slug}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Support "${title}" on EasyFund`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Check out "${title}" on EasyFund: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Campaign
          </DialogTitle>
          <DialogDescription>Help spread the word about this campaign</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium line-clamp-1">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{url}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={copyLink} className="justify-start">
              {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="outline" onClick={shareTwitter} className="justify-start">
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" onClick={shareFacebook} className="justify-start">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </Button>
            <Button variant="outline" onClick={shareWhatsApp} className="justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
