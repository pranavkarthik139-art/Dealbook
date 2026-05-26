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

  const handleSave = async () => {
    onSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSaving(false);
    } catch (error) {
      onSaving(false);
    }
  };

  const renderSlider = (label: string, value: number, onChange: (val: number) => void, min: number, max: number, suffix: string = '') => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: '500', color: '#4A5568' }}>{label}</label>
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

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1A202C' }}>
        Deal Health Metrics
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚡ Activity Velocity
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Critical threshold (days without activity)', activityVelocityCritical, setActivityVelocityCritical, 1, 14, ' days')}
          {renderSlider('Warning threshold (days without activity)', activityVelocityWarning, setActivityVelocityWarning, 1, 30, ' days')}
          <p style={{ fontSize: '12px', color: '#718096', marginTop: '12px' }}>
            • Below critical: Deal is stalled, high risk
            <br />• Between critical & warning: Deal needs attention
            <br />• Above warning: Deal is active
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📅 Deal Timeline
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Overdue threshold', overdueDays, setOverdueDays, 0, 30, ' days')}
          {renderSlider('Warning threshold', warningDays, setWarningDays, 1, 30, ' days')}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          👥 Stakeholder Engagement
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Critical engagement threshold', engagementCriticalDays, setEngagementCriticalDays, 1, 30, ' days')}
          {renderSlider('Warning engagement threshold', engagementWarningDays, setEngagementWarningDays, 1, 30, ' days')}
          {renderSlider('Minimum contacts for engagement', minContacts, setMinContacts, 1, 10, ' contact')}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📊 Probability Tiers
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('High probability threshold', probabilityHigh, setProbabilityHigh, 50, 100, '%')}
          {renderSlider('Medium probability threshold', probabilityMedium, setProbabilityMedium, 10, 60, '%')}
          <p style={{ fontSize: '12px', color: '#718096', marginTop: '12px' }}>
            • Above high threshold: High probability deal
            <br />• Between thresholds: Medium probability
            <br />• Below medium: Low probability
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚙️ Health Score Weights
        </h3>
        <div style={{ paddingLeft: '16px' }}>
          {renderSlider('Activity Velocity weight', activityWeight, setActivityWeight, 0, 100, '%')}
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
        Save Changes
      </button>
    </div>
  );
}
