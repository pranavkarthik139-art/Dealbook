'use client';

import React, { useState } from 'react';

interface OrganizationTabProps {
  onSaving: (isSaving: boolean) => void;
}

export function OrganizationTab({ onSaving }: OrganizationTabProps) {
  const [companyName, setCompanyName] = useState('Your Company');
  const [companyWebsite, setCompanyWebsite] = useState('https://yourcompany.com');
  const [maxTeamMembers, setMaxTeamMembers] = useState(10);
  const [dataRetention, setDataRetention] = useState('30');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [auditLogsEnabled, setAuditLogsEnabled] = useState(true);
  const [apiAccessEnabled, setApiAccessEnabled] = useState(false);

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
        Organization Settings
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🏢 Company Information
        </h3>

        <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #E5E5E0',
                borderRadius: '6px',
                fontFamily: 'DM Sans',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
              Company Website
            </label>
            <input
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #E5E5E0',
                borderRadius: '6px',
                fontFamily: 'DM Sans',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
              Max Team Members
            </label>
            <input
              type="number"
              value={maxTeamMembers}
              onChange={(e) => setMaxTeamMembers(parseInt(e.target.value))}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #E5E5E0',
                borderRadius: '6px',
                fontFamily: 'DM Sans',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔒 Security & Access Control
        </h3>

        <div style={{ paddingLeft: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={twoFactorRequired}
                onChange={(e) => setTwoFactorRequired(e.target.checked)}
                id="2fa-required"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="2fa-required" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer', fontWeight: '500' }}>
                Require two-factor authentication
              </label>
            </div>
            <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 0 24px' }}>
              All team members must enable 2FA to log in
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={ssoEnabled}
                onChange={(e) => setSsoEnabled(e.target.checked)}
                id="sso-enabled"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="sso-enabled" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer', fontWeight: '500' }}>
                Enable SSO (Single Sign-On)
              </label>
            </div>
            <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 0 24px' }}>
              Team members can log in via your company's identity provider
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={auditLogsEnabled}
                onChange={(e) => setAuditLogsEnabled(e.target.checked)}
                id="audit-logs"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="audit-logs" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer', fontWeight: '500' }}>
                Enable audit logs
              </label>
            </div>
            <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 0 24px' }}>
              Track all user actions for compliance and security
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={apiAccessEnabled}
                onChange={(e) => setApiAccessEnabled(e.target.checked)}
                id="api-access"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="api-access" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer', fontWeight: '500' }}>
                Allow API access for integrations
              </label>
            </div>
            <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 0 24px' }}>
              Enable third-party integrations to access your data via API
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          📋 Data Management
        </h3>

        <div style={{ paddingLeft: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#4A5568' }}>
              Data Retention Policy
            </label>
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              style={{
                maxWidth: '400px',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid #E5E5E0',
                borderRadius: '6px',
                fontFamily: 'DM Sans',
              }}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
              <option value="forever">Forever (default)</option>
            </select>
            <p style={{ fontSize: '12px', color: '#718096', marginTop: '8px', margin: '8px 0 0 0' }}>
              How long to keep archived/deleted deal data
            </p>
          </div>
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
          <strong>⚠️ Admin only:</strong> Changes here affect all team members. Use with caution.
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
