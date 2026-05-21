'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AutomationCard } from '@/components/automations/AutomationCard';
import { AutomationRuleBuilder } from '@/components/automations/AutomationRuleBuilder';

interface Automation {
  id: number;
  name: string;
  description?: string;
  trigger: string;
  triggerConfig: any;
  action: string;
  actionConfig: any;
  enabled: boolean;
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/automations');
      const data = await response.json();

      if (data.success) {
        setAutomations(data.automations);
      } else {
        setError('Failed to load automations');
      }
    } catch (err) {
      setError('Error loading automations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setAutomations([data.automation, ...automations]);
        setShowCreateForm(false);
        console.log('✅ Automation created:', data.automation.name);
      } else {
        setError('Failed to create automation');
      }
    } catch (err) {
      setError('Error creating automation');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    const automation = automations.find((a) => a.id === id);
    if (automation) {
      setEditingId(id);
      setEditingData(automation);
      setShowCreateForm(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingId) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/automations/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setAutomations(
          automations.map((a) => (a.id === editingId ? data.automation : a))
        );
        setEditingId(null);
        setEditingData(null);
        console.log('✅ Automation updated:', data.automation.name);
      } else {
        setError('Failed to update automation');
      }
    } catch (err) {
      setError('Error updating automation');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setAutomations(automations.filter((a) => a.id !== id));
        console.log('✅ Automation deleted');
      } else {
        setError('Failed to delete automation');
      }
    } catch (err) {
      setError('Error deleting automation');
      console.error(err);
    }
  };

  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      const automation = automations.find((a) => a.id === id);
      if (!automation) return;

      const response = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...automation, enabled }),
      });

      const data = await response.json();

      if (data.success) {
        setAutomations(
          automations.map((a) => (a.id === id ? data.automation : a))
        );
      }
    } catch (err) {
      console.error('Error toggling automation:', err);
    }
  };

  const handleViewHistory = (id: number) => {
    setHistoryId(id);
    // In a real app, would fetch execution history from API
    // For now, just show a placeholder
    setHistoryData([]);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/deals"
          style={{
            color: 'var(--cobalt)',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '16px',
            display: 'block',
          }}
        >
          ← Back to Deals
        </Link>
        <h1
          style={{
            fontSize: '32px',
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: 0,
            marginBottom: '8px',
          }}
        >
          Automation Center
        </h1>
        <p style={{ color: 'var(--ink-lighter)', margin: 0 }}>
          Automate repetitive tasks. Set rules once, apply forever.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#991B1B',
            marginBottom: '24px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Form Section */}
      {(showCreateForm || editingId) && (
        <div
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 20px 0',
            }}
          >
            {editingId ? 'Edit Automation' : 'Create New Automation'}
          </h2>
          <AutomationRuleBuilder
            initialData={editingData}
            onSubmit={editingId ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingId(null);
              setEditingData(null);
            }}
            isLoading={formLoading}
          />
        </div>
      )}

      {/* Create Button */}
      {!showCreateForm && !editingId && (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--cobalt)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + Create Automation
        </button>
      )}

      {/* History Modal */}
      {historyId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setHistoryId(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--paper)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              maxHeight: '600px',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: '0 0 16px 0',
              }}
            >
              Execution History
            </h2>

            {historyData.length === 0 ? (
              <p style={{ color: 'var(--ink-lighter)', textAlign: 'center', padding: '20px 0' }}>
                No executions yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {historyData.map((execution: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--paper-alt)',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${execution.status === 'success' ? 'var(--green)' : 'var(--red)'}`,
                    }}
                  >
                    <p style={{ fontSize: '12px', margin: 0, fontWeight: 600 }}>
                      {execution.status === 'success' ? '✅' : '❌'} {execution.status}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--ink-lighter)', margin: '4px 0 0 0' }}>
                      {new Date(execution.executedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setHistoryId(null)}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Automations Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-lighter)' }}>
          Loading automations...
        </div>
      ) : automations.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '12px',
            border: '1px dashed var(--line)',
          }}
        >
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ink-lighter)',
              margin: '0 0 8px 0',
            }}
          >
            No automations yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', margin: 0 }}>
            Create your first automation to save time on repetitive tasks
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              id={automation.id}
              name={automation.name}
              trigger={automation.trigger}
              triggerConfig={automation.triggerConfig}
              action={automation.action}
              actionConfig={automation.actionConfig}
              enabled={automation.enabled}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
