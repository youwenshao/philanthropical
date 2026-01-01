-- Migration: Verification Tiers and Fraud Detection Tables
-- Created: 2024-02-01

-- Verification tiers table
CREATE TABLE IF NOT EXISTS public.verification_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id BIGINT NOT NULL,
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'verified', 'rejected', 'disputed')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(verification_id, tier)
);

-- Indexes for verification_tiers
CREATE INDEX IF NOT EXISTS idx_verification_tiers_verification ON public.verification_tiers(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_tiers_tier ON public.verification_tiers(tier);
CREATE INDEX IF NOT EXISTS idx_verification_tiers_result ON public.verification_tiers(result);

-- Crowdsourced verifications table (Tier 1)
CREATE TABLE IF NOT EXISTS public.crowdsourced_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id BIGINT NOT NULL,
    charity_address TEXT NOT NULL REFERENCES public.charities(address),
    project_id BIGINT,
    evidence_hash TEXT NOT NULL,
    evidence_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disputed')),
    approve_votes INTEGER DEFAULT 0,
    reject_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    consensus_reached_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for crowdsourced_verifications
CREATE INDEX IF NOT EXISTS idx_crowdsourced_verifications_charity ON public.crowdsourced_verifications(charity_address);
CREATE INDEX IF NOT EXISTS idx_crowdsourced_verifications_status ON public.crowdsourced_verifications(status);
CREATE INDEX IF NOT EXISTS idx_crowdsourced_verifications_created ON public.crowdsourced_verifications(created_at);

-- Professional verifiers table (Tier 2)
CREATE TABLE IF NOT EXISTS public.professional_verifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verifier_address TEXT UNIQUE NOT NULL,
    organization_name TEXT NOT NULL,
    accreditation_number TEXT,
    reputation_score INTEGER DEFAULT 500,
    total_verifications INTEGER DEFAULT 0,
    successful_verifications INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for professional_verifiers
CREATE INDEX IF NOT EXISTS idx_professional_verifiers_address ON public.professional_verifiers(verifier_address);
CREATE INDEX IF NOT EXISTS idx_professional_verifiers_active ON public.professional_verifiers(active);

-- Verification votes table (for Tier 1 consensus)
CREATE TABLE IF NOT EXISTS public.verification_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id BIGINT NOT NULL,
    voter_address TEXT NOT NULL,
    vote_option TEXT NOT NULL CHECK (vote_option IN ('approve', 'reject')),
    stake_amount DECIMAL(78, 0) NOT NULL,
    slashed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(verification_id, voter_address)
);

-- Indexes for verification_votes
CREATE INDEX IF NOT EXISTS idx_verification_votes_verification ON public.verification_votes(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_votes_voter ON public.verification_votes(voter_address);

-- Fraud detection rules table
CREATE TABLE IF NOT EXISTS public.fraud_detection_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT UNIQUE NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('pattern', 'amount', 'frequency', 'geographic', 'image', 'ml')),
    rule_config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fraud_detection_rules
CREATE INDEX IF NOT EXISTS idx_fraud_detection_rules_type ON public.fraud_detection_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_rules_enabled ON public.fraud_detection_rules(enabled);

-- Fraud analysis results table
CREATE TABLE IF NOT EXISTS public.fraud_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('transaction', 'verification', 'charity', 'donor')),
    entity_id TEXT NOT NULL, -- Can be transaction_hash, verification_id, charity_address, or donor_address
    rule_id UUID REFERENCES public.fraud_detection_rules(id),
    ml_model_version TEXT,
    risk_score DECIMAL(5, 2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    features JSONB,
    result JSONB NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fraud_analysis_results
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_results_type ON public.fraud_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_results_entity ON public.fraud_analysis_results(entity_id);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_results_risk ON public.fraud_analysis_results(risk_score);
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_results_created ON public.fraud_analysis_results(created_at);

-- Verifier reputation history table
CREATE TABLE IF NOT EXISTS public.verifier_reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verifier_address TEXT NOT NULL,
    verification_id BIGINT,
    old_reputation INTEGER,
    new_reputation INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for verifier_reputation_history
CREATE INDEX IF NOT EXISTS idx_verifier_reputation_verifier ON public.verifier_reputation_history(verifier_address);
CREATE INDEX IF NOT EXISTS idx_verifier_reputation_created ON public.verifier_reputation_history(created_at);

-- Row Level Security Policies

-- Verification tiers: public read
ALTER TABLE public.verification_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verification tiers" ON public.verification_tiers
    FOR SELECT USING (true);

-- Crowdsourced verifications: public read
ALTER TABLE public.crowdsourced_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read crowdsourced verifications" ON public.crowdsourced_verifications
    FOR SELECT USING (true);

-- Professional verifiers: public read
ALTER TABLE public.professional_verifiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read professional verifiers" ON public.professional_verifiers
    FOR SELECT USING (true);

-- Verification votes: public read
ALTER TABLE public.verification_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verification votes" ON public.verification_votes
    FOR SELECT USING (true);

-- Fraud detection rules: authenticated read, admin write
ALTER TABLE public.fraud_detection_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read fraud rules" ON public.fraud_detection_rules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify fraud rules" ON public.fraud_detection_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Fraud analysis results: authenticated read
ALTER TABLE public.fraud_analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read fraud analysis" ON public.fraud_analysis_results
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only service role can insert fraud analysis" ON public.fraud_analysis_results
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Verifier reputation history: public read
ALTER TABLE public.verifier_reputation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verifier reputation history" ON public.verifier_reputation_history
    FOR SELECT USING (true);

-- Functions for updated_at timestamps
CREATE TRIGGER update_professional_verifiers_updated_at BEFORE UPDATE ON public.professional_verifiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_detection_rules_updated_at BEFORE UPDATE ON public.fraud_detection_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


