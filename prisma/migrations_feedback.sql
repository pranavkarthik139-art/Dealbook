-- Add feedback table to track questionnaire responses
CREATE TABLE IF NOT EXISTS product_feedback (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  respondent_name VARCHAR(255),
  respondent_email VARCHAR(255),
  respondent_role VARCHAR(100),

  -- Overall impression
  overall_rating INT, -- 1-5 scale
  likelihood_recommend INT, -- 0-10 scale (NPS)

  -- What they liked
  liked_features TEXT[],
  liked_reasons TEXT,

  -- What they'd like to see
  missing_features TEXT[],
  feature_requests TEXT,

  -- Pain points
  pain_points TEXT,

  -- Usability & design
  ease_of_use INT, -- 1-5 scale
  design_feedback TEXT,

  -- Comparison
  comparing_to VARCHAR(255),
  advantages TEXT,
  disadvantages TEXT,

  -- Open feedback
  additional_suggestions TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for quick lookup
CREATE INDEX idx_feedback_user_id ON product_feedback(user_id);
CREATE INDEX idx_feedback_created ON product_feedback(created_at);
