-- Function: Refresh Materialized Views
-- Purpose: Refresh all materialized views (can be called via cron or scheduled job)

-- This function is already created in the migration file, but this is a standalone version
-- that can be used for manual refresh or scheduled jobs

CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS TABLE(
    view_name TEXT,
    refresh_started_at TIMESTAMP WITH TIME ZONE,
    refresh_completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_time TIMESTAMP WITH TIME ZONE;
    v_end_time TIMESTAMP WITH TIME ZONE;
    v_duration_ms BIGINT;
    v_error_message TEXT;
BEGIN
    -- Refresh donation_analytics_mv
    BEGIN
        v_start_time := NOW();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.donation_analytics_mv;
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        
        RETURN QUERY SELECT 
            'donation_analytics_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            TRUE,
            NULL::TEXT;
    EXCEPTION WHEN OTHERS THEN
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        v_error_message := SQLERRM;
        
        RETURN QUERY SELECT 
            'donation_analytics_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            FALSE,
            v_error_message;
    END;

    -- Refresh charity_performance_mv
    BEGIN
        v_start_time := NOW();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.charity_performance_mv;
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        
        RETURN QUERY SELECT 
            'charity_performance_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            TRUE,
            NULL::TEXT;
    EXCEPTION WHEN OTHERS THEN
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        v_error_message := SQLERRM;
        
        RETURN QUERY SELECT 
            'charity_performance_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            FALSE,
            v_error_message;
    END;

    -- Refresh verification_stats_mv
    BEGIN
        v_start_time := NOW();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.verification_stats_mv;
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        
        RETURN QUERY SELECT 
            'verification_stats_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            TRUE,
            NULL::TEXT;
    EXCEPTION WHEN OTHERS THEN
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        v_error_message := SQLERRM;
        
        RETURN QUERY SELECT 
            'verification_stats_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            FALSE,
            v_error_message;
    END;

    -- Refresh fraud_detection_stats_mv
    BEGIN
        v_start_time := NOW();
        REFRESH MATERIALIZED VIEW CONCURRENTLY public.fraud_detection_stats_mv;
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        
        RETURN QUERY SELECT 
            'fraud_detection_stats_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            TRUE,
            NULL::TEXT;
    EXCEPTION WHEN OTHERS THEN
        v_end_time := NOW();
        v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
        v_error_message := SQLERRM;
        
        RETURN QUERY SELECT 
            'fraud_detection_stats_mv'::TEXT,
            v_start_time,
            v_end_time,
            v_duration_ms,
            FALSE,
            v_error_message;
    END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.refresh_all_materialized_views() TO authenticated;

-- Comment
COMMENT ON FUNCTION public.refresh_all_materialized_views() IS 
'Refreshes all materialized views concurrently and returns status for each view';

