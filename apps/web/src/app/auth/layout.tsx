import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#060e1e]">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#07162C] border-r border-white/10 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-3xl mb-6">
            <span className="text-[#0ef695]">Easy</span>
            <span className="text-white">Fund</span>
          </Link>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Fund What Matters
          </h2>
          <p className="text-white/55">
            Join thousands of people making a difference through crowdfunding.
            Support causes you care about, or start your own campaign.
          </p>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
