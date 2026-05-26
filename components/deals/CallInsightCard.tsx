'use client';

import React, { useState, useEffect } from 'react';
import { getSentimentColor, getRiskColor } from '@/lib/google-meet';

interface CallInsight {
  summary: string;
  sentiment: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyTopics: string[];
  actionItems: string[];
  concerns: string[];
  opportunities: string[];
}

interface CallInsightCardProps {
  callTitle: string;
  callDate: Date;
  attendees: string[];
  insights?: CallInsight;
  loading?: boolean;
  onGenerateInsights?: () => void;
}

export function CallInsightCard({
  callTitle,
  callDate,
  attendees,
  insights,
  loading = false,
  onGenerateInsights,
}: CallInsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!insights && !loading) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '4px',
            }}>
              🎙️ {callTitle}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--ink-lighter)',
            }}>
              {new Date(callDate).toLocaleDateString()} • {attendees.length} attendees
            </div>
          </div>
          {onGenerateInsights && (
            <button
              onClick={onGenerateInsights}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--cobalt)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? '⏳ Analyzing...' : '✨ Generate Insights'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--ink-light)',
          fontSize: '14px',
        }}>
          <div style={{
            animation: 'spin 2s linear infinite',
            fontSize: '16px',
          }}>
            ⏳
          </div>
          Analyzing call transcript with AI...
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const sentimentColor = getSentimentColor(insights.sentiment);
  const riskColor = getRiskColor(insights.riskLevel);

  return (
    <div style={{
      padding: '16px',
      backgroundColor: 'var(--paper)',
      border: '2px solid ' + sentimentColor,
      borderRadius: '8px',
      marginBottom: '12px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setExpanded(!expanded)}>
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: '4px',
          }}>
            🎙️ {callTitle}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--ink-lighter)',
          }}>
            {new Date(callDate).toLocaleDateString()} • {attendees.length} attendees
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          {/* Sentiment Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: sentimentColor + '15',
            borderRadius: '6px',
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: sentimentColor,
            }}>
              {insights.sentiment}
            </div>
            <div style={{
              fontSize: '10px',
              color: sentimentColor,
              fontWeight: 600,
            }}>
              sentiment
            </div>
          </div>

          {/* Risk Badge */}
          <div style={{
            padding: '6px 10px',
            backgroundColor: riskColor + '20',
            color: riskColor,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {insights.riskLevel} risk
          </div>

          {/* Expand Button */}
          <div style={{
            fontSize: '16px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 200ms ease',
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* Summary (always visible) */}
      <div style={{
        padding: '12px',
        backgroundColor: 'var(--paper-alt)',
        borderRadius: '6px',
        fontSize: '13px',
        color: 'var(--ink)',
        marginBottom: '12px',
        lineHeight: 1.6,
      }}>
        {insights.summary}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--line)',
        }}>
          {/* Key Topics */}
          {insights.keyTopics.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ink-lighter)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}>
                📌 Key Topics
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}>
                {insights.keyTopics.map((topic, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    backgroundColor: 'var(--cobalt)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {insights.actionItems.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ink-lighter)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}>
                ✅ Action Items
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {insights.actionItems.map((item, i) => (
                  <div key={i} style={{
                    fontSize: '12px',
                    color: 'var(--ink)',
                    padding: '4px 0',
                    paddingLeft: '20px',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--cobalt)',
                    }}>
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {insights.concerns.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ink-lighter)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}>
                ⚠️ Concerns
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {insights.concerns.map((concern, i) => (
                  <div key={i} style={{
                    fontSize: '12px',
                    color: 'var(--ink)',
                    padding: '4px 0',
                    paddingLeft: '20px',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#EF4444',
                    }}>
                      ⚠
                    </span>
                    {concern}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {insights.opportunities.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ink-lighter)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}>
                💡 Opportunities
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {insights.opportunities.map((opp, i) => (
                  <div key={i} style={{
                    fontSize: '12px',
                    color: 'var(--ink)',
                    padding: '4px 0',
                    paddingLeft: '20px',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--green)',
                    }}>
                      💡
                    </span>
                    {opp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
