'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

const VERIFICATION_LEVELS = [
  { value: 'email', label: 'Email Verification', desc: 'Verify your email address', icon: '✉️' },
  { value: 'phone', label: 'Phone Verification', desc: 'Verify your phone number', icon: '📱' },
  { value: 'identity', label: 'Identity Verification', desc: 'Verify your identity with a government ID', icon: '🪪' },
  { value: 'payout', label: 'Payout Verification', desc: 'Verify your bank account for receiving funds', icon: '🏦' },
];

export default function VerificationPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [documents, setDocuments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingRequests, setExistingRequests] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch(`${getApiUrl()}/api/verification`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setExistingRequests(data.data?.requests || []);
      } catch {}
    }
    if (user) fetchRequests();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const handleSubmit = async () => {
    if (!selectedLevel) {
      toast.error('Please select a verification level');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/verification`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: selectedLevel, documents }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Verification request submitted');
        refreshUser?.();
        router.push('/dashboard');
      } else {
        toast.error(data.error?.message || 'Failed to submit');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const currentLevel = (user as any).verificationLevel || 'none';
  const levelOrder = ['none', 'email', 'phone', 'identity', 'payout', 'full'];
  const currentLevelIndex = levelOrder.indexOf(currentLevel);

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Fundraiser Verification</h1>
        <p className="mt-1 text-muted-foreground">Build trust with donors by verifying your identity</p>
      </div>

      {/* Current Status */}
      <Card className="mb-6 max-w-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Current Verification Level</p>
              <p className="text-lg font-semibold capitalize">{currentLevel === 'none' ? 'Unverified' : currentLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Levels */}
      <div className="mb-8 max-w-2xl space-y-4">
        {VERIFICATION_LEVELS.map((level, i) => {
          const levelIndex = levelOrder.indexOf(level.value);
          const isVerified = currentLevelIndex >= levelIndex;
          const hasPending = existingRequests.some((r: any) => r.level === level.value && r.status === 'pending');

          return (
            <Card
              key={level.value}
              className={`cursor-pointer transition-colors ${
                selectedLevel === level.value ? 'border-primary bg-primary/5' : ''
              } ${isVerified ? 'opacity-60' : ''}`}
              onClick={() => !isVerified && !hasPending && setSelectedLevel(level.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-muted-foreground">{level.desc}</p>
                    </div>
                  </div>
                  {isVerified ? (
                    <Badge className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" /> Verified</Badge>
                  ) : hasPending ? (
                    <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                  ) : (
                    <Badge variant="outline">Select</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      {selectedLevel && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Verification Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Additional Information (optional)</Label>
              <Textarea
                placeholder="Provide any additional information to support your verification request..."
                value={documents}
                onChange={(e) => setDocuments(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                For identity verification, you may be asked to upload documents in a future step.
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Submit Verification Request
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
