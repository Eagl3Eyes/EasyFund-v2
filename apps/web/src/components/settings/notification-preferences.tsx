'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface NotificationPreferencesProps {
  preferences: {
    emailNotifications?: boolean;
    donationAlerts?: boolean;
    campaignUpdates?: boolean;
    marketingEmails?: boolean;
  };
  onSaved?: () => void;
}

export function NotificationPreferences({ preferences, onSaved }: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState({
    emailNotifications: preferences.emailNotifications ?? true,
    donationAlerts: preferences.donationAlerts ?? true,
    campaignUpdates: preferences.campaignUpdates ?? true,
    marketingEmails: preferences.marketingEmails ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationPreferences: prefs }),
      });
      if (res.ok) {
        toast.success('Preferences saved');
        onSaved?.();
      } else {
        toast.error('Failed to save preferences');
      }
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggles = [
    { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive notifications via email' },
    { key: 'donationAlerts' as const, label: 'Donation Alerts', desc: 'Get notified when you receive a donation' },
    { key: 'campaignUpdates' as const, label: 'Campaign Updates', desc: 'Updates from campaigns you follow' },
    { key: 'marketingEmails' as const, label: 'Marketing Emails', desc: 'Tips, platform updates, and promotions' },
  ];

  return (
    <div className="space-y-4">
      {toggles.map((t) => (
        <div key={t.key} className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label className="text-sm font-medium">{t.label}</Label>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </div>
          <input
            type="checkbox"
            checked={prefs[t.key]}
            onChange={(e) => setPrefs((p) => ({ ...p, [t.key]: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      ))}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Preferences
      </Button>
    </div>
  );
}
