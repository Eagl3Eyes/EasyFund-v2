'use client';

import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

const REPORT_REASONS = [
  { value: 'fraud', label: 'Fraud / Scam' },
  { value: 'false_information', label: 'False Information' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'misuse_of_funds', label: 'Misuse of Funds' },
  { value: 'stolen_content', label: 'Stolen Content' },
  { value: 'illegal_activity', label: 'Illegal Activity' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
];

interface ReportDialogProps {
  targetType: 'campaign' | 'comment' | 'user';
  targetId: string;
  children: React.ReactNode;
}

export function ReportDialog({ targetType, targetId, children }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    if (description.length < 10) {
      toast.error('Please provide at least 10 characters of description');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/reports`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, description }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Report submitted. Our team will review it.');
        setOpen(false);
        setReason('');
        setDescription('');
      } else {
        toast.error(data.error?.message || 'Failed to submit report');
      }
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {targetType}
          </DialogTitle>
          <DialogDescription>
            Help us keep EasyFund safe. Your report is confidential.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    reason === r.value
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'hover:bg-muted'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              placeholder="Provide details about why you're reporting this..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
