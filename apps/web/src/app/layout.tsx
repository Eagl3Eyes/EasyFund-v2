import type { Metadata } from 'next';
import { Manrope, Sora } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { CommandPalette } from '@/components/command-palette';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: {
    default: 'EasyFund - Fund What Matters',
    template: '%s | EasyFund',
  },
  description:
    'EasyFund is a modern crowdfunding platform that connects people who want to make a difference with causes that matter. Support campaigns, fund dreams, and track impact.',
  keywords: ['crowdfunding', 'donations', 'fundraising', 'charity', 'campaigns', 'support'],
  authors: [{ name: 'EasyFund' }],
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'EasyFund',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${sora.variable} font-manrope antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
              >
                Skip to content
              </a>
              <div id="main-content">
                {children}
              </div>
              <CommandPalette />
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
