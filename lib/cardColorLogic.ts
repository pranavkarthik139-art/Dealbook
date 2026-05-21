/**
 * Card Color Logic - Determine back-side card color based on metrics
 */

interface StallInfo {
  isStalled: boolean;
  daysStalled: number;
  risk: 'ok' | 'warning' | 'critical';
  reason: string;
}

type ColorMetric = 'stall_severity' | 'deal_health' | 'critical_data';

interface CriticalDataCheck {
  missingEmail: boolean;
  missingAmount: boolean;
  missingStage: boolean;
  missingContacts: boolean;
}

/**
 * Get color based on stall severity
 */
export function getColorByStallSeverity(stall?: StallInfo): string {
  if (!stall) return 'var(--cobalt)';

  switch (stall.risk) {
    case 'critical':
      return 'var(--error)'; // Red
    case 'warning':
      return 'var(--warning)'; // Yellow/Amber
    case 'ok':
    default:
      return 'var(--success)'; // Green
  }
}

/**
 * Get color based on deal health score
 */
export function getColorByHealthScore(healthScore?: number): string {
  const score = healthScore || 50;

  if (score >= 80) {
    return 'var(--success)'; // Green
  } else if (score >= 50) {
    return 'var(--warning)'; // Yellow/Amber
  } else {
    return 'var(--error)'; // Red
  }
}

/**
 * Check for critical missing data
 */
export function checkCriticalDataMissing(data: {
  email?: string;
  amount?: number | string;
  stage?: string;
  contactCount?: number;
}): CriticalDataCheck {
  return {
    missingEmail: !data.email,
    missingAmount: !data.amount,
    missingStage: !data.stage,
    missingContacts: (data.contactCount || 0) === 0,
  };
}

/**
 * Get color based on critical data missing
 */
export function getColorByCriticalData(data: {
  email?: string;
  amount?: number | string;
  stage?: string;
  contactCount?: number;
}): string {
  const critical = checkCriticalDataMissing(data);
  const missingCount = Object.values(critical).filter(Boolean).length;

  if (missingCount >= 3) {
    return 'var(--error)'; // Red - Critical data missing
  } else if (missingCount >= 1) {
    return 'var(--warning)'; // Yellow - Some data missing
  } else {
    return 'var(--success)'; // Green - All data present
  }
}

/**
 * Main function: Get back-side color based on user preference
 */
export function getBackSideColor(
  metric: ColorMetric,
  stall?: StallInfo,
  healthScore?: number,
  data?: {
    email?: string;
    amount?: number | string;
    stage?: string;
    contactCount?: number;
  }
): string {
  switch (metric) {
    case 'stall_severity':
      return getColorByStallSeverity(stall);
    case 'deal_health':
      return getColorByHealthScore(healthScore);
    case 'critical_data':
      return getColorByCriticalData(data || {});
    default:
      return 'var(--cobalt)';
  }
}

/**
 * Get readable description of why a color was chosen
 */
export function getColorReason(
  metric: ColorMetric,
  stall?: StallInfo,
  healthScore?: number,
  data?: {
    email?: string;
    amount?: number | string;
    stage?: string;
    contactCount?: number;
  }
): string {
  switch (metric) {
    case 'stall_severity':
      if (!stall) return 'No stall data';
      return `Stall severity: ${stall.risk}`;
    case 'deal_health':
      return `Health score: ${healthScore || 50}/100`;
    case 'critical_data':
      const critical = checkCriticalDataMissing(data || {});
      const missing = Object.entries(critical)
        .filter(([_, v]) => v)
        .map(([k]) => k.replace('missing', ''))
        .join(', ');
      return missing ? `Missing: ${missing}` : 'All data complete';
    default:
      return 'Unknown metric';
  }
}
