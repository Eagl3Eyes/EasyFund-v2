'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

interface DonationAmountSelectorProps {
  value: number;
  onChange: (amount: number) => void;
  currency?: string;
  disabled?: boolean;
}

export function DonationAmountSelector({ value, onChange, currency = 'USD', disabled }: DonationAmountSelectorProps) {
  const [customInput, setCustomInput] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handlePreset = (amount: number) => {
    setIsCustom(false);
    setCustomInput('');
    onChange(amount);
  };

  const handleCustom = (input: string) => {
    setCustomInput(input);
    const num = parseFloat(input);
    if (!isNaN(num) && num > 0) {
      setIsCustom(true);
      onChange(num);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handlePreset(amount)}
            disabled={disabled}
            className={cn(
              'rounded-2xl border-2 px-3 py-2.5 text-sm font-bold transition-all',
              value === amount && !isCustom
                ? 'border-[#0ef695] bg-[#0ef695]/10 text-[#0ef695]'
                : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:bg-white/[0.06] hover:text-white'
            )}
          >
            ${amount}
          </button>
        ))}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
        <Input
          type="number"
          min="1"
          step="0.01"
          placeholder="Custom amount"
          aria-label="Custom donation amount in dollars"
          value={isCustom ? customInput : value > 0 && !PRESET_AMOUNTS.includes(value) ? value : ''}
          onChange={(e) => handleCustom(e.target.value)}
          disabled={disabled}
          className="pl-7 text-lg font-semibold border-white/[0.08] bg-[#060e1e] text-white placeholder:text-white/30 focus-visible:ring-[#0ef695]/50"
        />
      </div>
    </div>
  );
}
