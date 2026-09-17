-- =====================================================================
-- CAREPATH AI - SEED DATA (VERIFIED HEALTHCARE DATA FIXTURES)
-- =====================================================================

-- 1. 14 CORE HEALTHCARE CATEGORIES (Multilingual: EN, TA, HI)
INSERT INTO public.healthcare_categories (id, name_en, name_ta, name_hi, description_en, description_ta, description_hi, icon_name, urgency_level, display_order)
VALUES
('primary_care', 'Primary Care', 'முதன்மை மருத்துவம்', 'प्राथमिक देखभाल', 'General health examinations, preventive visits, and routine health assessments.', 'பொது உடல்நலப் பரிசோதனைகள் மற்றும் தடுப்பு ஆலோசனைகள்.', 'सामान्य स्वास्थ्य जांच, निवारक देखभाल और नियमित स्वास्थ्य परामर्श।', 'Stethoscope', 'routine', 1),
('urgent_care', 'Urgent Care', 'அவசர சிகிச்சை', 'त्वरित देखभाल', 'Prompt care for non-life-threatening illnesses and minor injuries.', 'உயிருக்கு ஆபத்தில்லாத உடனடி சிகிச்சை தேவைப்படும் நிலைமைகள்.', 'गैर-जानलेवा बीमारियों और मामूली चोटों के लिए तत्काल उपचार।', 'Zap', 'urgent', 2),
('hospitals', 'Hospitals & Emergency', 'மருத்துவமனைகள் & அவசர பிரிவு', 'अस्पताल और आपातकालीन', '24/7 comprehensive medical centers equipped for emergency and surgical care.', 'அவசர மற்றும் அறுவை சிகிச்சைக்கான முழுமையான மருத்துவமனைகள்.', 'आपातकालीन और सर्जिकल देखभाल से सुसज्जित 24/7 व्यापक अस्पताल।', 'Building2', 'emergency', 3),
('specialists', 'Medical Specialists', 'சிறப்பு மருத்துவர்கள்', 'चिकित्सा विशेषज्ञ', 'Targeted specialist consultations (Cardiology, Dermatology, Neurology, Orthopedics).', 'இருதய, தோல், நரம்பியல் போன்ற சிறப்பு மருத்துவ ஆலோசனைகள்.', 'कार्डियोलॉजी, त्वचा रोग, न्यूरोलॉजी जैसे विशेष परामर्श।', 'UserCheck', 'routine', 4),
('diagnostics', 'Diagnostic Labs & Imaging', 'பரிசோதனை மையங்கள்', 'निदान प्रयोगशालाएं', 'Blood tests, pathology, MRI, CT scans, ultrasounds, and X-rays.', 'இரத்தப் பரிசோதனை, ஸ்கேன் மற்றும் எக்ஸ்ரே மையங்கள்.', 'रक्त परीक्षण, एक्स-रे, एमआरआई और पैथोलॉजी सेवाएं।', 'Microscope', 'routine', 5),
('pharmacies', 'Pharmacies & Prescriptions', 'மருந்தகங்கள்', 'फार्मेसी और दवाइयां', 'Dispensing medications, prescription counseling, and vaccines.', 'மருந்துகள் வழங்குதல் மற்றும் தடுப்பூசி சேவைகள்.', 'दवा वितरण, पर्चे पर परामर्श और टीकाकरण सेवाएं।', 'Pill', 'routine', 6),
('dental_care', 'Dental Care', 'பல் மருத்துவம்', 'दंत चिकित्सा', 'Oral examinations, hygiene, fillings, root canals, and orthodontic care.', 'பல் துலக்குதல், அடைத்தல் மற்றும் வாய்வழி மருத்துவ சேவைகள்.', 'दांतों की सफाई, फिलिंग और मौखिक स्वास्थ्य उपचार।', 'Smile', 'routine', 7),
('mental_health', 'Mental Health & Therapy', 'மனநல சேவைகள்', 'मानसिक स्वास्थ्य और थेरेपी', 'Counseling, psychiatry, stress management, and behavioral wellness.', 'மனநல ஆலோசனை மற்றும் உளவியல் சிகிச்சை சேவைகள்.', 'परामर्श, मनोचिकित्सा और भावनात्मक स्वास्थ्य सहायता।', 'HeartHandshake', 'routine', 8),
('womens_health', 'Women’s Health & Maternity', 'மகளிர் மருத்துவம்', 'महिला स्वास्थ्य और मातृत्व', 'Obstetrics, gynecology, prenatal monitoring, and reproductive wellness.', 'கர்ப்பகால பராமரிப்பு மற்றும் மகளிர் நோய் சிகிச்சை சேவைகள்.', 'प्रसूति, स्त्री रोग और प्रजनन स्वास्थ्य परामर्श।', 'Flower2', 'routine', 9),
('child_health', 'Pediatrics & Child Care', 'குழந்தைகள் மருத்துவம்', 'बाल चिकित्सा', 'Newborn checkups, vaccinations, developmental milestones, and pediatric care.', 'குழந்தைகளுக்கான தடுப்பூசிகள் மற்றும் வளர்ச்சி பரிசோதனைகள்.', 'बच्चों के स्वास्थ्य की जांच, टीकाकरण और बाल रोग विशेषज्ञ।', 'Baby', 'routine', 10),
('elder_care', 'Geriatrics & Elder Care', 'முதியோர் பராமரிப்பு', 'वृद्ध देखभाल', 'Specialized care for age-related chronic conditions and mobility support.', 'முதியோர்களுக்கான மருத்துவ மற்றும் இயக்கம் சார்ந்த ஆதரவு சேவைகள்.', 'आयु संबंधी दीर्घकालिक स्थितियों और गतिशीलता के लिए विशेषज्ञ देखभाल।', 'Users', 'routine', 11),
('rehabilitation', 'Physical Therapy & Rehab', 'இயன்முறை மருத்துவம்', 'पुनर्वास और फिजियोथेरेपी', 'Post-surgery recovery, physical therapy, and functional mobility restoration.', 'அறுவை சிகிச்சைக்குப் பிந்தைய உடற்பயிற்சி மற்றும் புனர்வாழ்வு சேவைகள்.', 'सर्जरी के बाद सुधार, भौतिक चिकित्सा और पुनर्वास।', 'Activity', 'routine', 12),
('telehealth', 'Telehealth & Online Consult', 'தொலைதூர மருத்துவம்', 'टेलीहेल्थ और ऑनलाइन परामर्श', 'Remote virtual navigation, video consultations, and digital triage.', 'வீட்டிலிருந்தே மருத்துவர்களிடம் தொலைபேசி அல்லது காணொளி ஆலோசனை.', 'डिजिटल वीडियो परामर्श और दूरस्थ स्वास्थ्य मार्गदर्शन।', 'Video', 'routine', 13),
('home_care', 'Home Healthcare & Nursing', 'வீட்டுப் பராமரிப்பு', 'गृह स्वास्थ्य देखभाल', 'In-home nursing, wound dressing, vital signs monitoring, and home therapy.', 'வீட்டில் வழங்கப்படும் செவிலியர் மற்றும் மருத்துவ கண்காணிப்பு சேவைகள்.', 'घर पर नर्सिंग देखभाल, घाव की ड्रेसिंग और निगरानी सेवाएं।', 'Home', 'routine', 14)
ON CONFLICT (id) DO NOTHING;

