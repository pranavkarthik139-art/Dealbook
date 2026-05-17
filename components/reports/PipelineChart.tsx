'use client';

import { useEffect, useState } from 'react';

interface Stage {
  stage: string;
  count: number;
  value: number;
  percentage: string;
  valuePercentage: string;
}

export function PipelineChart() {
  const [data, setData] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/reports/pipeline');
        const result = await response.json();
        console.log('Pipeline API response:', result);
        setData(result.stages || []);
        setTotalValue(result.totalValue || 0);
      } catch (error) {
        console.error('Failed to fetch pipeline data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-ink-lighter">Loading...</div>;
  }

  const stages = ['demo', 'poc', 'validation', 'closed'];
  const stageLabels: Record<string, string> = {
    demo: 'Demo',
    poc: 'POC',
    validation: 'Validation',
    closed: 'Closed',
  };

  return (
    <div className="bg-white rounded-lg border border-line p-6">
      <h3 className="font-semibold text-ink mb-6">Pipeline Overview</h3>

      {/* Horizontal Pipeline */}
      <div className="flex gap-3 mb-8">
        {stages.map(stage => {
          const stageData = data.find(s => s.stage === stage);
          const count = stageData?.count || 0;
          const value = stageData?.value || 0;

          return (
            <div key={stage} className="flex-1">
              <div className="bg-slate-50 rounded-lg border border-line p-4">
                <h4 className="text-sm font-semibold text-ink mb-2">{stageLabels[stage]}</h4>
                <div className="text-2xl font-bold text-cobalt mb-1">${(value / 1000).toFixed(0)}k</div>
                <div className="text-xs text-ink-lighter">{count} deal{count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-line">
        <div className="flex justify-between text-sm">
          <span className="text-ink-lighter">Total pipeline value</span>
          <span className="font-semibold text-ink">${(totalValue / 1000).toFixed(0)}k</span>
        </div>
      </div>
    </div>
  );
}
