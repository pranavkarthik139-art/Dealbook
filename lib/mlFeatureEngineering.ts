import { prisma } from './db';
import { analyzeEnhancedDeal, DealAnalysisInput } from './dealIntelligence';
import { differenceInDays } from 'date-fns';

/**
 * ML Feature Engineering Module
 *
 * This module prepares deal intelligence data for machine learning model training.
 * It handles:
 * 1. Feature normalization (percentiles, z-scores, time ratios)
 * 2. Feature vector creation for model input
 * 3. Persistent intelligence snapshots with ground truth outcomes
 * 4. Model readiness calculation
 *
 * These functions work together to build a supervised learning dataset for
 * future win/loss prediction models (Option C).
 */

/**
 * Normalized Feature Vector - Ready for ML model input
 * All values are normalized to 0-1 range or standardized for model training
 */
export interface NormalizedFeatureVector {
  // Normalized scores (0-1)
  healthPercentile: number; // 0-100 percentile ranking
  riskScoreNormalized: number; // 0-1
  momentumEncoded: number; // -1 (negative), 0 (neutral), 1 (positive)

  // Contact engagement (0-1)
  contactEngagementRatio: number; // engaged_count / total_contacts
  silentContactsRatio: number; // silent_count / total_contacts
  moderateContactsRatio: number; // moderate_count / total_contacts

  // Activity signals (z-score normalized)
  activityZScore: number; // Standard deviations from mean
  activityTrendEncoded: number; // -1 (down), 0 (flat), 1 (up)
  accelerationTrendEncoded: number; // -1 (decelerating), 0 (stable), 1 (accelerating)

  // Stage & velocity metrics (normalized ratios)
  stageDurationRatio: number; // current_days / expected_days
  daysAheadBehindNormalized: number; // normalized to -1 to 1 range
  velocityTrendEncoded: number; // -1 (slow), 0 (normal), 1 (fast)

  // Time-based features
  daysStalled: number; // days without activity
  daysSinceCreation: number; // days since deal created
  daysInCurrentStage: number; // days in current stage

  // Categorical & boolean features
  recentActivityFlag: number; // 1 if activity in last 7 days, 0 otherwise
  upcomingEventsCount: number; // number of upcoming calls
  milestoneCompletionRatio: number; // completed / total milestones

  // Health & confidence
  confidenceScore: number; // 0-100: how confident is this prediction?
  dataQualityScore: number; // 0-100: how complete is the data?
}

/**
 * Intelligence Snapshot for ML Training
 * Stores intelligence state at a point in time with the ground truth outcome
 */
export interface IntelligenceSnapshot {
  dealId: number;
  snapshotDate: Date;
  features: NormalizedFeatureVector;
  // Ground truth labels (set when deal closes)
  outcome?: 'won' | 'lost' | 'stalled' | null;
  daysToOutcome?: number; // days from snapshot to outcome
  finalStage?: string; // stage deal closed in
}

/**
 * Model readiness report
 * Indicates whether we have sufficient data to train a model
 */
export interface ModelReadinessReport {
  isReady: boolean;
  totalSnapshots: number;
  snapshotsWithOutcome: number;
  requiredForTraining: number;
  percentageComplete: number;
  estimatedReadyDate: Date;
  dealTypesRepresented: Record<string, number>;
  outcomeDistribution: Record<string, number>;
}

/**
 * Normalize a single deal's intelligence into ML feature vector
 * All features are normalized to ranges suitable for model training
 */
