-- Migration: Materialized Views for Analytics
-- Created: 2024-03-01
-- Purpose: Create materialized views for complex analytics queries to improve performance

-- Donation Analytics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.donation_analytics_mv AS
SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_donations,
    COUNT(DISTINCT donor_address) AS unique_donors,
    COUNT(DISTINCT charity_address) AS unique_charities,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_amount
FROM public.donation_events
WHERE processed = TRUE
GROUP BY DATE_TRUNC('day', created_at);

-- Index on materialized view for faster queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_analytics_mv_date ON public.donation_analytics_mv(date);

-- Charity Performance Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.charity_performance_mv AS
SELECT
    c.address AS charity_address,
    c.name AS charity_name,
    c.reputation_score,
    c.verification_status,
    COUNT(DISTINCT de.id) AS total_donations,
    COUNT(DISTINCT de.donor_address) AS unique_donors,
    SUM(de.amount) AS total_received,
    AVG(de.amount) AS avg_donation,
    MIN(de.created_at) AS first_donation_at,
    MAX(de.created_at) AS last_donation_at,
    COUNT(DISTINCT vs.id) AS total_verifications,
    COUNT(DISTINCT CASE WHEN vs.verification_result = 'verified' THEN vs.id END) AS verified_count,
    COUNT(DISTINCT fa.id) AS fraud_alerts_count,
    COUNT(DISTINCT CASE WHEN fa.severity = 'critical' THEN fa.id END) AS critical_alerts
FROM public.charities c
LEFT JOIN public.donation_events de ON c.address = de.charity_address AND de.processed = TRUE
LEFT JOIN public.verification_submissions vs ON c.address = vs.charity_address
LEFT JOIN public.fraud_alerts fa ON c.address = fa.charity_address AND fa.resolved = FALSE
GROUP BY c.address, c.name, c.reputation_score, c.verification_status;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_charity_performance_mv_address ON public.charity_performance_mv(charity_address);
CREATE INDEX IF NOT EXISTS idx_charity_performance_mv_reputation ON public.charity_performance_mv(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_charity_performance_mv_total_received ON public.charity_performance_mv(total_received DESC);

-- Verification Statistics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.verification_stats_mv AS
SELECT
    DATE_TRUNC('day', submitted_at) AS date,
    COUNT(*) AS total_submissions,
    COUNT(DISTINCT charity_address) AS unique_charities,
    COUNT(DISTINCT CASE WHEN verification_result = 'verified' THEN id END) AS verified_count,
    COUNT(DISTINCT CASE WHEN verification_result = 'rejected' THEN id END) AS rejected_count,
    COUNT(DISTINCT CASE WHEN verification_result = 'disputed' THEN id END) AS disputed_count,
    COUNT(DISTINCT CASE WHEN verification_result = 'pending' THEN id END) AS pending_count,
    ROUND(
        COUNT(DISTINCT CASE WHEN verification_result = 'verified' THEN id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT CASE WHEN verification_result IN ('verified', 'rejected') THEN id END), 0) * 100,
        2
    ) AS verification_rate
FROM public.verification_submissions
GROUP BY DATE_TRUNC('day', submitted_at);

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_stats_mv_date ON public.verification_stats_mv(date);

-- Fraud Detection Statistics Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS public.fraud_detection_stats_mv AS
SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_alerts,
    COUNT(DISTINCT charity_address) AS charities_with_alerts,
    COUNT(DISTINCT CASE WHEN severity = 'critical' THEN id END) AS critical_alerts,
    COUNT(DISTINCT CASE WHEN severity = 'high' THEN id END) AS high_alerts,
    COUNT(DISTINCT CASE WHEN severity = 'medium' THEN id END) AS medium_alerts,
    COUNT(DISTINCT CASE WHEN severity = 'low' THEN id END) AS low_alerts,
    COUNT(DISTINCT CASE WHEN resolved = TRUE THEN id END) AS resolved_count,
    COUNT(DISTINCT CASE WHEN resolved = FALSE THEN id END) AS unresolved_count,
    ROUND(
        COUNT(DISTINCT CASE WHEN resolved = TRUE THEN id END)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100,
        2
    ) AS resolution_rate
FROM public.fraud_alerts
GROUP BY DATE_TRUNC('day', created_at);

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_fraud_detection_stats_mv_date ON public.fraud_detection_stats_mv(date);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.donation_analytics_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.charity_performance_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.verification_stats_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.fraud_detection_stats_mv;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.donation_analytics_mv TO authenticated;
GRANT SELECT ON public.charity_performance_mv TO authenticated;
GRANT SELECT ON public.verification_stats_mv TO authenticated;
GRANT SELECT ON public.fraud_detection_stats_mv TO authenticated;

-- Comments for documentation
COMMENT ON MATERIALIZED VIEW public.donation_analytics_mv IS 'Aggregated daily donation statistics';
COMMENT ON MATERIALIZED VIEW public.charity_performance_mv IS 'Comprehensive charity performance metrics';
COMMENT ON MATERIALIZED VIEW public.verification_stats_mv IS 'Daily verification submission statistics';
COMMENT ON MATERIALIZED VIEW public.fraud_detection_stats_mv IS 'Daily fraud detection alert statistics';
COMMENT ON FUNCTION public.refresh_all_materialized_views() IS 'Refreshes all materialized views concurrently';

