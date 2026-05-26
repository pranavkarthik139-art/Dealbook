'use client';

import React, { useState } from 'react';

interface DelegationTabProps {
  onSaving: (isSaving: boolean) => void;
}

export function DelegationTab({ onSaving }: DelegationTabProps) {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'sales_engineer', active: true },
    { id: 2, name: 'John Smith', email: 'john@company.com', role: 'sales_engineer', active: true },
  ]);
  const [delegatedDealApproval, setDelegatedDealApproval] = useState(true);
  const [delegatedContactEdits, setDelegatedContactEdits] = useState(true);

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
        Delegation & Team
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          👥 Team Members
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E5E0' }}>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Name
                </th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Email
                </th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Role
                </th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #E5E5E0' }}>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#1A202C', fontWeight: '500' }}>
                    {member.name}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#718096' }}>
                    {member.email}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '13px', color: '#718096' }}>
                    {member.role === 'sales_engineer' ? 'Sales Engineer' : 'Presales Lead'}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '13px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: member.active ? '#ECFDF5' : '#FEE2E2',
                      color: member.active ? '#065F46' : '#991B1B',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      {member.active ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
          + Invite Team Member
        </button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚙️ Delegation Rules
        </h3>

        <div style={{ paddingLeft: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={delegatedDealApproval}
                onChange={(e) => setDelegatedDealApproval(e.target.checked)}
                id="deal-approval"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="deal-approval" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer', fontWeight: '500' }}>
                Require approval to create deals over $100K
              </label>
            </div>
            <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 0 24px' }}>
              Team leads must approve high-value deals before SEs can create them
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={delegatedContactEdits}
                onChange={(e) => setDelegatedContactEdits(e.target.checked)}
                id="contact-edits"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="contact-edits" style={{ fontSize: '13px', color: '#4A5568', cursor: 'pointer', fontWeight: '500' }}>
                Allow SEs to edit contact information
              </label>
            </div>
            <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 0 24px' }}>
              SEs can add/edit stakeholders and contact details on their deals
            </p>
          </div>
        </div>
      </div>

      <div style={{
        padding: '16px',
        backgroundColor: '#F0F0EB',
        borderRadius: '8px',
        marginBottom: '24px',
      }}>
        <p style={{ margin: '0', fontSize: '13px', color: '#4A5568' }}>
          <strong>Note:</strong> These settings apply to your team members. Individual users can customize their own preferences in their personal settings.
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
