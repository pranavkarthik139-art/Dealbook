'use client';

import { useState } from 'react';

interface Stage {
  stageName: string;
  expectedDays: number;
}

interface Milestone {
  title: string;
  description?: string;
  daysAfterStart?: number;
}

interface TemplateFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TemplateForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TemplateFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dealType, setDealType] = useState(initialData?.dealType || 'enterprise');
  const [expectedDuration, setExpectedDuration] = useState(
    initialData?.expectedDuration || 30
  );
  const [estimatedValue, setEstimatedValue] = useState(
    initialData?.estimatedValue || ''
  );

  const [stages, setStages] = useState<Stage[]>(
    initialData?.stages || [
      { stageName: 'demo', expectedDays: 14 },
      { stageName: 'poc', expectedDays: 21 },
      { stageName: 'validation', expectedDays: 14 },
    ]
  );

  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones || []
  );

  const [newMilestone, setNewMilestone] = useState<Milestone>({
    title: '',
    description: '',
    daysAfterStart: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      description,
      dealType,
      expectedDuration: parseInt(String(expectedDuration)),
      estimatedValue: estimatedValue ? parseInt(estimatedValue) : null,
      stages,
      milestones,
    });
  };

  const addMilestone = () => {
    if (newMilestone.title) {
      setMilestones([...milestones, newMilestone]);
      setNewMilestone({ title: '', description: '', daysAfterStart: undefined });
    }
  };

  const removeMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateStage = (idx: number, field: string, value: any) => {
    const updated = [...stages];
    updated[idx] = { ...updated[idx], [field]: value };
    setStages(updated);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '800px',
      }}
    >
      {/* Basic Info */}
      <fieldset
        style={{
          border: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        <legend style={{ fontSize: '14px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '12px' }}>
          Template Basics
        </legend>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '4px', display: 'block' }}>
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Enterprise SaaS Deal"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '4px', display: 'block' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this template for?"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                minHeight: '80px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '4px', display: 'block' }}>
                Deal Type *
              </label>
              <select
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              >
                <option value="enterprise">Enterprise</option>
                <option value="mid-market">Mid-Market</option>
                <option value="startup">Startup</option>
                <option value="smb">SMB</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '4px', display: 'block' }}>
                Expected Duration (days)
              </label>
              <input
                type="number"
                value={expectedDuration}
                onChange={(e) => setExpectedDuration(e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '4px', display: 'block' }}>
              Estimated Deal Value
            </label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="e.g., 500000"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </fieldset>

      {/* Pipeline Stages */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontSize: '14px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '12px' }}>
          Pipeline Stages
        </legend>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stages.map((stage, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                type="text"
                value={stage.stageName}
                onChange={(e) => updateStage(idx, 'stageName', e.target.value)}
                placeholder="Stage name"
                style={{
                  padding: '10px 12px',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="number"
                value={stage.expectedDays}
                onChange={(e) =>
                  updateStage(idx, 'expectedDays', parseInt(e.target.value))
                }
                placeholder="Expected days"
                style={{
                  padding: '10px 12px',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Milestones */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontSize: '14px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '12px' }}>
          Milestones & Checklist
        </legend>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                backgroundColor: 'var(--theme-card-bg)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 4px 0' }}>
                  {milestone.title}
                </p>
                {milestone.description && (
                  <p style={{ fontSize: '12px', color: 'var(--theme-text-tertiary)', margin: 0 }}>
                    {milestone.description}
                  </p>
                )}
                {milestone.daysAfterStart && (
                  <p style={{ fontSize: '11px', color: 'var(--amber)', margin: '4px 0 0 0' }}>
                    Day {milestone.daysAfterStart}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeMilestone(idx)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  color: 'var(--red)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add milestone form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--theme-border)' }}>
            <input
              type="text"
              value={newMilestone.title}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, title: e.target.value })
              }
              placeholder="Milestone title (e.g., Send proposal)"
              style={{
                padding: '10px 12px',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
            <textarea
              value={newMilestone.description || ''}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, description: e.target.value })
              }
              placeholder="Description (optional)"
              style={{
                padding: '10px 12px',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '60px',
                resize: 'vertical',
              }}
            />
            <input
              type="number"
              value={newMilestone.daysAfterStart || ''}
              onChange={(e) =>
                setNewMilestone({
                  ...newMilestone,
                  daysAfterStart: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Days after deal start (optional)"
              style={{
                padding: '10px 12px',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={addMilestone}
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-border)';
                e.currentTarget.style.color = 'var(--theme-text-primary)';
              }}
            >
              + Add Milestone
            </button>
          </div>
        </div>
      </fieldset>

      {/* Form Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--theme-border)' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'var(--theme-text-primary)',
            border: '1px solid var(--theme-border)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !name}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--theme-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading || !name ? 'not-allowed' : 'pointer',
            opacity: isLoading || !name ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </form>
  );
}
