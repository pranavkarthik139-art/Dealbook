'use client';

import { useState, useEffect } from 'react';

export interface DealSummary {
  total: number;
  active: number;
  closed: number;
  onHold: number;
  lost: number;
}

export function useDealStatus() {
  const [summary, setSummary] = useState<DealSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/deals');
        if (!response.ok) throw new Error('Failed to fetch deals');

        const data = await response.json();
        setSummary(data.summary);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDealStatus();
  }, []);

  return { summary, loading, error };
}
