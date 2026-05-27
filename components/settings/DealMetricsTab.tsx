'use client';

import React, { useState } from 'react';

interface DealMetricsTabProps {
  onSaving: (isSaving: boolean) => void;
}

export function DealMetricsTab({ onSaving }: DealMetricsTabProps) {
  const [activityVelocityCritical, setActivityVelocityCritical] = useState(3);
  const [activityVelocityWarning, setActivityVelocityWarning] = useState(7);
  const [overdueDays, setOverdueDays] = useState(0);
  const [warningDays, setWarningDays] = useState(7);
  const [engagementCriticalDays, setEngagementCriticalDays] = useState(5);
  const [engagementWarningDays, setEngagementWarningDays] = useState(14);
  const [minContacts, setMinContacts] = useState(1);
  const [probabilityHigh, setProbabilityHigh] = useState(70);
  const [probabilityMedium, setProbabilityMedium] = useState(30);
  const [activityWeight, setActivityWeight] = useState(40);
  const [sentimentWeight, setSentimentWeight] = useState(35);
  const [engagementWeight, setEngagementWeight] = useState(25);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const tooltips: Record<string, string> = {
    activityVelocity: 'How often deals should have interaction. B2B deals typically need contact every 3-5 days to stay warm.',
    timeline: 'How long deals can stay in a stage before becoming overdue. Enterprise deals: 7-14 days per stage.',
    engagement: 'Minimum stakeholder contacts needed. Best practice: 3+ stakeholders per enterprise deal.',
    probability: 'Win probability ranges. High: 70%+ (negotiation), Medium: 30-70% (evaluation), Low: <30% (early)',
    weights: 'How much each factor impacts deal health. Activity 40%, Sentiment 35%, Engagement 25% (industry standard).',
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    min: number,
    max: number,
    suffix: string = '',
    tooltipKey?: string
  ) => (
    <div style={{ marginBottom: '20px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#4A5568' }}>{label}</label>
          {tooltipKey && (
            <div
              style={{ position: 'relative', cursor: 'help' }}
              onMouseEnter={() => setHoveredTooltip(tooltipKey)}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <span style={{ fontSize: '12px', color: '#0047FF', fontWeight: '600' }}>?</span>
              {hoveredTooltip === tooltipKey && (
                <div style={{
                  position: 'absolute',
                  bottom: '120%',
                  left: '-100px',
                  width: '280px',
                  backgroundColor: '#1A202C',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  whiteSpace: 'normal',
                }}>
                  {tooltips[tooltipKey]}
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid #1A202C',
                  }} />
                </div>
              )}
            </div>
          )}
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0047FF' }}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '4px',
          borderRadius: '2px',
          background: '#E5E5E0',
          outline: 'none',
          WebkitAppearance: 'none',
        }}
      />
    </div>
  );

  const handleSave = async () => {
    onSaving(true);
    setSaveStatus(null);
    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealHealthMetrics: {
            activityVelocity: { critical: activityVelocityCritical, warning: activityVelocityWarning },
            timeline: { overdueDays, warningDays },
            engagement: { criticalDays: engagementCriticalDays, warningDays: engagementWarningDays, minContacts },
            probability: { high: probabilityHigh, medium: probabilityMedium },
            weights: { activity: activityWeight, sentiment: sentimentWeight, engagement: engagementWeight },
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving metrics:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      onSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1A202C' }}>
        Deal Health Metrics
      </h2>

      {saveStatus && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          borderRadius: '6px',
          backgroundColor: saveStatus === 'success' ? '#ECFDF5' : '#FEE2E2',
          color: saveStatus === 'success' ? '#065F46' : '#991B1B',
          fontSize: '13px',
          fontWeight: '500',
        }}>
          {saveStatus === 'success' ? '✓ Metrics saved successfully' : '✗ Failed to save metrics'}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚡ Activity Velocity
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Critical threshold (days without activity)', activityVelocityCritical, setActivityVelocityCritical, 1, 14, ' days', 'activityVelocity')}
          {renderSlider('Warning threshold (days without activity)', activityVelocityWarning, setActivityVelocityWarning, 1, 30, ' days')}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📅 Deal Timeline
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Overdue threshold', overdueDays, setOverdueDays, 0, 30, ' days', 'timeline')}
          {renderSlider('Warning threshold', warningDays, setWarningDays, 1, 30, ' days')}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          👥 Stakeholder Engagement
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Critical engagement threshold', engagementCriticalDays, setEngagementCriticalDays, 1, 30, ' days', 'engagement')}
          {renderSlider('Warning engagement threshold', engagementWarningDays, setEngagementWarningDays, 1, 30, ' days')}
          {renderSlider('Minimum contacts for engagement', minContacts, setMinContacts, 1, 10, ' contact')}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📊 Probability Tiers
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('High probability threshold', probabilityHigh, setProbabilityHigh, 50, 100, '%', 'probability')}
          {renderSlider('Medium probability threshold', probabilityMedium, setProbabilityMedium, 10, 60, '%')}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚙️ Health Score Weights
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Activity Velocity weight', activityWeight, setActivityWeight, 0, 100, '%', 'weights')}
          {renderSlider('Sentiment/Engagement weight', sentimentWeight, setSentimentWeight, 0, 100, '%')}
          {renderSlider('Contact Engagement weight', engagementWeight, setEngagementWeight, 0, 100, '%')}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#F0F0EB',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#4A5568',
          }}>
            Total: {activityWeight + sentimentWeight + engagementWeight}% (should equal 100%)
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: '10px 24px',
          backgroundColor: '#0047FF',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: 'DM Sans',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        Save Metrics
      </button>
    </div>
  );
}
