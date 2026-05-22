'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileMenu } from './MobileMenu';
import { CommandBar } from '@/components/common/CommandBar';
import { ThemeApplier } from '@/components/ThemeApplier';
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
    <>
      {/* Apply current theme to document */}
      <ThemeApplier />

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: themeConfig.mainColor,
        transition: 'background-color 300ms ease'
      }}>
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block" style={{ flexShrink: 0 }}>
          <Sidebar key={theme} />
        </div>

        {/* Mobile Menu - only visible on mobile */}
        <div className="lg:hidden">
          <MobileMenu />
        </div>

      {/* Main area with topbar + content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0  // Prevent flex overflow issues
      }}>
        <Topbar />
        <CommandBar />

        {/* Main content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: themeConfig.mainColor,
          transition: 'background-color 300ms ease',
          padding: 'clamp(16px, 5vw, 32px)' // Responsive padding
        }}>
          {children}
        </main>
      </div>
    </>
  );
}
