CREATE TABLE messages (
    message_id BIGSERIAL PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(conversation_id),
    user_id UUID REFERENCES users(user_id),

    direction VARCHAR(10) CHECK (direction IN ('inbound','outbound')),
    actor VARCHAR(20) CHECK (actor IN ('user','ai','human','system')),

    message_text TEXT,

    ai_label VARCHAR(100),
    ai_confidence NUMERIC(4,3),

    final_label VARCHAR(100),
    approved_by_human BOOLEAN DEFAULT FALSE,

    status VARCHAR(30) CHECK (
        status IN (
            'received',
            'classified',
            'waiting_human',
            'approved',
            'sent',
            'failed'
        )
    ),

    twilio_message_sid VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW()
);
