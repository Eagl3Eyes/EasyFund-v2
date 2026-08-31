import Link from 'next/link';
import { Heart } from 'lucide-react';

const footerLinks = {
  discover: [
    { label: 'Explore Campaigns', href: '/explore' },
    { label: 'Categories', href: '/categories' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About Us', href: '/about' },
  ],
  fundraiser: [
    { label: 'Start a Campaign', href: '/dashboard/campaigns/new' },
    { label: 'Fundraiser Guide', href: '/how-it-works' },
    { label: 'Verification', href: '/how-it-works' },
    { label: 'Withdrawals', href: '/how-it-works' },
  ],
  support: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Help Center', href: '/contact' },
    { label: 'Trust & Safety', href: '/how-it-works' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/about' },
    { label: 'Privacy Policy', href: '/about' },
    { label: 'Cookie Policy', href: '/about' },
    { label: 'Refund Policy', href: '/about' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <span className="text-primary">Easy</span>
              <span>Fund</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Empowering communities through crowdfunding. Every contribution creates lasting impact.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>for a better world</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-4 capitalize">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EasyFund. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
