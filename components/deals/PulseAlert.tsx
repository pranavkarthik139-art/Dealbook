'use client';

import { PulseSignal } from '@/lib/dealPulse';

interface PulseAlertProps {
  pulse: PulseSignal;
}

/**
 * PulseAlert - Compact Pulse display as an intelligence attribute
 * Shows customer relationship energy/sentiment in minimal format
 */
export function PulseAlert({ pulse }: PulseAlertProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'flatlined':
        return 'Flatlined';
      case 'weak':
        return 'Weak';
      case 'normal':
        return 'Normal';
      case 'strong':
        return 'Strong';
      case 'accelerating':
        return 'Accelerating';
      default:
        return 'Unknown';
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold text-ink-lighter uppercase tracking-wide mb-1">Customer Pulse</p>
      <p className="text-sm text-ink font-medium">{getStatusLabel(pulse.status)} • {pulse.bpm} bpm</p>
      <p className="text-xs text-ink-lighter mt-1">{pulse.reasonings[0]}</p>
    </div>
  );
}
