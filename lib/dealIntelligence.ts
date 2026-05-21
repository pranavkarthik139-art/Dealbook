import { differenceInDays, differenceInHours } from 'date-fns';

// ==================== EXISTING INTERFACE (LEGACY) ====================

export interface DealIntelligence {
  nextActions: NextAction[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskReasons: string[];
  suggestedFollowUpDays: number;
  momentum: 'positive' | 'neutral' | 'negative';
}

// ==================== PHASE 1: ENHANCED INTELLIGENCE ====================

/**
 * Contact Engagement Signal - Per-contact risk and engagement analysis
 * Indicates whether a specific stakeholder is engaged, silent, or responsive
 */
export interface ContactEngagementSignal {
  contactId: number;
  contactName: string;
  contactRole?: string; // 'decision_maker', 'technical_buyer', 'influencer', etc.
  engagementScore: number; // 0-100
  engagementLevel: 'engaged' | 'moderate' | 'silent'; // Categorical assessment
  lastContactedAt?: Date;
  daysSinceLastContact?: number;
  recentActivityCount: number; // Activities in last 30 days
  responseTimeMinutes?: number; // Avg minutes to respond to emails
  riskFactors: string[]; // Why this contact might be at risk
}

/**
 * Milestone Velocity - How quickly deal is progressing through stages
 * Compares current stage progression to historical patterns
 */
export interface MilestoneVelocity {
  currentStageName: string;
  currentStageDaysElapsed: number;
  expectedStageDays: number; // From historical data or template
  daysAheadBehind: number; // Negative = ahead of schedule, positive = behind
  velocityTrend: 'accelerating' | 'stable' | 'decelerating';
  estimatedStageDaysRemaining: number;
  projectedCloseDays?: number; // Estimate based on velocity
}

/**
 * Activity Trend - Analysis of deal momentum from activity patterns
 * Detects acceleration, deceleration, and stalling
 */
export interface ActivityTrend {
  last7Days: number;
  last30Days: number;
  last7DaysAverage: number; // Per day average
  last30DaysAverage: number; // Per day average
  trendDirection: 'up' | 'flat' | 'down'; // Is activity increasing, stable, or declining?
  accelerationTrend: 'accelerating' | 'stable' | 'decelerating';
  daysWithoutActivity: number;
  confidenceScore: number; // 0-100: how confident are we in this trend?
}

/**
 * Historical Comparison - How this deal ranks against similar deals
 * Enables percentile-based and predictive insights
 */
export interface HistoricalComparison {
  dealTypeAvgStageDuration: number; // Avg days in this stage for similar deals
  dealTypeAvgCloseTime: number; // Avg total time from creation to close for similar deals
  percentileHealthScore: number; // 0-100: where this deal ranks (100 = top performer)
  percentileVelocity: number; // 0-100: where this deal ranks in speed
  comparableDealsCount: number; // How many similar deals in history?
  predictedCloseDate?: Date; // ML-ready: predicted close based on patterns
  winRateSimilarDeals?: number; // % of similar deals that closed won
}

/**
 * Risk Score Breakdown - Transparent reasoning for risk assessment
 * Shows which factors contribute to overall risk and by how much
 */
export interface RiskScoreFactor {
  factor: string; // e.g., 'no_activity_7days', 'missing_contacts', 'overdue_stage'
  weight: number; // 0-1: importance of this factor
  value: number; // 0-100: contribution to overall risk from this factor
  description: string; // Human-readable explanation
}

/**
 * Reasoning - Complete explanation of intelligence scores
 * Enables trust and auditability of the intelligence system
 */
export interface IntelligenceReasoning {
  riskScoreBreakdown: RiskScoreFactor[];
  momentumReasoning: string;
  keyInsights: string[]; // Top 2-3 insights for a sales team
  concernsAndOpportunities: {
    concerns: string[];
    opportunities: string[];
  };
}

/**
 * Enhanced Deal Intelligence - Comprehensive multi-factor analysis
 * Includes all signals needed for portfolio-level visibility and decision-making
 * Structure supports ML feature vector extraction for future model training
 */
export interface EnhancedDealIntelligence {
  // Core scoring
  healthScore: number; // 0-100: overall deal health
  riskScore: number; // 0-100: overall risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  momentum: 'positive' | 'neutral' | 'negative';

  // Multi-factor signals
  signals: {
    contactEngagement: ContactEngagementSignal[];
    milestoneVelocity: MilestoneVelocity;
    activityTrend: ActivityTrend;
  };

