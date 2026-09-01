'use client';

import { useState } from 'react';
import { Send, Mail, MessageSquare, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        toast.error(data.error?.message || 'Failed to send message');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-white">Contact Us</h1>
        <p className="mt-4 text-lg text-white/55">
          Have a question or want to get in touch? We&apos;re here to help.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1828] p-6 text-center shadow-sm">
            <Mail className="mx-auto h-6 w-6 text-[#0ef695]" />
            <h3 className="mt-3 font-semibold text-white">Email</h3>
            <p className="mt-1 text-sm text-white/55">support@easyfund.com</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1828] p-6 text-center shadow-sm">
            <MessageSquare className="mx-auto h-6 w-6 text-[#0ef695]" />
            <h3 className="mt-3 font-semibold text-white">Live Chat</h3>
            <p className="mt-1 text-sm text-white/55">Available Mon-Fri, 9am-5pm EST</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1828] p-6 text-center shadow-sm">
            <MapPin className="mx-auto h-6 w-6 text-[#0ef695]" />
            <h3 className="mt-3 font-semibold text-white">Location</h3>
            <p className="mt-1 text-sm text-white/55">Remote-first company</p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/[0.08] bg-[#0c1828] p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0ef695]/10">
                <Send className="h-6 w-6 text-[#0ef695]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Message Sent!</h3>
              <p className="mt-2 text-white/55">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <button onClick={() => setSubmitted(false)} className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80">Name</Label>
                  <Input id="name" required placeholder="Your name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="border-white/[0.08] bg-[#060e1e] text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email</Label>
                  <Input id="email" type="email" required placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="border-white/[0.08] bg-[#060e1e] text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white/80">Subject</Label>
                <Input id="subject" required placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} className="border-white/[0.08] bg-[#060e1e] text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-white/80">Message</Label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full rounded-xl border border-white/[0.08] bg-[#060e1e] px-3 py-2.5 text-sm text-white placeholder:text-white/30 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ef695]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.message}
                  onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-2xl bg-[#0ef695] px-6 py-3 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
