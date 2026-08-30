'use client';

import { motion } from 'framer-motion';

export function MobileFallback() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0f1a] via-[#0d1929] to-[#0a1628]">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#10B981]/10 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-[#F59E0B]/8 blur-[80px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#6366F1]/8 blur-[70px]"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating card mockups */}
      <div className="relative flex items-center justify-center py-20">
        <div className="relative h-48 w-32">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20, rotateY: -15 + i * 8 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                y: [0, -8, 0],
                rotateY: [-15 + i * 8, -10 + i * 8, -15 + i * 8],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              style={{ transform: `rotateY(${-15 + i * 8}deg) translateX(${i * 8}px)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
