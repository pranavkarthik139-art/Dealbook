'use client';

import React, { useState } from 'react';

interface IntegrationsTabProps {
  onSaving: (isSaving: boolean) => void;
}

export function IntegrationsTab({ onSaving }: IntegrationsTabProps) {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleSyncCalls, setGoogleSyncCalls] = useState(false);
  const [googleSyncEmails, setGoogleSyncEmails] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackDealUpdates, setSlackDealUpdates] = useState(false);
  const [slackCallAlerts, setSlackCallAlerts] = useState(false);
  const [anthropicConnected, setAnthropicConnected] = useState(false);
  const [anthropicGenerateInsights, setAnthropicGenerateInsights] = useState(false);
  const [salesforceConnected, setSalesforceConnected] = useState(false);
  const [salesforceBidirectionalSync, setSalesforceBidirectionalSync] = useState(false);

  const handleSave = async () => {
    onSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSaving(false);
    } catch (error) {
      onSaving(false);
    }
  };

  const IntegrationCard = ({
    name,
    icon,
    description,
    connected,
    onConnect,
    onDisconnect,
    features
  }: {
    name: string;
    icon: string;
    description: string;
    connected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    features: Array<{ label: string; enabled: boolean; onChange: (val: boolean) => void }>;
  }) => (
    <div style={{
      padding: '20px',
      border: '1px solid #E5E5E0',
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '24px' }}>{icon}</div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>
              {name}
            </h4>
            <p style={{ margin: '0', fontSize: '12px', color: '#718096' }}>
              {description}
            </p>
          </div>
        </div>
        {connected ? (
          <button
            onClick={onDisconnect}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              border: '1px solid #FECACA',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              fontFamily: 'DM Sans',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FCA5A5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0047FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
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
            Connect
          </button>
        )}
      </div>

      {connected && features.length > 0 && (
        <div style={{ paddingTop: '16px', borderTop: '1px solid #E5E5E0' }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={feature.enabled}
                onChange={(e) => feature.onChange(e.target.checked)}
                id={`feature-${name}-${idx}`}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor={`feature-${name}-${idx}`} style={{ fontSize: '12px', color: '#4A5568', cursor: 'pointer' }}>
                {feature.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1A202C' }}>
        Integrations & Sync
      </h2>

      <p style={{ fontSize: '13px', color: '#718096', marginBottom: '24px' }}>
        Connect external services to automatically sync data and unlock more features.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Calendar & Email
        </h3>

        <IntegrationCard
          name="Google Workspace"
          icon="📧"
          description="Sync calendar events and emails"
          connected={googleConnected}
          onConnect={() => setGoogleConnected(true)}
          onDisconnect={() => setGoogleConnected(false)}
          features={[
            { label: 'Sync calls from Google Calendar', enabled: googleSyncCalls, onChange: setGoogleSyncCalls },
            { label: 'Auto-log emails from Gmail', enabled: googleSyncEmails, onChange: setGoogleSyncEmails },
          ]}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Communication
        </h3>

        <IntegrationCard
          name="Slack"
          icon="💬"
          description="Get deal updates and call alerts in Slack"
          connected={slackConnected}
          onConnect={() => setSlackConnected(true)}
          onDisconnect={() => setSlackConnected(false)}
          features={[
            { label: 'Deal stage change notifications', enabled: slackDealUpdates, onChange: setSlackDealUpdates },
            { label: 'Call completion alerts', enabled: slackCallAlerts, onChange: setSlackCallAlerts },
          ]}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          AI & Intelligence
        </h3>

        <IntegrationCard
          name="Anthropic Claude"
          icon="🤖"
          description="AI-powered call insights and deal intelligence"
          connected={anthropicConnected}
          onConnect={() => setAnthropicConnected(true)}
          onDisconnect={() => setAnthropicConnected(false)}
          features={[
            { label: 'Generate AI call summaries', enabled: anthropicGenerateInsights, onChange: setAnthropicGenerateInsights },
          ]}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          CRM
        </h3>

        <IntegrationCard
          name="Salesforce"
          icon="☁️"
          description="Sync deals, contacts, and opportunities"
          connected={salesforceConnected}
          onConnect={() => setSalesforceConnected(true)}
          onDisconnect={() => setSalesforceConnected(false)}
          features={[
            { label: 'Bidirectional sync (pull + push)', enabled: salesforceBidirectionalSync, onChange: setSalesforceBidirectionalSync },
          ]}
        />
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
