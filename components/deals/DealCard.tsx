'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBackSideColor } from '@/lib/cardColorLogic';
import { useDealNote } from '@/hooks/useDealNote';

interface StallInfo {
  isStalled: boolean;
  daysStalled: number;
  risk: 'ok' | 'warning' | 'critical';
  reason: string;
}

interface DealCardProps {
  id: number;
  name: string;
  amount?: number | string;
  stage?: string;
  lastActivityAt?: string | null;
  healthScore?: number;
  stall?: StallInfo;
  email?: string;
  onClick?: () => void;
  isSelected?: boolean;
  onToggleSelect?: (dealId: number, e: React.MouseEvent) => void;
}

export function DealCard({
  id,
  name,
  amount,
  stage,
  lastActivityAt,
  healthScore,
  stall,
  email,
  onClick,
  isSelected,
  onToggleSelect,
}: DealCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [colorMetric, setColorMetric] = useState<'stall_severity' | 'deal_health' | 'critical_data'>('stall_severity');

  // Use enhanced note hook
  const { note, setNote, clearNote, hasNote } = useDealNote(id);

  // Fetch user preferences for card color metric
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          setColorMetric(data.cardColorMetric || 'stall_severity');
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };
    fetchPreferences();
  }, []);

  const getStageBadgeColor = (stage?: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      demo: { bg: 'var(--cobalt-light)', text: 'var(--cobalt)' },
      poc: { bg: 'var(--warning-light)', text: 'var(--warning)' },
      validation: { bg: 'var(--success-light)', text: 'var(--success)' },
      closed: { bg: 'var(--success-light)', text: 'var(--success)' },
    };
    const stageKey = stage?.toLowerCase() || 'demo';
    return colors[stageKey] || { bg: 'var(--paper-alt)', text: 'var(--ink-lighter)' };
  };

  const stageColor = getStageBadgeColor(stage);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/deals/${id}`);
  };

  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount || 0;
  const formattedAmount = amountNum > 0 ? `$${(amountNum / 1000).toFixed(0)}k` : '—';

  const healthPercent = healthScore || 50;
  const healthColor =
    healthPercent >= 80
      ? 'var(--success)'
      : healthPercent >= 50
      ? 'var(--warning)'
      : 'var(--error)';

  // Compute back-side color based on user preference
  const backSideColor = getBackSideColor(
    colorMetric,
    stall,
    healthScore,
    {
      email,
      amount,
      stage,
      contactCount: email ? 1 : 0, // Simple: if email exists, count as 1 contact
    }
  );

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        perspective: '1000px',
        cursor: 'pointer',
        height: '280px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side - Primary Info */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Header */}
          <div>
            <h3
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '0 0 var(--space-3) 0',
                lineHeight: 1.3,
              }}
            >
              {name}
            </h3>

            {/* Amount & Stage Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  color: 'var(--cobalt)',
                }}
              >
                {formattedAmount}
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  backgroundColor: stageColor.bg,
                  color: stageColor.text,
                  borderRadius: '6px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {stage || 'demo'}
              </span>
            </div>
          </div>

          {/* Health Score */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: healthColor + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: healthColor,
                }}
              >
                {healthPercent}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--ink-lighter)',
                    textTransform: 'uppercase',
                  }}
                >
                  Health
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-xs)',
                    color: healthColor,
                  }}
                >
                  {healthPercent >= 80
                    ? 'On track'
                    : healthPercent >= 50
                    ? 'Needs attention'
                    : 'At risk'}
                </p>
              </div>
            </div>
          </div>

          {/* Tap to flip hint */}
          <p
            style={{
              margin: '0',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-lighter)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            ↻ Tap for details
          </p>
        </div>

        {/* Back Side - Secondary Info */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: backSideColor,
            border: `1px solid ${backSideColor}`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: 'rotateY(180deg)',
            color: 'white',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            transition: 'backgroundColor 0.3s ease', // Smooth color transitions
          }}
        >
          {/* Secondary Info Grid */}
          <div style={{ flex: 1, overflow: 'auto', marginBottom: 'var(--space-4)' }}>
            {/* Email */}
            {email && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 'var(--text-xs)', opacity: 0.75, textTransform: 'uppercase' }}>
                  Contact
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    opacity: 0.95,
                  }}
                >
                  {email}
                </p>
              </div>
            )}

            {/* Amount */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 'var(--text-xs)', opacity: 0.75, textTransform: 'uppercase' }}>
                Deal Value
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                {formattedAmount}
              </p>
            </div>

            {/* Last Activity */}
            {lastActivityAt && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 'var(--text-xs)', opacity: 0.75, textTransform: 'uppercase' }}>
                  Last Activity
                </p>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                  {new Date(lastActivityAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Stage */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 'var(--text-xs)', opacity: 0.75, textTransform: 'uppercase' }}>
                Stage
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 500, textTransform: 'capitalize' }}>
                {stage || 'demo'}
              </p>
            </div>
          </div>

          {/* Bookmark/Note Section - Enhanced */}
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              maxWidth: 'calc(100% - 80px)',
            }}
          >
            {/* If note exists, show prominent badge */}
            {hasNote && !showNoteInput && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNoteInput(true);
                }}
                style={{
                  backgroundColor: 'rgba(255, 215, 0, 0.2)', // Gold tint
                  border: '1px solid rgba(255, 215, 0, 0.5)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                }}
              >
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)' }}>
                  📌 {note}
                </p>
              </div>
            )}

            {/* If no note, show add button */}
            {!hasNote && !showNoteInput && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNoteInput(true);
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px dashed rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontSize: 'var(--text-lg)',
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                title="Add a note"
              >
                ✎
              </button>
            )}

            {/* Note Input Panel */}
            {showNoteInput && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: 'var(--space-3)',
                  backdropFilter: 'blur(10px)',
                  animation: 'slideIn 0.2s ease',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <label style={{ fontSize: 'var(--text-xs)', opacity: 0.75, marginBottom: '4px', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                  Add SE Note
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tag this deal with a quick note..."
                  maxLength={100}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    boxSizing: 'border-box',
                    marginBottom: 'var(--space-2)',
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowNoteInput(false);
                    }
                  }}
                  onBlur={() => {
                    // Keep the input open but just lose focus
                    setTimeout(() => {
                      if (hasNote) {
                        setShowNoteInput(false);
                      }
                    }, 100);
                  }}
                />
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', opacity: 0.6 }}>
                    {note.length}/100
                  </p>
                  {hasNote && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNote();
                        setShowNoteInput(false);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(255, 100, 100, 0.3)',
                        border: '1px solid rgba(255, 100, 100, 0.5)',
                        color: 'rgba(255, 200, 200, 0.9)',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.3)';
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View Deal Button */}
          <button
            onClick={handleViewDetails}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
          >
            → View Deal Details
          </button>
        </div>
      </div>
    </div>
  );
}
