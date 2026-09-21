'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Calendar,
  Building2,
  FileText,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { aiService } from '@/lib/ai/service';
import { HealthcareJourney, NavigationStep, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuestionItem {
  id: string;
  category: string;
  text: string;
  isAnswered: boolean;
}

export default function JourneyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { easyMode } = useAccessibility();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [journeys, setJourneys] = useState<HealthcareJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<HealthcareJourney | null>(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [checklists, setChecklists] = useState<
    { id: string; text: string; completed: boolean }[]
  >([
    { id: 'c1', text: 'Confirm OPD consultation token or online appointment slot', completed: true },
    { id: 'c2', text: 'Carry Government ID (Aadhaar / Voter ID) and health insurance card', completed: true },
    { id: 'c3', text: 'List all active medications & check Jan Aushadhi generic equivalents', completed: false },
    { id: 'c4', text: 'Fast for 10-12 hours prior if NABL fasting blood sugar / lipid panel is scheduled', completed: false },
  ]);

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q1',
      category: 'Understanding',
      text: 'What do you believe could be the primary cause or contributors to my symptoms?',
      isAnswered: false,
    },
    {
      id: 'q2',
      category: 'Tests/Procedures',
      text: 'Which specific NABL diagnostic blood tests or imaging scans are recommended?',
      isAnswered: false,
    },
    {
      id: 'q3',
      category: 'Medicines & Generic Alternatives',
      text: 'Can I request cost-effective generic medicine equivalents (Jan Aushadhi) for this prescription?',
      isAnswered: false,
    },
    {
      id: 'q4',
      category: 'Emergency Precautions',
      text: 'What critical warning symptoms should prompt me to visit a 24/7 Casualty or call 108?',
      isAnswered: false,
    },
  ]);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setCurrentUser(user);

    const list = repository.getJourneys();
    setJourneys(list);
    if (list.length > 0) {
      setSelectedJourney(list[0]);
    }
  }, [router]);

  const handleToggleStep = (stepId: string, currentCompleted: boolean) => {
    if (!selectedJourney) return;
    const updated = repository.updateJourneyStep(selectedJourney.id, stepId, !currentCompleted);
    if (updated) {
      setSelectedJourney({ ...updated });
      setJourneys((prev) =>
        prev.map((j) => (j.id === updated.id ? { ...updated } : j))
      );
    }
  };

  const handleToggleChecklist = (id: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklists((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleToggleQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isAnswered: !q.isAnswered } : q))
    );
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        category: 'Personal Note',
        text: newQuestionText.trim(),
        isAnswered: false,
      },
    ]);
    setNewQuestionText('');
  };

  const handleGenerateQuestions = async () => {
    if (!selectedJourney || isGenerating) return;
    setIsGenerating(true);
    try {
      const prompt = `Prepare clinical visit questions for a patient seeking care for ${selectedJourney.categoryName} with context ${selectedJourney.title}. Include generic drug and scheme questions.`;
      const response = await aiService.navigateHealthcare(prompt);
      const generated = response.suggestedQuestions || [];

      const mappedQuestions: QuestionItem[] = [
        ...generated.map((q, idx) => ({
          id: `gen-${Date.now()}-${idx}`,
          category: 'AI Recommended',
          text: q,
          isAnswered: false,
        })),
      ];

      setQuestions((prev) => [...prev, ...mappedQuestions]);
    } catch {
      // Graceful fallback
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedJourney) return null;

  const completedCount = selectedJourney.steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / selectedJourney.steps.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="text-xs">
              🇮🇳 Healthcare Care Pathway
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Connected Timeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            My Care Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Track sequential visit milestones, preparation checklists, and consultation questions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/find-care">
            <Button variant="outline" size="sm" className="text-xs rounded-2xl border-slate-200/80 dark:border-slate-700/80 hover:border-[#0866FF]">
              <Building2 className="w-3.5 h-3.5 mr-1 text-[#0866FF]" />
              <span>Change Facility</span>
            </Button>
          </Link>
          <Link href="/assistant">
            <Button size="sm" className="text-xs rounded-2xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white">
              <span>Ask AI Advice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Active Pathway Overview */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] shadow-xl space-y-4 border border-white/70 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="text-xs px-2.5 py-0.5">Active Milestone Timeline</Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Started {new Date(selectedJourney.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {selectedJourney.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Discipline: <strong className="text-[#0866FF] dark:text-[#48DFFF]">{selectedJourney.categoryName}</strong> • Facility:{' '}
              <strong>{selectedJourney.selectedFacility?.name || 'Apollo Hospitals, Greams Road'}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-[#0866FF] dark:text-[#48DFFF]">
              {progressPercent}%
            </span>
            <span className="block text-[11px] text-slate-400 font-medium">Completed</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-[#0866FF] via-[#00C6D7] to-[#20C997] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. VERTICAL CONNECTED MILESTONES TIMELINE (Section 26) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Sequential Care Milestones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any milestone to mark complete or review upcoming clinic action steps
          </p>
        </div>

        <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#0866FF] before:via-[#00C6D7] before:to-slate-300 dark:before:to-slate-700">
          {selectedJourney.steps.map((step, index) => {
            const isDone = step.isCompleted;
            return (
              <div key={step.id} className="relative group">
                {/* Node icon on vertical line */}
                <button
                  type="button"
                  onClick={() => handleToggleStep(step.id, isDone)}
                  className={`absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ring-4 ring-white dark:ring-[#071827] ${
                    isDone
                      ? 'bg-gradient-to-tr from-[#20C997] to-[#00C6D7] text-white scale-105'
                      : 'bg-white dark:bg-[#10283B] text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-[#0866FF]'
                  }`}
                  title="Toggle status"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </button>

                {/* Milestone Card */}
                <div
                  onClick={() => handleToggleStep(step.id, isDone)}
                  className={`p-5 sm:p-6 rounded-3xl glass-card border transition-all duration-200 cursor-pointer ${
                    isDone
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15'
                      : 'border-white/70 dark:border-white/10 hover:border-[#0866FF]/40 dark:hover:border-[#48DFFF]/40 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0866FF] dark:text-[#48DFFF]">
                          Milestone {index + 1}
                        </span>
                        {isDone && (
                          <Badge variant="success" className="text-[10px] px-2 py-0.5">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3
                        className={`text-base font-bold transition ${
                          isDone
                            ? 'text-slate-500 dark:text-slate-400 line-through'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>

                    <span className="text-xs font-semibold text-[#0866FF] dark:text-[#48DFFF] shrink-0">
                      {isDone ? 'Mark Incomplete' : 'Mark as Done →'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#00C6D7]" />
                      Estimated Duration: 1-2 Hours
                    </span>
                    <span className="flex items-center font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      Standard OPD Protocol
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PREPARATION CHECKLIST & DOCTOR QUESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Preparation Checklist */}
        <div className="glass-panel p-6 sm:p-7 rounded-[2rem] space-y-4 shadow-xl border border-white/70 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#0866FF] dark:text-[#48DFFF]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Visit Checklist
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {checklists.filter((c) => c.completed).length} of {checklists.length} ready
            </span>
          </div>

          <div className="space-y-2">
            {checklists.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className={`p-3.5 rounded-2xl glass-card border cursor-pointer transition-all flex items-start space-x-3 ${
                  item.completed
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15'
                    : 'border-white/70 dark:border-slate-800/80 hover:border-slate-300'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <span
                  className={`text-xs ${
                    item.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200 font-medium'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Add custom checklist item */}
          <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
            />
            <Button type="submit" size="sm" className="rounded-xl px-3 bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </form>
        </div>

        {/* Right: Suggested Questions for Doctor */}
        <div className="glass-panel p-6 sm:p-7 rounded-[2rem] space-y-4 shadow-xl border border-white/70 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-[#00C6D7]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Questions to Ask Doctor
              </h2>
            </div>
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] hover:underline flex items-center"
            >
              <Sparkles className={`w-3.5 h-3.5 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate AI Questions
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleToggleQuestion(q.id)}
                className={`p-3.5 rounded-2xl glass-card border cursor-pointer transition-all flex items-start space-x-3 ${
                  q.isAnswered
                    ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/15'
                    : 'border-white/70 dark:border-slate-800/80 hover:border-slate-300'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {q.isAnswered ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0866FF] dark:text-[#48DFFF]" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#0866FF] dark:text-[#48DFFF] block mb-0.5">
                    {q.category}
                  </span>
                  <p
                    className={`text-xs ${
                      q.isAnswered ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200 font-medium'
                    }`}
                  >
                    {q.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom question */}
          <form onSubmit={handleAddQuestion} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Add personal question for doctor..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl glass-input text-slate-900 dark:text-white focus:outline-none"
            />
            <Button type="submit" size="sm" className="rounded-xl px-3 bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
