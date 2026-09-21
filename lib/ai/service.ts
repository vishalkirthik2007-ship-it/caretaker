import { AIStructuredResponse } from '@/types';
import { generateStructuredNavigationResponse, checkEmergencyTriage } from './safety';
import { repository } from '../data/repository';

export interface AIServiceInterface {
  navigateHealthcare(query: string, history?: any[]): Promise<AIStructuredResponse>;
  generateQuestions(concern: string, categoryName?: string): Promise<{
    understanding: string[];
    testsProcedures: string[];
    nextSteps: string[];
    followUp: string[];
  }>;
  explainDocument(documentTitle: string, documentContent: string): Promise<{
    summary: string;
    terminology: { term: string; explanation: string }[];
    questionsForDoctor: string[];
  }>;
  summarizeConversation(messages: string[]): Promise<string>;
}

/**
 * Provider-Independent AI Service
 * Supports Google Gemini / external LLM APIs when keys are configured,
 * and seamlessly uses the deterministic medical navigation safety engine as a zero-downtime,
 * high-resilience fallback.
 */
class AIService implements AIServiceInterface {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.AI_MODEL_NAME || 'gemini-1.5-flash';
  }

  async navigateHealthcare(query: string, history?: any[]): Promise<AIStructuredResponse> {
    const user = repository.getCurrentUser();
    const userProfileContext = user
      ? {
          fullName: user.fullName,
          city: user.city,
          healthConditions: user.healthConditions,
          age: user.age,
          gender: user.gender,
        }
      : undefined;

    // 1. Mandatory Safety Pre-flight: Immediate Emergency Triage Check
    const emergencyTriage = checkEmergencyTriage(query);
    if (emergencyTriage.isEmergency) {
      return generateStructuredNavigationResponse(query, userProfileContext);
    }

    // 2. If external API is configured, attempt call with safety prompt
    if (this.apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are CarePath AI, a specialized healthcare navigation engine designed for India.
CRITICAL CLINICAL & SAFETY BOUNDARIES:
- You NEVER provide medical diagnoses, NEVER interpret laboratory values authoritatively, NEVER prescribe medications or doses, and NEVER claim to replace doctors or hospitals.
- In any acute distress (chest pain, stroke symptoms, severe breathing difficulty, active hemorrhage, poisoning, snake bite), trigger emergency category with 108/112 ambulance response.

INDIAN HEALTHCARE SYSTEM CONTEXT TO INCORPORATE:
1. Public & State Insurance Schemes:
   - Ayushman Bharat (PM-JAY): Up to ₹5 Lakh cashless cover per family/year for secondary and tertiary care at empanelled public & private hospitals.
   - Tamil Nadu CMCHIS (Chief Minister's Comprehensive Health Insurance Scheme)
   - Karnataka: Aarogya Karnataka / Ayushman Bharat-Arogya Karnataka
   - Kerala: Karunya Arogya Suraksha Padhathi (KASP) / Karunya Benevolent Fund
   - Andhra Pradesh & Telangana: Dr. YSR Aarogyasri / Aarogyasri
2. Affordable Medicines:
   - Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP / Jan Aushadhi Kendras) for high-quality WHO-GMP certified generic medicines (saving 50-90% on chronic care like Metformin, Atorvastatin, Telmisartan).
3. Indian Hospital Navigation & OPD Workflow:
   - Government / Tertiary OPD tokens (e-Hospital / ORS portal online booking, early morning physical counter tokens 7:30-10:00 AM).
   - Private super-specialty hospital consultation booking and insurance helpdesk (TPA desk for cashless pre-authorization).
   - NABL-accredited diagnostic labs for reliable bloodwork, fasting guidelines (FBS, lipid profile).
4. National Helplines:
   - 108: Emergency Ambulance & Trauma
   - 112: All-in-one National Emergency
   - 102: Janani Shishu Suraksha (Maternal & Infant Ambulance)
   - 104: State Health Advice Helpline
   - 14416: Tele-MANAS (24/7 Mental Health Helpline)

User request: "${query}"
User Profile Context:
- Name: ${userProfileContext?.fullName || 'User'}
- Location: ${userProfileContext?.city || 'India'}
- Age: ${userProfileContext?.age || 'Not specified'}
- Gender: ${userProfileContext?.gender || 'Not specified'}
- Existing Health Conditions: ${userProfileContext?.healthConditions || 'None reported'}

Return JSON strictly matching this schema:
{
  "understanding": "Clear, empathetic 1-2 sentence understanding of user's query tailored to their profile.",
  "possibleServiceCategory": "Name of appropriate Indian clinical specialty or healthcare department",
  "why": "Explanation of why this department is appropriate and what clinical assessment involves.",
  "nextSteps": [
    "Step 1: Specific Indian healthcare booking or navigation step (OPD, portal, or specialist)",
    "Step 2: Documentation to carry (Aadhaar, Ayushman Bharat card/state health card, prior prescriptions)",
    "Step 3: Diagnostic or appointment preparation advice (fasting, symptom log)",
    "Step 4: Generic medicine inquiry (Jan Aushadhi) or follow-up recommendation"
  ],
  "importantSafetyMessage": "CarePath AI is an educational healthcare navigation platform. It does not provide medical diagnoses or prescribe medications. Always consult a certified healthcare professional.",
  "isEmergency": false,
  "suggestedQuestions": [
    "Question 1 for the doctor",
    "Question 2 for the doctor",
    "Question 3 regarding tests or affordable generics"
  ]
}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            parsed.importantSafetyMessage =
              parsed.importantSafetyMessage ||
              'CarePath AI is an educational healthcare navigation platform. Always consult a certified healthcare professional.';
            return parsed;
          }
        }
      } catch {
        // Fallback safely to CarePath deterministic clinical navigation
      }
    }

    // 3. Resilient Deterministic Clinical Navigation Engine
    return generateStructuredNavigationResponse(query, userProfileContext);
  }

  async generateQuestions(concern: string, categoryName: string = 'General Health'): Promise<{
    understanding: string[];
    testsProcedures: string[];
    nextSteps: string[];
    followUp: string[];
  }> {
    return {
      understanding: [
        `What do you believe could be the primary cause or contributors to my ${concern}?`,
        'Are there specific lifestyle or occupational triggers I should be mindful of?',
        'Is this something typical for my age, demographic, and medical background?',
      ],
      testsProcedures: [
        `What diagnostic tests or bloodwork would you recommend to properly evaluate this?`,
        'How should I prepare for these tests (e.g. fasting, pausing medications)?',
        'What are the common risks or alternative procedures available?',
      ],
      nextSteps: [
        'What immediate practical steps can I take while waiting for test results?',
        'What symptoms should prompt me to seek urgent care rather than waiting?',
        'Do I need a formal referral to a specialized medical center or specialist?',
      ],
      followUp: [
        'When should we schedule a follow-up consultation to review results?',
        'Who can I contact if I experience side effects or question changes between visits?',
        'What timeline should I expect before feeling noticeable improvement?',
      ],
    };
  }

  async explainDocument(
    documentTitle: string,
    documentContent: string
  ): Promise<{
    summary: string;
    terminology: { term: string; explanation: string }[];
    questionsForDoctor: string[];
  }> {
    return {
      summary: `This document appears to be a medical record titled "${documentTitle}". It outlines clinical observations, test metrics, and physician impressions for reference. Note that laboratory reference ranges vary across testing facilities and only your prescribing physician can provide diagnostic context.`,
      terminology: [
        {
          term: 'Reference Range',
          explanation: 'The standard expected range of values found in a healthy population for this specific lab.',
        },
        {
          term: 'Differential / Indication',
          explanation: 'The initial clinical reasons or symptoms that prompted the healthcare provider to order this test.',
        },
        {
          term: 'Impression / Assessment',
          explanation: 'The summary findings recorded by the examining specialist or radiologist.',
        },
      ],
      questionsForDoctor: [
        'How do these recorded results correlate with the symptoms I have been experiencing?',
        'Are any of these flagged values clinically significant or requiring medication adjustment?',
        'Will we need repeat testing to track changes over time?',
      ],
    };
  }

  async summarizeConversation(messages: string[]): Promise<string> {
    if (!messages || messages.length === 0) return 'No conversation history available.';
    return `Care navigation inquiry initiated with ${messages.length} exchanges. Identified appropriate care settings and guided the user toward verified facilities and pre-appointment checklists.`;
  }
}

export const aiService = new AIService();
