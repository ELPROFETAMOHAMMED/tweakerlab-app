-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for tweaks
CREATE TYPE tweak_category AS ENUM ('gaming', 'performance', 'privacy', 'battery', 'appearance', 'network', 'system', 'security');
CREATE TYPE tweak_risk_level AS ENUM ('minimal', 'low', 'medium', 'high', 'critical');
CREATE TYPE tweak_status AS ENUM ('active', 'disabled', 'deprecated');
CREATE TYPE device_type AS ENUM ('desktop', 'laptop', 'both');
CREATE TYPE windows_version AS ENUM ('win10', 'win11', 'both');
CREATE TYPE tweak_file_type AS ENUM ('.reg', '.bat', '.ps1', '.exe', '.msi', '.zip');

-- Create tweaks table
CREATE TABLE IF NOT EXISTS tweaks (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic Information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    category tweak_category NOT NULL,
    icon_file_name VARCHAR(255) NOT NULL,

    -- Content & File Info
    tweak_content TEXT NOT NULL,
    file_extension tweak_file_type NOT NULL,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,

    -- Specifications
    windows_version windows_version NOT NULL DEFAULT 'both',
    device_type device_type NOT NULL DEFAULT 'both',
    requires_admin BOOLEAN NOT NULL DEFAULT false,
    requires_restart BOOLEAN NOT NULL DEFAULT false,
    affects_battery BOOLEAN NOT NULL DEFAULT false,
    affects_performance BOOLEAN NOT NULL DEFAULT false,
    affects_security BOOLEAN NOT NULL DEFAULT false,

    -- Risk Assessment
    risk_level tweak_risk_level NOT NULL DEFAULT 'low',
    risk_description TEXT NOT NULL,
    reversal_method TEXT NOT NULL DEFAULT 'Manual registry restoration required',

    -- Statistics
    downloads_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (success_rate >= 0 AND success_rate <= 100),

    -- Status & Admin Controls
    status tweak_status NOT NULL DEFAULT 'active',
    admin_notes TEXT NULL,
    disable_reason TEXT NULL,

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    featured_order INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Author Information
    author_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
    author_verified BOOLEAN NOT NULL DEFAULT false,

    -- Dependencies/Conflicts
    conflicts_with TEXT[] DEFAULT '{}',
    requires_tweaks TEXT[] DEFAULT '{}',

    -- Reports tracking
    reports_count INTEGER NOT NULL DEFAULT 0,
    last_report_date TIMESTAMPTZ NULL
);

-- Create ENUM types for reports
CREATE TYPE report_type AS ENUM ('bug', 'compatibility', 'performance', 'security', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- Create tweak_reports table
CREATE TABLE IF NOT EXISTS tweak_reports (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign Key to tweaks
    tweak_id UUID NOT NULL REFERENCES tweaks(id) ON DELETE CASCADE,

    -- Reporter Information (could be linked to users table later)
    user_id VARCHAR(255) NOT NULL, -- For now just a string, later could be UUID to users table

    -- Report Details
    report_type report_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- System Information (optional)
    user_system_info JSONB NULL,

    -- Status
    status report_status NOT NULL DEFAULT 'pending',
    admin_response TEXT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tweaks_category ON tweaks(category);
CREATE INDEX IF NOT EXISTS idx_tweaks_status ON tweaks(status);
CREATE INDEX IF NOT EXISTS idx_tweaks_is_active ON tweaks(is_active);
CREATE INDEX IF NOT EXISTS idx_tweaks_is_featured ON tweaks(is_featured);
CREATE INDEX IF NOT EXISTS idx_tweaks_created_at ON tweaks(created_at);
CREATE INDEX IF NOT EXISTS idx_tweaks_downloads_count ON tweaks(downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_tweaks_rating ON tweaks(rating DESC);

CREATE INDEX IF NOT EXISTS idx_tweak_reports_tweak_id ON tweak_reports(tweak_id);
CREATE INDEX IF NOT EXISTS idx_tweak_reports_status ON tweak_reports(status);
CREATE INDEX IF NOT EXISTS idx_tweak_reports_created_at ON tweak_reports(created_at DESC);

-- Create updated_at trigger for tweaks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tweaks_updated_at BEFORE UPDATE ON tweaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tweak_reports_updated_at BEFORE UPDATE ON tweak_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tweaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweak_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for tweaks (public read, admin write)
CREATE POLICY "Tweaks are viewable by everyone" ON tweaks
    FOR SELECT USING (true);

-- For now, allow anyone to insert/update tweaks (later restrict to admins)
CREATE POLICY "Anyone can insert tweaks" ON tweaks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update tweaks" ON tweaks
    FOR UPDATE USING (true);

-- Create policies for reports (public insert, admin read/update)
CREATE POLICY "Anyone can submit reports" ON tweak_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Reports are viewable by everyone" ON tweak_reports
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update reports" ON tweak_reports
    FOR UPDATE USING (true);
