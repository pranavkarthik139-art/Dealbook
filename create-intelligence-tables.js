// Create Phase 5 intelligence tables directly with SQL
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sqlStatements = [
  // DealIntelligenceSnapshot table
  `CREATE TABLE IF NOT EXISTS deal_intelligence_snapshots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

    -- Snapshot of intelligence at this point in time
    health_score INTEGER,
    risk_score INTEGER,
    risk_level VARCHAR(20),
    momentum VARCHAR(20),

    -- Activity & engagement metrics
    contact_engagement_count INTEGER,
    engaged_contacts_ratio DECIMAL(5, 2),
    average_activity_frequency DECIMAL(10, 4),
    activity_trend VARCHAR(20),
    days_without_activity INTEGER,

    -- Stage & milestone metrics
    stage_name VARCHAR(50),
    stage_days_elapsed INTEGER,
    days_ahead_behind INTEGER,

    -- Deal outcome (ground truth)
    deal_status VARCHAR(20),
    actual_close_date TIMESTAMP,
    days_to_close INTEGER,

    -- ML feature vector
    ml_features JSONB,

    snapshot_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create indexes for DealIntelligenceSnapshot
  `CREATE INDEX IF NOT EXISTS idx_deal_intelligence_snapshots_user_id ON deal_intelligence_snapshots(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deal_intelligence_snapshots_deal_id ON deal_intelligence_snapshots(deal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deal_intelligence_snapshots_snapshot_date ON deal_intelligence_snapshots(snapshot_date)`,

  // ContactEngagementLog table
  `CREATE TABLE IF NOT EXISTS contact_engagement_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

    -- Event tracking
    event_type VARCHAR(50),
    event_description TEXT,

    -- Response metrics
    response_time INTEGER,
    response_required BOOLEAN DEFAULT FALSE,
    responded BOOLEAN DEFAULT FALSE,

    -- Metadata
    metadata JSONB,

    event_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create indexes for ContactEngagementLog
  `CREATE INDEX IF NOT EXISTS idx_contact_engagement_logs_user_id ON contact_engagement_logs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_engagement_logs_contact_id ON contact_engagement_logs(contact_id)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_engagement_logs_deal_id ON contact_engagement_logs(deal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_engagement_logs_event_date ON contact_engagement_logs(event_date)`,
];

async function createTables() {
  console.log('Creating Phase 5 intelligence tables...\n');

  let created = 0;
  let errors = 0;

  for (const sql of sqlStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      if (sql.includes('CREATE TABLE')) {
        const tableName = sql.match(/CREATE TABLE[^(]*([a-z_]+)/i)[1];
        console.log(`✅ ${tableName}`);
        created++;
      } else if (sql.includes('CREATE INDEX')) {
        console.log(`✅ Index created`);
      }
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.error(`❌ Error:`, error.message.split('\n')[0]);
        errors++;
      } else {
        console.log(`ℹ️  Already exists`);
      }
    }
  }

  console.log(`\n${created} tables created, ${errors} errors\n`);
  console.log('✅ Phase 5 intelligence tables created successfully!');

  await prisma.$disconnect();
}

createTables();
