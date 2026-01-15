CREATE TABLE templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id UUID REFERENCES labels(label_id),

    template_name VARCHAR(150) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    body TEXT NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()
);
