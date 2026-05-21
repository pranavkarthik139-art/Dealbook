import { differenceInDays, differenceInHours } from 'date-fns';

/**
 * Deal Pulse - Intelligence Detection Feature
 * Measures the real-time heartbeat/energy of customer relationships
 * Part of the Intelligence Alerts & Detection system
 *
 * Factors:
 * 1. Recent Activity Velocity (40%) - How active is the relationship?
 * 2. Gong Sentiment & Optimism (35%) - What's the customer saying?
 * 3. Stakeholder Engagement Energy (25%) - How engaged are key people?
 */

export interface PulseSignal {
  score: number; // 0-100
  bpm: number; // Beats per minute (metaphorical: 40-180)
  status: 'flatlined' | 'weak' | 'normal' | 'strong' | 'accelerating';
  color: string;
  colorClass: string;
  reasonings: string[];
}

export interface PulseBreakdown {
  activityVelocity: number; // 0-100 (40% weight)
  gongSentiment: number; // 0-100 (35% weight)
  stakeholderEnergy: number; // 0-100 (25% weight)
}

/**
 * Calculate activity velocity (recent activities)
 * Measures momentum from recent events: calls, emails, meetings
 */
function calculateActivityVelocity(
  activityLogs: Array<{ action: string; createdAt: Date }>,
  calendarEvents: Array<{ startTime: Date }>,
  calls: Array<{ callDate: Date }>
): number {
  const now = new Date();

  // Weight different activity types
  const last7DaysActivities = activityLogs.filter(
    log => differenceInDays(now, log.createdAt) <= 7
  );

  const last7DaysCalls = calls.filter(
    call => differenceInDays(now, call.callDate) <= 7
  );

  const last7DaysUpcomingCalls = calendarEvents.filter(
    event => event.startTime > now && differenceInDays(event.startTime, now) <= 7
  );

  // Calculate weighted activity score
  let activityScore = 0;

  // Calls are highest engagement (3x weight)
  activityScore += last7DaysCalls.length * 3;

  // Upcoming calls (2x weight - shows commitment)
  activityScore += last7DaysUpcomingCalls.length * 2;

  // General activities (1x weight)
  activityScore += last7DaysActivities.length * 1;

  // Email-specific activities (0.5x weight)
  const emailActivities = last7DaysActivities.filter(
    log => log.action.includes('email') || log.action.includes('Email')
  );
  activityScore += emailActivities.length * 0.5;

  // Normalize to 0-100
  // Max realistic: 2-3 calls/week + meetings + emails
  const maxScore = 30; // This represents "very active"
  const velocityScore = Math.min(100, (activityScore / maxScore) * 100);

  // Bonus for acceleration (more activity in last 3 days vs last 7)
  const last3Days = activityLogs.filter(
    log => differenceInDays(now, log.createdAt) <= 3
  );
  if (last3Days.length > 0) {
    const accelerationBonus = Math.min(15, last3Days.length * 5);
    return Math.min(100, velocityScore + accelerationBonus);
  }

  return velocityScore;
}

/**
 * Calculate Gong sentiment & optimism
 * Analyzes descriptions and risk levels for customer sentiment
 */
