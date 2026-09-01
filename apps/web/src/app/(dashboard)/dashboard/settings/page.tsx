'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { NotificationPreferences } from '@/components/settings/notification-preferences';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

export default function SettingsPage() {
  const { user, loading, refreshUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ef695] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  async function handleSavePhone() {
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) throw new Error('Failed to save');

      await refreshUser();
      toast.success('Phone number saved');
    } catch {
      toast.error('Failed to save phone number');
    } finally {
      setSaving(false);
    }
  }

  const verificationLevels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    none: { label: 'Unverified', color: 'bg-white/10 text-white/50', icon: Shield },
    email: { label: 'Email Verified', color: 'bg-blue-500/10 text-blue-400', icon: Mail },
    phone: { label: 'Phone Verified', color: 'bg-purple-500/10 text-purple-400', icon: Phone },
    identity: { label: 'Identity Verified', color: 'bg-[#0ef695]/10 text-[#0ef695]', icon: ShieldCheck },
    address: { label: 'Address Verified', color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle },
    full: { label: 'Fully Verified', color: 'bg-[#0ef695]/10 text-[#0ef695]', icon: ShieldCheck },
  };

  const currentVerification = verificationLevels[user.verificationLevel || 'none'] || verificationLevels.none;
  const VerificationIcon = currentVerification.icon;

  return (
    <div className="relative p-6 lg:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[500px] rounded-full bg-[#0ef695]/[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1.5 text-white/50">Manage your account and preferences</p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#0ef695]" />
                Account Information
              </CardTitle>
              <CardDescription>Your private account details — not visible to others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled />
                <p className="text-xs text-white/35">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-3">
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSavePhone}
                    disabled={saving || phone === (user.phone || '')}
                    variant="outline"
                    className="border-white/10 hover:bg-white/[0.06]"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role & Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0ef695]" />
                Role & Verification
              </CardTitle>
              <CardDescription>Your account status and verification level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-white/40" />
                  <div>
                    <p className="text-sm font-medium text-white">Account Role</p>
                    <p className="text-xs text-white/50">Your assigned role on the platform</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-white/10 capitalize text-white">
                  {user.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <VerificationIcon className="h-5 w-5 text-white/40" />
                  <div>
                    <p className="text-sm font-medium text-white">Verification Level</p>
                    <p className="text-xs text-white/50">Your current verification status</p>
                  </div>
                </div>
                <Badge variant="outline" className={`border-white/10 ${currentVerification.color}`}>
                  {currentVerification.label}
                </Badge>
              </div>

              <Separator className="bg-white/[0.08]" />

              <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-white/40" />
                  <div>
                    <p className="text-sm font-medium text-white">Member Since</p>
                    <p className="text-xs text-white/50">Account creation date</p>
                  </div>
                </div>
                <span className="text-sm text-white/60">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#0ef695]" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferences
                preferences={{
                  emailNotifications: (user as any).notificationPreferences?.emailNotifications ?? true,
                  donationAlerts: (user as any).notificationPreferences?.donationAlerts ?? true,
                  campaignUpdates: (user as any).notificationPreferences?.campaignUpdates ?? true,
                  marketingEmails: (user as any).notificationPreferences?.marketingEmails ?? false,
                }}
                onSaved={() => refreshUser()}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
