'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DealsNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/deals', label: '📊 Pipeline', active: pathname === '/deals' },
    { href: '/deals/intelligence', label: '🧠 Intelligence', active: pathname === '/deals/intelligence' },
    { href: '/deals/insights', label: '💡 Insights', active: pathname === '/deals/insights' },
    { href: '/templates', label: '📋 Templates', active: pathname === '/templates' },
    { href: '/forecasting', label: '📈 Forecasting', active: pathname === '/forecasting' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '0',
      marginBottom: '24px',
      borderBottom: '1px solid var(--theme-border)',
      overflowX: 'auto',
      scrollBehavior: 'smooth'
    }}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          style={{
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            color: tab.active ? 'var(--theme-accent)' : 'var(--theme-text-tertiary)',
            borderBottom: tab.active ? '3px solid var(--theme-accent)' : 'none',
            transition: 'all var(--transition-base)',
            marginBottom: '-1px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (!tab.active) {
              e.currentTarget.style.color = 'var(--theme-text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--theme-border)';
            }
          }}
          onMouseLeave={(e) => {
            if (!tab.active) {
              e.currentTarget.style.color = 'var(--theme-text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
