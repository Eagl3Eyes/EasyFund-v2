'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Megaphone, DollarSign, TrendingUp, ArrowRight, Users, BarChart3, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { useAuth } from '@/providers/auth-provider';
import type { Campaign, Donation } from '@/lib/types';
import { getApiUrl } from '@/lib/config';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const isFundraiser = user?.role === 'fundraiser' || user?.role === 'admin';

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const notifRes = await fetch(`${getApiUrl()}/api/auth/notifications?limit=5`, { credentials: 'include' });
        const notifData = await notifRes.json();
        if (notifData.success) setNotifications(notifData.data?.notifications || []);

        if (isFundraiser) {
          const [campaignsRes, donationsRes] = await Promise.all([
            fetch(`${getApiUrl()}/api/campaigns?fundraiserId=${user?._id}&limit=5`, { credentials: 'include' }),
            fetch(`${getApiUrl()}/api/donations/campaign/${user?._id}?limit=5`, { credentials: 'include' }),
          ]);

          const campaignsData = await campaignsRes.json();
          if (campaignsData.success) setMyCampaigns(campaignsData.data);

          const donationsData = await donationsRes.json();
          if (donationsData.success) setRecentDonations(donationsData.data);
        } else {
          const [donationsRes, savedRes] = await Promise.all([
            fetch(`${getApiUrl()}/api/donations/user/${user?.email}?limit=5`, { credentials: 'include' }),
            fetch(`${getApiUrl()}/api/users/saved/campaigns?limit=3`, { credentials: 'include' }),
          ]);

          const donationsData = await donationsRes.json();
          if (donationsData.success) setRecentDonations(donationsData.data);

          const savedData = await savedRes.json();
          if (savedData.success) setSavedCampaigns(savedData.data);
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
  }, [user, isFundraiser]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const fundraiserStats = isFundraiser
    ? [
        {
          title: 'Total Raised',
          value: `$${user?.totalRaised?.toLocaleString() || '0'}`,
          icon: DollarSign,
          color: 'bg-[#0ef695]/10 text-[#0ef695]',
        },
        {
          title: 'My Campaigns',
          value: myCampaigns.length.toString(),
          icon: Megaphone,
          color: 'bg-blue-500/10 text-blue-400',
        },
        {
          title: 'Total Donated',
          value: `$${user?.totalDonated?.toLocaleString() || '0'}`,
          icon: Heart,
          color: 'bg-pink-500/10 text-pink-400',
        },
      ]
    : [
        {
          title: 'Total Donated',
          value: `$${user?.totalDonated?.toLocaleString() || '0'}`,
          icon: Heart,
          color: 'bg-pink-500/10 text-pink-400',
        },
        {
          title: 'Campaigns Supported',
          value: recentDonations.length.toString(),
          icon: Megaphone,
          color: 'bg-blue-500/10 text-blue-400',
        },
        {
          title: 'Saved Campaigns',
          value: savedCampaigns.length.toString(),
          icon: TrendingUp,
          color: 'bg-[#0ef695]/10 text-[#0ef695]',
        },
      ];

  return (
    <div className="relative p-6 lg:p-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[500px] rounded-full bg-[#0ef695]/[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-1.5 text-white/50">
          {isFundraiser
            ? "Here's an overview of your fundraising activity"
            : "Here's an overview of your activity"}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-3"
      >
        {fundraiserStats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.15]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/50">
                  {stat.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        <Link href="/explore">
          <Card variant="glow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0ef695]/10 shadow-[0_0_15px_rgba(14,246,149,0.1)] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(14,246,149,0.2)]">
                  <Heart className="h-5 w-5 text-[#0ef695]" />
                </div>
                <div>
                  <p className="font-semibold text-white">Find a Campaign</p>
                  <p className="text-sm text-white/50">Discover causes to support</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0ef695]" />
            </CardContent>
          </Card>
        </Link>

        {isFundraiser ? (
          <Link href="/dashboard/fundraiser/campaigns/new">
            <Card variant="glow">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0ef695]/10 shadow-[0_0_15px_rgba(14,246,149,0.1)]">
                    <Megaphone className="h-5 w-5 text-[#0ef695]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Start a Campaign</p>
                    <p className="text-sm text-white/50">Create a new fundraiser</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0ef695]" />
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Link href="/dashboard/fundraiser/campaigns/new">
            <Card variant="glow">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0ef695]/10 shadow-[0_0_15px_rgba(14,246,149,0.1)]">
                    <Megaphone className="h-5 w-5 text-[#0ef695]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Become a Fundraiser</p>
                    <p className="text-sm text-white/50">Start raising funds</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0ef695]" />
              </CardContent>
            </Card>
          </Link>
        )}
      </motion.div>

      {/* Fundraiser: My Campaigns */}
      {isFundraiser && myCampaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="border-l-2 border-[#0ef695] pl-3 text-xl font-semibold text-white">
              My Campaigns
            </h2>
            <Link href="/dashboard/fundraiser/campaigns" className="text-sm font-medium text-[#0ef695] transition-colors hover:text-[#38f9a8]">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCampaigns.slice(0, 3).map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <CampaignCard campaign={campaign} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Donations */}
      {recentDonations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="border-l-2 border-[#0ef695] pl-3 text-xl font-semibold text-white">
              {isFundraiser ? 'Recent Donations to My Campaigns' : 'Recent Donations'}
            </h2>
            <Link href="/dashboard/donations" className="text-sm font-medium text-[#0ef695] transition-colors hover:text-[#38f9a8]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentDonations.map((donation, index) => (
              <motion.div
                key={donation._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0c1828]/80 p-4 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.12]"
              >
                <div>
                  <p className="font-medium text-white">{donation.campaignTitle}</p>
                  <p className="text-sm text-white/50">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold text-[#0ef695]">${donation.amount}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Donor: Saved Campaigns */}
      {!isFundraiser && savedCampaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="border-l-2 border-[#0ef695] pl-3 text-xl font-semibold text-white">
              Saved Campaigns
            </h2>
            <Link href="/dashboard/saved" className="text-sm font-medium text-[#0ef695] transition-colors hover:text-[#38f9a8]">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <CampaignCard campaign={campaign} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="border-l-2 border-[#0ef695] pl-3 text-xl font-semibold text-white">
              Recent Activity
            </h2>
            <Link href="/dashboard/notifications" className="text-sm font-medium text-[#0ef695] transition-colors hover:text-[#38f9a8]">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map((n, index) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                className={`flex items-start gap-3 rounded-xl border border-white/[0.08] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.12] ${
                  !n.read ? 'bg-[#0ef695]/[0.04] border-[#0ef695]/20' : 'bg-[#0c1828]/80'
                }`}
              >
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="truncate text-xs text-white/50">{n.message}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-white/40">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
