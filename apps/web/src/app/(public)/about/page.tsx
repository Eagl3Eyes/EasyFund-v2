import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - EasyFund',
  description: 'Learn about EasyFund and our mission to make crowdfunding accessible for everyone.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-white">About EasyFund</h1>

        <div className="prose-invert mt-8 space-y-6 text-white/55">
          <p className="text-lg">
            EasyFund is a modern crowdfunding platform built to connect passionate fundraisers
            with generous supporters. Our mission is to make fundraising accessible, transparent,
            and trustworthy for everyone.
          </p>

          <h2 className="text-2xl font-bold text-white !mt-12">Our Mission</h2>
          <p>
            We believe that everyone deserves the opportunity to raise funds for causes they
            care about. Whether it&apos;s supporting education, healthcare, community development,
            or personal emergencies, EasyFund provides the tools and trust needed to make
            fundraising successful.
          </p>

          <h2 className="text-2xl font-bold text-white !mt-12">What Makes Us Different</h2>
          <ul className="space-y-4">
            <li>
              <strong className="text-white">Verification System:</strong> Our layered
              verification process ensures donors can trust the campaigns they support.
              Fundraisers earn verification badges as they complete identity checks.
            </li>
            <li>
              <strong className="text-white">Transparent Tracking:</strong> Every donation
              is recorded, and campaigns provide regular updates. Donors can see exactly how
              their contributions are making an impact.
            </li>
            <li>
              <strong className="text-white">Secure Payments:</strong> All transactions are
              processed through Stripe, a PCI Level 1 certified payment processor. Your
              financial data is always safe.
            </li>
            <li>
              <strong className="text-white">Low Fees:</strong> We keep our fees
              competitive so more of your money goes to the causes you care about.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-white !mt-12">Our Team</h2>
          <p>
            EasyFund is built by a team of passionate developers and designers who believe
            in the power of technology to create positive change. We&apos;re committed to
            continuously improving the platform based on feedback from our community.
          </p>

          <h2 className="text-2xl font-bold text-white !mt-12">Get in Touch</h2>
          <p>
            Have questions, suggestions, or want to partner with us? We&apos;d love to hear
            from you. Visit our{' '}
            <a href="/contact" className="text-[#0ef695] hover:underline">
              contact page
            </a>{' '}
            to reach out.
          </p>
        </div>
      </div>
    </div>
  );
}
