interface DealData {
  id: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
  status?: string;
  stage?: string;
  todos?: Array<{ completed: boolean }>;
  calendarEvents?: Array<{ startTime: string }>;
}

export function calculateDealHealth(deal: DealData): number {
  let health = 100;

  // Penalty for inactivity (5 points per day)
  if (deal.lastActivityAt) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    health -= daysSinceActivity * 5;
  } else {
    // No activity recorded, penalty
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    health -= daysSinceCreated * 5;
  }

  // Bonus for completed todos (2 points each)
  if (deal.todos) {
    const completedTodos = deal.todos.filter(t => t.completed).length;
    health += completedTodos * 2;
  }

  // Bonus for upcoming calendar events (10 points)
  if (deal.calendarEvents && deal.calendarEvents.length > 0) {
    const upcomingEvents = deal.calendarEvents.filter(
      e => new Date(e.startTime) > new Date()
    ).length;
    if (upcomingEvents > 0) {
      health += 10;
    }
  }

  // Penalty for closed/lost status
  if (deal.status === 'lost') {
    health = Math.min(health, 20);
  }

  // Cap between 0-100
  return Math.max(0, Math.min(100, Math.round(health)));
}

export function getHealthStatus(health: number): {
  label: string;
  color: string;
  colorClass: string;
} {
  if (health >= 80) {
    return { label: 'On track', color: 'green', colorClass: 'text-green' };
  }
  if (health >= 50) {
    return { label: 'Needs attention', color: 'amber', colorClass: 'text-amber' };
  }
  return { label: 'At risk', color: 'red', colorClass: 'text-red' };
}

export function getHealthReason(deal: DealData): string {
  if (!deal.lastActivityAt) {
    return 'No activity recorded';
  }

  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceActivity === 0) {
    return '✓ Active (last contact today)';
  }
  if (daysSinceActivity === 1) {
    return '✓ Active (last contact yesterday)';
  }
  if (daysSinceActivity < 7) {
    return `✓ Active (last contact ${daysSinceActivity}d ago)`;
  }
  if (daysSinceActivity < 14) {
    return `✗ Stalled (no activity ${daysSinceActivity}d)`;
  }
  return `✗ No activity for ${daysSinceActivity}d`;
}

export interface StallDetection {
  isStalled: boolean;
  daysStalled: number;
  risk: 'ok' | 'warning' | 'critical';
  reason: string;
  daysUntilCritical?: number;
}

export function detectStall(deal: DealData): StallDetection {
  // Stage-specific stall thresholds (days)
  const stallThresholds: Record<string, number> = {
    demo: 14,
    poc: 21,
    validation: 14,
    closed: 999, // Never stall closed deals
  };

  const stage = deal.stage?.toLowerCase() || 'demo';
  const threshold = stallThresholds[stage] || 21;

  // Calculate days since last activity
  const activityDate = deal.lastActivityAt
    ? new Date(deal.lastActivityAt)
    : new Date(deal.createdAt);

  const daysSinceActivity = Math.floor(
    (Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine stall status
  const isStalled = daysSinceActivity > threshold;
  const daysStalled = Math.max(0, daysSinceActivity - threshold);
  const daysUntilCritical = Math.max(0, threshold - daysSinceActivity);

  // Risk levels
  let risk: 'ok' | 'warning' | 'critical' = 'ok';
  if (isStalled && daysStalled <= 7) {
    risk = 'warning';
  } else if (isStalled && daysStalled > 7) {
    risk = 'critical';
  }

  // Generate reason
  let reason = '';
  if (daysSinceActivity === 0) {
    reason = `Active (expected move in ${threshold}d)`;
  } else if (daysSinceActivity < 3) {
    reason = `Recent activity (${daysSinceActivity}d ago)`;
  } else if (daysSinceActivity < threshold) {
    reason = `No activity ${daysSinceActivity}d (expected move in ${daysUntilCritical}d)`;
  } else if (risk === 'warning') {
    reason = `Stalled ${daysStalled}d (typically moves within ${threshold}d for ${stage})`;
  } else {
    reason = `Critical stall: ${daysStalled}d without activity`;
  }

  return {
    isStalled,
    daysStalled,
    risk,
    reason,
    daysUntilCritical,
  };
}
