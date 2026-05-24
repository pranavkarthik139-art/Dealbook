'use client';

import { useTheme } from '@/lib/ThemeContext';
import { PulseSignal } from '@/lib/dealPulse';

interface PulseAlertProps {
  pulse: PulseSignal;
}

/**
 * PulseAlert - Compact Pulse display as an intelligence attribute
 * Shows customer relationship energy/sentiment in minimal format
 */
export function PulseAlert({ pulse }: PulseAlertProps) {
  const theme = useTheme();
  const textColor = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const labelColor = theme === 'dark' ? '#cbd5e1' : '#64748b';

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
      <p style={{ color: labelColor }} className="text-xs font-semibold uppercase tracking-wide mb-1">Customer Pulse</p>
      <p style={{ color: textColor }} className="text-sm font-medium">{getStatusLabel(pulse.status)} • {pulse.bpm} bpm</p>
      <p style={{ color: labelColor }} className="text-xs mt-1">{pulse.reasonings[0]}</p>
    </div>
  );
}
