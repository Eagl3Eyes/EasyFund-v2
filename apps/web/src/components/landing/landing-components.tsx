'use client';

import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Leaf,
  Shield,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';

/* ==========================================================
   VERTICAL SIDE NAVIGATION
========================================================== */

const NAV = [
  { id: 'home', num: '01', name: 'Home' },
  { id: 'discover', num: '02', name: 'Discover' },
  { id: 'support', num: '03', name: 'Support' },
  { id: 'impact', num: '04', name: 'Impact' },
  { id: 'trust', num: '05', name: 'Trust' },
  { id: 'joinus', num: '06', name: 'Join Us' },
];

export function VerticalSideNav({ active }: { active: number }) {
  return (
    <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 xl:flex 2xl:left-8">
      <div className="relative flex flex-col gap-5">
        <div className="absolute bottom-2 left-[22px] top-2 w-px bg-white/[0.06]" />
        {NAV.map((s, i) => {
          const on = active === i;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="group relative z-10 flex items-center gap-3 py-1"
            >
              <span
                className={`w-4 text-right font-mono text-[10px] font-bold transition-colors duration-300 ${
                  on ? 'text-[#0ef695]' : 'text-white/15'
                }`}
              >
                {s.num}
              </span>
              <div
                className={`h-[9px] w-[9px] rounded-full border-[1.5px] transition-all duration-300 ${
                  on
                    ? 'scale-[1.3] border-[#0ef695] bg-[#0ef695] shadow-[0_0_10px_#0ef695]'
                    : 'border-white/20 bg-[#060e1e] group-hover:border-white/40'
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                  on ? 'text-white' : 'text-white/20 group-hover:text-white/40'
                }`}
              >
                {s.name}
              </span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}

/* ==========================================================
   ANIMATED COUNTER
========================================================== */

export function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: 2000 });

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  useEffect(() => {
    return spring.on('change', (v: number) => {
      if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ==========================================================
   SCROLL REVEAL WRAPPER (parallax‑aware)
========================================================== */

export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 50,
  x = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ==========================================================
   DISCOVER CARD WITH 3D TILT
========================================================== */

export interface CampaignCardData {
  category: string;
  catColor: string;
  title: string;
  raised: string;
  percent: number;
  supporters: number;
  image: string;
  featured?: boolean;
}

export function DiscoverCard({
  card,
  index,
}: {
  card: CampaignCardData;
  index: number;
}) {
  const tilts = [-5, 0, 3, 6];
  const rotY = tilts[index % 4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: rotY - 2 }}
      whileInView={{ opacity: 1, y: 0, rotateY: rotY }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
      whileHover={{ scale: 1.04, rotateY: 0, z: 50 }}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      className={`group cursor-pointer overflow-hidden rounded-[22px] bg-[#0d1726] shadow-xl ring-1 transition-shadow duration-500 hover:shadow-[0_24px_48px_rgba(0,0,0,0.45)] ${
        card.featured ? 'ring-white/20 lg:scale-[1.02]' : 'ring-white/10'
      }`}
    >
      <div className="relative h-48 overflow-hidden sm:h-56">
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1726] via-transparent to-black/20" />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur"
          style={{ backgroundColor: card.catColor }}
        >
          {card.category}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug">
          {card.title}
        </h3>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm font-extrabold">{card.raised}<span className="ml-1 text-[11px] font-normal text-white/45">raised</span></span>
          <span className="text-xs font-bold text-[#0ef695]">{card.percent}%</span>
        </div>
        <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${card.percent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#0ef695] to-[#38f9a8]"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-white/45">
          <div className="flex -space-x-1.5">
            {['bg-amber-400', 'bg-sky-400', 'bg-rose-400'].map((bg, i) => (
              <div key={i} className={`h-4 w-4 rounded-full border border-[#0d1726] ${bg}`} />
            ))}
          </div>
          <span>{card.supporters} supporters</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ==========================================================
   HERO GLOBE WITH FLOATING CARD
========================================================== */

export function HeroGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);

  return (
    <motion.div ref={ref} style={{ y, scale }} className="relative flex items-center justify-center">
      <div className="absolute h-[520px] w-[520px] rounded-full bg-[#0ef695]/[0.08] blur-[120px]" />

      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[520px]"
      >
        <img
          src="/images/landing/hero_earth.jpg"
          alt="3D Earth Globe"
          className="w-full rounded-3xl object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
        />

        {/* Campaign Overlay Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-[22%] w-[220px] rounded-2xl border border-white/15 bg-[#071728]/90 p-3.5 shadow-2xl backdrop-blur-xl sm:-right-6 sm:w-[250px]"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#0ef695]/20 px-2 py-0.5 text-[8px] font-bold text-[#0ef695]">FEATURED</span>
            <span className="text-[8px] text-white/35">Verified</span>
          </div>
          <h4 className="mt-2 text-xs font-bold sm:text-sm">Clean Water For All</h4>
          <div className="mt-2 flex items-baseline justify-between text-[11px]">
            <span className="font-bold">$24,350 <span className="text-[9px] font-normal text-white/45">raised</span></span>
            <span className="font-bold text-[#0ef695]">76%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '76%' }}
              transition={{ duration: 1.4, delay: 1.2 }}
              className="h-full rounded-full bg-gradient-to-r from-[#0ef695] to-[#38f9a8]"
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/40">
            <div className="flex -space-x-1">
              {['bg-amber-400', 'bg-sky-400', 'bg-pink-400'].map((c, i) => (
                <div key={i} className={`h-3.5 w-3.5 rounded-full border border-[#071728] ${c}`} />
              ))}
            </div>
            <span>152 supporters</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================
   SUPPORT JAR (3D Image + Orbiting Badges)
========================================================== */

export function SupportJar() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div ref={ref} style={{ y }} className="relative flex items-center justify-center">
      <div className="absolute h-[440px] w-[440px] rounded-full bg-[#0ef695]/[0.08] blur-[110px]" />

      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <img
          src="/images/landing/support_jar.jpg"
          alt="3D Donation Heart Jar"
          className="w-full rounded-3xl object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
        />

        {[
          { Icon: User, color: 'text-amber-400', border: 'border-amber-400/40', shadow: 'rgba(251,191,36,0.3)', pos: '-left-4 top-20', dy: [-3, 3, -3], dur: 3 },
          { Icon: Heart, color: 'text-pink-400 fill-pink-400', border: 'border-pink-400/40', shadow: 'rgba(244,114,182,0.3)', pos: '-right-4 top-14', dy: [4, -4, 4], dur: 3.5 },
          { Icon: Leaf, color: 'text-[#0ef695]', border: 'border-[#0ef695]/40', shadow: 'rgba(14,246,149,0.3)', pos: '-left-2 bottom-24', dy: [-4, 4, -4], dur: 4 },
          { Icon: Shield, color: 'text-sky-400', border: 'border-sky-400/40', shadow: 'rgba(56,189,248,0.3)', pos: '-right-2 bottom-28', dy: [3, -3, 3], dur: 4.2 },
        ].map(({ Icon, color, border, shadow, pos, dy, dur }, i) => (
          <motion.div
            key={i}
            animate={{ y: dy }}
            transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute ${pos} flex h-11 w-11 items-center justify-center rounded-full ${border} bg-[#0d1e33]/90 backdrop-blur-md`}
            style={{ boxShadow: `0 0 15px ${shadow}` }}
          >
            <Icon className={`h-5 w-5 ${color}`} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================
   IMPACT DIORAMA
========================================================== */

export function ImpactDiorama() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -30]);

  return (
    <motion.div ref={ref} style={{ y }} className="relative flex items-center justify-center">
      <div className="absolute h-[440px] w-[440px] rounded-full bg-[#0ef695]/[0.08] blur-[100px]" />

      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <img
          src="/images/landing/impact_school.jpg"
          alt="3D School Construction Diorama"
          className="w-full rounded-3xl object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
        />

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: 10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute -bottom-8 -right-2 w-60 rounded-2xl border border-white/15 bg-[#09182b]/95 p-4 shadow-2xl backdrop-blur-xl sm:-right-10 sm:w-[280px]"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold sm:text-sm">School Building Project</h4>
            <span className="rounded-full bg-[#0ef695]/20 px-2 py-0.5 text-[8px] font-bold text-[#0ef695]">Active</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between text-xs">
            <span className="font-bold">$37,500 <span className="text-[10px] text-white/45">raised of $50,000</span></span>
            <span className="font-bold text-[#0ef695]">75%</span>
          </div>
          <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '75%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-[#0ef695] to-[#38f9a8]"
            />
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[10px] text-white/45">
            <div className="flex -space-x-1">
              {['bg-sky-400', 'bg-amber-400', 'bg-rose-400'].map((c, i) => (
                <div key={i} className={`h-4 w-4 rounded-full border border-[#09182b] ${c}`} />
              ))}
            </div>
            <span>332 supporters</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================
   JOIN US COMMUNITY IMAGE
========================================================== */

export function CommunityDiorama() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <motion.div ref={ref} style={{ y }} className="relative flex items-center justify-center">
      <div className="absolute h-[440px] w-[440px] rounded-full bg-[#0ef695]/[0.08] blur-[100px]" />

      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[460px]"
      >
        <img
          src="/images/landing/joinus_community.jpg"
          alt="3D Community Children Holding Hands"
          className="w-full rounded-3xl object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
        />
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================
   TRUST CARD
========================================================== */

export function TrustCard({
  icon,
  badgeBg,
  iconColor,
  title,
  desc,
  idx,
}: {
  icon: React.ReactNode;
  badgeBg: string;
  iconColor: string;
  title: string;
  desc: string;
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group flex flex-col items-center rounded-2xl border border-white/10 bg-[#0c1c2e]/60 p-5 text-center shadow-lg backdrop-blur-sm transition-colors hover:border-[#0ef695]/20 hover:bg-[#0e2137]/80 sm:p-6"
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: badgeBg }}
      >
        <div style={{ color: iconColor }}>{icon}</div>
      </div>
      <h3 className="mt-4 text-sm font-bold sm:mt-5 sm:text-[15px]">{title}</h3>
      <p className="mt-2 text-[11px] leading-relaxed text-white/45 sm:text-xs">{desc}</p>
    </motion.div>
  );
}
