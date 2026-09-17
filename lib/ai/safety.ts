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
  'overdose',
  'severe allergic reaction',
  'anaphylaxis',
  'swollen tongue and throat',
  'sudden loss of vision',
  'coughing up blood',
  'severe head trauma',
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
      emergencyCategory: 'Acute Emergency Medical Escalation',
      recommendedAction:
        'Call national emergency dispatch immediately (112 / 911 / 108) or proceed to the nearest Emergency Department.',
      flaggedKeywords: matchedFlags,
    };
  }

  return {
    isEmergency: false,
    recommendedAction: 'Standard healthcare navigation workflow',
    flaggedKeywords: [],
  };
}

/**
 * Maps natural language user inputs to appropriate healthcare service categories
 */
export function mapQueryToCategory(query: string): {
  categoryId: string;
  categoryName: string;
  urgency: 'routine' | 'urgent' | 'emergency';
} {
  const q = query.toLowerCase();

  if (
    q.includes('chest') ||
    q.includes('unconscious') ||
    q.includes('stroke') ||
    q.includes('bleed') ||
    q.includes('emergency') ||
    q.includes('ambulance') ||
    q.includes('severe burn')
  ) {
    return {
      categoryId: 'hospitals',
      categoryName: 'Hospitals & Emergency Trauma Care',
      urgency: 'emergency',
    };
  }

  if (
    q.includes('urgent') ||
    q.includes('sprain') ||
    q.includes('cut') ||
    q.includes('fever') ||
    q.includes('mild burn') ||
    q.includes('walk in') ||
    q.includes('today') ||
    q.includes('flu')
  ) {
    return {
      categoryId: 'urgent_care',
      categoryName: 'Urgent Care & Walk-in Clinics',
      urgency: 'urgent',
    };
  }

  if (
    q.includes('skin') ||
    q.includes('rash') ||
    q.includes('derma') ||
    q.includes('eczema') ||
    q.includes('acne')
  ) {
    return {
      categoryId: 'specialists',
      categoryName: 'Dermatology & Skin Specialists',
      urgency: 'routine',
    };
  }

  if (
    q.includes('heart') ||
    q.includes('palpitation') ||
    q.includes('cardio') ||
    q.includes('hypertension') ||
    q.includes('blood pressure')
  ) {
    return {
      categoryId: 'specialists',
      categoryName: 'Cardiology & Heart Specialists',
      urgency: 'routine',
    };
  }

  if (
    q.includes('tooth') ||
    q.includes('teeth') ||
    q.includes('dental') ||
    q.includes('gum') ||
    q.includes('dentist')
  ) {
    return {
      categoryId: 'dental_care',
      categoryName: 'Dental Care & Oral Health',
      urgency: 'routine',
    };
  }

  if (
    q.includes('lab') ||
    q.includes('blood test') ||
    q.includes('mri') ||
    q.includes('ct scan') ||
    q.includes('x-ray') ||
    q.includes('xray') ||
    q.includes('scan') ||
    q.includes('ultrasound') ||
    q.includes('diagnostic')
  ) {
    return {
      categoryId: 'diagnostics',
      categoryName: 'Diagnostic Labs & Imaging Centers',
      urgency: 'routine',
    };
  }

  if (
    q.includes('mental') ||
    q.includes('stress') ||
    q.includes('anxiety') ||
    q.includes('depression') ||
    q.includes('therapy') ||
    q.includes('psychiatrist') ||
    q.includes('counselor')
  ) {
    return {
      categoryId: 'mental_health',
      categoryName: 'Mental Health & Behavioral Therapy',
      urgency: 'routine',
    };
  }

  if (
    q.includes('pregnant') ||
    q.includes('pregnancy') ||
    q.includes('maternity') ||
    q.includes('gynecol') ||
    q.includes('prenatal') ||
    q.includes('women')
  ) {
    return {
      categoryId: 'womens_health',
      categoryName: 'Women’s Health & Maternity',
      urgency: 'routine',
    };
  }

  if (
    q.includes('child') ||
    q.includes('baby') ||
    q.includes('pediatric') ||
    q.includes('infant') ||
    q.includes('vaccine for baby')
  ) {
    return {
      categoryId: 'child_health',
      categoryName: 'Pediatrics & Child Care',
      urgency: 'routine',
    };
  }

  if (
    q.includes('elder') ||
    q.includes('senior') ||
    q.includes('geriatric') ||
    q.includes('dementia') ||
    q.includes('fall')
  ) {
    return {
      categoryId: 'elder_care',
      categoryName: 'Geriatrics & Elder Care',
      urgency: 'routine',
    };
  }

  if (
    q.includes('physio') ||
    q.includes('rehab') ||
    q.includes('physical therapy') ||
    q.includes('post surgery recovery')
  ) {
    return {
      categoryId: 'rehabilitation',
      categoryName: 'Physical Therapy & Rehabilitation',
      urgency: 'routine',
    };
  }

  if (
    q.includes('pharmacy') ||
    q.includes('medicine') ||
    q.includes('prescription refill') ||
    q.includes('chemist') ||
    q.includes('drugs')
  ) {
    return {
      categoryId: 'pharmacies',
      categoryName: 'Pharmacies & Prescriptions',
      urgency: 'routine',
    };
  }

  if (
    q.includes('online') ||
    q.includes('video call') ||
    q.includes('telehealth') ||
    q.includes('virtual')
  ) {
    return {
      categoryId: 'telehealth',
      categoryName: 'Telehealth & Virtual Care',
      urgency: 'routine',
    };
  }

  // Default fallback
  return {
    categoryId: 'primary_care',
    categoryName: 'Primary Care & General Practice',
    urgency: 'routine',
  };
}

