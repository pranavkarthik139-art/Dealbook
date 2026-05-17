'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      }
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false);
      }
      if (isOpen && e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      }
      if (isOpen && e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      }
      if (isOpen && e.key === 'Enter' && filtered.length > 0) {
        const selectedDeal = filtered[selectedIndex];
        router.push('/deals/' + selectedDeal.id);
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, search, deals, selectedIndex, router]);

  const filtered = deals.filter(deal =>
    deal.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        zIndex: 9999,
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
          <input
            autoFocus
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
              No deals found
            </div>
          ) : (
            filtered.map((deal, index) => (
              <div
                key={deal.id}
                onClick={() => {
                  router.push('/deals/' + deal.id);
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: index === selectedIndex ? '#f3f4f6' : 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1a1a1a' }}>{deal.name}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                    {deal.stage?.toUpperCase()} • ${deal.amount ? (deal.amount / 1000).toFixed(0) : '0'}k
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', padding: '8px 16px', fontSize: '12px', color: '#999' }}>
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
        </div>
      </div>
    </div>
  );
}