function calculateGongSentiment(
  gongDescriptions: Array<{ description?: string; riskLevel?: string }>,
  recentCalls: Array<{ gongDescription?: string; gongRiskLevel?: string; gongInsightSummary?: string }>
): number {
  let sentimentScore = 50; // Neutral baseline

  if (gongDescriptions.length === 0 && recentCalls.length === 0) {
    return 50; // No data = neutral
  }

  const allDescriptions = [
    ...gongDescriptions.map(g => g.description || ''),
    ...recentCalls.map(c => c.gongDescription || c.gongInsightSummary || '')
  ].filter(d => d.length > 0);

  if (allDescriptions.length === 0) {
    return 50;
  }

  // Check for optimism keywords
  const optimismKeywords = [
    'budget approved',
    'timeline agreed',
    'champion engaged',
    'strong product-market fit',
    'moving forward',
    'accelerate',
    'excited',
    'committed',
    'confirmed',
    'approved',
    'positive',
    'success',
    'ready',
    'next phase',
    'closing soon',
    'legal signed',
    'procurement approved'
  ];

  const concernKeywords = [
    'delayed',
    'stalled',
    'concerns',
    'risk',
    'blocker',
    'competing',
    'evaluate',
    'skeptical',
    'uncertain',
    'pending',
    'on hold',
    'postponed',
    're-evaluate',
    'decision pending'
  ];

  const combinedText = allDescriptions.join(' ').toLowerCase();

  let optimismCount = 0;
  let concernCount = 0;

  optimismKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      optimismCount++;
    }
  });

  concernKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      concernCount++;
    }
  });

  // Calculate sentiment score
  const netSentiment = optimismCount - concernCount;
  sentimentScore = 50 + (netSentiment * 5); // Each keyword shifts by 5 points

  // Check risk levels
  const riskLevels = recentCalls.map(c => c.gongRiskLevel).filter(r => r);
  if (riskLevels.length > 0) {
    const criticalCount = riskLevels.filter(r => r === 'critical').length;
    const highCount = riskLevels.filter(r => r === 'high').length;
    const lowCount = riskLevels.filter(r => r === 'low').length;

    const riskAdjustment = (lowCount * 10) - (criticalCount * 15) - (highCount * 8);
    sentimentScore += riskAdjustment;
  }

  return Math.max(0, Math.min(100, sentimentScore));
}

/**
 * Calculate stakeholder engagement energy
 * Measures how engaged and active the contacts are
 */
function calculateStakeholderEnergy(
  contacts: Array<{
    id: number;
    lastContactedAt?: Date;
  }>,
  contactEngagementScores?: Array<{ engagementLevel: 'engaged' | 'moderate' | 'silent' }>
): number {
  if (!contacts || contacts.length === 0) {
    return 0; // No contacts = no energy
  }

  const now = new Date();

  // Calculate engagement distribution
  let engagedCount = 0;
  let moderateCount = 0;
  let silentCount = 0;

  if (contactEngagementScores && contactEngagementScores.length > 0) {
    engagedCount = contactEngagementScores.filter(c => c.engagementLevel === 'engaged').length;
    moderateCount = contactEngagementScores.filter(c => c.engagementLevel === 'moderate').length;
    silentCount = contactEngagementScores.filter(c => c.engagementLevel === 'silent').length;
  } else {
    // Fallback: estimate from lastContactedAt
    contacts.forEach(contact => {
      if (!contact.lastContactedAt) {
        silentCount++;
      } else {
        const daysSince = differenceInDays(now, contact.lastContactedAt);
        if (daysSince <= 3) engagedCount++;
        else if (daysSince <= 7) moderateCount++;
        else silentCount++;
      }
    });
  }

  // Calculate energy score
  const totalContacts = contacts.length;
  const engagementRatio = (engagedCount * 100 + moderateCount * 50) / (totalContacts * 100);
  const energyScore = engagementRatio * 100;

  // Bonus for multiple engaged stakeholders
  if (engagedCount >= 2) {
    return Math.min(100, energyScore + 15);
  }

  return energyScore;
}

/**
 * Calculate overall Pulse
 * Combines all signals into a single heartbeat metric
 */