-- 2. VERIFIED REALISTIC FACILITIES
INSERT INTO public.facilities (id, name, facility_type, description, rating, verified, phone, email, website, emergency_available, wheelchair_accessible, languages_supported)
VALUES
('b0000001-0000-0000-0000-000000000001', 'MetroHealth Central Medical Center', 'Hospital', 'Comprehensive multi-specialty tertiary care hospital with 24/7 Level-1 Trauma Emergency Department.', 4.8, true, '+1 (555) 019-2834', 'info@metrohealth-central.org', 'https://metrohealth-central.example.org', true, true, ARRAY['English', 'Spanish', 'Tamil', 'Hindi']),
('b0000001-0000-0000-0000-000000000002', 'Riverdale Urgent Care & Walk-in', 'Urgent Care', 'Rapid diagnosis and care for sprains, lacerations, mild fevers, infections, and burns without an appointment.', 4.6, true, '+1 (555) 018-9921', 'contact@riverdaleurgent.com', 'https://riverdaleurgent.example.com', false, true, ARRAY['English', 'Hindi']),
('b0000001-0000-0000-0000-000000000003', 'Evergreen Family Primary Care', 'Clinic', 'Community clinic delivering holistic family medicine, routine wellness exams, and chronic disease guidance.', 4.9, true, '+1 (555) 014-7732', 'care@evergreenprimary.org', 'https://evergreenprimary.example.org', false, true, ARRAY['English', 'Tamil']),
('b0000001-0000-0000-0000-000000000004', 'Apex Diagnostic & Imaging Center', 'Diagnostic Center', 'High-field MRI, Low-dose CT scans, Digital X-Ray, 3D Mammography, and accredited pathology blood lab.', 4.7, true, '+1 (555) 017-3341', 'records@apexdiagnostic.com', 'https://apexdiagnostic.example.com', false, true, ARRAY['English', 'Spanish']),
('b0000001-0000-0000-0000-000000000005', 'Harmony Mental Health & Wellness', 'Mental Health Clinic', 'Confidential outpatient psychological counseling, psychiatric evaluation, and therapy for anxiety and stress.', 4.8, true, '+1 (555) 012-6677', 'intake@harmonymental.org', 'https://harmonymental.example.org', false, true, ARRAY['English', 'Hindi', 'Tamil']),
('b0000001-0000-0000-0000-000000000006', 'BrightSmile Family Dental', 'Dental Practice', 'Preventive dental cleaning, digital X-rays, cavity restoration, cosmetic orthodontics, and emergency tooth relief.', 4.7, true, '+1 (555) 016-5544', 'help@brightsmile.example.com', 'https://brightsmiledental.example.com', false, true, ARRAY['English'])
ON CONFLICT (id) DO NOTHING;

