-- =====================================================================
-- CAREPATH AI - PRODUCTION POSTGRESQL SCHEMA (SUPABASE NORMALIZED)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Updated_at Trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    date_of_birth DATE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    easy_mode_enabled BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    high_contrast BOOLEAN DEFAULT FALSE,
    reduced_motion BOOLEAN DEFAULT FALSE,
    font_size VARCHAR(10) DEFAULT 'default' CHECK (font_size IN ('small', 'default', 'large', 'xlarge')),
    location_enabled BOOLEAN DEFAULT FALSE,
    last_known_latitude NUMERIC(10, 7),
    last_known_longitude NUMERIC(10, 7),
    share_anonymous_analytics BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. CONSENTS
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('terms_of_service', 'privacy_policy', 'ai_navigation_disclaimer', 'location_access', 'family_data_processing')),
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address_hash TEXT,
    user_agent TEXT
);

-- 4. HEALTHCARE CATEGORIES
CREATE TABLE IF NOT EXISTS public.healthcare_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ta TEXT,
    description_hi TEXT,
    icon_name TEXT NOT NULL,
    urgency_level VARCHAR(20) DEFAULT 'routine' CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HEALTHCARE SERVICES
CREATE TABLE IF NOT EXISTS public.healthcare_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) NOT NULL REFERENCES public.healthcare_categories(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ta TEXT,
    name_hi TEXT,
    description_en TEXT,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FACILITIES
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN ('Hospital', 'Clinic', 'Urgent Care', 'Diagnostic Center', 'Pharmacy', 'Mental Health Clinic', 'Dental Practice', 'Rehab Center')),
    description TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.5,
    verified BOOLEAN DEFAULT TRUE,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    phone TEXT,
    email TEXT,
    website TEXT,
    emergency_available BOOLEAN DEFAULT FALSE,
    wheelchair_accessible BOOLEAN DEFAULT TRUE,
    languages_supported TEXT[] DEFAULT ARRAY['English'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. FACILITY LOCATIONS
CREATE TABLE IF NOT EXISTS public.facility_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE UNIQUE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'USA',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    landmarks TEXT,
    parking_info TEXT
);

-- 8. FACILITY SERVICES (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.facility_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.healthcare_services(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    UNIQUE(facility_id, service_id)
);

-- 9. FACILITY HOURS
CREATE TABLE IF NOT EXISTS public.facility_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    is_closed BOOLEAN DEFAULT FALSE,
    open_time TIME,
    close_time TIME,
    is_24_hours BOOLEAN DEFAULT FALSE,
    UNIQUE(facility_id, day_of_week)
);

-- 10. SAVED FACILITIES
CREATE TABLE IF NOT EXISTS public.saved_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, facility_id)
);

-- 11. NAVIGATION SESSIONS
CREATE TABLE IF NOT EXISTS public.navigation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Healthcare Navigation',
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    identified_category_id VARCHAR(50) REFERENCES public.healthcare_categories(id) ON DELETE SET NULL,
    urgency_level VARCHAR(20) DEFAULT 'routine' CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
    selected_facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_navigation_sessions_updated_at BEFORE UPDATE ON public.navigation_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 12. NAVIGATION MESSAGES
CREATE TABLE IF NOT EXISTS public.navigation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.navigation_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'carepath_ai', 'system')),
    content TEXT NOT NULL,
    structured_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NAVIGATION STEPS (Visual Journey)
CREATE TABLE IF NOT EXISTS public.navigation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.navigation_sessions(id) ON DELETE CASCADE,
    step_key VARCHAR(50) NOT NULL CHECK (step_key IN ('goal', 'service', 'facility', 'preparation', 'visit', 'follow_up')),
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    step_order INT NOT NULL,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CARE PLANS
CREATE TABLE IF NOT EXISTS public.care_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. APPOINTMENT NOTES & CHECKLISTS
CREATE TABLE IF NOT EXISTS public.appointment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.navigation_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    item_type VARCHAR(30) DEFAULT 'checklist' CHECK (item_type IN ('checklist', 'instruction', 'memo')),
    is_completed BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. QUESTION LISTS & QUESTIONS FOR PROFESSIONALS
CREATE TABLE IF NOT EXISTS public.question_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.navigation_sessions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.question_lists(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'understanding' CHECK (category IN ('understanding', 'tests_procedures', 'next_steps', 'follow_up')),
    question_text TEXT NOT NULL,
    is_answered BOOLEAN DEFAULT FALSE,
    answer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. DOCUMENT CATEGORIES
CREATE TABLE IF NOT EXISTS public.document_categories (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- 18. DOCUMENTS (Secure Document Vault)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES public.document_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    ai_summary TEXT,
    ai_terminology JSONB,
    ai_suggested_questions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 19. FAMILY PROFILES
CREATE TABLE IF NOT EXISTS public.family_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('Child', 'Parent', 'Spouse', 'Elder', 'Other')),
    date_of_birth DATE,
    emergency_contact TEXT,
    can_manage_documents BOOLEAN DEFAULT TRUE,
    can_manage_navigation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. NOTIFICATIONS & PREFERENCES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('journey_reminder', 'preparation_alert', 'saved_facility_update', 'security_alert', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    journey_reminders BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_type VARCHAR(50) DEFAULT 'navigation' CHECK (feedback_type IN ('navigation', 'facility', 'ai_assistant', 'accessibility', 'general')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. AI CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Healthcare Navigation Chat',
    safety_flags_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    structured_response JSONB,
    safety_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. AUDIT LOGS (Security & Compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_facilities_type ON public.facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_facility_locations_geo ON public.facility_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_nav_sessions_user ON public.navigation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_nav_messages_session ON public.navigation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_facilities_user ON public.saved_facilities(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action);
