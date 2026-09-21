'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  User,
  Building2,
  CheckCircle2,
  Phone,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { aiService } from '@/lib/ai/service';
import { repository } from '@/lib/data/repository';
import { AIMessage, AIStructuredResponse, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function AssistantPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const { t } = useLanguage();
  const { easyMode } = useAccessibility();

  const [input, setInput] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-01',
      role: 'assistant',
      content:
        'Namaste. I am CarePath AI, your healthcare navigation guide for India. I can guide you to appropriate medical specialists, accredited hospitals across Indian cities, Ayushman Bharat & Jan Aushadhi resources, and prepare practical questions for your doctor. How may I guide you today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
    }
  }, []);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response: AIStructuredResponse = await aiService.navigateHealthcare(
        queryText.trim()
      );

      const botMsg: AIMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `I have evaluated your query regarding "${queryText}". Below is your structured Indian healthcare navigation plan.`,
        structuredResponse: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Graceful error handling
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported on this browser.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Conversation reset. I am ready to guide you to the right healthcare facility in India. What care or department are you looking for?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const guidedQueries = [
    { label: '🩺 General OPD Visit', query: 'I have a high fever, body ache, and need an OPD general physician consultation.' },
    { label: '🦴 Joint / Ortho Care', query: 'I have persistent knee joint swelling and want to consult an orthopaedic specialist.' },
    { label: '🚨 Chest Pain (Emergency)', query: 'Severe sudden crushing chest pain and shortness of breath.' },
    { label: '🔬 Blood Test (NABL)', query: 'Where can I get a comprehensive fasting blood sugar and lipid profile test?' },
    { label: '💊 Jan Aushadhi Stores', query: 'How can I find affordable generic medicine equivalents through Jan Aushadhi?' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Controls Bar */}
      <div className="glass-panel rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-md flex items-center justify-between shrink-0 mb-4 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              {t.assistant.title} (India Navigator)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span>Non-diagnostic triage</span>
              {currentUser?.city && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin className="w-3 h-3 text-teal-600 mr-0.5 inline" />
                  <span>Personalized for {currentUser.city}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetChat}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 space-y-5 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-2xl bg-teal-100/80 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 mt-1 border border-teal-200/60 dark:border-teal-800/60 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-5 shadow-md space-y-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-xs shadow-teal-700/20'
                  : 'glass-panel text-slate-900 dark:text-white rounded-tl-xs border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>

              {/* Structured AI Navigation Cards */}
              {msg.structuredResponse && (
                <div className="space-y-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 text-slate-900 dark:text-white">
                  {/* Emergency Alert Banner if red-flag detected */}
                  {msg.structuredResponse.isEmergency && (
                    <div className="p-4 rounded-2xl bg-red-600 text-white space-y-2 shadow-lg animate-pulse">
                      <div className="flex items-center space-x-2 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{t.assistant.emergencyDetected}</span>
                      </div>
                      <p className="text-xs text-red-100 leading-relaxed">
                        {msg.structuredResponse.importantSafetyMessage}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href="tel:108"
                          className="inline-flex items-center px-4 py-2 bg-white text-red-700 font-bold text-xs rounded-xl shadow"
                        >
                          <Phone className="w-4 h-4 mr-1.5" />
                          Call Ambulance (108)
                        </a>
                        <a
                          href="tel:112"
                          className="inline-flex items-center px-4 py-2 bg-red-800 text-white font-bold text-xs rounded-xl shadow"
                        >
                          National Emergency (112)
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 1. Understanding Card */}
                  <div className="p-3.5 glass-card rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      {t.assistant.understanding}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {msg.structuredResponse.understanding}
                    </p>
                  </div>

                  {/* 2. Possible Healthcare Service Category */}
                  <div className="p-3.5 bg-teal-50/80 dark:bg-teal-950/60 rounded-2xl border border-teal-200/70 dark:border-teal-800/70 flex items-start justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block mb-1">
                        {t.assistant.possibleService}
                      </span>
                      <p className="text-sm font-bold text-teal-950 dark:text-teal-100">
                        {msg.structuredResponse.possibleServiceCategory}
                      </p>
                      <p className="text-xs text-teal-800 dark:text-teal-300 mt-1">
                        {msg.structuredResponse.why}
                      </p>
                    </div>
                    {msg.structuredResponse.categoryId && (
                      <Link
                        href={`/facilities?category=${msg.structuredResponse.categoryId}`}
                        className="shrink-0 ml-3"
                      >
                        <Button size="sm" variant="primary" className="text-xs py-1.5 rounded-xl shadow-xs">
                          Find Facilities
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* 3. Practical Next Steps */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {t.assistant.nextSteps}
                    </span>
                    <div className="space-y-2">
                      {msg.structuredResponse.nextSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 glass-card p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Questions to Ask Doctor */}
                  {msg.structuredResponse.suggestedQuestions && (
                    <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200/70 dark:border-indigo-800/70 space-y-2 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block">
                        Suggested Questions for Your Healthcare Visit (OPD)
                      </span>
                      <ul className="list-disc list-inside text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
                        {msg.structuredResponse.suggestedQuestions.map((q, i) => (
                          <li key={i} className="leading-relaxed">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 5. Non-Diagnostic Medical Disclaimer Notice */}
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/50 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 flex items-start space-x-2 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                    <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{msg.structuredResponse.importantSafetyMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 mt-1 border border-teal-200/60 dark:border-teal-800/60 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 text-xs pl-11 font-medium">
            <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
            <span>CarePath AI is preparing Indian healthcare navigation guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Guided Chips (If few messages) */}
      {messages.length <= 2 && (
        <div className="py-2 space-y-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {t.assistant.guidedTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {guidedQueries.map((g, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(g.query)}
                className="text-xs glass-card hover:border-teal-500 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all duration-200 font-medium hover:shadow-xs"
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="pt-3 flex items-center space-x-2 shrink-0"
      >
        <button
          type="button"
          onClick={handleVoiceInput}
          title="Voice input (English/Hindi)"
          className={`p-3.5 rounded-2xl border transition shadow-xs ${
            isListening
              ? 'bg-red-500 text-white border-red-500 animate-pulse'
              : 'glass-panel text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening ? t.assistant.speakListening : 'Ask about hospital departments, OPD tokens, Jan Aushadhi, or symptoms...'
          }
          className={`flex-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 glass-panel px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-md ${
            easyMode ? 'text-lg py-4' : ''
          }`}
        />

        <Button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-5 py-3.5 rounded-2xl shadow-md bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading CarePath Assistant...
        </div>
      }
    >
      <AssistantPageContent />
    </Suspense>
  );
}
