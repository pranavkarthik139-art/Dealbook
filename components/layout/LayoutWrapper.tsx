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

  // Don't show sidebar/topbar on auth pages or landing page
  const isAuthPage = pathname?.startsWith('/auth');
  const isLandingPage = pathname === '/';

  if (isAuthPage || isLandingPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Apply current theme to document */}
      <ThemeApplier />

      {/* Sidebar - hidden on mobile, fixed positioning */}
      <div className="hidden lg:block" style={{ position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 1000 }}>
        <Sidebar key={theme} />
      </div>

      {/* Mobile Menu - only visible on mobile */}
      <div className="lg:hidden">
        <MobileMenu />
      </div>

      <div style={{
        minHeight: '100vh',
        backgroundColor: themeConfig.mainColor,
        transition: 'background-color 300ms ease',
        marginLeft: '280px'  // Account for fixed sidebar width
      }} className="hidden lg:block">
      {/* Main area with topbar + content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
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
      </div>
    </>
  );
}
