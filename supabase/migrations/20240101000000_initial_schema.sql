-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charities table
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    registration_number TEXT,
    reputation_score INTEGER DEFAULT 100,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'challenged', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    challenge_period_end TIMESTAMP WITH TIME ZONE
);

-- Donation events table
CREATE TABLE IF NOT EXISTS public.donation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id BIGINT NOT NULL,
    donor_address TEXT NOT NULL,
    charity_address TEXT NOT NULL REFERENCES public.charities(address),
    amount DECIMAL(78, 0) NOT NULL, -- Supports up to 78 digits for large token amounts
    token_address TEXT NOT NULL,
    receipt_token_id BIGINT,
    transaction_hash TEXT UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_donation_events_donor (donor_address),
    INDEX idx_donation_events_charity (charity_address),
    INDEX idx_donation_events_created (created_at)
);

-- Verification submissions table
CREATE TABLE IF NOT EXISTS public.verification_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id BIGINT NOT NULL,
    charity_address TEXT NOT NULL REFERENCES public.charities(address),
    project_id BIGINT,
    evidence_hash TEXT NOT NULL,
    evidence_url TEXT,
    verification_result TEXT DEFAULT 'pending' CHECK (verification_result IN ('pending', 'verified', 'rejected', 'disputed')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by TEXT,
    disputed BOOLEAN DEFAULT FALSE,
    INDEX idx_verification_submissions_charity (charity_address),
    INDEX idx_verification_submissions_created (submitted_at)
);

-- Fraud alerts table
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL,
    charity_address TEXT REFERENCES public.charities(address),
    donation_id BIGINT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_fraud_alerts_charity (charity_address),
    INDEX idx_fraud_alerts_resolved (resolved, created_at)
);

-- Projects table (for escrow)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id BIGINT UNIQUE NOT NULL,
    charity_address TEXT NOT NULL REFERENCES public.charities(address),
    token_address TEXT NOT NULL,
    total_amount DECIMAL(78, 0) NOT NULL,
    released_amount DECIMAL(78, 0) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_projects_charity (charity_address)
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id BIGINT NOT NULL REFERENCES public.projects(project_id),
    milestone_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(78, 0) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, milestone_id),
    INDEX idx_milestones_project (project_id)
);

-- Row Level Security Policies

-- Users can read their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Charities: public read, admin write
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read charities" ON public.charities
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert charities" ON public.charities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Donation events: users can read their own, public can read all
ALTER TABLE public.donation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read donation events" ON public.donation_events
    FOR SELECT USING (true);

CREATE POLICY "Only service role can insert donation events" ON public.donation_events
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Verification submissions: public read
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verification submissions" ON public.verification_submissions
    FOR SELECT USING (true);

-- Fraud alerts: authenticated users can read, admins can write
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read fraud alerts" ON public.fraud_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert fraud alerts" ON public.fraud_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Projects: public read
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read projects" ON public.projects
    FOR SELECT USING (true);

-- Milestones: public read
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read milestones" ON public.milestones
    FOR SELECT USING (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