  // Historical context
  historicalComparison: HistoricalComparison;

  // Transparent reasoning
  reasoning: IntelligenceReasoning;

  // ML feature vector (ready for model training)
  mlFeatureVector?: {
    healthPercentile: number;
    riskScore: number;
    momentumEncoded: number; // positive=1, neutral=0, negative=-1
    contactEngagementRatio: number; // engaged/total contacts
    activityZScore: number; // How many std devs from mean?
    stageDurationRatio: number; // Current/expected days in stage
    daysStalled: number;
    recentActivityFlag: number; // Has activity in last 7 days? 1/0
    upcomingEventsCount: number;
    milestoneCompletionRatio: number; // Completed/total milestones
  };
}

export interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedDate?: Date;
  template?: string;
}

// ==================== TYPE DEFINITIONS FOR DATA INPUT ====================

/**
 * Contact data needed for engagement signal calculation
 */
export interface ContactData {
  id: number;
  name: string;
  email: string;
  title?: string;
  role?: string;
  lastContactedAt?: Date;
}

/**
 * Activity log entry for trend analysis
 */
export interface ActivityData {
  id: number;
  action: string;
  description?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Calendar event for activity analysis
 */
export interface CalendarEventData {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
}

/**
 * To-do for milestone progress tracking
 */
export interface TodoData {
  id: number;
  content: string;
  completed: boolean;
  createdAt: Date;
  dealId?: number;
}

/**
 * Complete deal data for analysis
 */
export interface DealAnalysisInput {
  id: number;
  name: string;
  stage?: string;
  amount?: number;
  status?: string;
  createdAt: Date;
  lastActivityAt?: Date;
  expectedCloseDate?: Date;

  // Relations needed
  contacts: ContactData[];
  activityLogs: ActivityData[];
  calendarEvents: CalendarEventData[];
  todos: TodoData[];

