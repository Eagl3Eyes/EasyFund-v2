'use client';

export default function ExploreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mb-6 text-white/55">{error.message || 'Failed to load campaigns'}</p>
      <div className="flex gap-3">
        <button onClick={reset} className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
          Try Again
        </button>
        <a href="/" className="inline-flex items-center justify-center rounded-2xl bg-[#0ef695] px-5 py-2.5 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8]">
          Back to Home
        </a>
      </div>
    </div>
  );
}
