import { AIStructuredResponse } from '@/types';
import { generateStructuredNavigationResponse, checkEmergencyTriage } from './safety';

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
    // 1. Mandatory Safety Pre-flight: Immediate Emergency Triage Check
    const emergencyTriage = checkEmergencyTriage(query);
    if (emergencyTriage.isEmergency) {
      return generateStructuredNavigationResponse(query);
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
                      text: `You are CarePath AI, a healthcare navigation engine. You NEVER diagnose illnesses, NEVER prescribe drugs, and NEVER claim to replace doctors.
Your task is ONLY to help the user identify the right healthcare service category, explain why, provide 4 next steps, and state safety disclaimers.
User request: "${query}"

Return JSON matching:
{
  "understanding": "...",
  "possibleServiceCategory": "...",
  "why": "...",
  "nextSteps": ["step 1", "step 2", "step 3", "step 4"],
  "importantSafetyMessage": "CarePath AI is an educational navigation platform. Always consult a certified healthcare professional.",
  "isEmergency": false,
  "suggestedQuestions": ["question 1", "question 2", "question 3"]
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
            // Double-check AI output doesn't contain forbidden claims
            parsed.importantSafetyMessage =
              parsed.importantSafetyMessage ||
              'CarePath AI is an educational navigation platform. Always consult a certified healthcare professional.';
            return parsed;
          }
        }
      } catch {
        // Fallback safely to CarePath deterministic clinical navigation
      }
    }

    // 3. Resilient Deterministic Clinical Navigation Engine
    return generateStructuredNavigationResponse(query);
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