export function calculateDealPulse(
  activityLogs: Array<{ action: string; createdAt: Date }> = [],
  calendarEvents: Array<{ startTime: Date }> = [],
  calls: Array<{ callDate: Date }> = [],
  gongData: Array<{ description?: string; riskLevel?: string }> = [],
  recentCalls: Array<{ gongDescription?: string; gongRiskLevel?: string; gongInsightSummary?: string }> = [],
  contacts: Array<{ id: number; lastContactedAt?: Date }> = [],
  contactEngagementScores?: Array<{ engagementLevel: 'engaged' | 'moderate' | 'silent' }>
): PulseSignal {
  // Calculate component scores
  const activityVelocity = calculateActivityVelocity(activityLogs, calendarEvents, calls);
  const gongSentiment = calculateGongSentiment(gongData, recentCalls);
  const stakeholderEnergy = calculateStakeholderEnergy(contacts, contactEngagementScores);

  // Weighted average (40% + 35% + 25%)
  const pulseScore = Math.round(
    (activityVelocity * 0.4) + (gongSentiment * 0.35) + (stakeholderEnergy * 0.25)
  );

  // Convert to BPM (40-180 metaphorical range)
  const bpm = 40 + Math.round((pulseScore / 100) * 140);

  // Determine status
  let status: 'flatlined' | 'weak' | 'normal' | 'strong' | 'accelerating';
  if (pulseScore < 20) status = 'flatlined';
  else if (pulseScore < 40) status = 'weak';
  else if (pulseScore < 60) status = 'normal';
  else if (pulseScore < 80) status = 'strong';
  else status = 'accelerating';

  // Determine color
  let color: string;
  let colorClass: string;
  if (status === 'flatlined') {
    color = '#6B7280'; // Gray
    colorClass = 'text-gray-500';
  } else if (status === 'weak') {
    color = '#EF4444'; // Red
    colorClass = 'text-red';
  } else if (status === 'normal') {
    color = '#F59E0B'; // Amber
    colorClass = 'text-amber';
  } else if (status === 'strong') {
    color = '#10B981'; // Green
    colorClass = 'text-green';
  } else {
    color = '#0047FF'; // Cobalt
    colorClass = 'text-cobalt';
  }

  // Generate reasonings
  const reasonings: string[] = [];

  if (activityVelocity > 70) {
    reasonings.push(`🔥 High activity velocity (${Math.round(activityVelocity)}/100)`);
  } else if (activityVelocity > 40) {
    reasonings.push(`📈 Steady activity pace (${Math.round(activityVelocity)}/100)`);
  } else if (activityVelocity > 0) {
    reasonings.push(`📉 Low activity velocity (${Math.round(activityVelocity)}/100)`);
  } else {
    reasonings.push(`⚠️ No recent activity`);
  }

  if (gongSentiment > 70) {
    reasonings.push(`😊 Very optimistic sentiment from stakeholders`);
  } else if (gongSentiment > 50) {
    reasonings.push(`😐 Neutral to positive sentiment`);
  } else if (gongSentiment < 30) {
    reasonings.push(`😟 Concerns raised by stakeholders`);
  }

  const engagedRatio = Math.round((stakeholderEnergy / 100) * contacts.length);
  if (engagedRatio >= contacts.length * 0.7) {
    reasonings.push(`👥 ${engagedRatio}/${contacts.length} stakeholders actively engaged`);
  } else if (engagedRatio > 0) {
    reasonings.push(`👥 ${engagedRatio}/${contacts.length} stakeholders engaged`);
  } else {
    reasonings.push(`👤 No active stakeholder engagement`);
  }

  return {
    score: pulseScore,
    bpm,
    status,
    color,
    colorClass,
    reasonings
  };
}

/**
 * Get pulse interpretation
 */
export function getPulseInterpretation(
  score: number
): { label: string; description: string } {
  if (score >= 80) {
    return {
      label: '🚀 Accelerating',
      description: 'Deal has strong momentum and very positive sentiment'
    };
  }
  if (score >= 60) {
    return {
      label: '💪 Strong Pulse',
      description: 'Healthy relationship energy and good engagement'
    };
  }
  if (score >= 40) {
    return {
      label: '⏻ Normal Pulse',
      description: 'Steady but not accelerating, needs monitoring'
    };
  }
  if (score >= 20) {
    return {
      label: '⚠️ Weak Pulse',
      description: 'Low energy, engagement declining'
    };
  }
  return {
    label: '🔴 Flatlined',
    description: 'Deal has lost momentum, immediate action needed'
  };
}
