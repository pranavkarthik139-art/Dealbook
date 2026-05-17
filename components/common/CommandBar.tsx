'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Deal {
  id: number;
  name: string;
  stage?: string;
  amount?: number;
}

export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Deal[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.deals || []).filter((deal: Deal) =>
            deal.name.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered.slice(0, 10));
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Error searching deals:', error);
      }
    };

    searchDeals();
  }, [query]);

  const handleSelect = (dealId: number) => {
    router.push(`/deals/${dealId}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-32"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="border-b border-line p-4">
          <input
            autoFocus
            type="text"
            placeholder="Search deals... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-ink placeholder-ink-lighter focus:outline-none"
          />
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {results.map((deal, idx) => (
              <button
                key={deal.id}
                onClick={() => handleSelect(deal.id)}
                className={`w-full text-left px-4 py-3 border-b border-line last:border-b-0 transition-colors ${
                  idx === selectedIndex
                    ? 'bg-cobalt-light text-cobalt'
                    : 'text-ink hover:bg-slate-50'
                }`}
              >
                <div className="font-medium">{deal.name}</div>
                <div className="text-xs text-ink-lighter">
                  {deal.stage && <span>{deal.stage.toUpperCase()}</span>}
                  {deal.amount && <span> • ${(deal.amount / 1000).toFixed(0)}k</span>}
                </div>
              </button>
            ))}
          </div>
        ) : query ? (
          <div className="p-4 text-center text-ink-lighter text-sm">
            No deals found matching "{query}"
          </div>
        ) : (
          <div className="p-4 text-center text-ink-lighter text-sm">
            Type to search deals...
          </div>
        )}

        {/* Footer hint */}
        <div className="border-t border-line px-4 py-2 text-xs text-ink-lighter flex justify-between">
          <span>↑↓ to navigate</span>
          <span>Enter to select</span>
        </div>
      </div>
    </div>
  );
}
