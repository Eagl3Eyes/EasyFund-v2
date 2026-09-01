'use client';

import { useState } from 'react';
import { Heart, CreditCard, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface DonationFlowProps {
  campaignId: string;
  campaignTitle: string;
  fundraiserName: string;
}

const presetAmounts = [10, 25, 50, 100, 250, 500];

export function DonationFlow({ campaignId, campaignTitle, fundraiserName }: DonationFlowProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [step, setStep] = useState<'amount' | 'details' | 'processing' | 'success'>('amount');
  const [processing, setProcessing] = useState(false);

  const selectedAmount = amount || Number(customAmount) || 0;

  const handleAmountSelect = (preset: number) => {
    setAmount(preset);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount(0);
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      toast.error('Please log in to donate');
      return;
    }

    if (selectedAmount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    setStep('processing');
    setProcessing(true);

    try {
      const res = await fetch(`${getApiUrl()}/api/donations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          amount: selectedAmount,
          anonymous,
          message,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.sessionUrl;
      } else {
        toast.error(data.error?.message || 'Failed to initiate donation');
        setStep('amount');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      setStep('amount');
    } finally {
      setProcessing(false);
    }
  };

  // Check for donation success/cancel from URL params
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('donation') === 'success' && step !== 'success') {
      setStep('success');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  if (step === 'success') {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-card p-6 shadow-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0ef695]/10">
          <Check className="h-6 w-6 text-[#0ef695]" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Thank You!</h3>
        <p className="mt-2 text-sm text-white/55">
          Your donation to &ldquo;{campaignTitle}&rdquo; has been received.
          You&apos;ll receive a confirmation email shortly.
        </p>
        <button onClick={() => setStep('amount')} className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
          Make Another Donation
        </button>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-card p-6 shadow-sm text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0ef695]" />
        <p className="mt-4 text-sm text-white/55">
          Redirecting to Stripe Checkout...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white">Support This Campaign</h3>
      <p className="mt-1 text-sm text-white/55">
        Your donation directly supports {fundraiserName}&apos;s campaign
      </p>

      {step === 'amount' && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => handleAmountSelect(preset)}
                className={`rounded-2xl py-2.5 text-sm font-bold transition-all ${
                  selectedAmount === preset
                    ? 'bg-[#0ef695] text-[#060e1e] shadow-lg shadow-[#0ef695]/25'
                    : 'border border-white/10 bg-[#0a1b30] text-white hover:border-white/20 hover:bg-[#0f2240]'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-amount" className="text-white/80">Custom Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
              <Input
                id="custom-amount"
                type="number"
                min="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-8 border-white/[0.08] bg-[#060e1e] text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50"
              />
            </div>
          </div>

          <button
            className="w-full inline-flex items-center justify-center rounded-2xl bg-[#0ef695] px-6 py-3 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8] disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={selectedAmount < 1}
            onClick={() => setStep('details')}
          >
            <Heart className="mr-2 h-4 w-4" />
            Donate ${selectedAmount || 0}
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-3 text-center">
            <p className="text-sm text-white/40">Donation Amount</p>
            <p className="text-2xl font-bold text-[#0ef695]">${selectedAmount}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-white/80">Message (Optional)</Label>
            <Input
              id="message"
              placeholder="Add a message of support"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              className="border-white/[0.08] bg-[#060e1e] text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5"
            />
            <Label htmlFor="anonymous" className="text-sm text-white/70">
              Make my donation anonymous
            </Label>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep('amount')} className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
              Back
            </button>
            <button
              className="flex-1 inline-flex items-center justify-center rounded-2xl bg-[#0ef695] px-6 py-3 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8] disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleProceedToCheckout}
              disabled={processing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
