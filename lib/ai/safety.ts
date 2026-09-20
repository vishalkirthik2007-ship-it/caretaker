import { AIStructuredResponse } from '@/types';

export interface TriageResult {
  isEmergency: boolean;
  emergencyCategory?: string;
  recommendedAction: string;
  flaggedKeywords: string[];
}

const EMERGENCY_RED_FLAGS = [
  'chest pain',
  'crushing chest',
  'heart attack',
  'stroke',
  'facial droop',
  'slurred speech',
  'cannot breathe',
  'severe shortness of breath',
  'choking',
  'heavy bleeding',
  'uncontrolled hemorrhage',
  'unconscious',
  'loss of consciousness',
  'seizure',
  'fits',
  'overdose',
  'poisoning',
  'snake bite',
  'severe allergic reaction',
  'anaphylaxis',
  'swollen tongue and throat',
  'sudden loss of vision',
  'coughing up blood',
  'severe head trauma',
  'accident',
  'suicidal',
];

/**
 * Evaluates input text for high-acuity emergency indicators
 */
export function checkEmergencyTriage(input: string): TriageResult {
  const normalized = input.toLowerCase();
  const matchedFlags: string[] = [];

  for (const flag of EMERGENCY_RED_FLAGS) {
    if (normalized.includes(flag)) {
      matchedFlags.push(flag);
    }
  }

  if (matchedFlags.length > 0) {
    return {
      isEmergency: true,
      emergencyCategory: 'Acute Emergency Medical Escalation (India 112 / 108)',
      recommendedAction:
        'Call national emergency ambulance immediately (Dial 108 or 112) or proceed to the nearest 24/7 Hospital Casualty / Emergency Department.',
      flaggedKeywords: matchedFlags,
    };
  }

  return {
    isEmergency: false,
    recommendedAction: 'Standard Indian healthcare navigation workflow',
    flaggedKeywords: [],
  };
}

/**
 * Maps natural language user inputs to appropriate Indian healthcare service categories
 */
