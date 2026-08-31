'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface Campaign {
  _id: string;
  title: string;
  amountRaised: number;
}

interface Balance {
  available: number;
  totalWithdrawn: number;
}

export default function WithdrawalRequestPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [amount, setAmount] = useState(0);
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignsRes, balanceRes] = await Promise.all([
          fetch(`${getApiUrl()}/api/campaigns?fundraiserId=${user?._id}&status=active`, { credentials: 'include' }),
          fetch(`${getApiUrl()}/api/withdrawals/balance`, { credentials: 'include' }),
        ]);
        const campaignsData = await campaignsRes.json();
        const balanceData = await balanceRes.json();
        if (campaignsData.success) setCampaigns(campaignsData.data?.campaigns || []);
        if (balanceData.success) setBalance(balanceData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const handleSubmit = async () => {
    if (!selectedCampaign || amount <= 0 || !bankName || !accountNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (balance && amount > balance.available) {
      toast.error(`Insufficient balance. Available: $${balance.available.toFixed(2)}`);
      return;
    }
    if (amount < 50) {
      toast.error('Minimum withdrawal is $50');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/withdrawals`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: selectedCampaign, amount, bankName, accountHolder, accountNumber, routingNumber }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Withdrawal request submitted');
        router.push('/dashboard/fundraiser/withdrawals');
      } else {
        toast.error(data.error?.message || 'Failed to submit request');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const fees = Math.round(amount * 0.02 * 100) / 100;
  const netAmount = amount - fees;

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/fundraiser/withdrawals" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Withdrawals
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Request Withdrawal</h1>
        <p className="mt-1 text-muted-foreground">Withdraw funds from your campaigns</p>
      </div>

      {balance && (
        <Card className="mb-6 max-w-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-primary">${balance.available.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Withdrawal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Campaign</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
            >
              <option value="">Select a campaign</option>
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>{c.title} (Raised: ${c.amountRaised.toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input id="amount" type="number" min="50" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Minimum $50" />
            {amount > 0 && (
              <p className="text-xs text-muted-foreground">
                Fee (2%): ${fees.toFixed(2)} | You receive: ${netAmount.toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., Chase Bank" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account Holder Name</Label>
            <Input id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder={user.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input id="routingNumber" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} placeholder="Routing number (optional)" />
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
            Request Withdrawal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
