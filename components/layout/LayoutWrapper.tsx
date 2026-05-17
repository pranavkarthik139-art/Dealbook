'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandBar } from '@/components/common/CommandBar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--paper-bg)'
    }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area with topbar + content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Topbar />
        <CommandBar />

        {/* Main content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'var(--paper-bg)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
