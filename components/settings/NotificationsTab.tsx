'use client';

import React, { useState } from 'react';

interface NotificationsTabProps {
  onSaving: (isSaving: boolean) => void;
}

export function NotificationsTab({ onSaving }: NotificationsTabProps) {
  const [emailDefault, setEmailDefault] = useState('mentions');
  const [emailQuietHours, setEmailQuietHours] = useState(false);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState('daily');
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackDefault, setSlackDefault] = useState('mentions');
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [inAppSound, setInAppSound] = useState(true);

  const handleSave = async () => {
    onSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSaving(false);
    } catch (error) {
      onSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1A202C' }}>
        Notification Preferences
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📧 Email
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
              Default Notifications
            </label>
            <select
              value={emailDefault}
              onChange={(e) => setEmailDefault(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #E5E5E0',
                borderRadius: '6px',
                fontFamily: 'DM Sans',
              }}
            >
              <option value="all">All notifications</option>
              <option value="mentions">Mentions only</option>
              <option value="none">None</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={emailQuietHours}
              onChange={(e) => setEmailQuietHours(e.target.checked)}
              id="quiet-hours"
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="quiet-hours" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer' }}>
              Enable quiet hours (no notifications between 9pm-9am)
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
              Digest Frequency
            </label>
            <select
              value={emailDigestFrequency}
              onChange={(e) => setEmailDigestFrequency(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #E5E5E0',
                borderRadius: '6px',
                fontFamily: 'DM Sans',
              }}
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          💬 Slack
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '16px' }}>
          {!slackConnected ? (
            <button
              style={{
                padding: '10px 16px',
                backgroundColor: '#0047FF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: 'DM Sans',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Connect Slack Workspace
            </button>
          ) : (
            <>
              <div style={{ padding: '12px', backgroundColor: '#F0F0EB', borderRadius: '6px', fontSize: '13px', color: '#4A5568' }}>
                ✓ Slack workspace connected
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
                  Default Notifications
                </label>
                <select
                  value={slackDefault}
                  onChange={(e) => setSlackDefault(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #E5E5E0',
                    borderRadius: '6px',
                    fontFamily: 'DM Sans',
                  }}
                >
                  <option value="all">All notifications</option>
                  <option value="mentions">Mentions only</option>
                  <option value="none">None</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔔 In-App
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={inAppEnabled}
              onChange={(e) => setInAppEnabled(e.target.checked)}
              id="inapp-enabled"
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="inapp-enabled" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer' }}>
              Enable in-app notifications
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={inAppSound}
              onChange={(e) => setInAppSound(e.target.checked)}
              id="inapp-sound"
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              disabled={!inAppEnabled}
            />
            <label htmlFor="inapp-sound" style={{ fontSize: '13px', color: inAppEnabled ? '#4A5568' : '#A0AEC0', cursor: inAppEnabled ? 'pointer' : 'default' }}>
              Play sound for notifications
            </label>
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
