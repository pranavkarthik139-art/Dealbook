/**
 * Efficient Salesforce Write Client
 *
 * Key strategies:
 * 1. Batch writes (100 records per API call)
 * 2. Change detection (don't write if unchanged)
 * 3. Async/queued writes (don't block on Salesforce)
 * 4. Retry logic (auto-retry failed writes)
 * 5. External ID upsert (prevent duplicates)
 */

interface WriteJob {
  id: string;
  objectType: string; // 'Opportunity', 'Contact', 'Event', 'Task'
  recordId?: string; // Salesforce ID (for updates)
  externalId?: string; // External ID (for upserts)
  action: 'insert' | 'update' | 'upsert';
  fields: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
}

interface WriteResult {
  jobId: string;
  status: 'queued' | 'processing' | 'success' | 'failed';
  message: string;
  recordId?: string;
  error?: string;
}

class SalesforceClient {
  private accessToken: string;
  private instanceUrl: string;
  private writeQueue: Map<string, WriteJob> = new Map();
  private batchSize = 100;
  private processingInterval: NodeJS.Timeout | null = null;
  private usageStats = {
    totalWrites: 0,
    successfulWrites: 0,
    failedWrites: 0,
    apiCalls: 0,
  };

  constructor(accessToken: string, instanceUrl: string) {
    this.accessToken = accessToken;
    this.instanceUrl = instanceUrl;
    this.startQueueProcessor();
  }