export function mapQueryToCategory(query: string): {
  categoryId: string;
  categoryName: string;
  urgency: 'routine' | 'urgent' | 'emergency';
} {
  const q = query.toLowerCase();

  // Emergency / Trauma
  if (
    q.includes('chest') ||
    q.includes('unconscious') ||
    q.includes('stroke') ||
    q.includes('bleed') ||
    q.includes('emergency') ||
    q.includes('ambulance') ||
    q.includes('severe burn') ||
    q.includes('casualty') ||
    q.includes('trauma') ||
    q.includes('accident') ||
    q.includes('snake bite')
  ) {
    return {
      categoryId: 'emergency_trauma',
      categoryName: 'Emergency & Trauma Care (24/7 Casualty)',
      urgency: 'emergency',
    };
  }

  // Cardiology
  if (
    q.includes('heart') ||
    q.includes('palpitation') ||
    q.includes('cardio') ||
    q.includes('hypertension') ||
    q.includes('blood pressure') ||
    q.includes('bp') ||
    q.includes('cholesterol')
  ) {
    return {
      categoryId: 'cardiology',
      categoryName: 'Cardiology & Heart Care',
      urgency: 'urgent',
    };
  }

  // Oncology
  if (
    q.includes('cancer') ||
    q.includes('tumor') ||
    q.includes('tumour') ||
    q.includes('oncology') ||
    q.includes('chemo') ||
    q.includes('radiation') ||
    q.includes('biopsy')
  ) {
    return {
      categoryId: 'oncology',
      categoryName: 'Oncology & Cancer Care',
      urgency: 'routine',
    };
  }

  // Neurology
  if (
    q.includes('headache') ||
    q.includes('migraine') ||
    q.includes('neuro') ||
    q.includes('seizure') ||
    q.includes('vertigo') ||
    q.includes('spine') ||
    q.includes('paralysis') ||
    q.includes('nerve')
  ) {
    return {
      categoryId: 'neurology',
      categoryName: 'Neurology & Neurosurgery',
      urgency: 'routine',
    };
  }

  // Orthopaedics
  if (
    q.includes('bone') ||
    q.includes('fracture') ||
    q.includes('joint') ||
    q.includes('knee') ||
    q.includes('ortho') ||
    q.includes('back pain') ||
    q.includes('shoulder') ||
    q.includes('ligament') ||
    q.includes('sprain')
  ) {
    return {
      categoryId: 'orthopaedics',
      categoryName: 'Orthopaedics & Joint Care',
      urgency: 'routine',
    };
  }

  // Paediatrics
  if (
    q.includes('child') ||
    q.includes('baby') ||
    q.includes('pediatric') ||
    q.includes('paediatric') ||
    q.includes('infant') ||
    q.includes('kid') ||
    q.includes('vaccine for child')
  ) {
    return {
      categoryId: 'paediatrics',
      categoryName: 'Paediatrics & Child Health',
      urgency: 'routine',
    };
  }

  // Maternity & Women's Health
  if (
    q.includes('pregnant') ||
    q.includes('pregnancy') ||
    q.includes('maternity') ||
    q.includes('gynecol') ||
    q.includes('prenatal') ||
    q.includes('delivery') ||
    q.includes('women') ||
    q.includes('pcos') ||
    q.includes('period')
  ) {
    return {
      categoryId: 'maternity_womens',
      categoryName: 'Maternity, Obstetrics & Gynaecology',
      urgency: 'routine',
    };
  }

  // Ophthalmology / Eye Care
  if (
    q.includes('eye') ||
    q.includes('vision') ||
    q.includes('cataract') ||
    q.includes('glasses') ||
    q.includes('ophthalm') ||
    q.includes('blind') ||
    q.includes('spectacle')
  ) {
    return {
      categoryId: 'ophthalmology',
      categoryName: 'Ophthalmology & Eye Care',
      urgency: 'routine',
    };
  }

  // ENT
  if (
    q.includes('ear') ||
    q.includes('nose') ||
    q.includes('throat') ||
    q.includes('ent') ||
    q.includes('sinus') ||
    q.includes('hearing') ||
    q.includes('tonsil')
  ) {
    return {
      categoryId: 'ent',
      categoryName: 'ENT (Ear, Nose & Throat)',
      urgency: 'routine',
    };
  }

  // Dermatology
  if (
    q.includes('skin') ||
    q.includes('rash') ||
    q.includes('derma') ||
    q.includes('itching') ||
    q.includes('allergy on skin') ||
    q.includes('acne') ||
    q.includes('pimples')
  ) {
    return {
      categoryId: 'dermatology',
      categoryName: 'Dermatology & Skin Care',
      urgency: 'routine',
    };
  }

  // Dental
  if (
    q.includes('tooth') ||
    q.includes('teeth') ||
    q.includes('dental') ||
    q.includes('gum') ||
    q.includes('dentist') ||
    q.includes('root canal') ||
    q.includes('cavity')
  ) {
    return {
      categoryId: 'dental',
      categoryName: 'Dental & Oral Health Clinics',
      urgency: 'routine',
    };
  }

  // Psychiatry / Mental Health
  if (
    q.includes('mental') ||
    q.includes('stress') ||
    q.includes('anxiety') ||
    q.includes('depression') ||
    q.includes('therapy') ||
    q.includes('psychiatrist') ||
    q.includes('counselor') ||
    q.includes('tele-manas')
  ) {
    return {
      categoryId: 'psychiatry',
      categoryName: 'Psychiatry & Mental Healthcare (Tele-MANAS)',
      urgency: 'routine',
    };
  }

  // Nephrology & Dialysis
  if (
    q.includes('kidney') ||
    q.includes('dialysis') ||
    q.includes('nephro') ||
    q.includes('creatinine') ||
    q.includes('urea')
  ) {
    return {
      categoryId: 'nephrology',
      categoryName: 'Nephrology & Dialysis Care',
      urgency: 'urgent',
    };
  }

  // Urology
  if (
    q.includes('stone') ||
    q.includes('kidney stone') ||
    q.includes('urine') ||
    q.includes('uti') ||
    q.includes('prostate') ||
    q.includes('uro')
  ) {
    return {
      categoryId: 'urology',
      categoryName: 'Urology & Men’s Health',
      urgency: 'routine',
    };
  }

  // Pulmonology
  if (
    q.includes('cough') ||
    q.includes('asthma') ||
    q.includes('breath') ||
    q.includes('wheezing') ||
    q.includes('lung') ||
    q.includes('pulmon') ||
    q.includes('tb') ||
    q.includes('tuberculosis')
  ) {
    return {
      categoryId: 'pulmonology',
      categoryName: 'Pulmonology & Respiratory Medicine',
      urgency: 'routine',
    };
  }

  // Diagnostic Labs & Imaging
  if (
    q.includes('lab') ||
    q.includes('blood test') ||
    q.includes('mri') ||
    q.includes('ct scan') ||
    q.includes('x-ray') ||
    q.includes('xray') ||
    q.includes('scan') ||
    q.includes('ultrasound') ||
    q.includes('diagnostic') ||
    q.includes('pathology') ||
    q.includes('nabl')
  ) {
    return {
      categoryId: 'diagnostics',
      categoryName: 'Diagnostic Centres & NABL Labs',
      urgency: 'routine',
    };
  }

  // Pharmacies
  if (
    q.includes('pharmacy') ||
    q.includes('medicine') ||
    q.includes('chemist') ||
    q.includes('jan aushadhi') ||
    q.includes('generic') ||
    q.includes('tablets')
  ) {
    return {
      categoryId: 'pharmacies',
      categoryName: 'Pharmacies & Jan Aushadhi Kendras',
      urgency: 'routine',
    };
  }

  // Blood Banks
  if (
    q.includes('blood bank') ||
    q.includes('donate blood') ||
    q.includes('plasma') ||
    q.includes('platelet')
  ) {
    return {
      categoryId: 'blood_banks',
      categoryName: 'Blood Banks & Plasma Donation Centers',
      urgency: 'emergency',
    };
  }

  // Ambulance
  if (
    q.includes('108') ||
    q.includes('102') ||
    q.includes('call ambulance')
  ) {
    return {
      categoryId: 'ambulance_services',
      categoryName: 'Ambulance & Emergency Dispatch (108 / 112)',
      urgency: 'emergency',
    };
  }

  // Government Hospitals
  if (
    q.includes('government') ||
    q.includes('govt') ||
    q.includes('gh') ||
    q.includes('civil hospital') ||
    q.includes('ayushman') ||
    q.includes('pmjay')
  ) {
    return {
      categoryId: 'government_hospitals',
      categoryName: 'Government & District Civil Hospitals',
      urgency: 'routine',
    };
  }

  // Default: General Medicine & Family Physicians
  return {
    categoryId: 'general_medicine',
    categoryName: 'General Medicine & Family Physicians',
    urgency: 'routine',
  };
}

