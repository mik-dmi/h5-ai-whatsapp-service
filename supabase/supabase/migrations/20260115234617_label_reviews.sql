CREATE TABLE label_reviews (
    review_id BIGSERIAL PRIMARY KEY,
    message_id BIGINT REFERENCES messages(message_id),

    old_label VARCHAR(100),
    new_label VARCHAR(100),

    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP DEFAULT NOW()
);
