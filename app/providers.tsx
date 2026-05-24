'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/ThemeContext';
import { ThemeApplier } from '@/components/layout/ThemeApplier';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth" refetchInterval={0}>
      <ThemeProvider>
        <ThemeApplier />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
