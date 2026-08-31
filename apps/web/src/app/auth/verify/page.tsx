'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

export default function VerifyPage() {
  const { user, loading } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/verify-email`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast.success('Verification email sent');
      } else {
        toast.error(data.error?.message || 'Failed to send verification email');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            {sent
              ? 'We sent a new verification link to your email address.'
              : user?.email
                ? `We'll send a verification link to ${user.email}`
                : 'Check your email for a verification link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="flex items-center justify-center gap-2 text-[#0ef695]">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Email sent successfully</span>
            </div>
          ) : null}

          <Button onClick={handleResend} disabled={sending} className="w-full">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            {sent ? 'Resend Verification Email' : 'Send Verification Email'}
          </Button>

          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
