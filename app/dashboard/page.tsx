'use client';

import { Header } from '@/components/dashboard/Header';
import { TimezoneSelector } from '@/components/dashboard/TimezoneSelector';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { StageAnalytics } from '@/components/dashboard/StageAnalytics';
import { DealsSnapshot } from '@/components/dashboard/DealsSnapshot';
import { TodoList } from '@/components/dashboard/TodoList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { EmailSyncButton } from '@/components/dashboard/EmailSyncButton';

export default function DashboardPage() {
  return (
    <div style={{
      padding: '32px 24px',
      backgroundColor: 'var(--paper-bg)',
      minHeight: '100%'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Header with timezone selector and sync button */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
          gap: '16px'
        }}>
          <Header userName="Team" />
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              padding: '12px 16px',
              minWidth: '200px'
            }}>
              <EmailSyncButton />
            </div>
            <TimezoneSelector />
          </div>
        </div>

        {/* Today's Focus + Stage Analytics side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div>
            <TodaysFocus />
          </div>
          <div>
            <StageAnalytics />
          </div>
        </div>

        {/* Deals Summary */}
        <DealsSnapshot />

        {/* Main content grid - To-Do List and Activity Feed */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          marginTop: '32px'
        }}>
          <div style={{ gridColumn: 'span 1' }}>
            <TodoList />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
