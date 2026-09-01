import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, HandCoins, BarChart3, ShieldCheck, Heart, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works - EasyFund',
  description: 'Learn how EasyFund works and how you can support or start a campaign.',
};

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-white">How EasyFund Works</h1>
        <p className="mt-4 text-lg text-white/55">
          Simple, transparent, and impactful crowdfunding for everyone.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-4xl space-y-16">
        {/* For Donors */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">For Supporters</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Search, title: 'Discover', desc: 'Browse campaigns across various categories. Find causes that resonate with your values and passions.' },
              { icon: HandCoins, title: 'Donate Securely', desc: 'Make a donation in just a few clicks. All payments are processed securely through Stripe.' },
              { icon: BarChart3, title: 'Track Impact', desc: 'Follow campaign updates and see how your support is making a real difference in people\'s lives.' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#0c1828] p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0ef695]/10 text-[#0ef695]">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/55">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Fundraisers */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">For Fundraisers</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Heart, title: 'Create Campaign', desc: 'Tell your story, set a goal, and add images. Our wizard makes it easy to get started.' },
              { icon: Users, title: 'Build Community', desc: 'Share your campaign and engage with supporters. Post updates to keep them informed.' },
              { icon: ShieldCheck, title: 'Get Verified', desc: 'Earn trust with verification badges. Verified campaigns receive more donations on average.' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#0c1828] p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0ef695]/10 text-[#0ef695]">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/55">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Trust & Safety</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-white">Verified Fundraisers</h3>
              <p className="mt-2 text-sm text-white/55">
                All fundraisers go through our verification process. Verified accounts display
                a badge so donors know they can trust the campaign.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Secure Payments</h3>
              <p className="mt-2 text-sm text-white/55">
                All donations are processed through Stripe, a PCI Level 1 certified payment
                processor. Your financial information is never stored on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Transparent Tracking</h3>
              <p className="mt-2 text-sm text-white/55">
                Every donation is recorded and campaigns provide regular updates. You can see
                exactly where your money goes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Admin Oversight</h3>
              <p className="mt-2 text-sm text-white/55">
                Our team reviews campaigns and monitors for fraudulent activity. We have
                measures in place to protect both donors and fundraisers.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mt-4 text-white/55">
            Join thousands of people making a difference through EasyFund.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-2xl bg-[#0ef695] px-7 py-3.5 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8]"
            >
              Explore Campaigns
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Start a Campaign
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
