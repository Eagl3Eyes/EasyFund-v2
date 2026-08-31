'use client';

import { useState } from 'react';
import { Megaphone, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface CampaignUpdateFormProps {
  campaignId: string;
  campaignTitle: string;
  onSuccess?: () => void;
}

export function CampaignUpdateForm({ campaignId, campaignTitle, onSuccess }: CampaignUpdateFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/campaigns/${campaignId}/updates`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, image: image || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Update posted successfully');
        setTitle('');
        setContent('');
        setImage('');
        onSuccess?.();
      } else {
        toast.error(data.error?.message || 'Failed to post update');
      }
    } catch {
      toast.error('Failed to post update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Post Update for &ldquo;{campaignTitle}&rdquo;
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-title">Title</Label>
            <Input
              id="update-title"
              placeholder="e.g., We reached 50% of our goal!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-content">Content</Label>
            <Textarea
              id="update-content"
              placeholder="Share what's new with your campaign..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">{content.length}/5000 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-image" className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" /> Image URL (optional)
            </Label>
            <Input
              id="update-image"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />}
            Post Update
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
