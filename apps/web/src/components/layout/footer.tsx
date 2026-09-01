import Link from 'next/link';
import { Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Explore', href: '/explore' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Create Campaign', href: '/dashboard/fundraiser/campaigns/new' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Terms of Service', href: '/about' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Privacy Policy', href: '/about' },
    ],
  },
];

const socialIcons = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Linkedin, label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/[0.06] bg-[#040b16] py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0ef695] text-[#060e1e]">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="text-base font-bold">
                Easy<span className="text-[#0ef695]">Fund</span>
              </span>
            </Link>
            <p className="mt-4 text-xs text-white/35">
              &copy; {new Date().getFullYear()} EasyFund. All rights reserved.
            </p>
          </div>

          {/* Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-white/40">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-white/30 sm:flex-row">
          <p>Made with ❤️ for people who care.</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/35">Follow Us</span>
            {socialIcons.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:border-white/25 hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
