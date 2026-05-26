'use client';

import React, { useState } from 'react';

interface AdvancedTabProps {
  onSaving: (isSaving: boolean) => void;
}

export function AdvancedTab({ onSaving }: AdvancedTabProps) {
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API Key', created: '2026-05-01', lastUsed: '2026-05-27', key: 'pk_live_••••••••••••••••' },
  ]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://yourapp.com/webhooks');
  const [webhookEvents, setWebhookEvents] = useState({
    dealCreated: true,
    dealUpdated: true,
    dealClosed: true,
    callLogged: true,
  });

  const handleSave = async () => {
    onSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSaving(false);
    } catch (error) {
      onSaving(false);
    }
  };

  const handleCreateApiKey = () => {
    if (newKeyName) {
      const newKey = {
        id: apiKeys.length + 1,
        name: newKeyName,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never',
        key: 'pk_live_' + Math.random().toString(36).substring(2, 15),
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setShowNewKeyForm(false);
    }
  };

  const handleDeleteApiKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1A202C' }}>
        Advanced Settings
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔑 API Keys
        </h3>

        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
          Use API keys to access Dealbook programmatically. Keep them secret!
        </p>

        <div style={{ marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E5E0' }}>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Name
                </th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Created
                </th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Last Used
                </th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Key
                </th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} style={{ borderBottom: '1px solid #E5E5E0' }}>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#1A202C', fontWeight: '500' }}>
                    {apiKey.name}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#718096' }}>
                    {apiKey.created}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#718096' }}>
                    {apiKey.lastUsed}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#718096', fontFamily: 'monospace' }}>
                    {apiKey.key}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '13px' }}>
                    <button
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      style={{
                        padding: '4px 8px',
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
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!showNewKeyForm ? (
          <button
            onClick={() => setShowNewKeyForm(true)}
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
            + Create New Key
          </button>
        ) : (
          <div style={{ padding: '16px', backgroundColor: '#F0F0EB', borderRadius: '6px', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Staging API Key"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #E5E5E0',
                    borderRadius: '6px',
                    fontFamily: 'DM Sans',
                  }}
                />
              </div>
              <button
                onClick={handleCreateApiKey}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0047FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  fontFamily: 'DM Sans',
                }}
              >
                Create
              </button>
              <button
                onClick={() => setShowNewKeyForm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#E5E5E0',
                  color: '#4A5568',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  fontFamily: 'DM Sans',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🪝 Webhooks
        </h3>

        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
          Receive real-time notifications when events happen in Dealbook.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #E5E5E0',
                borderRadius: '6px',
                fontFamily: 'DM Sans',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568', display: 'block' }}>
              Subscribe to Events
            </label>
            {Object.entries(webhookEvents).map(([key, enabled]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) =>
                    setWebhookEvents({ ...webhookEvents, [key]: e.target.checked })
                  }
                  id={`webhook-${key}`}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor={`webhook-${key}`} style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer' }}>
                  {key === 'dealCreated' && 'Deal Created'}
                  {key === 'dealUpdated' && 'Deal Updated'}
                  {key === 'dealClosed' && 'Deal Closed'}
                  {key === 'callLogged' && 'Call Logged'}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📥 Data & Export
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
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
            Export Deals (CSV)
          </button>
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
            Export All Data (JSON)
          </button>
        </div>
      </div>

      <div style={{
        padding: '16px',
        backgroundColor: '#FEF3C7',
        borderRadius: '8px',
        marginBottom: '24px',
        borderLeft: '4px solid #F59E0B',
      }}>
        <p style={{ margin: '0', fontSize: '13px', color: '#92400E' }}>
          <strong>⚠️ Caution:</strong> Some of these settings are advanced and can affect system behavior. Change only if you know what you're doing.
        </p>
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
