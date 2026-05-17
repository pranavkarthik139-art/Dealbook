import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'closed' | 'on-hold' | 'lost' | 'default';
  className?: string;
}

const variantStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-100 text-slate-800',
  'on-hold': 'bg-amber-100 text-amber-800',
  lost: 'bg-rose-100 text-rose-800',
  default: 'bg-slate-100 text-slate-800',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
        variantStyles[variant]
      } ${className}`}
    >
      {children}
    </span>
  );
}
