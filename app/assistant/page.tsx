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
  ArrowLeft,
  Info,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { aiService } from '@/lib/ai/service';
import { repository } from '@/lib/data/repository';
import { AIMessage, AIStructuredResponse, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 3 Prompt Chips matching Reference Poster
const PROMPT_CHIPS = [
  { label: 'Nearby hospitals', query: 'Find the nearest accredited hospital with 24/7 casualty' },
  { label: 'Fever care tips', query: 'I have fever and sore throat, what should I do?' },
  { label: 'When to see doctor', query: 'When should I visit a doctor for persistent fever or flu symptoms?' },
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

  // Initial messages recreating the reference poster
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-user-1',
      role: 'user',
      content: 'I have fever and sore throat, what should I do?',
      timestamp: '10:24 AM',
    },
    {
      id: 'msg-assistant-1',
      role: 'assistant',
      content: 'Based on your symptoms, here are some suggestions:\n\n1. Rest and stay hydrated.\n2. You can take paracetamol for fever (as per recommended dosage).\n3. Gargle with warm saline water.\n4. If symptoms persist for more than 3 days or worsen (high fever, difficulty breathing, severe throat pain), please visit a doctor.',
      structuredResponse: {
        understanding: 'Based on your symptoms, here are some suggestions:',
        isEmergency: false,
        possibleServiceCategory: 'General Medicine / ENT',
        categoryId: 'general-medicine',
        why: 'Fever and throat irritation often stem from seasonal viral upper respiratory infections.',
        nextSteps: [
          'Rest and stay hydrated.',
          'You can take paracetamol for fever (as per recommended dosage).',
          'Gargle with warm saline water.',
          'If symptoms persist for more than 3 days or worsen (high fever, difficulty breathing, severe throat pain), please visit a doctor.',
        ],
        importantSafetyMessage:
          'If you have severe symptoms like breathing difficulty, chest pain or cannot keep fluids down, please go to the nearest emergency department immediately or call 108 (Emergency).',
      },
      timestamp: '10:24 AM',
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
    if (initialQuery.trim() && initialQuery !== 'I have fever and sore throat, what should I do?') {
      handleSendMessage(initialQuery.trim());
    }
  }, []);

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: currentTime,
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        content: 'Chat reset. How can I assist with your healthcare today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 h-[calc(100vh-4.2rem)] flex flex-col space-y-3">
      {/* 1. TOP HEADER matching Reference Poster */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Ask Care
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
            Your AI Health Assistant
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CHAT FEED matching Reference Poster */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            {msg.role === 'user' ? (
              <div className="flex flex-col items-end">
                <div className="max-w-md px-4 py-2.5 rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white text-xs sm:text-sm font-medium shadow-sm">
                  {msg.content}
                </div>
                {msg.timestamp && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 pr-1 mt-0.5">
                    {msg.timestamp}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-start space-x-2.5">
                {/* Bot Icon */}
                <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-[#00C6D7] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>

                {/* Assistant Message Bubble matching Reference Poster */}
                <div className="flex-1 max-w-xl rounded-2xl rounded-tl-xs bg-white/90 dark:bg-[#10283B]/90 border border-slate-200/80 dark:border-white/10 p-4 shadow-sm backdrop-blur-md space-y-3">
                  {/* Introductory sentence */}
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {msg.structuredResponse ? msg.structuredResponse.understanding : msg.content}
                  </p>

                  {/* Numbered Suggestions list */}
                  {msg.structuredResponse?.nextSteps && msg.structuredResponse.nextSteps.length > 0 && (
                    <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {msg.structuredResponse.nextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5 leading-relaxed">
                          <span className="font-bold text-[#0066FF] dark:text-[#42D9FF] shrink-0">
                            {idx + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Red/Coral Emergency Highlight Box matching Reference Poster */}
                  {msg.structuredResponse?.importantSafetyMessage && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start space-x-2.5 text-xs text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {msg.structuredResponse.importantSafetyMessage}
                      </p>
                    </div>
                  )}

                  {/* Actions / Specialist Links */}
                  {msg.structuredResponse?.possibleServiceCategory && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-white/10">
                      <Link href={`/find-care?category=${msg.structuredResponse.categoryId || 'general-medicine'}`}>
                        <Button size="sm" className="h-7 text-xs rounded-full bg-[#0066FF] hover:bg-[#0052cc] text-white">
                          <Building2 className="w-3 h-3 mr-1" />
                          View {msg.structuredResponse.possibleServiceCategory} Hospitals
                        </Button>
                      </Link>
                      <Link href="/map">
                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-full border-slate-200 dark:border-slate-700">
                          <Navigation className="w-3 h-3 mr-1 text-[#00C6D7]" />
                          Map View
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-[#0066FF] dark:text-[#42D9FF] text-xs pl-10 font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Ask Care is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. PROMPT CHIPS matching Reference Poster: Nearby hospitals, Fever care tips, When to see doctor */}
      <div className="shrink-0 space-y-2 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleSendMessage(chip.query)}
              className="text-xs px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-[#10283B]/85 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#0066FF] hover:text-[#0066FF] dark:hover:text-[#42D9FF] whitespace-nowrap shadow-xs backdrop-blur-md transition active:scale-98"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 4. PILL INPUT & CIRCULAR SEND BUTTON matching Reference Poster */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full pl-4 pr-20 py-3 rounded-full bg-white/95 dark:bg-[#10283B]/95 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/25 shadow-md backdrop-blur-md"
          />

          <div className="absolute right-2 flex items-center space-x-1">
            {speechSupported && (
              <button
                type="button"
                onClick={handleSpeechToggle}
                className={`p-1.5 rounded-full transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
                title={isListening ? 'Stop' : 'Voice'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 transition"
              title="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
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
