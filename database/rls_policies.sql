-- =====================================================================
-- CAREPATH AI - ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all user-scoped and private tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read-only tables (Categories, Services, Facilities, Hours, Locations, Categories)
ALTER TABLE public.healthcare_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC DIRECTORY POLICIES (All authenticated & anon users can read verified facilities & services)
CREATE POLICY "Allow public read of categories" ON public.healthcare_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read of active services" ON public.healthcare_services FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read of verified facilities" ON public.facilities FOR SELECT USING (verified = true OR (auth.jwt() ->> 'is_admin')::boolean = true);
CREATE POLICY "Allow public read of facility locations" ON public.facility_locations FOR SELECT USING (true);
CREATE POLICY "Allow public read of facility services" ON public.facility_services FOR SELECT USING (true);
CREATE POLICY "Allow public read of facility hours" ON public.facility_hours FOR SELECT USING (true);
CREATE POLICY "Allow public read of doc categories" ON public.document_categories FOR SELECT USING (true);

-- 2. PROFILES POLICY
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- 3. USER PREFERENCES
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- 4. CONSENTS
CREATE POLICY "Users can manage own consents" ON public.consents FOR ALL USING (auth.uid() = user_id);

-- 5. SAVED FACILITIES
CREATE POLICY "Users can manage saved facilities" ON public.saved_facilities FOR ALL USING (auth.uid() = user_id);

-- 6. NAVIGATION SESSIONS & MESSAGES & STEPS
CREATE POLICY "Users can manage own navigation sessions" ON public.navigation_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own navigation messages" ON public.navigation_messages FOR ALL
USING (EXISTS (SELECT 1 FROM public.navigation_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

CREATE POLICY "Users can manage own navigation steps" ON public.navigation_steps FOR ALL
USING (EXISTS (SELECT 1 FROM public.navigation_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

-- 7. APPOINTMENT NOTES & CHECKLISTS
CREATE POLICY "Users can manage own appointment notes" ON public.appointment_notes FOR ALL USING (auth.uid() = user_id);

-- 8. QUESTIONS FOR PROFESSIONALS
CREATE POLICY "Users can manage own question lists" ON public.question_lists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own questions" ON public.questions FOR ALL
USING (EXISTS (SELECT 1 FROM public.question_lists ql WHERE ql.id = list_id AND ql.user_id = auth.uid()));

-- 9. DOCUMENTS (VAULT PRIVACY)
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- 10. FAMILY PROFILES
CREATE POLICY "Users can manage family profiles" ON public.family_profiles FOR ALL USING (auth.uid() = primary_user_id);

-- 11. NOTIFICATIONS
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);

-- 12. AI CONVERSATIONS & MESSAGES
CREATE POLICY "Users can manage own AI conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI messages" ON public.ai_messages FOR ALL
USING (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

-- 13. AUDIT LOGS (Read-only to admins, insert allowed from authenticated server actions)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING ((auth.jwt() ->> 'is_admin')::boolean = true);
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- 14. ADMIN FACILITY MANAGEMENT
CREATE POLICY "Admins can insert facilities" ON public.facilities FOR INSERT WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);
CREATE POLICY "Admins can update facilities" ON public.facilities FOR UPDATE USING ((auth.jwt() ->> 'is_admin')::boolean = true);
CREATE POLICY "Admins can delete facilities" ON public.facilities FOR DELETE USING ((auth.jwt() ->> 'is_admin')::boolean = true);
