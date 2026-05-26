'use client';

import { useSession } from 'next-auth/react';
import { Header } from '@/components/dashboard/Header';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { DealsSnapshot } from '@/components/dashboard/DealsSnapshot';
import { StageAnalytics } from '@/components/dashboard/StageAnalytics';
import { TodoList } from '@/components/dashboard/TodoList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { CriticalDeals } from '@/components/dashboard/CriticalDeals';
import { KeyInsights } from '@/components/dashboard/KeyInsights';
import { getTheme } from '@/lib/themes';
import { useTheme } from '@/lib/ThemeContext';

export default function DashboardPage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const themeConfig = getTheme(theme);

  // Extract first name from email or use session name
  const getFirstName = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ')[0];
    }
    if (session?.user?.email) {
      return session.user.email.split('@')[0].charAt(0).toUpperCase() + session.user.email.split('@')[0].slice(1);
    }
    return 'Engineer';
  };

  const firstName = getFirstName();

  return (
    <div style={{
      padding: 'var(--space-10) var(--space-8)',
      backgroundColor: themeConfig.mainColor,
      minHeight: '100vh',
      transition: 'background-color 300ms ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <Header userName={firstName} style={{ marginBottom: 'var(--space-10)' }} />

        {/* Main Grid: Left (2/3) + Right (1/3) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-10)'
        }}>
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Today's Focus - Compact */}
            <TodaysFocus />

            {/* Pipeline Summary */}
            <DealsSnapshot />

            {/* Stage Analytics - Pipeline Breakdown */}
            <StageAnalytics />

            {/* Critical Deals */}
            <CriticalDeals />

            {/* Key Insights */}
            <KeyInsights />
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* To-Do List */}
            <TodoList />

            {/* Activity Feed */}
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