/**
 * Creates structured clinical navigation responses strictly conforming to Indian healthcare constraints
 */
export function generateStructuredNavigationResponse(
  userQuery: string,
  userProfile?: { fullName?: string; city?: string; healthConditions?: string }
): AIStructuredResponse {
  const triage = checkEmergencyTriage(userQuery);

  if (triage.isEmergency) {
    return {
      understanding: `You have described acute medical symptoms (${triage.flaggedKeywords.join(
        ', '
      )}) that indicate a potential life-threatening emergency.`,
      possibleServiceCategory: 'Emergency & Trauma Care (24/7 Casualty)',
      categoryId: 'emergency_trauma',
      why: 'Acute, sudden, or severe trauma symptoms require immediate emergency hospital casualty stabilization with oxygen, monitoring, and trained trauma physicians.',
      nextSteps: [
        'Immediately call National Emergency Ambulance Dispatch (Dial 108 or 112).',
        'If safe and conscious, have a family member or neighbor escort you to the nearest 24/7 Hospital Casualty / Trauma Center.',
        'Keep the patient sitting or resting with clear airway; do not attempt to drive alone.',
        'Inform the casualty triage nurse immediately upon arrival for priority attention.',
      ],
      importantSafetyMessage:
        'CRITICAL SAFETY NOTICE: CarePath AI is an educational navigation platform and NEVER replaces emergency healthcare services. In medical distress, call 108 or 112 without delay.',
      isEmergency: true,
      emergencyHotline: '108 / 112',
      suggestedQuestions: [
        'What is the estimated ambulance arrival time to my current location?',
        'Which nearby tertiary hospital has immediate cardiac and ICU bed availability?',
      ],
    };
  }

  const mapped = mapQueryToCategory(userQuery);
  const cityMention = userProfile?.city ? ` in ${userProfile.city}` : ' in your city';
  const nameGreeting = userProfile?.fullName ? `Hello ${userProfile.fullName.split(' ')[0]}, you` : 'You';

  const personalizedNextSteps = [
    `Locate an accredited hospital or clinic${cityMention} matching your healthcare needs.`,
    'Confirm OPD (Outpatient Department) consultation hours or book an appointment token.',
    'Carry your previous medical records, current prescriptions, and government photo ID / Ayushman Bharat card.',
  ];

  if (userProfile?.healthConditions) {
    personalizedNextSteps.push(
      `Mention your active health background (${userProfile.healthConditions}) to the attending doctor for comprehensive evaluation.`
    );
  } else {
    personalizedNextSteps.push(
      'Consult a licensed medical specialist for thorough clinical evaluation and treatment.'
    );
  }

  return {
    understanding: `${nameGreeting} are seeking healthcare guidance regarding "${userQuery}". This corresponds to outpatient or specialized care${cityMention}.`,
    possibleServiceCategory: mapped.categoryName,
    categoryId: mapped.categoryId,
    why: `For these symptoms, ${mapped.categoryName} provides verified clinical evaluation, diagnostic tests, and tailored care protocols.`,
    nextSteps: personalizedNextSteps,
    importantSafetyMessage:
      'CarePath AI is an educational navigation platform. It does not provide medical diagnoses, write prescriptions, or replace consultation with a qualified doctor. Always seek professional healthcare advice.',
    isEmergency: false,
    suggestedQuestions: [
      'What symptoms or triggers should I track in a notebook before my OPD visit?',
      'Are there any fasting or laboratory prerequisites before visiting the doctor?',
      'Can I request cost-effective generic medicine equivalents (Jan Aushadhi) for this condition?',
    ],
  };
}
