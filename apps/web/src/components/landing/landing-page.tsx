'use client';

import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Facebook,
  FileText,
  Headphones,
  Heart,
  Instagram,
  Linkedin,
  Lock,
  Menu,
  RotateCw,
  ShieldCheck,
  Star,
  Target,
  Twitter,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  AnimatedCounter,
  CampaignCardData,
  CommunityDiorama,
  DiscoverCard,
  HeroGlobe,
  ImpactDiorama,
  Reveal,
  SupportJar,
  TrustCard,
  VerticalSideNav,
} from './landing-components';

const EasyFund3DScene = dynamic(() => import('./easyfund-3d-scene'), {
  ssr: false,
  loading: () => null,
});

/* ==========================================================
   DATA
========================================================== */

const campaigns: CampaignCardData[] = [
  {
    category: 'Education',
    catColor: '#2563eb',
    title: 'Build a School in Rural India',
    raised: '$18,450',
    percent: 61,
    supporters: 98,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Medical',
    catColor: '#ef4444',
    title: 'Help Children Fight Cancer',
    raised: '$32,860',
    percent: 82,
    supporters: 186,
    image: '/images/landing/child_cancer.jpg',
    featured: true,
  },
  {
    category: 'Environment',
    catColor: '#16a34a',
    title: 'Save Our Rainforests',
    raised: '$15,230',
    percent: 43,
    supporters: 112,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'Community',
    catColor: '#9333ea',
    title: 'Food for Homeless People',
    raised: '$9,600',
    percent: 48,
    supporters: 76,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  },
];

const SECTIONS = ['home', 'discover', 'support', 'impact', 'trust', 'joinus'];

/* ==========================================================
   LANDING PAGE
========================================================== */

