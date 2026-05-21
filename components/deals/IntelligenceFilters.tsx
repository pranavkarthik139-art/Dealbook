'use client';

import { useState } from 'react';

interface Filters {
  riskLevel: ('low' | 'medium' | 'high' | 'critical')[];
  healthScoreMin: number;
  healthScoreMax: number;
  momentum: ('positive' | 'neutral' | 'negative')[];
  stage: string[];
  valueMin: number;
  valueMax: number;
  daysInStageMin: number;
  daysInStageMax: number;
}

interface IntelligenceFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

/**
 * IntelligenceFilters Component
 * Sidebar with filter controls for deal intelligence dashboard
 */
export default function IntelligenceFilters({
  filters,
  onFiltersChange,
}: IntelligenceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilters = (newFilters: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const toggleRiskLevel = (level: 'low' | 'medium' | 'high' | 'critical') => {
    const newRiskLevel = filters.riskLevel.includes(level)
      ? filters.riskLevel.filter((r) => r !== level)
      : [...filters.riskLevel, level];
    updateFilters({ riskLevel: newRiskLevel });
  };

  const toggleMomentum = (m: 'positive' | 'neutral' | 'negative') => {
    const newMomentum = filters.momentum.includes(m)
      ? filters.momentum.filter((momentum) => momentum !== m)
      : [...filters.momentum, m];
    updateFilters({ momentum: newMomentum });
  };

  const toggleStage = (stage: string) => {
    const newStages = filters.stage.includes(stage)
      ? filters.stage.filter((s) => s !== stage)
      : [...filters.stage, stage];
    updateFilters({ stage: newStages });
  };

  const resetFilters = () => {
    onFiltersChange({
      riskLevel: [],
      healthScoreMin: 0,
      healthScoreMax: 100,
      momentum: [],
      stage: [],
      valueMin: 0,
      valueMax: 10000000,
      daysInStageMin: 0,
      daysInStageMax: 365,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-500 hover:text-slate-700"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Risk Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">
              Risk Level
            </label>
            <div className="space-y-1">
              {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.riskLevel.includes(level)}
                    onChange={() => toggleRiskLevel(level)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Health Score */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">
              Health Score
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.healthScoreMin}
                  onChange={(e) =>
                    updateFilters({ healthScoreMin: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Min"
                  className="w-1/2 px-2 py-1 text-sm border border-slate-300 rounded"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.healthScoreMax}
                  onChange={(e) =>
                    updateFilters({ healthScoreMax: parseInt(e.target.value) || 100 })
                  }
                  placeholder="Max"
                  className="w-1/2 px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Momentum */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">
              Momentum
            </label>
            <div className="space-y-1">
              {(['positive', 'neutral', 'negative'] as const).map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.momentum.includes(m)}
                    onChange={() => toggleMomentum(m)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 capitalize">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">
              Stage
            </label>
            <div className="space-y-1">
              {['demo', 'poc', 'validation', 'closed'].map((stage) => (
                <label key={stage} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.stage.includes(stage)}
                    onChange={() => toggleStage(stage)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 capitalize">{stage}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deal Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">
              Deal Value ($)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.valueMin}
                  onChange={(e) => updateFilters({ valueMin: parseInt(e.target.value) || 0 })}
                  placeholder="Min"
                  className="w-1/2 px-2 py-1 text-sm border border-slate-300 rounded"
                />
                <input
                  type="number"
                  value={filters.valueMax}
                  onChange={(e) =>
                    updateFilters({ valueMax: parseInt(e.target.value) || 10000000 })
                  }
                  placeholder="Max"
                  className="w-1/2 px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Days in Stage */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">
              Days in Stage
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.daysInStageMin}
                  onChange={(e) =>
                    updateFilters({ daysInStageMin: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Min"
                  className="w-1/2 px-2 py-1 text-sm border border-slate-300 rounded"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.daysInStageMax}
                  onChange={(e) =>
                    updateFilters({ daysInStageMax: parseInt(e.target.value) || 365 })
                  }
                  placeholder="Max"
                  className="w-1/2 px-2 py-1 text-sm border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="w-full px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
