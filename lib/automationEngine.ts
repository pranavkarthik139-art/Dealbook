/**
 * Automation Engine Utilities
 * Handles trigger evaluation, condition matching, and action execution
 */

export type AutomationTrigger =
  | 'deal_created'
  | 'stage_changed'
  | 'date_reached'
  | 'email_received'
  | 'todo_completed';

export type AutomationAction =
  | 'create_todo'
  | 'send_email'
  | 'update_field'
  | 'move_stage'
  | 'create_task';

export interface AutomationRule {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface TriggerConfig {
  stage?: string;
  minAmount?: number;
  maxAmount?: number;
  daysInStage?: number;
  probability?: number;
  rules?: AutomationRule[];
}

export interface ActionConfig {
  todos?: string[];
  field?: string;
  value?: any;
  toStage?: string;
  emailTemplate?: string;
  recipients?: string[];
  subject?: string;
  body?: string;
}

/**
 * Evaluate if a trigger condition is met
 */
export function evaluateTrigger(
  trigger: AutomationTrigger,
  triggerConfig: TriggerConfig,
  dealData: any
): boolean {
  switch (trigger) {
    case 'deal_created':
      // Always triggers on deal creation
      return true;

    case 'stage_changed':
      // Check if the deal stage matches configured stage
      return !triggerConfig.stage || dealData.stage === triggerConfig.stage;

    case 'date_reached':
      // Check if today matches a certain date relative to deal creation
      if (!triggerConfig.daysInStage) return false;
      const daysElapsed = Math.floor(
        (Date.now() - new Date(dealData.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      return daysElapsed >= triggerConfig.daysInStage;

    case 'email_received':
      // Trigger when email from specific contact is received
      return true; // Handled elsewhere

    case 'todo_completed':
      // Always triggers when todo is marked complete
      return true;

    default:
      return false;
  }
}

/**
 * Evaluate if all rules in a condition set are true
 */
export function evaluateRules(
  rules: AutomationRule[] | undefined,
  dealData: any
): boolean {
  if (!rules || rules.length === 0) return true;

  return rules.every((rule) => evaluateRule(rule, dealData));
}

/**
 * Evaluate a single rule
 */
function evaluateRule(rule: AutomationRule, dealData: any): boolean {
  const fieldValue = dealData[rule.field];

  switch (rule.operator) {
    case 'eq':
      return fieldValue === rule.value;
    case 'ne':
      return fieldValue !== rule.value;
    case 'gt':
      return fieldValue > rule.value;
    case 'gte':
      return fieldValue >= rule.value;
    case 'lt':
      return fieldValue < rule.value;
    case 'lte':
      return fieldValue <= rule.value;
    case 'in':
      return Array.isArray(rule.value) && rule.value.includes(fieldValue);
    case 'contains':
      return String(fieldValue).includes(String(rule.value));
    default:
      return false;
  }
}

/**
 * Get human-readable trigger description
 */
export function getTriggerDescription(
  trigger: AutomationTrigger,
  config: TriggerConfig
): string {
  switch (trigger) {
    case 'deal_created':
      return 'When a deal is created';
    case 'stage_changed':
      return `When a deal moves to ${config.stage}`;
    case 'date_reached':
      return `After ${config.daysInStage} days in current stage`;
    case 'email_received':
      return 'When an email is received from a contact';
    case 'todo_completed':
      return 'When a to-do is marked complete';
    default:
      return 'Unknown trigger';
  }
}

/**
 * Get human-readable action description
 */
export function getActionDescription(
  action: AutomationAction,
  config: ActionConfig
): string {
  switch (action) {
    case 'create_todo':
      return `Create ${config.todos?.length || 1} to-do(s)`;
    case 'send_email':
      return `Send email to ${config.recipients?.length || 1} recipient(s)`;
    case 'update_field':
      return `Set ${config.field} to ${config.value}`;
    case 'move_stage':
      return `Move deal to ${config.toStage}`;
    case 'create_task':
      return 'Create a task';
    default:
      return 'Unknown action';
  }
}

/**
 * Get list of available triggers
 */
export const AVAILABLE_TRIGGERS: Array<{
  value: AutomationTrigger;
  label: string;
  description: string;
}> = [
  {
    value: 'deal_created',
    label: 'Deal Created',
    description: 'Trigger when a new deal is created',
  },
  {
    value: 'stage_changed',
    label: 'Stage Changed',
    description: 'Trigger when a deal moves to a specific stage',
  },
  {
    value: 'date_reached',
    label: 'Date Reached',
    description: 'Trigger after a deal has been in current stage for X days',
  },
  {
    value: 'email_received',
    label: 'Email Received',
    description: 'Trigger when an email is received from a deal contact',
  },
  {
    value: 'todo_completed',
    label: 'To-Do Completed',
    description: 'Trigger when a deal-related to-do is marked complete',
  },
];

/**
 * Get list of available actions
 */
export const AVAILABLE_ACTIONS: Array<{
  value: AutomationAction;
  label: string;
  description: string;
}> = [
  {
    value: 'create_todo',
    label: 'Create To-Do(s)',
    description: 'Automatically create one or more to-do items',
  },
  {
    value: 'send_email',
    label: 'Send Email',
    description: 'Send an email to deal contacts or team',
  },
  {
    value: 'update_field',
    label: 'Update Field',
    description: 'Automatically update a deal field (e.g., probability)',
  },
  {
    value: 'move_stage',
    label: 'Move Stage',
    description: 'Automatically move deal to next stage',
  },
];

/**
 * Build trigger config from form data
 */
export function buildTriggerConfig(
  trigger: AutomationTrigger,
  formData: Record<string, any>
): TriggerConfig {
  const config: TriggerConfig = {};

  switch (trigger) {
    case 'stage_changed':
      config.stage = formData.stage;
      break;
    case 'date_reached':
      config.daysInStage = parseInt(formData.daysInStage);
      break;
  }

  // Add conditions if specified
  if (formData.conditions) {
    config.rules = formData.conditions;
  }

  return config;
}

/**
 * Build action config from form data
 */
export function buildActionConfig(
  action: AutomationAction,
  formData: Record<string, any>
): ActionConfig {
  const config: ActionConfig = {};

  switch (action) {
    case 'create_todo':
      config.todos = formData.todos || [];
      break;
    case 'send_email':
      config.emailTemplate = formData.emailTemplate;
      config.recipients = formData.recipients || [];
      break;
    case 'update_field':
      config.field = formData.field;
      config.value = formData.value;
      break;
    case 'move_stage':
      config.toStage = formData.toStage;
      break;
  }

  return config;
}
