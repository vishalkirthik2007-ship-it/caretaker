# CarePath AI (Caretaker) 🏥

> **Find the right care. Take the right next step.**  
> An AI-driven healthcare navigation platform guiding patients in India to verified medical facilities, care categories, and practical appointment preparation.

---

## 🌟 Key Features

### 1. Dedicated Onboarding & Healthcare Identity
* **Indian Mobile Validation**: `+91` 10-digit mobile number validation for healthcare alerts.
* **Encrypted Health Profile**: Record relevant medical conditions, allergies, and emergency contacts with zero public disclosure.
* **Returning User Recognition**: Automatic profile detection and 1-click quick restoration.

### 2. Comprehensive App Personalization
* **Dynamic Greetings**: Time-aware greetings personalized with the user's name (*"Good morning, Vishal"*).
* **Profile Photo / DP**: Custom circular avatar with real-time base64 image persistence and upload badge.
* **Contextual Health Guidance**: Proactive alerts and checklist recommendations based on user-recorded conditions and location.

### 3. Dedicated User Details Page (`/profile`)
* View and edit all personal, contact, and emergency details.
* Upload, update, or remove profile photos.
* Clean logout action with instant session purging.

### 4. 25+ Indian Healthcare Categories & Verified Institutions
* Full coverage across 25 medical disciplines: Emergency & Trauma, Cardiology, Oncology, Neurology, Orthopaedics, PM Jan Aushadhi & Generic Pharmacies, NABL Diagnostic Pathology, Blood Banks, and AYUSH.
* Verified institutions: AIIMS New Delhi, Apollo Greams Road Chennai, CMC Vellore, Tata Memorial Mumbai, NIMHANS Bengaluru, PGIMER Chandigarh, and more.
* **Clickable Facility Cards**: Direct routing to facility detail profiles with Google Maps directions, OPD hours, and emergency hotlines.

### 5. Google Maps-Style Interactive Map Hub (`/map`)
* GPS geolocation detection.
* City switcher across major Indian hubs (Chennai, Bengaluru, Delhi NCR, Mumbai, Hyderabad, Kolkata, Vellore).
* Distance calculation and simulated real-time road traffic ETAs.

### 6. AI Triage & Indian Emergency Protocols
* Non-diagnostic triage powered by Google Gemini and localized clinical decision trees.
* National emergency response integration: **108** (Ambulance), **112** (Emergency), **102** (Maternal/Child), and **14416** (Tele-MANAS Mental Health).

### 7. User-Isolated Document Vault (`/documents`)
* Medical records, prescriptions, and lab reports securely partitioned by active user ID.

### 8. Light + Dark Mode
* System-wide theme engine with dark slate (`#0B1120`) surfaces, elevated cards, and emerald accents.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS, CSS Custom Properties (Theme Engine)
* **Icons**: Lucide React
* **AI Engine**: Google Gemini API (`@google/genai` / REST)
* **Database / Backend**: Supabase / PostgreSQL schema with Row-Level Security

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/vishalkirthik2007-ship-it/caretaker.git
cd caretaker
npm install
```

### 2. Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL_NAME=gemini-1.5-flash
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Clinical Safety Disclaimer
CarePath AI is an educational navigation platform. It does not provide medical diagnoses, write prescriptions, or replace consultation with certified healthcare professionals. In life-threatening emergencies, dial **108** or **112** immediately.
