import { differenceInDays } from 'date-fns';

export interface DealIntelligence {
  nextActions: NextAction[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskReasons: string[];
  suggestedFollowUpDays: number;
  momentum: 'positive' | 'neutral' | 'negative';
}

export interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedDate?: Date;
  template?: string;
}

export interface DealState {
  id: number;
  name: string;
  stage?: string;
  status?: string;
  health: number; // 0-100
  lastActivityAt?: string | null;
  createdAt: string;
  contactCount: number;
  upcomingCalls: number;
  completedTodos: number;
  totalTodos: number;
  stalled?: {
    isStalled: boolean;
    daysStalled: number;
    risk: string;
  };
}

const STAGE_THRESHOLDS: Record<string, number> = {
  demo: 14,
  poc: 21,
  validation: 14,
};

export function analyzeDeal(deal: DealState): DealIntelligence {
  const nextActions: NextAction[] = [];
  const riskReasons: string[] = [];
  let riskScore = 0;

  const now = new Date();
  const createdDaysAgo = differenceInDays(now, new Date(deal.createdAt));
  const lastActivityDaysAgo = deal.lastActivityAt
    ? differenceInDays(now, new Date(deal.lastActivityAt))
    : createdDaysAgo;

  // Risk: No contacts added
  if (deal.contactCount === 0) {
    riskScore += 30;
    riskReasons.push('No stakeholders identified');
    nextActions.push({
      action: 'Add key stakeholders',
      priority: 'high',
      reason: 'No contacts on this deal yet. Add decision makers, technical buyers, and champions.',
      template: 'Add at least 3 stakeholders before advancing',
    });
  }

  // Risk: Low deal health
  if (deal.health < 50) {
    riskScore += 25;
    riskReasons.push(`Low deal health (${deal.health}/100)`);
    nextActions.push({
      action: 'Diagnose deal issues',
      priority: 'high',
      reason: `Deal health is ${deal.health}/100. Review recent activity and contact engagement.`,
      template: 'Call champion, review POC progress, check for blockers',
    });
  } else if (deal.health < 70) {
    riskScore += 15;
    riskReasons.push(`Moderate deal health (${deal.health}/100)`);
  }

  // Risk: Stalled deal
  if (deal.stalled?.isStalled) {
    const daysStalled = deal.stalled.daysStalled;
    riskScore += Math.min(daysStalled * 2, 40);
    riskReasons.push(
      `Stalled ${daysStalled} days (${deal.stalled.risk} risk)`
    );

    nextActions.push({
      action: `Re-engage stakeholders`,
      priority: 'high',
      reason: `No activity in ${daysStalled} days. Reach out to champion or decision maker.`,
      suggestedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      template: 'Send email checking on POC progress, request call',
    });
  }

  // Risk: Long in current stage
  const stageThreshold = STAGE_THRESHOLDS[deal.stage || ''] || 21;
  if (createdDaysAgo > stageThreshold && !deal.stalled?.isStalled) {
    const daysOverThreshold = createdDaysAgo - stageThreshold;
    if (daysOverThreshold > 7) {
      riskScore += 20;
      riskReasons.push(
        `${daysOverThreshold} days over expected stage duration`
      );
      nextActions.push({
        action: 'Advance deal or clarify blockers',
        priority: 'medium',
        reason: `Deal has been in ${deal.stage} for ${createdDaysAgo} days (threshold: ${stageThreshold}d).`,
        template: 'Ask: What is needed to move forward? What are open questions?',
      });
    }
  }

  // Opportunity: No upcoming calls
  if (deal.upcomingCalls === 0 && deal.contactCount > 0) {
    if (lastActivityDaysAgo > 3) {
      riskScore += 15;
      riskReasons.push('No upcoming calls scheduled');
      nextActions.push({
        action: 'Schedule next meeting',
        priority: 'high',
        reason: `No calls on calendar. Last activity was ${lastActivityDaysAgo} days ago.`,
        suggestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        template: 'Email or call to confirm next steps and set meeting',
      });
    } else {
      nextActions.push({
        action: 'Schedule follow-up call',
        priority: 'medium',
        reason: `No upcoming calls. Consider proactive scheduling.`,
        suggestedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      });
    }
  }

  // Opportunity: Incomplete todos
  if (deal.totalTodos > 0) {
    const incompleteTodos = deal.totalTodos - deal.completedTodos;
    if (incompleteTodos > 0) {
      nextActions.push({
        action: `Complete pending tasks (${incompleteTodos}/${deal.totalTodos})`,
        priority: 'medium',
        reason: `${incompleteTodos} to-do(s) remain. These likely unlock the deal.`,
        template: 'Review to-dos, prioritize blocking items',
      });
    }
  }

  // Opportunity: Strong momentum
  if (deal.health > 80 && deal.upcomingCalls > 0 && !deal.stalled?.isStalled) {
    nextActions.unshift({
      action: 'Prepare for next call',
      priority: 'medium',
      reason: 'Deal is on strong trajectory. Come prepared with clear asks.',
      template:
        'Define decision criteria, prepare proposal, identify next milestone',
    });
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore >= 80) riskLevel = 'critical';
  else if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'medium';
  else riskLevel = 'low';

  // Determine momentum
  let momentum: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (deal.health > 75 && deal.upcomingCalls > 0 && lastActivityDaysAgo < 3) {
    momentum = 'positive';
  } else if (deal.stalled?.isStalled || lastActivityDaysAgo > 14) {
    momentum = 'negative';
  }

  // Suggested follow-up timing (in days)
  const suggestedFollowUpDays = Math.max(
    1,
    Math.min(
      7,
      Math.ceil(lastActivityDaysAgo / 2) // follow up at half the time since last activity
    )
  );

  // Sort actions by priority
  nextActions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return {
    nextActions: nextActions.slice(0, 5), // top 5 actions
    riskScore,
    riskLevel,
    riskReasons,
    suggestedFollowUpDays,
    momentum,
  };
}
