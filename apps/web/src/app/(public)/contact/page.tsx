'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { Send, Mail, MessageSquare, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a question or want to get in touch? We&apos;re here to help.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <Mail className="mx-auto h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">support@easyfund.com</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <MessageSquare className="mx-auto h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Live Chat</h3>
            <p className="mt-1 text-sm text-muted-foreground">Available Mon-Fri, 9am-5pm EST</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <MapPin className="mx-auto h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Location</h3>
            <p className="mt-1 text-sm text-muted-foreground">Remote-first company</p>
          </div>
        </div>

        <div className="mt-12 rounded-xl border bg-card p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Message Sent!</h3>
              <p className="mt-2 text-muted-foreground">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
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
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
