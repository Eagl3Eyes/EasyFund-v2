'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Globe,
  Loader2,
  MapPin,
  Save,
  Users,
  Megaphone,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite((user as any).website || '');
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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`${getApiUrl()}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.data?.url || uploadData.url;

      const profileRes = await fetch(`${getApiUrl()}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!profileRes.ok) throw new Error('Profile update failed');

      await refreshUser();
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, bio, location, website }),
      });

      if (!res.ok) throw new Error('Failed to save');

      await refreshUser();
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    {
      label: 'Followers',
      value: (user as any).followersCount || 0,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Campaigns',
      value: user.campaignsCount || 0,
      icon: Megaphone,
      color: 'bg-[#0ef695]/10 text-[#0ef695]',
    },
    {
      label: 'Total Donated',
      value: `$${(user.totalDonated || 0).toLocaleString()}`,
      icon: Heart,
      color: 'bg-pink-500/10 text-pink-400',
    },
    {
      label: 'Total Raised',
      value: `$${(user.totalRaised || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
  ];

  return (
    <div className="relative p-6 lg:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[500px] rounded-full bg-[#0ef695]/[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
        <p className="mt-1.5 text-white/50">Manage your public profile information</p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="h-28 w-28 overflow-hidden rounded-2xl bg-[#071324] ring-2 ring-[#0ef695]/20 ring-offset-2 ring-offset-[#0c1828]">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || ''}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#0ef695]">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-white/50">{user.email}</p>
                  <p className="mt-1 text-xs text-white/35">Click avatar to change photo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Public Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#0ef695]" />
                Public Information
              </CardTitle>
              <CardDescription>This information will be visible on your public profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell others about yourself and what drives you to support causes"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/50">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-end"
        >
          <Button onClick={handleSave} disabled={saving} className="bg-[#0ef695] text-[#060e1e] hover:bg-[#38f9a8]">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
