'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandBar } from '@/components/common/CommandBar';
import { getTheme } from '@/lib/themes';
import { useTheme } from '@/lib/ThemeContext';
import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const themeConfig = getTheme(theme);
  const pathname = usePathname();

  // Don't show sidebar/topbar on auth pages
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: themeConfig.mainColor,
      transition: 'background-color 300ms ease'
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
          backgroundColor: themeConfig.mainColor,
          transition: 'background-color 300ms ease'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
