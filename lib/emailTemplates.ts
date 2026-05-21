/**
 * Email Templates for Batch Sending
 * Supports {{dealName}} and {{contactName}} placeholders
 */

export interface EmailTemplate {
  subject: string;
  body: string;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  followUp: {
    subject: 'Quick follow-up on {{dealName}}',
    body: `Hi {{contactName}},

I wanted to follow up on our discussion about {{dealName}}.

I'd like to check in and see if you have any questions or if there's anything else I can help clarify.

Looking forward to hearing from you!

Best regards`,
  },

  pocReminder: {
    subject: 'POC Update: {{dealName}}',
    body: `Hi {{contactName}},

I hope this finds you well. I wanted to provide a quick update on the Proof of Concept for {{dealName}}.

I'd love to schedule a time to discuss next steps and address any questions you might have.

Please let me know your availability in the coming week.

Best regards`,
  },

  nextSteps: {
    subject: 'Next Steps for {{dealName}}',
    body: `Hi {{contactName}},

Thank you for the great conversation about {{dealName}}.

I wanted to outline the next steps and ensure we're aligned on the timeline and requirements.

Could we schedule a brief call this week to finalize the plan?

Best regards`,
  },

  demoSchedule: {
    subject: 'Demo Scheduled: {{dealName}}',
    body: `Hi {{contactName}},

Excited to walk you through {{dealName}} in action!

I've prepared a customized demo based on your specific requirements. During the session, I'll highlight the key features that directly address your challenges.

Looking forward to showing you what we can do!

Best regards`,
  },

  custom: {
    subject: '',
    body: '',
  },
};

/**
 * Replace template placeholders with actual values
 */
export function renderTemplate(
  template: EmailTemplate,
  dealName: string,
  contactName: string
): EmailTemplate {
  return {
    subject: template.subject
      .replace(/{{dealName}}/g, dealName)
      .replace(/{{contactName}}/g, contactName),
    body: template.body
      .replace(/{{dealName}}/g, dealName)
      .replace(/{{contactName}}/g, contactName),
  };
}

/**
 * Get all available template names (excluding 'custom')
 */
export function getTemplateNames(): string[] {
  return Object.keys(emailTemplates).filter(key => key !== 'custom');
}
