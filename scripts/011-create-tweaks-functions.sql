-- Function to increment tweak download count
CREATE OR REPLACE FUNCTION increment_tweak_downloads(tweak_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE tweaks
    SET downloads_count = downloads_count + 1,
        updated_at = NOW()
    WHERE id = tweak_uuid
    RETURNING downloads_count INTO new_count;

    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment tweak likes count
CREATE OR REPLACE FUNCTION increment_tweak_likes(tweak_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE tweaks
    SET likes_count = likes_count + 1,
        updated_at = NOW()
    WHERE id = tweak_uuid
    RETURNING likes_count INTO new_count;

    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement tweak likes count
CREATE OR REPLACE FUNCTION decrement_tweak_likes(tweak_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE tweaks
    SET likes_count = GREATEST(likes_count - 1, 0),
        updated_at = NOW()
    WHERE id = tweak_uuid
    RETURNING likes_count INTO new_count;

    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment tweak views count
CREATE OR REPLACE FUNCTION increment_tweak_views(tweak_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE tweaks
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = tweak_uuid
    RETURNING views_count INTO new_count;

    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update reports count when a new report is created
CREATE OR REPLACE FUNCTION update_tweak_reports_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the tweaks table with new report count and last report date
    UPDATE tweaks
    SET reports_count = (
        SELECT COUNT(*)
        FROM tweak_reports
        WHERE tweak_id = NEW.tweak_id
    ),
    last_report_date = NEW.created_at,
    updated_at = NOW()
    WHERE id = NEW.tweak_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update reports count
CREATE TRIGGER trigger_update_tweak_reports_count
    AFTER INSERT ON tweak_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_tweak_reports_count();

-- Function to get featured tweaks
CREATE OR REPLACE FUNCTION get_featured_tweaks(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    detailed_description TEXT,
    category tweak_category,
    icon_file_name VARCHAR(255),
    tweak_content TEXT,
    file_extension tweak_file_type,
    file_size_bytes INTEGER,
    windows_version windows_version,
    device_type device_type,
    requires_admin BOOLEAN,
    requires_restart BOOLEAN,
    affects_battery BOOLEAN,
    affects_performance BOOLEAN,
    affects_security BOOLEAN,
    risk_level tweak_risk_level,
    risk_description TEXT,
    reversal_method TEXT,
    downloads_count INTEGER,
    likes_count INTEGER,
    views_count INTEGER,
    rating DECIMAL(3,2),
    reviews_count INTEGER,
    success_rate DECIMAL(5,2),
    status tweak_status,
    admin_notes TEXT,
    disable_reason TEXT,
    is_active BOOLEAN,
    is_featured BOOLEAN,
    featured_order INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    author_name VARCHAR(255),
    author_verified BOOLEAN,
    conflicts_with TEXT[],
    requires_tweaks TEXT[],
    reports_count INTEGER,
    last_report_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM tweaks t
    WHERE t.is_featured = true
    AND t.is_active = true
    ORDER BY t.featured_order ASC NULLS LAST, t.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tweaks by category
CREATE OR REPLACE FUNCTION get_tweaks_by_category(cat tweak_category, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    detailed_description TEXT,
    category tweak_category,
    icon_file_name VARCHAR(255),
    tweak_content TEXT,
    file_extension tweak_file_type,
    file_size_bytes INTEGER,
    windows_version windows_version,
    device_type device_type,
    requires_admin BOOLEAN,
    requires_restart BOOLEAN,
    affects_battery BOOLEAN,
    affects_performance BOOLEAN,
    affects_security BOOLEAN,
    risk_level tweak_risk_level,
    risk_description TEXT,
    reversal_method TEXT,
    downloads_count INTEGER,
    likes_count INTEGER,
    views_count INTEGER,
    rating DECIMAL(3,2),
    reviews_count INTEGER,
    success_rate DECIMAL(5,2),
    status tweak_status,
    admin_notes TEXT,
    disable_reason TEXT,
    is_active BOOLEAN,
    is_featured BOOLEAN,
    featured_order INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    author_name VARCHAR(255),
    author_verified BOOLEAN,
    conflicts_with TEXT[],
    requires_tweaks TEXT[],
    reports_count INTEGER,
    last_report_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM tweaks t
    WHERE t.category = cat
    AND t.is_active = true
    ORDER BY t.downloads_count DESC, t.rating DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search tweaks
CREATE OR REPLACE FUNCTION search_tweaks(search_term TEXT, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    detailed_description TEXT,
    category tweak_category,
    icon_file_name VARCHAR(255),
    tweak_content TEXT,
    file_extension tweak_file_type,
    file_size_bytes INTEGER,
    windows_version windows_version,
    device_type device_type,
    requires_admin BOOLEAN,
    requires_restart BOOLEAN,
    affects_battery BOOLEAN,
    affects_performance BOOLEAN,
    affects_security BOOLEAN,
    risk_level tweak_risk_level,
    risk_description TEXT,
    reversal_method TEXT,
    downloads_count INTEGER,
    likes_count INTEGER,
    views_count INTEGER,
    rating DECIMAL(3,2),
    reviews_count INTEGER,
    success_rate DECIMAL(5,2),
    status tweak_status,
    admin_notes TEXT,
    disable_reason TEXT,
    is_active BOOLEAN,
    is_featured BOOLEAN,
    featured_order INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    author_name VARCHAR(255),
    author_verified BOOLEAN,
    conflicts_with TEXT[],
    requires_tweaks TEXT[],
    reports_count INTEGER,
    last_report_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM tweaks t
    WHERE (
        t.title ILIKE '%' || search_term || '%' OR
        t.description ILIKE '%' || search_term || '%' OR
        t.detailed_description ILIKE '%' || search_term || '%'
    )
    AND t.is_active = true
    ORDER BY
        CASE
            WHEN t.title ILIKE '%' || search_term || '%' THEN 1
            WHEN t.description ILIKE '%' || search_term || '%' THEN 2
            ELSE 3
        END,
        t.downloads_count DESC,
        t.rating DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
