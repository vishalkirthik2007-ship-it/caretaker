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
  Compass,
  FileText,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { aiService } from '@/lib/ai/service';
import { repository } from '@/lib/data/repository';
import { AIMessage, AIStructuredResponse, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Section 23 Suggested Actions
const SUGGESTED_ACTIONS = [
  { label: 'Find nearby hospital', query: 'Find the nearest accredited hospital with 24/7 casualty' },
  { label: 'Find specialist', query: 'I need to consult a cardiologist or specialist for chronic symptoms' },
  { label: 'Emergency care', query: 'What should I do in an emergency? Dial 108/112 protocol' },
  { label: 'Explain my report', query: 'How can I understand my NABL laboratory blood test or lipid report?' },
  { label: 'My care journey', query: 'Guide me on what documents and questions to prepare for my hospital visit' },
];

function AskCareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

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
        'Hello. I am Ask Care, your CareNest AI healthcare assistant for India. I can help guide you to verified specialists, accredited hospitals across Tamil Nadu and India, explain health terms, navigate CMCHIS & Ayushman Bharat schemes, and organize your doctor consultations. How can I assist you today?',
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
        content: response.isEmergency
          ? `⚠️ HIGH PRIORITY EMERGENCY: ${response.importantSafetyMessage}`
          : response.understanding,
        structuredResponse: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content:
            'I encountered a temporary connection issue. If this is an emergency, please dial 108 or visit the nearest 24/7 casualty hospital immediately.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeechToggle = () => {
    if (!speechSupported) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content:
          'Chat reset. How can I guide your healthcare navigation today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4.5rem)] flex flex-col space-y-4">
      {/* 1. TOP HEADER (Section 23) */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl shadow-lg border border-white/70 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white flex items-center justify-center shadow-md shadow-blue-500/25 ring-2 ring-[#48DFFF]/40">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#071827]" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Ask Care
              </h1>
              <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-[#0866FF]/10 text-[#0866FF] dark:text-[#48DFFF] border border-[#0866FF]/20">
                AI Assistant
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              &ldquo;Your healthcare assistant&rdquo;
            </p>
          </div>
        </div>

        {/* Right side: User Context pill & Reset */}
        <div className="flex items-center space-x-2">
          {currentUser && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl glass-card text-xs text-slate-600 dark:text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#0866FF] dark:text-[#48DFFF]" />
              <span>{currentUser.city || 'India'}</span>
            </div>
          )}

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl glass-card text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-5 shadow-lg space-y-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white rounded-tr-xs shadow-blue-500/20'
                  : 'glass-panel text-slate-900 dark:text-white rounded-tl-xs border border-white/70 dark:border-white/10'
              }`}
            >
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>

              {/* Structured AI Navigation Cards (Connected to System) */}
              {msg.structuredResponse && (
                <div className="space-y-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 text-slate-900 dark:text-white">
                  {/* Emergency Detected Alert */}
                  {msg.structuredResponse.isEmergency && (
                    <div className="p-4 rounded-2xl bg-[#FF5C6C] text-white space-y-2 shadow-lg animate-pulse">
                      <div className="flex items-center space-x-2 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Emergency Medical Distress Flagged</span>
                      </div>
                      <p className="text-xs text-red-50 leading-relaxed">
                        {msg.structuredResponse.importantSafetyMessage}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href="tel:108"
                          className="inline-flex items-center px-4 py-2 bg-white text-red-600 font-bold text-xs rounded-xl shadow"
                        >
                          <Phone className="w-4 h-4 mr-1.5" />
                          Ambulance (Dial 108)
                        </a>
                        <a
                          href="tel:112"
                          className="inline-flex items-center px-4 py-2 bg-red-800 text-white font-bold text-xs rounded-xl shadow"
                        >
                          Emergency (Dial 112)
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 1. Recommended Specialty Setting */}
                  <div className="p-4 bg-[#0866FF]/10 dark:bg-[#0866FF]/20 rounded-2xl border border-[#0866FF]/25 dark:border-[#48DFFF]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0866FF] dark:text-[#48DFFF] block mb-0.5">
                        Recommended Medical Discipline
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {msg.structuredResponse.possibleServiceCategory}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {msg.structuredResponse.why}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Link href={`/facilities?category=${msg.structuredResponse.categoryId || 'general'}`}>
                        <Button size="sm" className="text-xs rounded-xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-xs">
                          <Building2 className="w-3.5 h-3.5 mr-1" />
                          View Hospitals
                        </Button>
                      </Link>
                      <Link href="/map">
                        <Button size="sm" variant="outline" className="text-xs rounded-xl glass-card">
                          <Navigation className="w-3.5 h-3.5 mr-1 text-[#00C6D7]" />
                          Map Radar
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 2. Practical Action Steps */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Recommended Next Actions
                    </span>
                    <div className="space-y-1.5">
                      {msg.structuredResponse.nextSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 glass-card p-2.5 rounded-xl"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#0866FF]/20 text-[#0866FF] dark:text-[#48DFFF] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Questions to Ask Doctor */}
                  {msg.structuredResponse.suggestedQuestions && (
                    <div className="p-3.5 bg-blue-50/70 dark:bg-[#142B40]/70 rounded-2xl border border-blue-200/70 dark:border-blue-800/70 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0866FF] dark:text-[#48DFFF] block">
                        Questions for Your Doctor Consultation
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        {msg.structuredResponse.suggestedQuestions.map((q, i) => (
                          <li key={i} className="leading-relaxed">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 4. Safety Disclaimer Notice */}
                  <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-2 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{msg.structuredResponse.importantSafetyMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-2xl bg-blue-100 dark:bg-[#10283B] text-[#0866FF] dark:text-[#48DFFF] flex items-center justify-center shrink-0 mt-1 shadow-xs border border-blue-200 dark:border-slate-700">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-[#0866FF] dark:text-[#48DFFF] text-xs pl-11 font-medium animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Ask Care is preparing verified healthcare navigation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. SUGGESTED ACTIONS ABOVE INPUT (Section 23) */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Suggested:
          </span>
          {SUGGESTED_ACTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSendMessage(item.query)}
              className="text-xs px-3 py-1.5 rounded-full glass-card border border-white/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0866FF] dark:hover:border-[#48DFFF] hover:text-[#0866FF] dark:hover:text-[#48DFFF] whitespace-nowrap transition"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 4. LARGE ROUNDED INPUT & SEND BUTTON (Section 23) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="glass-panel p-2 rounded-3xl shadow-xl border border-white/70 dark:border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your health..."
            className="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />

          {speechSupported && (
            <button
              type="button"
              onClick={handleSpeechToggle}
              className={`p-2.5 rounded-2xl transition ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] hover:from-[#0052cc] hover:to-[#00acc1] text-white shadow-md shadow-blue-500/25 font-bold text-xs sm:text-sm flex items-center space-x-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading Ask Care AI Assistant...
        </div>
      }
    >
      <AskCareContent />
    </Suspense>
  );
}
