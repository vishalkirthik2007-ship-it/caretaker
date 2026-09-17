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
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { aiService } from '@/lib/ai/service';
import { HealthcareJourney, NavigationStep } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuestionItem {
  id: string;
  category: string;
  text: string;
  isAnswered: boolean;
}

export default function JourneyPage() {
  const { t } = useLanguage();
  const { easyMode } = useAccessibility();

  const [journeys, setJourneys] = useState<HealthcareJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<HealthcareJourney | null>(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [checklists, setChecklists] = useState<
    { id: string; text: string; completed: boolean }[]
  >([
    { id: 'c1', text: 'Confirm appointment date & time with clinic receptionist', completed: true },
    { id: 'c2', text: 'Locate photo ID, insurance card, and copay payment method', completed: true },
    { id: 'c3', text: 'List all active medications, dosages, and vitamins in notes', completed: false },
    { id: 'c4', text: 'Fast for 8 hours prior if blood chemistry panel was ordered', completed: false },
  ]);

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q1',
      category: 'Understanding',
      text: 'What do you think is the primary cause of this discomfort?',
      isAnswered: false,
    },
    {
      id: 'q2',
      category: 'Tests/Procedures',
      text: 'Do we need any specific diagnostic bloodwork or imaging scans?',
      isAnswered: false,
    },
    {
      id: 'q3',
      category: 'Next Steps',
      text: 'What warning symptoms would mean I should seek urgent care?',
      isAnswered: false,
    },
  ]);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const list = repository.getJourneys();
    setJourneys(list);
    if (list.length > 0) {
      setSelectedJourney(list[0]);
    }
  }, []);

  const handleToggleStep = (stepId: string, currentStatus: boolean) => {
    if (!selectedJourney) return;
    const updated = repository.updateJourneyStep(selectedJourney.id, stepId, !currentStatus);
    if (updated) {
      setSelectedJourney({ ...updated });
    }
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklists([
      ...checklists,
      { id: `chk-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        category: 'General',
        text: newQuestionText.trim(),
        isAnswered: false,
      },
    ]);
    setNewQuestionText('');
  };

  const handleAIGenerateQuestions = async () => {
    if (!selectedJourney) return;
    setIsGenerating(true);
    try {
      const generated = await aiService.generateQuestions(
        selectedJourney.title,
        selectedJourney.categoryName
      );

      const mappedQuestions: QuestionItem[] = [
        ...generated.understanding.map((txt, i) => ({
          id: `gen-und-${i}`,
          category: 'Understanding',
          text: txt,
          isAnswered: false,
        })),
        ...generated.testsProcedures.map((txt, i) => ({
          id: `gen-tst-${i}`,
          category: 'Tests/Procedures',
          text: txt,
          isAnswered: false,
        })),
        ...generated.nextSteps.map((txt, i) => ({
          id: `gen-nxt-${i}`,
          category: 'Next Steps',
          text: txt,
          isAnswered: false,
        })),
      ];

      setQuestions((prev) => [...prev, ...mappedQuestions]);
    } catch (err) {
      console.error('Failed to generate questions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedJourney) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.journey.title}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.journey.subtitle}
        </p>
      </div>

      {/* Active Journey Overview Card */}
      <Card className="p-6 border-slate-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success">Active Healthcare Workflow</Badge>
              <span className="text-xs text-slate-400">
                Created: {new Date(selectedJourney.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {selectedJourney.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Service: <strong>{selectedJourney.categoryName}</strong> • Facility:{' '}
              <strong>{selectedJourney.selectedFacility?.name}</strong>
            </p>
          </div>
          <Link href="/facilities">
            <Button variant="outline" size="sm" className="text-xs">
              Change Facility
            </Button>
          </Link>
        </div>

        {/* 6 Step Visual Pipeline */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Navigation Workflow Steps
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedJourney.steps.map((step) => (
              <div
                key={step.id}
                onClick={() => handleToggleStep(step.id, step.isCompleted)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  step.isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      step.isCompleted ? 'text-emerald-900 line-through' : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Appointment Preparation Checklist */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">
                Prepare for Your Visit
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {checklists.filter((c) => c.completed).length} of {checklists.length} ready
            </span>
          </div>

          <form onSubmit={handleAddChecklist} className="flex gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Add personal checklist item (e.g. bring MRI disc)..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
            />
            <Button type="submit" size="sm" className="text-xs shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </form>

          <div className="space-y-2 pt-1">
            {checklists.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setChecklists(
                    checklists.map((c) =>
                      c.id === item.id ? { ...c, completed: !c.completed } : c
                    )
                  )
                }
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span
                    className={`${
                      item.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChecklists(checklists.filter((c) => c.id !== item.id));
                  }}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 2: Questions for Healthcare Professional */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-700" />
              <h2 className="text-base font-bold text-slate-900">
                Questions for the Doctor
              </h2>
            </div>
            <button
              onClick={handleAIGenerateQuestions}
              disabled={isGenerating}
              className="inline-flex items-center text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              {isGenerating ? 'Generating...' : 'AI Suggestions'}
            </button>
          </div>

          <form onSubmit={handleAddQuestion} className="flex gap-2">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Add question to ask your doctor..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700"
            />
            <Button type="submit" size="sm" className="text-xs shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </form>

          <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() =>
                  setQuestions(
                    questions.map((item) =>
                      item.id === q.id ? { ...item, isAnswered: !item.isAnswered } : item
                    )
                  )
                }
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition text-xs flex items-start justify-between gap-2"
              >
                <div className="flex items-start space-x-2.5">
                  {q.isAnswered ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                      {q.category}
                    </span>
                    <span
                      className={`leading-relaxed block mt-0.5 ${
                        q.isAnswered ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {q.text}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuestions(questions.filter((item) => item.id !== q.id));
                  }}
                  className="text-slate-400 hover:text-red-500 p-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
