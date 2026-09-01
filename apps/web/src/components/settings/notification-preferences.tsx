'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      const res = await fetch(`${getApiUrl()}/api/auth/notification-preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prefs),
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
    <div className="space-y-3">
      {toggles.map((t) => (
        <div
          key={t.key}
          className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
        >
          <div>
            <p className="text-sm font-medium text-white">{t.label}</p>
            <p className="text-xs text-white/50">{t.desc}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs[t.key]}
            onClick={() => setPrefs((p) => ({ ...p, [t.key]: !p[t.key] }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ef695]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060e1e] ${
              prefs[t.key] ? 'bg-[#0ef695]' : 'bg-white/10'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                prefs[t.key] ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="bg-[#0ef695] text-[#060e1e] hover:bg-[#38f9a8]">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
