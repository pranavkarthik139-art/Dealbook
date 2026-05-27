'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { DealsSnapshot } from '@/components/dashboard/DealsSnapshot';
import { TodoList } from '@/components/dashboard/TodoList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { CriticalDeals } from '@/components/dashboard/CriticalDeals';
import { KeyInsights } from '@/components/dashboard/KeyInsights';
import BrainBreakContainer from '@/components/BrainBreak/BrainBreakContainer';
import { getTheme } from '@/lib/themes';
import { useTheme } from '@/lib/ThemeContext';

export default function DashboardPage() {
  const { data: session } = useSession();
  const theme = useTheme();
  const themeConfig = getTheme(theme);
  const [showBrainBreak, setShowBrainBreak] = useState(false);

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

            {/* Brain Break Game */}
            <button
              onClick={() => setShowBrainBreak(true)}
              style={{
                padding: 'var(--space-6)',
                backgroundColor: themeConfig.accentColor,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              🧩 Brain Break - Play a quick game
            </button>
          </div>
        </div>

        {/* Brain Break Modal */}
        {showBrainBreak && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: themeConfig.mainColor,
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <BrainBreakContainer onClose={() => setShowBrainBreak(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
