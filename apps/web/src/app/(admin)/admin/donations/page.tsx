'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/config';

interface Donation {
  _id: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchDonations() {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/campaigns?limit=100`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          // Flatten donations from campaigns
          const allDonations: Donation[] = [];
          for (const campaign of data.data?.campaigns || []) {
            try {
              const dRes = await fetch(`${getApiUrl()}/api/donations/campaign/${campaign._id}`, { credentials: 'include' });
              const dData = await dRes.json();
              if (dData.success) {
                for (const d of dData.data || []) {
                  allDonations.push({ ...d, campaignTitle: campaign.title });
                }
              }
            } catch {}
          }
          setDonations(allDonations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (error) {
        console.error('Failed to fetch donations:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
  }, []);

  const filtered = donations.filter(d =>
    d.donorEmail?.toLowerCase().includes(search.toLowerCase()) ||
    d.campaignTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Donations</h1>
        <p className="mt-1 text-white/55">View all platform donations</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-white/55">Total Donations</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-white/55">Total Amount</p>
            <p className="text-2xl font-bold text-[#0ef695]">${totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-white/55" />
        <Input
          placeholder="Search by email or campaign..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-white/[0.06]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1828] p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-white/55" />
          <p className="mt-4 text-lg font-medium">No donations found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-white/[0.06]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Campaign</th>
                <th className="px-4 py-3 text-left font-medium">Donor</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((donation) => (
                <tr key={donation._id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{donation.campaignTitle}</td>
                  <td className="px-4 py-3">{donation.donorEmail}</td>
                  <td className="px-4 py-3 font-semibold text-[#0ef695]">${donation.amount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                      {donation.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-white/55">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
