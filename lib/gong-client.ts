/**
 * Efficient Gong API Client with Caching & Cost Optimization
 *
 * Key strategies:
 * 1. Cache all API responses for 24-48 hours
 * 2. Batch fetch multiple records
 * 3. Track API usage to avoid overages
 * 4. Lazy load detailed data (transcript, full insights)
 */

interface GongCallSummary {
  id: string;
  title: string;
  participants: string[];
  duration: number; // minutes
  startTime: Date;
  sentiment?: number; // 0-100
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface GongCallFull extends GongCallSummary {
  transcript: string;
  insights: {
    summary: string;
    keyTopics: string[];
    riskFlags: string[];
    nextSteps: string[];
  };
}

interface CacheEntry<T> {
  data: T;
  expiresAt: Date;
  quality: 'summary' | 'full'; // What level of detail was cached
}

class GongClient {
  private accessToken: string;
  private baseURL = 'https://api.gong.io/v2';

  // In-memory cache (consider Redis for production)
  private cache = new Map<string, CacheEntry<any>>();

  // API usage tracking
  private usageStats = {
    totalCalls: 0,
    dailyCallCount: 0,
    callsByEndpoint: new Map<string, number>(),
    lastReset: new Date(),
  };

  constructor(accessToken: string) {
    this.accessToken = accessToken;

    // Reset daily count at midnight
    this.resetDailyCount();
  }

