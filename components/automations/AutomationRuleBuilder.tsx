'use client';

import { useState } from 'react';
import {
  AVAILABLE_TRIGGERS,
  AVAILABLE_ACTIONS,
  buildTriggerConfig,
  buildActionConfig,
} from '@/lib/automationEngine';

interface AutomationRuleBuilderProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AutomationRuleBuilder({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AutomationRuleBuilderProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [trigger, setTrigger] = useState(initialData?.trigger || 'deal_created');
  const [action, setAction] = useState(initialData?.action || 'create_todo');
  const [enabled, setEnabled] = useState(initialData?.enabled !== false);

  // Stage trigger config
  const [selectedStage, setSelectedStage] = useState(
    initialData?.triggerConfig?.stage || 'poc'
  );

  // Date trigger config
  const [daysInStage, setDaysInStage] = useState(
    initialData?.triggerConfig?.daysInStage || 7
  );

  // Action config - create_todo
  const [todos, setTodos] = useState<string[]>(
    initialData?.actionConfig?.todos || []
  );
  const [newTodo, setNewTodo] = useState('');

  // Action config - update_field
  const [fieldName, setFieldName] = useState(
    initialData?.actionConfig?.field || 'probability'
  );
  const [fieldValue, setFieldValue] = useState(
    initialData?.actionConfig?.value || ''
  );

  // Action config - move_stage
  const [toStage, setToStage] = useState(
    initialData?.actionConfig?.toStage || 'validation'
  );

  const stages = ['demo', 'poc', 'validation', 'closed'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let triggerConfig: any = {};
    let actionConfig: any = {};

    // Build trigger config
    if (trigger === 'stage_changed') {
      triggerConfig.stage = selectedStage;
    } else if (trigger === 'date_reached') {
      triggerConfig.daysInStage = parseInt(String(daysInStage));
    }

    // Build action config
    if (action === 'create_todo') {
      actionConfig.todos = todos;
    } else if (action === 'update_field') {
      actionConfig.field = fieldName;
      actionConfig.value = isNaN(Number(fieldValue)) ? fieldValue : Number(fieldValue);
    } else if (action === 'move_stage') {
      actionConfig.toStage = toStage;
    }

    await onSubmit({
      name,
      description,
      trigger,
      triggerConfig,
      action,
      actionConfig,
      enabled,
    });
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo]);
      setNewTodo('');
    }
  };

  const removeTodo = (idx: number) => {
    setTodos(todos.filter((_, i) => i !== idx));
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '700px',
      }}
    >
      {/* Basic Info */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--theme-text-primary)',
            marginBottom: '12px',
          }}
        >
          Rule Name & Description
        </legend>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--theme-text-primary)',
                marginBottom: '4px',
                display: 'block',
              }}
            >
              Rule Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Auto-create POC tasks"
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
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--theme-text-primary)',
                marginBottom: '4px',
                display: 'block',
              }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this automation do?"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--theme-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                minHeight: '60px',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      </fieldset>

      {/* Trigger Selection */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--theme-text-primary)',
            marginBottom: '12px',
          }}
        >
          When (Trigger)
        </legend>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
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
            {AVAILABLE_TRIGGERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Conditional fields based on trigger */}
          {trigger === 'stage_changed' && (
            <div>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--theme-text-primary)',
                  marginBottom: '4px',
                  display: 'block',
                }}
              >
                When deal moves to:
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
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
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {trigger === 'date_reached' && (
            <div>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--theme-text-primary)',
                  marginBottom: '4px',
                  display: 'block',
                }}
              >
                After how many days in current stage?
              </label>
              <input
                type="number"
                value={daysInStage}
                onChange={(e) => setDaysInStage(e.target.value)}
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
          )}
        </div>
      </fieldset>

      {/* Action Selection */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--theme-text-primary)',
            marginBottom: '12px',
          }}
        >
          Then (Action)
        </legend>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
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
            {AVAILABLE_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          {/* Conditional fields based on action */}
          {action === 'create_todo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--theme-border)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a to-do item"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid var(--theme-border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={addTodo}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>

              {todos.map((todo, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: 'var(--theme-card-bg)',
                    borderRadius: '6px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--theme-text-primary)' }}>
                    ✓ {todo}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTodo(idx)}
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
            </div>
          )}

          {action === 'update_field' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--theme-border)' }}>
              <div>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--theme-text-primary)',
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  Field Name:
                </label>
                <select
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
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
                  <option value="probability">Probability</option>
                  <option value="status">Status</option>
                  <option value="stage">Stage</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--theme-text-primary)',
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  Value:
                </label>
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Enter value"
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
          )}

          {action === 'move_stage' && (
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--theme-border)' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--theme-text-primary)',
                  marginBottom: '4px',
                  display: 'block',
                }}
              >
                Move to stage:
              </label>
              <select
                value={toStage}
                onChange={(e) => setToStage(e.target.value)}
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
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </fieldset>

      {/* Enable/Disable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          style={{
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            accentColor: 'var(--theme-accent)',
          }}
        />
        <label
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--theme-text-primary)',
            cursor: 'pointer',
          }}
        >
          Enable this automation
        </label>
      </div>

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
          {isLoading ? 'Saving...' : 'Save Rule'}
        </button>
      </div>
    </form>
  );
}
