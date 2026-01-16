-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;


INSERT INTO users (user_id, phone_number, created_at, last_seen_at)
VALUES
(gen_random_uuid(), '+15550000001', NOW() - INTERVAL '2 days', NOW() - INTERVAL '10 minutes'),
(gen_random_uuid(), '+15550000002', NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 minutes'),
(gen_random_uuid(), '+15550000003', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 hour');




INSERT INTO conversations (conversation_id, user_id, is_open)
SELECT
    gen_random_uuid(),
    user_id,
    TRUE
FROM users;




INSERT INTO labels (
    label_id,
    label_name,
    description,
    confidence_threshold,
    auto_send,
    requires_human
)
VALUES
(gen_random_uuid(), 'pricing_question', 'User asking about pricing', 0.75, TRUE, FALSE),
(gen_random_uuid(), 'order_status', 'User asking about order status', 0.70, TRUE, FALSE),
(gen_random_uuid(), 'support_issue', 'User reporting an issue', 0.65, FALSE, TRUE),
(gen_random_uuid(), 'human_required', 'AI unsure, needs human', 0.00, FALSE, TRUE);




INSERT INTO templates (
    template_id,
    label_id,
    template_name,
    language,
    body
)
SELECT
    gen_random_uuid(),
    label_id,
    label_name || '_template',
    'en',
    CASE label_name
        WHEN 'pricing_question' THEN 'Our pricing starts at $10 per month.'
        WHEN 'order_status' THEN 'Please share your order number so we can check the status.'
        WHEN 'support_issue' THEN 'We have received your issue and our support team will contact you shortly.'
        ELSE 'A human agent will reply to you shortly.'
    END
FROM labels;


INSERT INTO messages (
    conversation_id,
    user_id,
    direction,
    actor,
    message_text,
    status
)
SELECT
    c.conversation_id,
    c.user_id,
    'inbound',
    'user',
    CASE
        WHEN u.phone_number = '+15550000001' THEN 'How much does your service cost?'
        WHEN u.phone_number = '+15550000002' THEN 'Where is my order?'
        ELSE 'I have a problem with my account'
    END,
    'received'
FROM conversations c
JOIN users u ON u.user_id = c.user_id;


UPDATE messages
SET
    ai_label = CASE
        WHEN message_text ILIKE '%cost%' THEN 'pricing_question'
        WHEN message_text ILIKE '%order%' THEN 'order_status'
        ELSE 'support_issue'
    END,
    ai_confidence = CASE
        WHEN message_text ILIKE '%cost%' THEN 0.88
        WHEN message_text ILIKE '%order%' THEN 0.82
        ELSE 0.52
    END,
    status = CASE
        WHEN message_text ILIKE '%problem%' THEN 'waiting_human'
        ELSE 'classified'
    END;




INSERT INTO messages (
    conversation_id,
    user_id,
    direction,
    actor,
    message_text,
    final_label,
    approved_by_human,
    status
)
SELECT
    m.conversation_id,
    m.user_id,
    'outbound',
    'ai',
    t.body,
    m.ai_label,
    FALSE,
    'sent'
FROM messages m
JOIN labels l ON l.label_name = m.ai_label
JOIN templates t ON t.label_id = l.label_id
WHERE m.ai_confidence >= l.confidence_threshold;



UPDATE messages
SET
    final_label = 'human_required',
    approved_by_human = TRUE,
    status = 'approved'
WHERE ai_confidence < 0.60;
