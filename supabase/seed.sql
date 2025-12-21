-- Seed data for development

-- Insert sample charities (these would normally be created via smart contract events)
INSERT INTO public.charities (address, name, description, registration_number, verification_status, reputation_score)
VALUES
    ('0x1111111111111111111111111111111111111111', 'Save the Children', 'Helping children in need worldwide', 'REG001', 'approved', 950),
    ('0x2222222222222222222222222222222222222222', 'World Food Programme', 'Fighting global hunger', 'REG002', 'approved', 980),
    ('0x3333333333333333333333333333333333333333', 'Doctors Without Borders', 'Medical aid in crisis zones', 'REG003', 'pending', 100)
ON CONFLICT (address) DO NOTHING;

-- Sample donation events (would be populated by indexer)
-- Note: These are examples - in production, these come from blockchain events
-- INSERT INTO public.donation_events (donation_id, donor_address, charity_address, amount, token_address, receipt_token_id, transaction_hash, block_number)
-- VALUES
--     (1, '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '0x1111111111111111111111111111111111111111', '1000000000000000000', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 10001, '0x...', 12345678);

