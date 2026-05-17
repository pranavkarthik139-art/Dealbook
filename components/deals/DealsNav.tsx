'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DealsNav() {
  const pathname = usePathname();

  const isKanban = pathname === '/deals';
  const isInsights = pathname === '/deals/insights';

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid var(--line)'
    }}>
      <Link
        href="/deals"
        style={{
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          color: isKanban ? 'var(--cobalt)' : 'var(--ink-lighter)',
          borderBottom: isKanban ? '2px solid var(--cobalt)' : 'none',
          transition: 'color 150ms ease',
          marginBottom: '-1px',
          cursor: 'pointer'
        }}
      >
        🤝 Pipeline
      </Link>

      <Link
        href="/deals/insights"
        style={{
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          color: isInsights ? 'var(--cobalt)' : 'var(--ink-lighter)',
          borderBottom: isInsights ? '2px solid var(--cobalt)' : 'none',
          transition: 'color 150ms ease',
          marginBottom: '-1px',
          cursor: 'pointer'
        }}
      >
        📊 Insights
      </Link>
    </div>
  );
}
