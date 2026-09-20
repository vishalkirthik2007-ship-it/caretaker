'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { aiService } from '@/lib/ai/service';
import { AIMessage, AIStructuredResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function AssistantPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const { t } = useLanguage();
  const { easyMode } = useAccessibility();

  const [input, setInput] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-01',
      role: 'assistant',
      content:
        'Hello. I am the CarePath AI navigation assistant. I can help guide you to the appropriate medical service category, find verified facilities, and prepare questions for your doctor. How can I guide you today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

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
        content: `I have analyzed your request regarding "${queryText}". Below is your structured healthcare navigation plan.`,
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
    recognition.lang = 'en-US';
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
          'Conversation cleared. I am ready to guide you to the right healthcare setting. What care are you looking for?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const guidedQueries = [
    { label: t.assistant.optProvider, query: 'I need to find a primary care doctor for an annual health checkup.' },
    { label: t.assistant.optSpecialist, query: 'I am experiencing persistent knee joint pain and need a specialist.' },
    { label: t.assistant.optHospital, query: 'I have a high fever with sudden deep pain and need urgent care.' },
    { label: t.assistant.optDiagnostic, query: 'Where can I get a comprehensive blood test and MRI scan?' },
    { label: t.assistant.optPrepare, query: 'How do I prepare for my first appointment with a cardiologist?' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {t.assistant.title}
            </h1>
            <p className="text-xs text-slate-500">
              Structured Healthcare Guidance & Triage
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetChat}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-5 shadow-xs space-y-4 ${
                msg.role === 'user'
                  ? 'bg-teal-700 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>

              {/* Structured AI Navigation Cards */}
              {msg.structuredResponse && (
                <div className="space-y-4 pt-2 border-t border-slate-100 text-slate-900">
                  {/* Emergency Alert Banner if red-flag detected */}
                  {msg.structuredResponse.isEmergency && (
                    <div className="p-4 rounded-2xl bg-red-600 text-white space-y-2 shadow-md animate-pulse">
                      <div className="flex items-center space-x-2 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{t.assistant.emergencyDetected}</span>
                      </div>
                      <p className="text-xs text-red-100 leading-relaxed">
                        {msg.structuredResponse.importantSafetyMessage}
                      </p>
                      <div className="pt-1">
                        <a
                          href="tel:112"
                          className="inline-flex items-center px-4 py-2 bg-white text-red-700 font-bold text-xs rounded-xl shadow"
                        >
                          <Phone className="w-4 h-4 mr-1.5" />
                          {t.assistant.callEmergencyNow}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 1. Understanding Card */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      {t.assistant.understanding}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {msg.structuredResponse.understanding}
                    </p>
                  </div>

                  {/* 2. Possible Healthcare Service Category */}
                  <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-100 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block mb-1">
                        {t.assistant.possibleService}
                      </span>
                      <p className="text-sm font-bold text-teal-950">
                        {msg.structuredResponse.possibleServiceCategory}
                      </p>
                      <p className="text-xs text-teal-800 mt-1">
                        {msg.structuredResponse.why}
                      </p>
                    </div>
                    {msg.structuredResponse.categoryId && (
                      <Link
                        href={`/facilities?category=${msg.structuredResponse.categoryId}`}
                        className="shrink-0 ml-3"
                      >
                        <Button size="sm" variant="primary" className="text-xs py-1.5">
                          Find Facilities
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* 3. Practical Next Steps */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      {t.assistant.nextSteps}
                    </span>
                    <div className="space-y-1.5">
                      {msg.structuredResponse.nextSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                        >
                          <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Questions to Ask Doctor */}
                  {msg.structuredResponse.suggestedQuestions && (
                    <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                        Suggested Questions for Your Healthcare Visit
                      </span>
                      <ul className="list-disc list-inside text-xs text-indigo-950 space-y-1">
                        {msg.structuredResponse.suggestedQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 5. Non-Diagnostic Medical Disclaimer Notice */}
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start space-x-2 text-[11px] text-amber-900 leading-snug">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{msg.structuredResponse.importantSafetyMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs pl-11">
            <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
            <span>CarePath AI is evaluating navigation guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Guided Chips (If few messages) */}
      {messages.length <= 2 && (
        <div className="py-2 space-y-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.assistant.guidedTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {guidedQueries.map((g, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(g.query)}
                className="text-xs bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition font-medium"
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
        className="pt-3 border-t border-slate-200 flex items-center space-x-2 shrink-0"
      >
        <button
          type="button"
          onClick={handleVoiceInput}
          title="Voice input"
          className={`p-3 rounded-2xl border transition ${
            isListening
              ? 'bg-red-500 text-white border-red-500 animate-pulse'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening ? t.assistant.speakListening : t.assistant.inputPlaceholder
          }
          className={`flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 shadow-xs ${
            easyMode ? 'text-lg py-4' : ''
          }`}
        />

        <Button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-5 py-3 rounded-2xl shadow-xs"
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
