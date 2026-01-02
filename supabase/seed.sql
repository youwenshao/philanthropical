-- Seed data for development

-- Insert sample charities (these would normally be created via smart contract events)
-- Major International Charities
INSERT INTO public.charities (address, name, description, registration_number, verification_status, reputation_score)
VALUES
    -- Major International Charities
    ('0x1111111111111111111111111111111111111111', 'UNICEF', 'United Nations Children\'s Fund - Protecting children worldwide and providing humanitarian aid', 'UNICEF-001', 'approved', 990),
    ('0x2222222222222222222222222222222222222222', 'World Food Programme', 'Fighting global hunger and providing food assistance in emergencies', 'WFP-002', 'approved', 980),
    ('0x3333333333333333333333333333333333333333', 'Doctors Without Borders', 'Medical aid in crisis zones and conflict areas worldwide', 'MSF-003', 'approved', 975),
    ('0x4444444444444444444444444444444444444444', 'Red Cross', 'International humanitarian organization providing emergency assistance and disaster relief', 'ICRC-004', 'approved', 985),
    ('0x5555555555555555555555555555555555555555', 'World Central Kitchen', 'Providing meals in disaster-stricken areas worldwide', 'WCK-005', 'approved', 960),
    ('0x6666666666666666666666666666666666666666', 'Oxfam', 'Global movement working to end poverty and injustice', 'OXFAM-006', 'approved', 970),
    ('0x7777777777777777777777777777777777777777', 'World Vision', 'Christian humanitarian organization helping children and families in need', 'WV-007', 'approved', 965),
    ('0x8888888888888888888888888888888888888888', 'Save the Children', 'Helping children in need worldwide with education and protection', 'STC-008', 'approved', 950),
    
    -- Hong Kong Local Charities
    ('0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Caritas Hong Kong', 'Providing social services, education, medical care, and community development in Hong Kong', 'HK-CARITAS-001', 'approved', 940),
    ('0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', 'The Community Chest of Hong Kong', 'Major fundraising organization supporting over 165 social welfare member agencies', 'HK-COMMCHEST-002', 'approved', 945),
    ('0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'Crossroads Foundation', 'Connecting those in need with those who can help through redistribution of goods', 'HK-CROSSROADS-003', 'approved', 930),
    ('0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD', 'The Boys\' and Girls\' Clubs Association of Hong Kong', 'Providing services to children and youths focusing on development and well-being', 'HK-BGCA-004', 'approved', 935),
    ('0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', 'Feeding Hong Kong', 'Food bank collecting surplus food and redistributing to charities serving those in need', 'HK-FEEDING-005', 'approved', 920),
    ('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 'SPCA Hong Kong', 'Promoting animal welfare and providing adoption and veterinary care services', 'HK-SPCA-006', 'approved', 910),
    ('0x1010101010101010101010101010101010101010', 'Hong Kong Dog Rescue', 'Rescuing and rehoming abandoned dogs and puppies in Hong Kong', 'HK-HKDR-007', 'approved', 905),
    ('0x2020202020202020202020202020202020202020', 'Support! International Foundation', 'Youth-led NGO providing educational programs and community development events', 'HK-SUPPORT-008', 'approved', 915)
ON CONFLICT (address) DO NOTHING;

-- Sample donation events (would be populated by indexer)
-- Note: These are examples - in production, these come from blockchain events
-- INSERT INTO public.donation_events (donation_id, donor_address, charity_address, amount, token_address, receipt_token_id, transaction_hash, block_number)
-- VALUES
--     (1, '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '0x1111111111111111111111111111111111111111', '1000000000000000000', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 10001, '0x...', 12345678);