export function normalizeIntelligenceFeatures(
  dealAnalysisInput: DealAnalysisInput,
  intelligence: any,
  portfolioStats?: {
    meanHealth: number;
    stdDevHealth: number;
    meanActivity: number;
    stdDevActivity: number;
    avgStageDuration: number;
    similarDealsCount: number;
  }
): NormalizedFeatureVector {
  const stats = portfolioStats || {
    meanHealth: 60,
    stdDevHealth: 20,
    meanActivity: 2,
    stdDevActivity: 1.5,
    avgStageDuration: 21,
    similarDealsCount: 20,
  };

  // Contact engagement ratios
  const contacts = dealAnalysisInput.contacts || [];
  const engagedCount =
    intelligence.signals.contactEngagement.filter(
      (c: any) => c.engagementLevel === 'engaged'
    ).length || 0;
  const silentCount =
    intelligence.signals.contactEngagement.filter(
      (c: any) => c.engagementLevel === 'silent'
    ).length || 0;
  const moderateCount = Math.max(0, contacts.length - engagedCount - silentCount);

  const contactEngagementRatio =
    contacts.length > 0 ? engagedCount / contacts.length : 0;
  const silentContactsRatio = contacts.length > 0 ? silentCount / contacts.length : 0;
  const moderateContactsRatio =
    contacts.length > 0 ? moderateCount / contacts.length : 0;

  // Activity z-score
  const activityTrend = intelligence.signals.activityTrend;
  const activityZScore =
    stats.stdDevActivity > 0
      ? (activityTrend.last7DaysAverage - stats.meanActivity) / stats.stdDevActivity
      : 0;

  // Activity trend encoding
  const activityTrendEncoded =
    activityTrend.trendDirection === 'up'
      ? 1
      : activityTrend.trendDirection === 'down'
        ? -1
        : 0;

  const accelerationTrendEncoded =
    activityTrend.accelerationTrend === 'accelerating'
      ? 1
      : activityTrend.accelerationTrend === 'decelerating'
        ? -1
        : 0;

  // Stage metrics
  const stageDurationRatio =
    intelligence.signals.milestoneVelocity.expectedStageDays > 0
      ? intelligence.signals.milestoneVelocity.currentStageDaysElapsed /
        intelligence.signals.milestoneVelocity.expectedStageDays
      : 1;

  const daysAheadBehind = intelligence.signals.milestoneVelocity.daysAheadBehind;
  const maxDaysDeviation = 30; // normalize to -1 to 1 for +/- 30 days
  const daysAheadBehindNormalized = Math.max(-1, Math.min(1, daysAheadBehind / maxDaysDeviation));

  const velocityTrendEncoded =
    intelligence.signals.milestoneVelocity.velocityTrend === 'accelerating'
      ? 1
      : intelligence.signals.milestoneVelocity.velocityTrend === 'decelerating'
        ? -1
        : 0;

  // Time features
  const daysStalled = activityTrend.daysWithoutActivity;
  const daysSinceCreation = differenceInDays(new Date(), dealAnalysisInput.createdAt);
  const daysInCurrentStage = intelligence.signals.milestoneVelocity.currentStageDaysElapsed;

  // Activity flag
  const recentActivityFlag = activityTrend.last7Days > 0 ? 1 : 0;

  // Upcoming events
  const upcomingEventsCount = dealAnalysisInput.calendarEvents?.length || 0;

  // Milestone completion
  const completedMilestones = dealAnalysisInput.todos?.filter((t) => t.completed).length || 0;
  const totalMilestones = dealAnalysisInput.todos?.length || 1;
  const milestoneCompletionRatio = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;

  // Confidence and data quality scores
  const dataPoints = contacts.length + activityTrend.last30Days + upcomingEventsCount + totalMilestones;
  const dataQualityScore = Math.min(100, (dataPoints / 20) * 100); // 20 data points = 100% quality

  const confidenceScore = Math.min(
    100,
    activityTrend.confidenceScore + (contacts.length > 0 ? 20 : 0) + (upcomingEventsCount > 0 ? 10 : 0)
  );

  return {
    healthPercentile: intelligence.historicalComparison.percentileHealthScore,
    riskScoreNormalized: intelligence.riskScore / 100,
    momentumEncoded:
      intelligence.momentum === 'positive'
        ? 1
        : intelligence.momentum === 'negative'
          ? -1
          : 0,

    contactEngagementRatio,
    silentContactsRatio,
    moderateContactsRatio,

    activityZScore,
    activityTrendEncoded,
    accelerationTrendEncoded,

    stageDurationRatio,
    daysAheadBehindNormalized,
    velocityTrendEncoded,

    daysStalled,
    daysSinceCreation,
    daysInCurrentStage,

    recentActivityFlag,
    upcomingEventsCount,
    milestoneCompletionRatio,

    confidenceScore,
    dataQualityScore,
  };
}

/**
 * Create and persist an intelligence snapshot for ML training dataset
 * Called regularly (e.g., monthly) to build up training data
 */
export async function persistIntelligenceSnapshot(
  dealId: number,
  intelligence: any,
  features: NormalizedFeatureVector,
  dealType?: string
): Promise<void> {
  try {
    await prisma.dealIntelligenceSnapshot.create({
      data: {
        userId: 1, // Hardcoded for now
        dealId,

        // Core intelligence metrics
        healthScore: intelligence.healthScore,
        riskScore: intelligence.riskScore,
        riskLevel: intelligence.riskLevel,
        momentum: intelligence.momentum,

        // Activity metrics
        contactEngagementCount: intelligence.signals.contactEngagement.filter(
          (c: any) => c.engagementLevel === 'engaged'
        ).length,
        engagedContactsRatio: features.contactEngagementRatio * 100,
        averageActivityFrequency: intelligence.signals.activityTrend.last7DaysAverage,
        activityTrend: intelligence.signals.activityTrend.trendDirection,
        daysWithoutActivity: intelligence.signals.activityTrend.daysWithoutActivity,

        // Stage metrics
        stageName: intelligence.signals.milestoneVelocity.currentStageName,
        stageDaysElapsed: intelligence.signals.milestoneVelocity.currentStageDaysElapsed,
        daysAheadBehind: intelligence.signals.milestoneVelocity.daysAheadBehind,

        // ML feature vector
        mlFeatures: features as any, // Store normalized features for model

        snapshotDate: new Date(),
      },
    });
  } catch (error) {
    console.error('Error persisting intelligence snapshot:', error);
    // Don't throw - snapshots are nice-to-have, not critical
  }
}