  /**
   * Strategy: ASYNC QUEUE
   * Queue a write and return immediately (don't block)
   */
  async queueWrite(
    objectType: string,
    fields: Record<string, any>,
    options?: {
      recordId?: string;
      externalId?: string;
      action?: 'insert' | 'update' | 'upsert';
      priority?: 'high' | 'normal';
    }
  ): Promise<WriteResult> {
    const jobId = `${objectType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: WriteJob = {
      id: jobId,
      objectType,
      recordId: options?.recordId,
      externalId: options?.externalId,
      action: options?.action || (options?.recordId ? 'update' : 'insert'),
      fields,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      status: 'pending',
    };

    this.writeQueue.set(jobId, job);

    console.log(
      `📋 Queued ${objectType}: ${jobId} (queue size: ${this.writeQueue.size})`
    );

    // Process immediately if batch is full
    if (this.writeQueue.size >= this.batchSize) {
      setImmediate(() => this.processBatch());
    }

    return {
      jobId,
      status: 'queued',
      message: `Write queued for ${objectType}`,
    };
  }

  /**
   * Strategy: BATCH WRITES
   * Process accumulated writes in one API call
   */
  private async processBatch(): Promise<void> {
    if (this.writeQueue.size === 0) return;

    const batch = Array.from(this.writeQueue.entries())
      .slice(0, this.batchSize)
      .map(([_, job]) => {
        job.status = 'processing';
        return job;
      });

    console.log(`\n📤 Processing Salesforce batch: ${batch.length} records`);

    try {
      // Build composite request
      const batchRequests = batch.map((job) => {
        if (job.action === 'upsert' && job.externalId) {
          // Upsert via external ID
          return {
            method: 'PATCH',
            url: `/services/data/v57.0/sobjects/${job.objectType}/${job.externalId}__c/${job.externalId}`,
            richInput: job.fields,
          };
        } else if (job.action === 'update' && job.recordId) {
          // Update existing record
          return {
            method: 'PATCH',
            url: `/services/data/v57.0/sobjects/${job.objectType}/${job.recordId}`,
            richInput: job.fields,
          };
        } else {
          // Insert new record
          return {
            method: 'POST',
            url: `/services/data/v57.0/sobjects/${job.objectType}`,
            richInput: job.fields,
          };
        }
      });

      // Execute batch
      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/composite/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Sforce-Call-Options': `client=Dealbook/1.0`, // Custom header for tracking
        },
        body: JSON.stringify({
          batchRequests,
          haltOnError: false, // Continue even if some fail
        }),
      });

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status}`);
      }

      const results = await response.json();
      this.usageStats.apiCalls++;

      // Process results
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < batch.length; i++) {
        const job = batch[i];
        const result = results.results[i];

        // Remove from queue
        this.writeQueue.delete(job.id);

        // Check success (204 = No Content for updates, 201 = Created for inserts)
        if (result.statusCode === 204 || result.statusCode === 201) {
          job.status = 'success';
          successCount++;
          this.usageStats.successfulWrites++;

          console.log(`✅ ${job.objectType}: ${job.id}`);
        } else {
          // Retry logic
          if (job.retryCount < job.maxRetries) {
            job.retryCount++;
            job.status = 'pending';
            this.writeQueue.set(job.id, job);
            console.log(`🔄 Retry ${job.retryCount}/${job.maxRetries}: ${job.id}`);
          } else {
            job.status = 'failed';
            job.error = result.result?.message || 'Unknown error';
            failureCount++;
            this.usageStats.failedWrites++;

            console.log(`❌ Failed: ${job.id} - ${job.error}`);
          }
        }
      }

      console.log(`✅ Batch complete: ${successCount} success, ${failureCount} failed`);
    } catch (error) {
      console.error('❌ Batch processing failed:', error);

      // Re-queue failed jobs
      for (const [_, job] of Array.from(this.writeQueue.entries()).slice(0, this.batchSize)) {
        if (job.status === 'processing') {
          job.status = 'pending';
        }
      }
    }
  }

  /**
   * Strategy: CHANGE DETECTION
   * Only write if fields actually changed
   */
  async updateIfChanged(
    salesforceId: string,
    objectType: string,
    newFields: Record<string, any>
  ): Promise<boolean> {
    try {
      // Fetch current record
      const current = await this.getRecord(objectType, salesforceId);

      // Detect changes
      const changedFields: Record<string, any> = {};
      let hasChanges = false;

      for (const [key, value] of Object.entries(newFields)) {
        // Skip null/undefined values
        if (value === null || value === undefined) continue;

        // Compare (handle date strings)
        const currentValue = current[key];
        const isDifferent =
          JSON.stringify(currentValue) !== JSON.stringify(value);

        if (isDifferent) {
          changedFields[key] = value;
          hasChanges = true;
        }
      }

      if (!hasChanges) {
        console.log(`⏭️  No changes for ${salesforceId}, skipping write`);
        return false;
      }

      // Queue only changed fields
      await this.queueWrite(objectType, changedFields, {
        recordId: salesforceId,
        action: 'update',
      });

      return true;
    } catch (error) {
      console.error('Change detection failed:', error);
      // Fall back to writing all fields
      await this.queueWrite(objectType, newFields, {
        recordId: salesforceId,
        action: 'update',
      });
      return true;
    }
  }

  /**
   * Strategy: EXTERNAL ID UPSERT
   * Prevent duplicates with single API call
   */
  async upsertRecord(
    objectType: string,
    externalIdField: string,
    externalId: string,
    fields: Record<string, any>
  ): Promise<WriteResult> {
    return this.queueWrite(objectType, fields, {
      externalId,
      action: 'upsert',
    });
  }

  /**
   * Fetch current record values (for change detection)
   */
  private async getRecord(objectType: string, recordId: string): Promise<Record<string, any>> {
    try {
      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/${objectType}/${recordId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch record: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch record for change detection:', error);
      return {}; // Return empty, treat as all fields changed
    }
  }

  /**
   * Start background queue processor
   * Runs every 5 seconds if queue has items
   */
  private startQueueProcessor() {
    this.processingInterval = setInterval(async () => {
      if (this.writeQueue.size > 0) {
        await this.processBatch();
      }
    }, 5000);
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      queueSize: this.writeQueue.size,
      totalWrites: this.usageStats.totalWrites,
      successfulWrites: this.usageStats.successfulWrites,
      failedWrites: this.usageStats.failedWrites,
      apiCalls: this.usageStats.apiCalls,
      successRate:
        this.usageStats.totalWrites > 0
          ? (
              (this.usageStats.successfulWrites / this.usageStats.totalWrites) *
              100
            ).toFixed(2) + '%'
          : 'N/A',
    };
  }

  /**
   * Get pending jobs (for debugging)
   */
  getPendingJobs() {
    return Array.from(this.writeQueue.values()).map((job) => ({
      id: job.id,
      objectType: job.objectType,
      action: job.action,
      status: job.status,
      retryCount: job.retryCount,
    }));
  }

  /**
   * Flush queue (wait for all writes to complete)
   * Useful for tests or before shutdown
   */
  async flush(): Promise<void> {
    console.log('⏸️  Flushing Salesforce queue...');

    // Process any remaining jobs
    while (this.writeQueue.size > 0) {
      await this.processBatch();
      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('✅ Queue flushed');
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}

export { SalesforceClient, WriteJob, WriteResult };
