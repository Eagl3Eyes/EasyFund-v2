'use client';

import Link from 'next/link';
import { FeaturedCampaigns } from '@/components/home/featured-campaigns';
import { TrustStats } from '@/components/home/trust-stats';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Make a Difference.
            <br />
            <span className="text-primary">Fund What Matters.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Support real people, meaningful causes, and communities that need your help.
            Every contribution creates lasting impact.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Explore Campaigns
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Start a Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Statistics */}
      <TrustStats />

      {/* Featured Campaigns */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Featured Campaigns</h2>
            <p className="mt-3 text-muted-foreground">Discover campaigns making a real impact</p>
          </div>
          <FeaturedCampaigns />
          <div className="mt-8 text-center">
            <Link
              href="/explore"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-6 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              View All Campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">How EasyFund Works</h2>
            <p className="mt-3 text-muted-foreground">Simple, transparent, and impactful</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Find a Cause', desc: 'Browse campaigns and find a cause that resonates with you.' },
              { step: '2', title: 'Understand It', desc: 'Read the story, see the plan, and know where your money goes.' },
              { step: '3', title: 'Support It', desc: 'Make a secure donation in just a few clicks.' },
              { step: '4', title: 'Track Impact', desc: 'Follow updates and see the real difference your support makes.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Explore Categories</h2>
            <p className="mt-3 text-muted-foreground">Find causes you care about</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {[
              { name: 'Education', slug: 'education', icon: '📚', color: 'bg-blue-100 text-blue-700' },
              { name: 'Health', slug: 'health', icon: '❤️', color: 'bg-red-100 text-red-700' },
              { name: 'Community', slug: 'community', icon: '👥', color: 'bg-green-100 text-green-700' },
              { name: 'Emergency', slug: 'emergency', icon: '🆘', color: 'bg-amber-100 text-amber-700' },
              { name: 'Environment', slug: 'environment', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/explore?category=${cat.slug}`}
                className={`rounded-xl p-6 text-center transition-colors hover:shadow-md ${cat.color}`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <p className="mt-2 font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Ready to Make a Difference?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Whether you want to support a cause or start your own campaign, EasyFund gives you
            everything you need to create real impact.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Explore Campaigns
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
