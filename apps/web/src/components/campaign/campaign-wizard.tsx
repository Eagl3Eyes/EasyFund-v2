'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Upload,
  Plus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface Milestone {
  title: string;
  percentage: number;
  description: string;
}

interface CampaignFormData {
  title: string;
  description: string;
  story: string;
  category: string;
  location: string;
  goal: number;
  deadline: string;
  image: string;
  beneficiaryType: 'self' | 'someone_else' | 'organization' | 'community';
  milestones: Milestone[];
}

const steps = ['Basics', 'Story', 'Goal & Timeline', 'Review'];

const categories = [
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'community', label: 'Community' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'environment', label: 'Environment' },
  { value: 'arts-culture', label: 'Arts & Culture' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'animals', label: 'Animals' },
  { value: 'other', label: 'Other' },
];

const beneficiaryTypes = [
  { value: 'self', label: 'For Myself', desc: 'You are the direct beneficiary' },
  { value: 'someone_else', label: 'For Someone Else', desc: 'Raising funds for another person' },
  { value: 'organization', label: 'For an Organization', desc: 'Raising funds for a non-profit or organization' },
  { value: 'community', label: 'For the Community', desc: 'Raising funds for a community project' },
];

export function CampaignWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    story: '',
    category: '',
    location: '',
    goal: 0,
    deadline: '',
    image: '',
    beneficiaryType: 'self',
    milestones: [],
  });

  const updateField = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', percentage: 25, description: '' }],
    }));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.title && formData.description && formData.category;
      case 1:
        return formData.story && formData.story.length > 50;
      case 2:
        return formData.goal > 0 && formData.deadline;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to create a campaign');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/campaigns`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goal: Number(formData.goal),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Campaign created! It will be reviewed before going live.');
        router.push('/dashboard');
      } else {
        toast.error(data.error?.message || 'Failed to create campaign');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${
                i <= step ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className={`mx-4 h-0.5 w-8 sm:w-16 ${
                  i < step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Campaign Basics</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us the essentials about your campaign
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Help Build a School Library"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                placeholder="A brief summary of your campaign (appears in campaign cards)"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                maxLength={200}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={formData.category === cat.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => updateField('category', cat.value)}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Who is this campaign for?</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {beneficiaryTypes.map((bt) => (
                  <div
                    key={bt.value}
                    className={`cursor-pointer rounded-lg border p-3 ${
                      formData.beneficiaryType === bt.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => updateField('beneficiaryType', bt.value)}
                  >
                    <p className="text-sm font-medium text-foreground">{bt.label}</p>
                    <p className="text-xs text-muted-foreground">{bt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Tell Your Story</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Share why this campaign matters and how funds will be used
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">Campaign Story *</Label>
              <Textarea
                id="story"
                placeholder="Tell potential supporters about your campaign. Why is it important? How will the funds be used? What impact will donations have?"
                value={formData.story}
                onChange={(e) => updateField('story', e.target.value)}
                rows={10}
              />
              <p className="text-xs text-muted-foreground">
                {formData.story.length} characters (minimum 50)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Campaign Image URL</Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => updateField('image', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a URL to your campaign image
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Goal & Timeline</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set your fundraising goal and deadline
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Fundraising Goal (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="goal"
                  type="number"
                  min="1"
                  placeholder="10000"
                  value={formData.goal || ''}
                  onChange={(e) => updateField('goal', Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Campaign Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
              />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between">
                <Label>Milestones (Optional)</Label>
                <Button variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Milestone
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Break your goal into milestones to show supporters your progress plan
              </p>

              <div className="mt-4 space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Milestone {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          placeholder="e.g., Initial Setup"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Percentage of Goal</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={milestone.percentage}
                          onChange={(e) => updateMilestone(index, 'percentage', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        placeholder="What this milestone achieves"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Review Your Campaign</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Check everything looks good before submitting
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium text-foreground">{formData.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-foreground">{formData.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge>{categories.find(c => c.value === formData.category)?.label}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal</p>
                <p className="font-medium text-foreground">${formData.goal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="text-foreground">
                  {new Date(formData.deadline).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Story Preview</p>
                <p className="line-clamp-3 text-foreground">{formData.story}</p>
              </div>
              {formData.milestones.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                  <p className="text-foreground">{formData.milestones.length} milestones</p>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Your campaign will be submitted for review. Our team will review it within 24-48 hours
                before it goes live on the platform.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Campaign'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
