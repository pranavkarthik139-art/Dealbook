'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Deal {
  id: number;
  name: string;
  amount?: number;
  status?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string | null;
  lastActivityAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

interface DealDetailHeaderProps {
  deal: Deal;
  onEdit?: (field: string) => void;
  isEditing?: boolean;
  editValues?: Partial<Deal>;
  onEditChange?: (field: string, value: any) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export function DealDetailHeader({
  deal,
  onEdit,
  isEditing = false,
  editValues,
  onEditChange,
  onSave,
  onCancel,
}: DealDetailHeaderProps) {
  const getStageColor = (stage?: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      demo: { bg: '#dbeafe', text: '#1e40af' },
      poc: { bg: '#e9d5ff', text: '#6b21a8' },
      validation: { bg: '#c7d2fe', text: '#3730a3' },
      closed: { bg: '#d1fae5', text: '#065f46' },
    };
    return colors[stage || ''] || { bg: '#f1f5f9', text: '#0f172a' };
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: '#d1fae5', text: '#065f46' },
      on_hold: { bg: '#fef3c7', text: '#92400e' },
      lost: { bg: '#fee2e2', text: '#7f1d1d' },
      closed: { bg: '#f1f5f9', text: '#0f172a' },
    };
    return colors[status || ''] || { bg: '#f1f5f9', text: '#0f172a' };
  };

  const stageColor = getStageColor(deal.stage);
  const statusColor = getStatusColor(deal.status);

  return (
    <div className="space-y-6 pb-8 border-b border-line">
      {/* Title & Amount Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isEditing && editValues ? (
            <input
              type="text"
              value={editValues.name || deal.name}
              onChange={(e) => onEditChange?.('name', e.target.value)}
              className="font-serif text-4xl font-bold text-ink w-full border-b-2 border-cobalt focus:outline-none pb-2 mb-4"
              placeholder="Deal name"
            />
          ) : (
            <h1 className="font-serif text-4xl font-bold text-ink mb-4">{deal.name}</h1>
          )}

          {/* Amount Display */}
          <div className="mb-6">
            {isEditing && editValues ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-ink-light">$</span>
                <input
                  type="number"
                  value={editValues.amount || deal.amount || ''}
                  onChange={(e) => onEditChange?.('amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="text-2xl font-bold text-ink border-b-2 border-cobalt focus:outline-none pb-1"
                  placeholder="0"
                />
                <span className="text-lg text-ink-lighter">k</span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-ink">
                {deal.amount ? `$${(deal.amount / 1000).toFixed(1)}k` : '—'}
              </p>
            )}
          </div>

          {/* Badges Row - Stage & Status */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Stage Badge */}
            {deal.stage && (
              <div
                style={{
                  backgroundColor: stageColor.bg,
                  color: stageColor.text,
                }}
                className="px-4 py-2 rounded-full text-sm font-semibold inline-block"
              >
                {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
              </div>
            )}

            {/* Status Badge */}
            {deal.status && (
              <div
                style={{
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                }}
                className="px-4 py-2 rounded-full text-sm font-semibold inline-block"
              >
                {deal.status.replace('_', ' ').charAt(0).toUpperCase() +
                  deal.status.slice(1).replace(/_/g, ' ')}
              </div>
            )}

            {/* Probability */}
            {deal.probability !== undefined && (
              <div className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-900 inline-block">
                {deal.probability}% Win
              </div>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {!isEditing && (
          <button
            onClick={() => onEdit?.('general')}
            className="px-4 py-2 rounded-lg border border-line text-ink text-sm hover:bg-paper-alt transition-colors shrink-0"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Key Metrics Grid - Compact Version */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
        {/* Days in Stage */}
        <div className="bg-paper-alt rounded-lg p-3">
          <p className="text-xs font-semibold text-ink-lighter uppercase mb-1 tracking-wide">Days in Stage</p>
          <p className="text-lg font-bold text-ink">
            {(() => {
              const now = new Date();
              const updated = new Date(deal.updatedAt);
              const days = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
              return days;
            })()}
          </p>
        </div>

        {/* Last Activity */}
        <div className="bg-paper-alt rounded-lg p-3">
          <p className="text-xs font-semibold text-ink-lighter uppercase mb-1 tracking-wide">Last Activity</p>
          <p className="text-lg font-bold text-ink text-ellipsis truncate">
            {deal.lastActivityAt ? formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: false }) : 'None'}
          </p>
        </div>

        {/* Deal Age */}
        <div className="bg-paper-alt rounded-lg p-3">
          <p className="text-xs font-semibold text-ink-lighter uppercase mb-1 tracking-wide">Deal Age</p>
          <p className="text-lg font-bold text-ink">
            {Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
          </p>
        </div>

        {/* Expected Close */}
        <div className="bg-paper-alt rounded-lg p-3">
          <p className="text-xs font-semibold text-ink-lighter uppercase mb-1 tracking-wide">Close Date</p>
          <p className="text-lg font-bold text-ink">
            {deal.expectedCloseDate
              ? new Date(deal.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-3 pt-4 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-line text-ink text-sm hover:bg-paper-alt transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