/**
 * Check model readiness based on snapshot data collected
 * Returns whether we have enough data to train a predictive model
 */
export async function checkModelReadiness(): Promise<ModelReadinessReport> {
  try {
    const totalSnapshots = await prisma.dealIntelligenceSnapshot.count();
    const snapshotsWithOutcome = await prisma.dealIntelligenceSnapshot.count({
      where: { dealStatus: { not: null } },
    });

    // Require minimum snapshots before training
    const requiredForTraining = 100; // At least 100 snapshots
    const percentageComplete = (snapshotsWithOutcome / requiredForTraining) * 100;

    // Get outcome distribution
    const outcomes = await prisma.dealIntelligenceSnapshot.groupBy({
      by: ['dealStatus'],
      _count: true,
    });

    const outcomeDistribution: Record<string, number> = {};
    outcomes.forEach((outcome) => {
      if (outcome.dealStatus) {
        outcomeDistribution[outcome.dealStatus] = outcome._count;
      }
    });

    // Get deal types represented
    const deals = await prisma.deal.findMany({
      select: { stage: true },
      distinct: ['stage'],
    });

    const dealTypesRepresented: Record<string, number> = {};
    deals.forEach((deal) => {
      dealTypesRepresented[deal.stage || 'unknown'] = 1;
    });

    // Estimate ready date (assuming ~3 snapshots per day across all deals)
    const daysUntilReady = Math.max(0, Math.ceil((requiredForTraining - totalSnapshots) / 3));
    const estimatedReadyDate = new Date();
    estimatedReadyDate.setDate(estimatedReadyDate.getDate() + daysUntilReady);

    return {
      isReady: snapshotsWithOutcome >= requiredForTraining,
      totalSnapshots,
      snapshotsWithOutcome,
      requiredForTraining,
      percentageComplete: Math.min(100, percentageComplete),
      estimatedReadyDate,
      dealTypesRepresented,
      outcomeDistribution,
    };
  } catch (error) {
    console.error('Error checking model readiness:', error);
    return {
      isReady: false,
      totalSnapshots: 0,
      snapshotsWithOutcome: 0,
      requiredForTraining: 100,
      percentageComplete: 0,
      estimatedReadyDate: new Date(),
      dealTypesRepresented: {},
      outcomeDistribution: {},
    };
  }
}

/**
 * Get feature statistics for portfolio (used for normalization)
 */
export async function getPortfolioFeatureStats(): Promise<{
  meanHealth: number;
  stdDevHealth: number;
  meanActivity: number;
  stdDevActivity: number;
  avgStageDuration: number;
  similarDealsCount: number;
}> {
  try {
    // Fetch recent snapshots to calculate statistics
    const snapshots = await prisma.dealIntelligenceSnapshot.findMany({
      where: {
        snapshotDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
    });

    if (snapshots.length === 0) {
      return {
        meanHealth: 60,
        stdDevHealth: 20,
        meanActivity: 2,
        stdDevActivity: 1.5,
        avgStageDuration: 21,
        similarDealsCount: 20,
      };
    }

    const healthScores = snapshots.map((s) => s.healthScore || 60);
    const activities = snapshots.map((s) => Number(s.averageActivityFrequency || 2));
    const stageDurations = snapshots.map((s) => Number(s.stageDaysElapsed || 21));

    const meanHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    const stdDevHealth = Math.sqrt(
      healthScores.reduce((sum, score) => sum + Math.pow(score - meanHealth, 2), 0) /
        healthScores.length
    );

    const meanActivity = activities.reduce((a, b) => a + b, 0) / activities.length;
    const stdDevActivity = Math.sqrt(
      activities.reduce((sum, act) => sum + Math.pow(act - meanActivity, 2), 0) / activities.length
    );

    const avgStageDuration = stageDurations.reduce((a, b) => a + b, 0) / stageDurations.length;

    return {
      meanHealth,
      stdDevHealth,
      meanActivity,
      stdDevActivity,
      avgStageDuration,
      similarDealsCount: snapshots.length,
    };
  } catch (error) {
    console.error('Error getting portfolio stats:', error);
    return {
      meanHealth: 60,
      stdDevHealth: 20,
      meanActivity: 2,
      stdDevActivity: 1.5,
      avgStageDuration: 21,
      similarDealsCount: 20,
    };
  }
}
