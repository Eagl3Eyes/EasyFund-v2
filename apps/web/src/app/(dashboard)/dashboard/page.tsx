'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Megaphone, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { useAuth } from '@/providers/auth-provider';
import type { Campaign, Donation } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch recent donations
        const donationsRes = await fetch(`${getApiUrl()}/api/donations/user/${user?.email}?limit=5`, {
          credentials: 'include',
        });
        const donationsData = await donationsRes.json();
        if (donationsData.success) {
          setRecentDonations(donationsData.data);
        }

        // Fetch saved campaigns
        const savedRes = await fetch(`${getApiUrl()}/api/users/saved/campaigns?limit=3`, {
          credentials: 'include',
        });
        const savedData = await savedRes.json();
        if (savedData.success) {
          setSavedCampaigns(savedData.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsDataLoading(false);
      }
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: 'Total Donated',
      value: `$${user?.totalDonated?.toLocaleString() || '0'}`,
      icon: Heart,
      color: 'text-pink-500',
    },
    {
      title: 'Campaigns Supported',
      value: recentDonations.length.toString(),
      icon: Megaphone,
      color: 'text-blue-500',
    },
    {
      title: 'Saved Campaigns',
      value: savedCampaigns.length.toString(),
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/explore">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Find a Campaign</p>
                  <p className="text-sm text-muted-foreground">Discover causes to support</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        {user?.role === 'fundraiser' || user?.role === 'admin' ? (
          <Link href="/campaigns/new">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Start a Campaign</p>
                    <p className="text-sm text-muted-foreground">Create a new fundraiser</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Link href="/auth/register?role=fundraiser">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Become a Fundraiser</p>
                    <p className="text-sm text-muted-foreground">Start raising funds</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Recent Donations */}
      {recentDonations.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Donations</h2>
            <Link href="/dashboard/donations" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentDonations.map((donation) => (
              <div key={donation._id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-foreground">{donation.campaignTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold text-primary">${donation.amount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Campaigns */}
      {savedCampaigns.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Saved Campaigns</h2>
            <Link href="/dashboard/saved" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