/**
 * Creates structured clinical navigation responses strictly conforming to product constraints
 */
export function generateStructuredNavigationResponse(
  userQuery: string
): AIStructuredResponse {
  const triage = checkEmergencyTriage(userQuery);

  if (triage.isEmergency) {
    return {
      understanding: `You have mentioned acute symptoms indicating possible immediate medical distress (${triage.flaggedKeywords.join(
        ', '
      )}).`,
      possibleServiceCategory: 'Emergency Medical Department / Trauma Center',
      categoryId: 'hospitals',
      why: 'Acute, sudden, or severe symptoms require physical, immediate hospital-grade intervention and vital stabilization.',
      nextSteps: [
        'Immediately dial national emergency services (112 / 911 / 108).',
        'Have someone nearby stay with you and keep your airway clear.',
        'Do not drive yourself if you are feeling dizzy, faint, or experiencing chest discomfort.',
        'Locate the nearest open 24/7 Hospital Emergency Trauma Center.',
      ],
      importantSafetyMessage:
        'CRITICAL: This platform is not an emergency response provider. Please do not delay seeking professional emergency services.',
      isEmergency: true,
      emergencyHotline: '112 / 911 / 108',
      suggestedQuestions: [
        'What is your estimated ambulance arrival time?',
        'Which hospital emergency room has immediate cardiac/trauma capacity?',
      ],
    };
  }

  const mapped = mapQueryToCategory(userQuery);

  return {
    understanding: `You are looking for assistance regarding: "${userQuery}". You appear to need navigation guidance to the appropriate care setting.`,
    possibleServiceCategory: mapped.categoryName,
    categoryId: mapped.categoryId,
    why: `Based on your request, ${mapped.categoryName} specializes in evaluating, diagnosing, and coordinating treatment for these specific concerns.`,
    nextSteps: [
      'Find an appropriate verified facility matching your location and accessibility needs.',
      'Check available clinic hours and whether walk-ins or scheduled appointments are preferred.',
      'Prepare relevant medical history, previous test results, and current medication list.',
      'Contact the qualified healthcare professional at the selected facility for an in-person assessment.',
    ],
    importantSafetyMessage:
      'CarePath AI provides navigation information only and does not offer clinical diagnoses or medical advice. Always consult a licensed healthcare professional for medical concerns.',
    isEmergency: false,
    suggestedQuestions: [
      'What symptoms or changes should I observe and write down before my visit?',
      'Are there any pre-visit requirements such as fasting or stopping specific supplements?',
      'What documents or previous test records should I bring along?',
    ],
  };
}
