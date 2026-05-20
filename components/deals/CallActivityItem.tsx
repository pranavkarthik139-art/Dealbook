'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Call {
  id: number;
  title: string;
  callDate: string;
  durationMinutes?: number;
  attendees: string[];
  notes?: string;
  gongDescription?: string;
  gongInsightSummary?: string;
  gongRiskLevel?: string;
}

interface CallActivityItemProps {
  call: Call;
  onUpdateGongDescription: (callId: number, description: string) => Promise<void>;
}

export function CallActivityItem({ call, onUpdateGongDescription }: CallActivityItemProps) {
  const [isEditingGong, setIsEditingGong] = useState(false);
  const [gongDescription, setGongDescription] = useState(call.gongDescription || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGongDescription = async () => {
    setIsSaving(true);
    try {
      await onUpdateGongDescription(call.id, gongDescription);
      setIsEditingGong(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'high':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: '20px',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        📞
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Call Header - Title with Time and Ago */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginBottom: '4px',
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a202c',
            }}
          >
            {call.title}
          </p>

          {/* Time with ago format */}
          <span
            style={{
              fontSize: '12px',
              color: '#718096',
              fontWeight: '500',
            }}
          >
            {new Date(call.callDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {' '}
            <span style={{ color: '#A0AEC0' }}>
              [{formatDistanceToNow(new Date(call.callDate))}]
            </span>
          </span>
        </div>

        {/* Duration, Attendees, and Risk on next line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#718096',
            flexWrap: 'wrap',
          }}
        >
          {call.durationMinutes && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⏱️ {call.durationMinutes} min
            </span>
          )}

          {call.attendees.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              👥 {call.attendees.join(', ')}
            </span>
          )}

          {call.gongRiskLevel && (
            <span
              style={{
                fontSize: '11px',
                color: getRiskColor(call.gongRiskLevel),
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor:
                  call.gongRiskLevel === 'low'
                    ? '#ECFDF5'
                    : call.gongRiskLevel === 'medium'
                      ? '#FFFBEB'
                      : '#FEF2F2',
              }}
            >
              {call.gongRiskLevel.toUpperCase()} RISK
            </span>
          )}
        </div>

        {/* Notes */}
        {call.notes && (
          <div
            style={{
              fontSize: '12px',
              color: '#4a5568',
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: '#F9FAFB',
              borderRadius: '4px',
              borderLeft: '2px solid #CBD5E0',
            }}
          >
            {call.notes}
          </div>
        )}

        {/* Gong Description Section */}
        <div
          style={{
            backgroundColor: '#F0F4FB',
            border: '1px solid #C7D2E7',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: isEditingGong || gongDescription ? '8px' : 0,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                fontWeight: '600',
                color: '#0047FF',
              }}
            >
              🎯 Gong Description
            </p>

            {!isEditingGong && (
              <button
                onClick={() => setIsEditingGong(true)}
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#0047FF',
                  backgroundColor: 'transparent',
                  border: '1px solid #0047FF',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF2FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {gongDescription ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {isEditingGong ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                value={gongDescription}
                onChange={(e) => setGongDescription(e.target.value)}
                placeholder="Add call insights, notes, risks, next steps..."
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '12px',
                  border: '1px solid #CBD5E0',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  resize: 'vertical',
                }}
              />

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setIsEditingGong(false);
                    setGongDescription(call.gongDescription || '');
                  }}
                  disabled={isSaving}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#4a5568',
                    backgroundColor: '#E2E8F0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveGongDescription}
                  disabled={isSaving}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#FFFFFF',
                    backgroundColor: '#0047FF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : gongDescription ? (
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: '#1a202c',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
              }}
            >
              {gongDescription}
            </p>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: '#A0AEC0',
                fontStyle: 'italic',
              }}
            >
              No Gong description yet. Click Add to capture call insights.
            </p>
          )}

          {/* Auto-populated Gong Insight Summary */}
          {call.gongInsightSummary && !isEditingGong && (
            <div
              style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #C7D2E7',
                fontSize: '11px',
                color: '#4a5568',
                fontStyle: 'italic',
              }}
            >
              <strong>Gong Summary:</strong> {call.gongInsightSummary}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
