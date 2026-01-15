CREATE TABLE labels (
    label_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_name VARCHAR(100) UNIQUE NOT NULL,

    description TEXT,

    confidence_threshold NUMERIC(4,3) DEFAULT 0.70,
    auto_send BOOLEAN DEFAULT TRUE,

    requires_human BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()
);