  private resetDailyCount() {
    setInterval(() => {
      this.usageStats.dailyCallCount = 0;
      this.usageStats.lastReset = new Date();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Strategy: CACHING
   * Check cache first before making API calls
   */
  private getCached<T>(key: string, quality: 'summary' | 'full' = 'summary'): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Cache expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // If we need 'full' but only have 'summary', still miss the cache
    if (quality === 'full' && entry.quality === 'summary') {
      return null;
    }

    return entry.data as T;
  }

  private setCached<T>(key: string, data: T, quality: 'summary' | 'full' = 'summary', ttlHours = 24) {
    this.cache.set(key, {
      data,
      expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000),
      quality,
    });
  }

  /**
   * Track API usage for cost monitoring
   */
  private logAPICall(endpoint: string) {
    this.usageStats.totalCalls++;
    this.usageStats.dailyCallCount++;
    this.usageStats.callsByEndpoint.set(
      endpoint,
      (this.usageStats.callsByEndpoint.get(endpoint) || 0) + 1
    );

    // Alert if approaching daily limit (10k per day on standard plan)
    if (this.usageStats.dailyCallCount > 8000) {
      console.warn(
        `⚠️ GONG API WARNING: ${this.usageStats.dailyCallCount} calls made today. Approaching 10k limit!`
      );
    }

    // Log for monitoring dashboard
    console.log(
      `[GONG API] ${endpoint} - Daily: ${this.usageStats.dailyCallCount}, Total: ${this.usageStats.totalCalls}`
    );
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    this.logAPICall(endpoint);

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params && method === 'GET') {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(params) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Gong API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get call details - WITH CACHING
   * Returns summary by default (lightweight)
   * Only fetches full data if explicitly requested
   */
  async getCall(callId: string, options?: { includeTranscript?: boolean }): Promise<GongCallSummary | GongCallFull> {
    const quality = options?.includeTranscript ? 'full' : 'summary';
    const cacheKey = `call:${callId}:${quality}`;

    // Check cache first - SAVES API CALL
    const cached = this.getCached<GongCallSummary | GongCallFull>(cacheKey, quality);
    if (cached) {
      console.log(`✅ Cache HIT: ${callId}`);
      return cached;
    }

    console.log(`📡 Cache MISS: ${callId} - Fetching from Gong API`);

    // Fetch from API if not cached
    const response = await this.request<any>('/calls', {
      callId,
      includeTranscript: options?.includeTranscript || false,
    });

    const call: GongCallSummary | GongCallFull = {
      id: response.call.id,
      title: response.call.name,
      participants: response.call.participants.map((p: any) => p.email),
      duration: response.call.duration,
      startTime: new Date(response.call.startTime),
      sentiment: response.call.sentiment?.value,
      riskLevel: response.call.riskLevel,
      ...(options?.includeTranscript && {
        transcript: response.call.transcript,
        insights: {
          summary: response.call.insights?.summary,
          keyTopics: response.call.insights?.topics || [],
          riskFlags: response.call.insights?.risks || [],
          nextSteps: response.call.insights?.nextSteps || [],
        },
      }),
    };

    // Cache for 24 hours
    this.setCached(cacheKey, call, quality, 24);

    return call;
  }

  /**
   * Get multiple calls at once - BATCH STRATEGY
   * Reduces API calls from N to 1
   */
  async getCalls(
    callIds: string[],
    options?: { includeTranscript?: boolean }
  ): Promise<(GongCallSummary | GongCallFull)[]> {
    // Separate into cached vs. uncached
    const cached: Map<string, GongCallSummary | GongCallFull> = new Map();
    const uncached: string[] = [];

    const quality = options?.includeTranscript ? 'full' : 'summary';

    for (const callId of callIds) {
      const cacheKey = `call:${callId}:${quality}`;
      const cachedCall = this.getCached<GongCallSummary | GongCallFull>(cacheKey, quality);

      if (cachedCall) {
        cached.set(callId, cachedCall);
      } else {
        uncached.push(callId);
      }
    }

    console.log(`📊 Batch fetch: ${cached.size}/${callIds.length} cached, ${uncached.length} need API call`);

    // Fetch uncached calls in one batch - SAVES API CALLS
    let fetched: Map<string, GongCallSummary | GongCallFull> = new Map();

    if (uncached.length > 0) {
      const response = await this.request<any>('/calls/batch', {
        callIds: uncached,
        includeTranscript: options?.includeTranscript || false,
      });

      // Process batch response
      for (const call of response.calls) {
        const processed: GongCallSummary | GongCallFull = {
          id: call.id,
          title: call.name,
          participants: call.participants.map((p: any) => p.email),
          duration: call.duration,
          startTime: new Date(call.startTime),
          sentiment: call.sentiment?.value,
          riskLevel: call.riskLevel,
          ...(options?.includeTranscript && {
            transcript: call.transcript,
            insights: {
              summary: call.insights?.summary,
              keyTopics: call.insights?.topics || [],
              riskFlags: call.insights?.risks || [],
              nextSteps: call.insights?.nextSteps || [],
            },
          }),
        };

        const cacheKey = `call:${call.id}:${quality}`;
        this.setCached(cacheKey, processed, quality, 24);
        fetched.set(call.id, processed);
      }
    }

    // Combine cached + fetched
    return callIds.map(id => cached.get(id) || fetched.get(id)!).filter(Boolean);
  }

  /**
   * Incremental sync - only fetch NEW/UPDATED calls
   * STRATEGY: Fetch only what's changed since last sync
   */
  async syncCallsSinceLastUpdate(lastSyncTime: Date): Promise<GongCallSummary[]> {
    console.log(`🔄 Incremental sync since ${lastSyncTime.toISOString()}`);

    const response = await this.request<any>('/calls', {
      filter: {
        updatedAfter: lastSyncTime.toISOString(),
      },
      limit: 100, // Paginate if needed
    });

    const calls: GongCallSummary[] = response.calls.map((call: any) => ({
      id: call.id,
      title: call.name,
      participants: call.participants.map((p: any) => p.email),
      duration: call.duration,
      startTime: new Date(call.startTime),
      sentiment: call.sentiment?.value,
      riskLevel: call.riskLevel,
    }));

    // Cache all results
    for (const call of calls) {
      this.setCached(`call:${call.id}:summary`, call, 'summary', 48);
    }

    console.log(`✅ Synced ${calls.length} updated calls`);
    return calls;
  }

  /**
   * Get API usage stats for monitoring dashboard
   */
  getUsageStats() {
    return {
      totalCalls: this.usageStats.totalCalls,
      dailyCallCount: this.usageStats.dailyCallCount,
      callsByEndpoint: Object.fromEntries(this.usageStats.callsByEndpoint),
      cacheSize: this.cache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      estimatedDailyCost: this.usageStats.dailyCallCount * 0.0001, // If charged per call
      limit: 10000,
      percentageOfLimit: (this.usageStats.dailyCallCount / 10000) * 100,
    };
  }

  private calculateCacheHitRate(): number {
    // Would need to track hits vs misses
    return 0; // Placeholder
  }

  /**
   * Clear old cache entries to save memory
   */
  clearExpiredCache() {
    const now = new Date();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    console.log(`🧹 Cleared ${cleared} expired cache entries`);
  }
}

export { GongClient, GongCallSummary, GongCallFull };
