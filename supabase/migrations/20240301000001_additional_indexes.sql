-- Migration: Additional Strategic Indexes
-- Created: 2024-03-01
-- Purpose: Add composite and partial indexes for common query patterns

-- Composite indexes for donation_events
CREATE INDEX IF NOT EXISTS idx_donation_events_charity_created 
ON public.donation_events(charity_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donation_events_donor_created 
ON public.donation_events(donor_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donation_events_processed_created 
ON public.donation_events(processed, created_at DESC) 
WHERE processed = FALSE;

-- Partial index for unprocessed donations
CREATE INDEX IF NOT EXISTS idx_donation_events_unprocessed 
ON public.donation_events(created_at DESC) 
WHERE processed = FALSE;

-- Composite index for verification_submissions
CREATE INDEX IF NOT EXISTS idx_verification_submissions_charity_result 
ON public.verification_submissions(charity_address, verification_result, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_verification_submissions_result_created 
ON public.verification_submissions(verification_result, submitted_at DESC);

-- Partial index for pending verifications
CREATE INDEX IF NOT EXISTS idx_verification_submissions_pending 
ON public.verification_submissions(submitted_at DESC) 
WHERE verification_result = 'pending';

-- Composite index for fraud_alerts
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity_resolved 
ON public.fraud_alerts(severity, resolved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_charity_severity 
ON public.fraud_alerts(charity_address, severity, created_at DESC);

-- Partial index for unresolved alerts
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_unresolved 
ON public.fraud_alerts(created_at DESC) 
WHERE resolved = FALSE;

-- Partial index for critical alerts
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_critical 
ON public.fraud_alerts(created_at DESC) 
WHERE severity = 'critical' AND resolved = FALSE;

-- Composite index for charities
CREATE INDEX IF NOT EXISTS idx_charities_status_reputation 
ON public.charities(verification_status, reputation_score DESC);

CREATE INDEX IF NOT EXISTS idx_charities_status_created 
ON public.charities(verification_status, created_at DESC);

-- Index for projects
CREATE INDEX IF NOT EXISTS idx_projects_charity_active 
ON public.projects(charity_address, active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_active 
ON public.projects(created_at DESC) 
WHERE active = TRUE;

-- GIN index for JSONB columns (if any exist in future)
-- Example: CREATE INDEX IF NOT EXISTS idx_table_jsonb_column ON public.table USING GIN (jsonb_column);

-- Full-text search indexes (if needed for search functionality)
-- Example for charity names:
CREATE INDEX IF NOT EXISTS idx_charities_name_search 
ON public.charities USING gin(to_tsvector('english', name));

-- Index for verification tiers (from Phase 2)
CREATE INDEX IF NOT EXISTS idx_verification_tiers_verification_tier 
ON public.verification_tiers(verification_id, tier);

CREATE INDEX IF NOT EXISTS idx_verification_tiers_result_created 
ON public.verification_tiers(result, created_at DESC);

-- Index for crowdsourced verifications
CREATE INDEX IF NOT EXISTS idx_crowdsourced_verifications_status_created 
ON public.crowdsourced_verifications(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crowdsourced_verifications_charity_status 
ON public.crowdsourced_verifications(charity_address, status);

-- Index for professional verifiers
CREATE INDEX IF NOT EXISTS idx_professional_verifiers_active_reputation 
ON public.professional_verifiers(active, reputation_score DESC);

-- Index for verification votes
CREATE INDEX IF NOT EXISTS idx_verification_votes_verification_voter 
ON public.verification_votes(verification_id, voter_address);

CREATE INDEX IF NOT EXISTS idx_verification_votes_voter_created 
ON public.verification_votes(voter_address, created_at DESC);

-- Index for fraud analysis results
CREATE INDEX IF NOT EXISTS idx_fraud_analysis_results_type_risk 
ON public.fraud_analysis_results(analysis_type, risk_score DESC, analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_fraud_analysis_results_entity_created 
ON public.fraud_analysis_results(entity_id, analyzed_at DESC);

-- Comments for documentation
COMMENT ON INDEX idx_donation_events_charity_created IS 'Optimizes queries filtering by charity and sorting by date';
COMMENT ON INDEX idx_verification_submissions_pending IS 'Optimizes queries for pending verifications';
COMMENT ON INDEX idx_fraud_alerts_unresolved IS 'Optimizes queries for unresolved fraud alerts';
COMMENT ON INDEX idx_charities_name_search IS 'Enables full-text search on charity names';