export default function LandingPage() {
  const [menu, setMenu] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [selectedAmt, setSelectedAmt] = useState(25);

  // Scroll‑spy
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i]);
        if (el && el.offsetTop <= y) { setActiveSection(i); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroTextY = useTransform(heroScroll, [0, 1], [0, -60]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#060e1e] font-sans text-white selection:bg-[#0ef695]/30">
      {/* 3D Background */}
      <EasyFund3DScene />

      {/* Side Nav */}
      <VerticalSideNav active={activeSection} />

      {/* ================================================================
          NAVBAR
      ================================================================ */}
      <header className="fixed left-0 top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
          <nav className="flex h-14 items-center justify-between rounded-2xl border border-white/[0.08] bg-[#071324]/80 px-4 shadow-2xl backdrop-blur-xl sm:h-16 lg:px-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0ef695] text-[#060e1e] shadow-lg shadow-[#0ef695]/20 sm:h-9 sm:w-9">
                <Heart className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
              </div>
              <span className="text-base font-bold tracking-tight sm:text-lg">
                Easy<span className="text-[#0ef695]">Fund</span>
              </span>
            </a>

            {/* Desktop Links */}
            <div className="hidden items-center gap-6 text-[13px] font-medium text-white/60 lg:flex">
              {[
                ['Explore', '#discover'],
                ['Categories', '#support'],
                ['How It Works', '#impact'],
                ['About Us', '#trust'],
                ['Success Stories', '#joinus'],
              ].map(([l, h]) => (
                <a key={l} href={h} className="transition hover:text-white">{l}</a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2.5 lg:flex">
              <a href="/auth/login" className="rounded-xl border border-white/12 px-4 py-[7px] text-[13px] font-medium transition hover:bg-white/10">
                Log in
              </a>
              <a href="/campaigns/new" className="rounded-xl bg-[#0ef695] px-5 py-2 text-[13px] font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:-translate-y-0.5 hover:bg-[#38f9a8]">
                Start a Campaign
              </a>
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setMenu(!menu)} className="rounded-xl border border-white/10 p-2 lg:hidden" aria-label="Menu">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>

          {/* Mobile dropdown */}
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-2xl border border-white/10 bg-[#071324]/95 p-4 backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {[['Explore', '#discover'], ['Categories', '#support'], ['How It Works', '#impact'], ['About Us', '#trust'], ['Success Stories', '#joinus']].map(([l, h]) => (
                  <a key={l} href={h} onClick={() => setMenu(false)} className="rounded-xl px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">{l}</a>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href="/auth/login" className="rounded-xl border border-white/10 py-2.5 text-center text-sm font-medium">Log in</a>
                  <a href="/campaigns/new" className="rounded-xl bg-[#0ef695] py-2.5 text-center text-sm font-bold text-[#060e1e]">Start Campaign</a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* ================================================================
          01 — HERO
      ================================================================ */}
      <section ref={heroRef} id="home" className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32 lg:pt-36">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
            {/* LEFT */}
            <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-[2.4rem] font-extrabold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]"
              >
                Make a Difference.
                <br />
                Fund What <span className="text-[#0ef695]">Matters.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/55 sm:mt-6 sm:text-base lg:text-lg"
              >
                EasyFund connects kind people with meaningful causes. Together,
                we can turn small actions into big impact.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-7 flex flex-wrap gap-3 sm:mt-8"
              >
                <a
                  href="#discover"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-[#0ef695] px-6 py-3.5 text-[14px] font-bold text-[#060e1e] shadow-xl shadow-[#0ef695]/20 transition hover:-translate-y-0.5 hover:bg-[#38f9a8] sm:px-7 sm:py-4"
                >
                  Explore Campaigns
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-[14px] font-bold backdrop-blur transition hover:bg-white/10 sm:px-7 sm:py-4"
                >
                  Start a Campaign
                </a>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="mt-10 flex flex-wrap items-center gap-4 sm:mt-12"
              >
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-[#060e1e] object-cover sm:h-9 sm:w-9" />
                  ))}
                </div>
                <span className="text-xs text-white/50 sm:text-[13px]">
                  Join <strong className="text-white/70">25,000+</strong> people making an impact
                </span>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT — 3D Earth Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2 }}
            >
              <HeroGlobe />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 sm:flex"
        >
          <div className="flex h-7 w-[18px] justify-center rounded-full border border-white/25 p-[3px]">
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="h-[6px] w-[4px] rounded-full bg-[#0ef695]"
            />
          </div>
          <span className="text-[10px] tracking-widest text-white/30">Scroll to explore</span>
        </motion.div>
      </section>

      {/* ================================================================
          02 — DISCOVER
      ================================================================ */}
      <section id="discover" className="relative z-20 bg-[#EFF2F6] py-20 text-[#071324] sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[0.45fr_1fr] lg:gap-14">
            {/* Left Sidebar Header */}
            <div>
              <Reveal>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#16a34a]">
                  02 Discover
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                  There&apos;s Always a Cause
                  <br className="hidden sm:block" />
                  Worth <span className="text-[#16a34a]">Supporting</span>
                </h2>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="mt-4 text-sm leading-relaxed text-[#071324]/55 sm:text-[15px]">
                  Explore verified campaigns across categories that matter to you.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <a
                  href="/explore"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0ef695] px-5 py-3 text-[13px] font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:bg-[#38f9a8]"
                >
                  Browse All Campaigns <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Reveal>
            </div>

            {/* Right Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {campaigns.map((c, i) => (
                <DiscoverCard key={c.title} card={c} index={i} />
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="mt-10 flex justify-center gap-2 lg:mt-12">
            {[true, false, false, false, false].map((on, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  on ? 'bg-[#071324]' : 'bg-[#071324]/20'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          03 — SUPPORT
      ================================================================ */}
      <section id="support" className="relative z-20 overflow-hidden bg-[#061224] py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(14,246,149,0.05),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* Left */}
            <div>
              <Reveal>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#0ef695]">03 Support</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                  Every Contribution
                  <br /><span className="text-[#0ef695]">Counts</span>
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-[15px]">
                  No amount is too small when it comes to creating a better tomorrow.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-8 grid max-w-md grid-cols-4 gap-2.5">
                  {[10, 25, 50, 100].map((a) => (
                    <button
                      key={a}
                      onClick={() => setSelectedAmt(a)}
                      className={`rounded-2xl py-3 text-sm font-bold transition-all ${
                        selectedAmt === a
                          ? 'bg-[#0ef695] text-[#060e1e] shadow-lg shadow-[#0ef695]/25'
                          : 'border border-white/10 bg-[#0a1b30] text-white hover:border-white/20 hover:bg-[#0f2240]'
                      }`}
                    >
                      ${a}
                    </button>
                  ))}
                </div>
                <button className="mt-2.5 w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1b30]/60 py-3 text-left px-4 text-sm text-white/35 transition hover:border-white/20">
                  Custom Amount
                </button>
              </Reveal>
            </div>

            {/* Right — 3D Jar */}
            <SupportJar />
          </div>
        </div>
      </section>

      {/* ================================================================
          04 — IMPACT
      ================================================================ */}
      <section id="impact" className="relative z-20 overflow-hidden bg-[#07162C] py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
          {/* Stats Flow Row */}
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-10">
              {[
                { icon: <Target className="h-5 w-5" />, bg: 'bg-sky-500/10', col: 'text-sky-400', label: 'Goal', val: '$50,000' },
                { icon: <Heart className="h-5 w-5 fill-current" />, bg: 'bg-pink-500/10', col: 'text-pink-400', label: 'Raised', val: '$37,500' },
                { icon: <RotateCw className="h-5 w-5" />, bg: 'bg-[#0ef695]/10', col: 'text-[#0ef695]', label: 'Progress', val: '75%' },
                { icon: <Calendar className="h-5 w-5" />, bg: 'bg-purple-500/10', col: 'text-purple-400', label: 'Days Left', val: '12' },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.col}`}>{s.icon}</div>
                    <div>
                      <p className="text-[10px] text-white/35">{s.label}</p>
                      <p className="text-sm font-bold sm:text-base">{s.val}</p>
                    </div>
                  </div>
                  {i < 3 && <ArrowRight className="hidden h-4 w-4 text-white/15 sm:block" />}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Main 2-col */}
          <div className="mt-14 grid items-center gap-12 lg:mt-20 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <Reveal>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#0ef695]">04 Impact</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                  Watch an Idea
                  <br />Become <span className="text-[#0ef695]">Impact</span>
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-[15px]">
                  Track progress in real-time as your support brings change to life.
                </p>
              </Reveal>
            </div>

            {/* 3D Diorama */}
            <ImpactDiorama />
          </div>
        </div>
      </section>

      {/* ================================================================
          05 — TRUST
      ================================================================ */}
      <section id="trust" className="relative z-20 overflow-hidden py-20 sm:py-24 lg:py-32" style={{ background: 'linear-gradient(160deg, #071e2e 0%, #0a2e36 45%, #0c3a3f 75%, #0a2e36 100%)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
          <div className="grid items-start gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
            {/* Left */}
            <div>
              <Reveal>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#0ef695]">05 Trust</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                  Built on <span className="text-[#0ef695]">Trust.</span>
                  <br />Backed by <span className="text-[#0ef695]">Safety.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-[15px]">
                  We ensure every campaign and contribution is secure and transparent.
                </p>
              </Reveal>
            </div>

            {/* Right — 4 Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TrustCard idx={0} icon={<ShieldCheck className="h-7 w-7" />} badgeBg="rgba(14,246,149,0.15)" iconColor="#0ef695" title="Verified Campaigns" desc="Every campaign is reviewed for authenticity." />
              <TrustCard idx={1} icon={<Lock className="h-7 w-7" />} badgeBg="rgba(168,85,247,0.15)" iconColor="#c084fc" title="Secure Payments" desc="Your donations are protected with bank-level security." />
              <TrustCard idx={2} icon={<FileText className="h-7 w-7" />} badgeBg="rgba(56,189,248,0.15)" iconColor="#38bdf8" title="Transparent Tracking" desc="Track progress and see real impact in real-time." />
              <TrustCard idx={3} icon={<Headphones className="h-7 w-7" />} badgeBg="rgba(244,114,182,0.15)" iconColor="#f472b6" title="Dedicated Support" desc="Our team is here to help you anytime." />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          06 — JOIN US
      ================================================================ */}
      <section id="joinus" className="relative z-20 overflow-hidden bg-[#061326] py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(14,246,149,0.08),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <Reveal>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#0ef695]">06 Join Us</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-3 text-[2.1rem] font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Together, We Can
                  <br />Create a <span className="text-[#0ef695]">Better World</span>
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-[15px]">
                  Start your campaign or support others today. Every action makes a difference.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="/campaigns/new" className="rounded-2xl bg-[#0ef695] px-6 py-3.5 text-sm font-bold text-[#060e1e] shadow-lg shadow-[#0ef695]/20 transition hover:-translate-y-0.5 hover:bg-[#38f9a8]">
                    Start a Campaign
                  </a>
                  <a href="/explore" className="rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold backdrop-blur transition hover:bg-white/10">
                    Explore Campaigns
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Community Diorama */}
            <CommunityDiorama />
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer className="relative z-20 border-t border-white/[0.06] bg-[#040b16] py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0ef695] text-[#060e1e]">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
                <span className="text-base font-bold">Easy<span className="text-[#0ef695]">Fund</span></span>
              </a>
              <p className="mt-4 text-xs text-white/35">&copy; {new Date().getFullYear()} EasyFund. All rights reserved.</p>
            </div>

            {/* Columns */}
            {[
              { title: 'Platform', links: [['Explore', '/explore'], ['How It Works', '/how-it-works'], ['Create Campaign', '/campaigns/new']] },
              { title: 'Support', links: [['Help Center', '/contact'], ['Contact Us', '/contact'], ['Terms of Service', '/about']] },
              { title: 'Company', links: [['About Us', '/about'], ['Careers', '/about'], ['Privacy Policy', '/about']] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/60">{col.title}</h4>
                <ul className="mt-3 space-y-2 text-xs text-white/40">
                  {col.links.map(([l, h]) => (
                    <li key={l}><a href={h} className="transition hover:text-white">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-white/30 sm:flex-row">
            <p>Made with ❤️ for people who care.</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/35">Follow Us</span>
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:border-white/25 hover:text-white">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
