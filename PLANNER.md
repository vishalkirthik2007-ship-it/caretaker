# CarePath AI - Production Implementation Plan & Architecture Specification

**CarePath AI** is an enterprise-grade AI Healthcare Navigation Platform designed to guide public users to the right care and the right next step—safely, ethically, and securely.

The platform strictly adheres to medical navigation ethics: **it never diagnoses, never prescribes, never claims to be a doctor, and always prioritizes user safety, privacy, and emergency escalations.**

---

## 1. System Architecture & Project Structure

```
/
├── app/                              # Next.js 14 App Router
│   ├── (auth)/                       # Auth routes: login, register, forgot-password, reset-password, verify
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/                  # User dashboard & core workflows
│   │   ├── dashboard/page.tsx        # Main personalized landing
│   │   ├── find-care/page.tsx        # Healthcare service finder & category search
│   │   ├── facilities/               # Facility directory & details [id]
│   │   ├── map/page.tsx              # Interactive map view
│   │   ├── assistant/page.tsx        # AI CarePath conversational assistant
│   │   ├── journey/page.tsx          # Visual healthcare journey manager & checklists
│   │   ├── documents/page.tsx        # Secure Document Vault & Document AI explainer
│   │   ├── family/page.tsx           # Family Care profiles & permissions
│   │   └── settings/page.tsx         # Account, Language, Accessibility, Privacy, Security
│   ├── admin/page.tsx                # Dedicated Admin Portal (Facilities, AI monitor, Audit)
│   ├── manifest.json                 # PWA Manifest
│   ├── layout.tsx                    # Root layout with Theme, i18n, Accessibility, Toaster
│   └── page.tsx                      # Public landing page with SEO tags
├── components/                       # Shared UI & Feature components
│   ├── ui/                           # Button, Card, Dialog/Modal, Badge, Input, Skeleton
│   └── layout/                       # Header, Desktop Sidebar, Mobile Bottom Nav, Emergency Modal
├── hooks/                            # Custom state hooks (Language, Accessibility)
├── lib/                              # Shared libraries & business logic
│   ├── supabase/                     # Client, Server, and Middleware Supabase helpers
│   ├── ai/                           # AIService interface, LLM provider, Safety Engine, Triage
│   ├── i18n/                         # Dictionaries for English, Tamil (தமிழ்), Hindi (हिंदी)
│   ├── security/                     # Rate limiting, CSRF, input sanitization, file validator
│   ├── data/                         # Mock data fixtures & repository layer
│   └── utils.ts                      # Distance calculations, date formatting, cn helper
├── database/                         # Database migrations & schemas
│   ├── schema.sql                    # Full PostgreSQL normalized schema (25+ tables)
│   ├── rls_policies.sql              # Supabase Row Level Security rules
│   └── seed.sql                      # Verified facility fixtures & initial categories
├── public/                           # Static assets, PWA manifest, and app icons
├── PLANNER.md                        # Master architectural plan & system documentation
└── next.config.mjs / package.json
```

---

## 2. Core Functional Pillars

### Phase 1: Foundation & Database
- 25+ normalized PostgreSQL tables (`profiles`, `user_preferences`, `consents`, `healthcare_categories`, `healthcare_services`, `facilities`, `facility_locations`, `facility_services`, `facility_hours`, `saved_facilities`, `navigation_sessions`, `navigation_steps`, `documents`, `family_profiles`, `ai_conversations`, `audit_logs`).
- Row Level Security (RLS) policies guaranteeing zero-leakage patient isolation.

### Phase 2: AI Safety Layer & Triage
- Mandatory emergency red-flag triage detection (stroke symptoms, severe chest pain, choking, uncontrolled bleeding).
- Non-diagnostic clinical safety boundaries.
- Structured response architecture: Understanding, Recommended Service Category, Why, 4 Next Steps, and Safety Notice.

### Phase 3: Directory, Facilities & Interactive Map
- 14 core healthcare categories mapped to natural language queries.
- Verified facility roster with distance filtering (Haversine formula), opening hours, wheelchair accessibility, and 24/7 emergency indicators.
- Interactive map view with current location sensing, pin markers, and facility detail preview cards.

### Phase 4: Journey & Appointment Preparation
- 6-step visual navigation pipeline: Goal → Service → Facility → Preparation → Visit → Follow-up.
- Customizable appointment checklists.
- AI Doctor Questions Generator (categorized into Understanding, Tests/Procedures, and Next Steps).

### Phase 5: Privacy, Security & Accessibility
- Encrypted Document Vault with MIME validation and Document AI plain-language translation.
- Family Care profiles with isolated records and emergency contact linking.
- CarePath Easy Mode (52px+ touch targets, font scaling, high-contrast borders).
- Multilingual dictionaries for English, Tamil, and Hindi.
- Privacy Center with complete JSON personal data export and permanent account purge.
- Admin Portal for facility verification and safety monitoring.