-- 3. FACILITY LOCATIONS
INSERT INTO public.facility_locations (facility_id, address_line1, city, state, postal_code, country, latitude, longitude, parking_info)
VALUES
('b0000001-0000-0000-0000-000000000001', '742 Evergreen Terrace, Medical District', 'Metropolis', 'NY', '10001', 'USA', 40.712776, -74.005974, 'Multi-level parking garage on North Wing. Free first 2 hours.'),
('b0000001-0000-0000-0000-000000000002', '125 River Street, Suite 100', 'Metropolis', 'NY', '10003', 'USA', 40.729100, -73.996500, 'Surface parking lot adjacent to entrance.'),
('b0000001-0000-0000-0000-000000000003', '404 Oak Avenue, Suite 2B', 'Metropolis', 'NY', '10014', 'USA', 40.733500, -74.002800, 'Designated patient parking in rear of building.'),
('b0000001-0000-0000-0000-000000000004', '890 Innovation Parkway, Tower 1', 'Metropolis', 'NY', '10022', 'USA', 40.758900, -73.971200, 'Underground validated parking with elevator access.'),
('b0000001-0000-0000-0000-000000000005', '55 Peace Plaza, Suite 400', 'Metropolis', 'NY', '10016', 'USA', 40.748400, -73.985700, 'Street parking and garage across the street.'),
('b0000001-0000-0000-0000-000000000006', '310 Broadway Avenue', 'Metropolis', 'NY', '10007', 'USA', 40.715000, -74.007000, 'Valet parking available at entrance.')
ON CONFLICT (facility_id) DO NOTHING;

-- 4. DOCUMENT CATEGORIES
INSERT INTO public.document_categories (id, name, description)
VALUES
('lab_reports', 'Laboratory & Blood Tests', 'Blood test results, metabolic panels, lipid panels, pathology.'),
('prescriptions', 'Prescriptions & Medications', 'Doctor medication orders, pharmacy dispensing instructions.'),
('imaging_scans', 'Imaging & Scans', 'MRI, X-Ray, Ultrasound, CT radiology reports and notes.'),
('referrals', 'Doctor Referrals & Consultations', 'Referral letters to specialists and hospital admission notes.'),
('discharge_summaries', 'Discharge Summaries', 'Summaries after hospital or surgical center discharge.')
ON CONFLICT (id) DO NOTHING;