  // Historical context (optional)
  historicalData?: {
    stageDurations: Record<string, number[]>; // stage -> array of days it took
    dealCloseTimes: number[]; // days from creation to close
    similarDealCount: number;
    similarDealWinRate: number;
  };
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

// ==================== CONSTANTS & CONFIGURATION ====================

const STAGE_THRESHOLDS: Record<string, number> = {
  demo: 14,
  poc: 21,
  validation: 14,
};

const STAGE_ORDER = ['demo', 'poc', 'validation', 'closed'] as const;

/**
 * Default historical patterns for when we don't have deal-specific history
 * These are fallback values based on typical SaaS sales cycles
 */
const DEFAULT_HISTORICAL_DATA = {
  stageDurations: {
    demo: [10, 15, 20, 14],
    poc: [15, 25, 35, 21],
    validation: [7, 14, 21, 14],
    closed: [5, 10, 15, 10],
  },
  dealCloseTimes: [45, 60, 75, 90, 120], // days from creation to close
  similarDealWinRate: 0.65, // 65% win rate
  similarDealCount: 10, // number of comparable deals used for benchmarking
};

// ==================== PHASE 1: SIGNAL CALCULATION FUNCTIONS ====================

/**
 * Calculate per-contact engagement signals
 * Analyzes activity with each stakeholder to identify engaged vs. silent contacts
 */
export function calculateContactEngagementSignals(
  contacts: ContactData[],
  activityLogs: ActivityData[],
  calendarEvents: CalendarEventData[]
): ContactEngagementSignal[] {
  const now = new Date();

  return contacts.map((contact) => {
    // Find all activities related to this contact
    const contactActivities = activityLogs.filter((log) =>
      log.description?.toLowerCase().includes(contact.email.toLowerCase())
    );

    const recentActivities = contactActivities.filter(
      (log) => differenceInDays(now, log.createdAt) <= 30
    );

    const relatedEvents = calendarEvents.filter((event) =>
      event.attendees.some((attendee) =>
        attendee.toLowerCase().includes(contact.email.toLowerCase())
      )
    );

    const lastActivityAt = contact.lastContactedAt
      ? new Date(contact.lastContactedAt)
      : contactActivities.length > 0
        ? new Date(contactActivities[contactActivities.length - 1].createdAt)
        : undefined;

    const daysSinceLastContact = lastActivityAt
      ? differenceInDays(now, lastActivityAt)
      : undefined;

    // Calculate engagement score (0-100)
    let engagementScore = 50; // Neutral baseline

    if (daysSinceLastContact !== undefined) {
      // Penalize lack of recent contact
      if (daysSinceLastContact <= 3) engagementScore = 85;
      else if (daysSinceLastContact <= 7) engagementScore = 70;
      else if (daysSinceLastContact <= 14) engagementScore = 55;
      else if (daysSinceLastContact <= 30) engagementScore = 35;
      else engagementScore = 15;
    }

    // Bonus for upcoming calendar events
    const upcomingEvents = relatedEvents.filter(
      (event) => event.startTime > now
    );
    if (upcomingEvents.length > 0) engagementScore += 15;

    // Bonus for multiple recent activities
    if (recentActivities.length >= 3) engagementScore += 10;

    // Cap at 100
    engagementScore = Math.min(100, engagementScore);

    // Determine engagement level
    const engagementLevel: 'engaged' | 'moderate' | 'silent' =
      engagementScore >= 70
        ? 'engaged'
        : engagementScore >= 40
          ? 'moderate'
          : 'silent';

    // Build risk factors for silent/moderate contacts
    const riskFactors: string[] = [];
    if (daysSinceLastContact && daysSinceLastContact > 7) {
      riskFactors.push(`No contact for ${daysSinceLastContact} days`);
    }
    if (upcomingEvents.length === 0 && daysSinceLastContact && daysSinceLastContact > 3) {
      riskFactors.push('No upcoming events scheduled');
    }
    if (recentActivities.length === 0) {
      riskFactors.push('No recent activity logged');
    }

    return {
      contactId: contact.id,
      contactName: contact.name,
      contactRole: contact.role,
      engagementScore,
      engagementLevel,
      lastContactedAt: lastActivityAt,
      daysSinceLastContact,
      recentActivityCount: recentActivities.length,
      riskFactors,
    };
  });
}

/**
 * Calculate milestone/stage velocity
 * Compares current stage progress to historical patterns
 */
export function calculateMilestoneVelocity(
  deal: DealAnalysisInput,
  historicalData?: Record<string, number[]>
): MilestoneVelocity {
  const now = new Date();
  const currentStageDaysElapsed = differenceInDays(now, deal.createdAt);

  // Get expected days for this stage
  const stage = (deal.stage || 'demo') as keyof typeof DEFAULT_HISTORICAL_DATA.stageDurations;
  const stageHistory =
    historicalData?.[stage] || DEFAULT_HISTORICAL_DATA.stageDurations[stage] || [14];
  const expectedStageDays = Math.round(
    stageHistory.reduce((a, b) => a + b, 0) / stageHistory.length
  );

  const daysAheadBehind = currentStageDaysElapsed - expectedStageDays;

  // Determine velocity trend by comparing recent activity trend to expected pace
  const activityTrend = calculateActivityTrend(deal.activityLogs);
  const expectedDailyActivity = 1; // Expected activities per day for on-pace deal
  const velocityTrend: 'accelerating' | 'stable' | 'decelerating' =
    activityTrend.last7DaysAverage > expectedDailyActivity
      ? 'accelerating'
      : activityTrend.last7DaysAverage < expectedDailyActivity * 0.5
        ? 'decelerating'
        : 'stable';

  // Estimate remaining days in stage based on velocity
  let estimatedStageDaysRemaining = expectedStageDays - currentStageDaysElapsed;
  if (velocityTrend === 'accelerating') {
    estimatedStageDaysRemaining = Math.ceil(estimatedStageDaysRemaining * 0.75);
  } else if (velocityTrend === 'decelerating') {
    estimatedStageDaysRemaining = Math.ceil(estimatedStageDaysRemaining * 1.5);
  }
  estimatedStageDaysRemaining = Math.max(1, estimatedStageDaysRemaining); // At least 1 day

  // Project close date if we have more stages
  const currentStageIndex = STAGE_ORDER.indexOf((deal.stage || 'demo') as typeof STAGE_ORDER[number]);
  let projectedCloseDays: number | undefined;

  if (currentStageIndex >= 0 && currentStageIndex < STAGE_ORDER.length - 1) {
    // Sum remaining stages
    let remainingDays = estimatedStageDaysRemaining;
    for (let i = currentStageIndex + 1; i < STAGE_ORDER.length; i++) {
      const stage = STAGE_ORDER[i];
      const stageDays =
        historicalData?.[stage] || DEFAULT_HISTORICAL_DATA.stageDurations[stage] || [14];
      remainingDays += Math.round(stageDays.reduce((a, b) => a + b, 0) / stageDays.length);
    }
    projectedCloseDays = remainingDays;
  }

  return {
    currentStageName: deal.stage || 'unknown',
    currentStageDaysElapsed,
    expectedStageDays,
    daysAheadBehind,
    velocityTrend,
    estimatedStageDaysRemaining,
    projectedCloseDays,
  };
}

/**
 * Calculate activity trend analysis
 * Detects acceleration, deceleration, and stalling patterns
 */
export function calculateActivityTrend(activityLogs: ActivityData[]): ActivityTrend {
  const now = new Date();

  // Partition activities into time windows
  const last7Days = activityLogs.filter((log) => differenceInDays(now, log.createdAt) <= 7);
  const last30Days = activityLogs.filter((log) => differenceInDays(now, log.createdAt) <= 30);

  const last7DaysAverage = last7Days.length > 0 ? last7Days.length / 7 : 0;
  const last30DaysAverage = last30Days.length > 0 ? last30Days.length / 30 : 0;

  // Determine trend direction
  const trendDirection: 'up' | 'flat' | 'down' =
    last7DaysAverage > last30DaysAverage * 1.2
      ? 'up'
      : last7DaysAverage < last30DaysAverage * 0.8
        ? 'down'
        : 'flat';

  // Determine acceleration trend (comparing first half of 30d to second half)
  const midpoint = Math.ceil(last30Days.length / 2);
  const firstHalf = last30Days.slice(0, midpoint);
  const secondHalf = last30Days.slice(midpoint);
  const accelerationTrend: 'accelerating' | 'stable' | 'decelerating' =
    secondHalf.length > firstHalf.length * 1.2
      ? 'accelerating'
      : secondHalf.length < firstHalf.length * 0.8
        ? 'decelerating'
        : 'stable';

  // Days without activity
  const daysWithoutActivity =
    activityLogs.length === 0
      ? differenceInDays(now, new Date(0)) // Very large number
      : differenceInDays(now, activityLogs[activityLogs.length - 1].createdAt);

  // Confidence score: higher with more data points
  const confidenceScore = Math.min(100, last30Days.length * 10); // 100 with 10+ activities

  return {
    last7Days: last7Days.length,
    last30Days: last30Days.length,
    last7DaysAverage,
    last30DaysAverage,
    trendDirection,
    accelerationTrend,
    daysWithoutActivity,
    confidenceScore,
  };
}

/**
 * Calculate historical comparison metrics
 * Compares this deal to similar deals in history
 */
export function calculateHistoricalComparison(
  deal: DealAnalysisInput,
  historicalData?: {
    stageDurations: Record<string, number[]>;
    dealCloseTimes: number[];
    similarDealCount: number;
    similarDealWinRate: number;
  }
): HistoricalComparison {
  const history = historicalData || DEFAULT_HISTORICAL_DATA;

  // Get average stage duration
  const stage = (deal.stage || 'demo') as keyof typeof DEFAULT_HISTORICAL_DATA.stageDurations;
  const stageDurationArray = history.stageDurations[stage] || [14];
  const dealTypeAvgStageDuration = Math.round(
    stageDurationArray.reduce((a, b) => a + b, 0) / stageDurationArray.length
  );

  // Get average close time
  const dealTypeAvgCloseTime = Math.round(
    history.dealCloseTimes.reduce((a, b) => a + b, 0) / history.dealCloseTimes.length
  );

  // Calculate percentile scores (simplified: compare current to average)
  const currentStageDaysElapsed = differenceInDays(new Date(), deal.createdAt);
  const percentileHealthScore = Math.max(
    0,
    Math.min(100, 100 - (currentStageDaysElapsed / dealTypeAvgStageDuration) * 50)
  );

  // Velocity percentile (activity per day vs average)
  const activityTrend = calculateActivityTrend(deal.activityLogs);
  const avgActivityPerDay = 1; // baseline
  const percentileVelocity = Math.min(100, (activityTrend.last7DaysAverage / avgActivityPerDay) * 50);

  return {
    dealTypeAvgStageDuration,
    dealTypeAvgCloseTime,
    percentileHealthScore,
    percentileVelocity,
    comparableDealsCount: history.similarDealCount || 10,
    winRateSimilarDeals: history.similarDealWinRate || 0.65,
  };
}

/**
 * Normalize feature vectors for ML model input
 * Converts raw scores to normalized scales suitable for machine learning
 */
export function normalizeScoresForML(
  deals: DealAnalysisInput[]
): Array<DealAnalysisInput & { normalizedScores: any }> {
  // Calculate percentiles and z-scores across the portfolio
  const healthScores = deals.map((d) => {
    const activityTrend = calculateActivityTrend(d.activityLogs);
    return 100 - Math.min(100, differenceInDays(new Date(), d.lastActivityAt || d.createdAt) * 5);
  });

  const meanHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
  const stdDevHealth = Math.sqrt(
    healthScores.reduce((sum, score) => sum + Math.pow(score - meanHealth, 2), 0) / healthScores.length
  );

  return deals.map((deal, index) => ({
    ...deal,
    normalizedScores: {
      healthZScore: (healthScores[index] - meanHealth) / (stdDevHealth || 1),
      healthPercentile: (healthScores.filter((h) => h <= healthScores[index]).length / healthScores.length) * 100,
    },
  }));
}

/**
 * Prepare intelligence data for ML model training
 * Phase 2 will persist this via DealIntelligenceSnapshot table
 * For now, this generates the data structure
 */
export function prepareIntelligenceSnapshotForML(
  deal: DealAnalysisInput,
  intelligence: EnhancedDealIntelligence
): {
  timestamp: Date;
  dealId: number;
  features: Record<string, number>;
  outcome?: 'won' | 'lost' | 'stalled'; // Ground truth (set after deal closes)
} {
  return {
    timestamp: new Date(),
    dealId: deal.id,
    features: intelligence.mlFeatureVector || {},
    // outcome will be set in Phase 2 when DealIntelligenceSnapshot is persisted
  };
}

/**
 * Main enhanced deal analysis function
 * Returns comprehensive multi-factor intelligence for a deal
 * Builds on existing analyzeDeal logic while adding new signals
 */
export function analyzeEnhancedDeal(
  deal: DealAnalysisInput,
  additionalContext?: {
    historicalData?: Record<string, number[]>;
    upcomingCalls?: number;
    completedMilestones?: number;
    totalMilestones?: number;
  }
): EnhancedDealIntelligence {
  const now = new Date();

  // Calculate signals
  const contactEngagement = calculateContactEngagementSignals(
    deal.contacts,
    deal.activityLogs,
    deal.calendarEvents
  );

  const milestoneVelocity = calculateMilestoneVelocity(deal, additionalContext?.historicalData);
  const activityTrend = calculateActivityTrend(deal.activityLogs);
  const historicalComparison = calculateHistoricalComparison(deal, deal.historicalData);

  // Calculate base health and risk scores
  let healthScore = 100;
  let riskScore = 0;
  const riskFactors: RiskScoreFactor[] = [];

  // Health factor: Days since last activity (0-30 penalty)
  const daysSinceActivity = deal.lastActivityAt
    ? differenceInDays(now, deal.lastActivityAt)
    : differenceInDays(now, deal.createdAt);

  if (daysSinceActivity > 14) {
    const penalty = Math.min(30, daysSinceActivity * 2);
    healthScore -= penalty;
    riskScore += penalty;
    riskFactors.push({
      factor: 'no_activity_days',
      weight: 0.25,
      value: penalty,
      description: `No activity for ${daysSinceActivity} days`,
    });
  }

  // Health factor: Contact engagement
  const silentContacts = contactEngagement.filter((c) => c.engagementLevel === 'silent');
  if (silentContacts.length > 0) {
    const penalty = Math.min(25, silentContacts.length * 10);
    healthScore -= penalty;
    riskScore += penalty;
    riskFactors.push({
      factor: 'silent_stakeholders',
      weight: 0.2,
      value: penalty,
      description: `${silentContacts.length} stakeholder(s) not recently engaged`,
    });
  }

  // Health factor: Milestone/stage velocity
  if (milestoneVelocity.daysAheadBehind > 7) {
    const penalty = Math.min(20, milestoneVelocity.daysAheadBehind);
    healthScore -= penalty;
    riskScore += penalty;
    riskFactors.push({
      factor: 'stage_delay',
      weight: 0.15,
      value: penalty,
      description: `${milestoneVelocity.daysAheadBehind} days behind expected stage duration`,
    });
  }

  // Health factor: Contact count
  if (deal.contacts.length === 0) {
    const penalty = 30;
    healthScore -= penalty;
    riskScore += penalty;
    riskFactors.push({
      factor: 'no_contacts',
      weight: 0.2,
      value: penalty,
      description: 'No stakeholders identified',
    });
  }

  // Health bonuses
  if (contactEngagement.filter((c) => c.engagementLevel === 'engaged').length >= 2) {
    healthScore += 10;
  }

  if (additionalContext?.upcomingCalls && additionalContext.upcomingCalls > 0) {
    healthScore += 5;
  }

  // Milestone progress bonus
  if (
    additionalContext?.completedMilestones &&
    additionalContext?.totalMilestones &&
    additionalContext.completedMilestones > 0
  ) {
    const milestoneCompletion = (additionalContext.completedMilestones / additionalContext.totalMilestones) * 20;
    healthScore += milestoneCompletion;
  }

  // Cap scores
  healthScore = Math.max(0, Math.min(100, healthScore));
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Determine risk level
  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    riskScore >= 80
      ? 'critical'
      : riskScore >= 60
        ? 'high'
        : riskScore >= 40
          ? 'medium'
          : 'low';

  // Determine momentum
  const momentum: 'positive' | 'neutral' | 'negative' =
    healthScore >= 75 && activityTrend.trendDirection === 'up'
      ? 'positive'
      : healthScore < 50 || activityTrend.trendDirection === 'down'
        ? 'negative'
        : 'neutral';

  // Generate reasoning
  const momentumReasoning =
    momentum === 'positive'
      ? `Deal is accelerating with ${activityTrend.last7Days} activities in last week`
      : momentum === 'negative'
        ? `Deal momentum is declining (${activityTrend.daysWithoutActivity} days without activity)`
        : `Deal velocity is stable at ${activityTrend.last7DaysAverage.toFixed(1)} activities/day`;

  const keyInsights: string[] = [];
  if (silentContacts.length > 0) {
    keyInsights.push(`⚠️ ${silentContacts.length} stakeholder(s) have gone silent`);
  }
  if (milestoneVelocity.daysAheadBehind > 7) {
    keyInsights.push(`📅 Deal is ${milestoneVelocity.daysAheadBehind} days behind expected timeline`);
  }
  if (contactEngagement.length === 0) {
    keyInsights.push(`👥 No contacts added yet - add key stakeholders`);
  }
  if (activityTrend.last7Days === 0) {
    keyInsights.push(`🔇 No activity in 7 days - time for re-engagement`);
  }

  const concerns =
    riskFactors.length > 0
      ? riskFactors.map((f) => f.description)
      : healthScore < 50
        ? [`Deal health is critically low (${healthScore}/100)`]
        : [];

  const opportunities = [];
  if (contactEngagement.filter((c) => c.engagementLevel === 'moderate').length > 0) {
    opportunities.push('Focus on moderate-engagement contacts to move them to engaged');
  }
  if (additionalContext?.upcomingCalls === 0 && deal.contacts.length > 0) {
    opportunities.push('Schedule next calls with key stakeholders');
  }

  // Build ML feature vector
  const engagedContactsRatio = contactEngagement.filter((c) => c.engagementLevel === 'engaged').length / Math.max(1, contactEngagement.length);

  const mlFeatureVector = {
    healthPercentile: historicalComparison.percentileHealthScore,
    riskScore,
    momentumEncoded: momentum === 'positive' ? 1 : momentum === 'negative' ? -1 : 0,
    contactEngagementRatio: engagedContactsRatio,
    activityZScore: ((activityTrend.last7DaysAverage - 1) / Math.max(0.5, 1)), // Normalized
    stageDurationRatio: milestoneVelocity.currentStageDaysElapsed / Math.max(1, milestoneVelocity.expectedStageDays),
    daysStalled: activityTrend.daysWithoutActivity,
    recentActivityFlag: activityTrend.last7Days > 0 ? 1 : 0,
    upcomingEventsCount: additionalContext?.upcomingCalls || 0,
    milestoneCompletionRatio: (additionalContext?.completedMilestones || 0) / Math.max(1, additionalContext?.totalMilestones || 1),
  };

  return {
    healthScore,
    riskScore,
    riskLevel,
    momentum,
    signals: {
      contactEngagement,
      milestoneVelocity,
      activityTrend,
    },
    historicalComparison,
    reasoning: {
      riskScoreBreakdown: riskFactors,
      momentumReasoning,
      keyInsights,
      concernsAndOpportunities: {
        concerns,
        opportunities,
      },
    },
    mlFeatureVector,
  };
}

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
