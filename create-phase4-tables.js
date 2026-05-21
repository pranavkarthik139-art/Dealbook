// Create Phase 4 tables directly with SQL
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sqlStatements = [
  // User table
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'presales_lead',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Deal Templates
  `CREATE TABLE IF NOT EXISTS deal_templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deal_type VARCHAR(100),
    default_stage VARCHAR(50) DEFAULT 'demo',
    expected_duration INTEGER,
    estimated_value DECIMAL(12, 2),
    is_public BOOLEAN DEFAULT FALSE,
    usage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
  )`,

  `CREATE TABLE IF NOT EXISTS deal_template_stages (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES deal_templates(id) ON DELETE CASCADE,
    stage_name VARCHAR(100),
    "order" INTEGER,
    expected_days INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(template_id, stage_name)
  )`,

  `CREATE TABLE IF NOT EXISTS deal_template_milestones (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES deal_templates(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES deal_template_stages(id) ON DELETE SET NULL,
    title VARCHAR(255),
    description TEXT,
    days_after_start INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Automations
  `CREATE TABLE IF NOT EXISTS deal_automations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    trigger VARCHAR(100),
    trigger_config JSONB,
    action VARCHAR(100),
    action_config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS deal_automation_rules (
    id SERIAL PRIMARY KEY,
    automation_id INTEGER NOT NULL REFERENCES deal_automations(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES deal_templates(id) ON DELETE SET NULL,
    rule_name VARCHAR(255),
    condition TEXT,
    condition_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(automation_id, rule_name)
  )`,

  `CREATE TABLE IF NOT EXISTS automation_executions (
    id SERIAL PRIMARY KEY,
    automation_id INTEGER NOT NULL REFERENCES deal_automations(id) ON DELETE CASCADE,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    trigger VARCHAR(100),
    status VARCHAR(50),
    result TEXT,
    error TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
  )`,

  // Sharing & Collaboration
  `CREATE TABLE IF NOT EXISTS shared_deals (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    shared_by_user_id INTEGER NOT NULL REFERENCES users(id),
    shared_with_email VARCHAR(255),
    permission VARCHAR(50) DEFAULT 'view',
    access_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(deal_id, shared_with_email)
  )`,

  `CREATE TABLE IF NOT EXISTS collaboration_comments (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Resources & Forecasting
  `CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(50),
    category VARCHAR(100),
    total_capacity DECIMAL(12, 2),
    cost_per_unit DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS resource_allocations (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    allocated_amount DECIMAL(12, 2),
    allocated_cost DECIMAL(12, 2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(deal_id, resource_id)
  )`,

  `CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(50),
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    projected_revenue DECIMAL(14, 2),
    projected_deals INTEGER,
    confidence INTEGER,
    risk_factors TEXT,
    by_stage JSONB,
    by_resource JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Add Phase 4 columns to deals if they don't exist
  `ALTER TABLE deals ADD COLUMN IF NOT EXISTS template_id INTEGER REFERENCES deal_templates(id) ON DELETE SET NULL`,
  `ALTER TABLE deals ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 50`,
  `ALTER TABLE deals ADD COLUMN IF NOT EXISTS expected_close_date TIMESTAMP`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_deal_templates_user_id ON deal_templates(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deal_template_stages_template_id ON deal_template_stages(template_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deal_template_milestones_template_id ON deal_template_milestones(template_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deal_automations_user_id ON deal_automations(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_deal_automation_rules_automation_id ON deal_automation_rules(automation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_automation_executions_automation_id ON automation_executions(automation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_automation_executions_deal_id ON automation_executions(deal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_shared_deals_deal_id ON shared_deals(deal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_shared_deals_access_token ON shared_deals(access_token)`,
  `CREATE INDEX IF NOT EXISTS idx_collaboration_comments_deal_id ON collaboration_comments(deal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_resource_allocations_deal_id ON resource_allocations(deal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_resource_allocations_resource_id ON resource_allocations(resource_id)`,
  `CREATE INDEX IF NOT EXISTS idx_forecasts_user_id ON forecasts(user_id)`,
];

async function createTables() {
  console.log('Creating Phase 4 tables...\n');

  let created = 0;
  let errors = 0;

  for (const sql of sqlStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      if (sql.includes('CREATE TABLE')) {
        const tableName = sql.match(/CREATE TABLE[^(]*([a-z_]+)/i)[1];
        console.log(`✅ ${tableName}`);
        created++;
      } else if (sql.includes('ALTER TABLE')) {
        console.log(`✅ Column added`);
        created++;
      } else if (sql.includes('CREATE INDEX')) {
        console.log(`✅ Index created`);
      }
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.error(`❌ Error:`, error.message.split('\n')[0]);
        errors++;
      }
    }
  }

  console.log(`\n${created} tables/columns created, ${errors} errors`);
  await prisma.$disconnect();
}

createTables();
