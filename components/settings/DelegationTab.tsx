'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DelegationTabProps {
  onSaving: (isSaving: boolean) => void;
}

interface Assignment {
  id: number;
  dealId: number;
  seUserId: number;
  deal: { name: string };
  seUser: { name: string };
}

interface Deal {
  id: number;
  name: string;
}

interface SE {
  id: number;
  name: string;
  email: string;
}

export function DelegationTab({ onSaving }: DelegationTabProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'sales_engineer', active: true },
    { id: 2, name: 'John Smith', email: 'john@company.com', role: 'sales_engineer', active: true },
  ]);
  const [delegatedDealApproval, setDelegatedDealApproval] = useState(true);
  const [delegatedContactEdits, setDelegatedContactEdits] = useState(true);

  // Deal Assignment State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [seList, setSeList] = useState<SE[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [selectedSeId, setSelectedSeId] = useState<number | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  // Fetch assignments, deals, and SE list on mount
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'presales_lead') {
      fetchData();
    }
  }, [userRole]);

  const fetchData = async () => {
    try {
      // Fetch assignments
      const assignRes = await fetch('/api/deals/assignments');
      if (assignRes.ok) {
        const assignData = await assignRes.json();
        setAssignments(assignData.assignments || []);
      }

      // Fetch deals
      const dealsRes = await fetch('/api/deals');
      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        // The API returns { deals: [...], summary: {...} }
        setDeals(dealsData.deals || []);
      }

      // Fetch SEs
      const seRes = await fetch('/api/users?role=sales_engineer');
      if (seRes.ok) {
        const seData = await seRes.json();
        setSeList(seData.users || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAssignmentError('Failed to load assignment data');
    }
  };

  const handleAssignDeal = async () => {
    if (!selectedDealId || !selectedSeId) {
      setAssignmentError('Please select both a deal and a sales engineer');
      return;
    }

    setAssignmentLoading(true);
    setAssignmentError(null);
    setAssignmentSuccess(null);

    try {
      const response = await fetch('/api/deals/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: selectedDealId,
          seUserId: selectedSeId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAssignmentSuccess('Assignment created successfully');
        setSelectedDealId(null);
        setSelectedSeId(null);
        await fetchData(); // Refresh list
        setTimeout(() => setAssignmentSuccess(null), 3000);
      } else {
        const data = await response.json();
        setAssignmentError(data.error || 'Failed to assign deal');
      }
    } catch (error) {
      setAssignmentError('An error occurred');
      console.error(error);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    setAssignmentLoading(true);
    setAssignmentError(null);

    try {
      const response = await fetch(`/api/deals/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setAssignmentSuccess('Assignment removed successfully');
        await fetchData(); // Refresh list
        setTimeout(() => setAssignmentSuccess(null), 3000);
      } else {
        const data = await response.json();
        setAssignmentError(data.error || 'Failed to remove assignment');
      }
    } catch (error) {
      setAssignmentError('An error occurred');
      console.error(error);
    } finally {
      setAssignmentLoading(false);
    }
  };

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

      {(userRole === 'admin' || userRole === 'presales_lead') && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#1A202C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📋 Deal Assignments
          </h3>

          {/* Current Assignments */}
          {assignments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Current Assignments
              </p>
              <div style={{ marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E5E5E0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Deal
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Assigned To
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} style={{ borderBottom: '1px solid #E5E5E0' }}>
                        <td style={{ padding: '12px 0', fontSize: '13px', color: '#1A202C', fontWeight: '500' }}>
                          {assignment.deal.name}
                        </td>
                        <td style={{ padding: '12px 0', fontSize: '13px', color: '#718096' }}>
                          {assignment.seUser.name}
                        </td>
                        <td style={{ padding: '12px 0', fontSize: '13px' }}>
                          <button
                            onClick={() => handleRemoveAssignment(assignment.id)}
                            disabled={assignmentLoading}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              opacity: assignmentLoading ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!assignmentLoading) e.currentTarget.style.backgroundColor = '#FECACA';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEE2E2';
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add New Assignment */}
          <div style={{
            padding: '16px',
            backgroundColor: '#FAFAF8',
            borderRadius: '8px',
            border: '1px solid #E5E5E0',
          }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', margin: 0 }}>
              Assign New Deal
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#4A5568' }}>
                  Deal
                </label>
                <select
                  value={selectedDealId || ''}
                  onChange={(e) => setSelectedDealId(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #E5E5E0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'DM Sans',
                  }}
                >
                  <option value="">-- Select Deal --</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#4A5568' }}>
                  Sales Engineer
                </label>
                <select
                  value={selectedSeId || ''}
                  onChange={(e) => setSelectedSeId(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #E5E5E0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'DM Sans',
                  }}
                >
                  <option value="">-- Select SE --</option>
                  {seList.map((se) => (
                    <option key={se.id} value={se.id}>
                      {se.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignDeal}
                disabled={assignmentLoading || !selectedDealId || !selectedSeId}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0047FF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                  opacity: assignmentLoading || !selectedDealId || !selectedSeId ? 0.6 : 1,
                  fontFamily: 'DM Sans',
                }}
                onMouseEnter={(e) => {
                  if (!assignmentLoading && selectedDealId && selectedSeId) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {assignmentLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>

            {assignmentError && (
              <div style={{
                marginTop: '12px',
                padding: '10px 12px',
                backgroundColor: '#FEE2E2',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#991B1B',
              }}>
                {assignmentError}
              </div>
            )}

            {assignmentSuccess && (
              <div style={{
                marginTop: '12px',
                padding: '10px 12px',
                backgroundColor: '#ECFDF5',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#065F46',
              }}>
                {assignmentSuccess}
              </div>
            )}
          </div>
        </div>
      )}

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
