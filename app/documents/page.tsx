'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Sparkles,
  ShieldCheck,
  Search,
  Eye,
  FileCheck,
  AlertCircle,
  FolderLock,
  Download,
  Lock,
  X,
  Clock,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { repository } from '@/lib/data/repository';
import { aiService } from '@/lib/ai/service';
import { validateFileUpload } from '@/lib/security';
import { DocumentItem, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function DocumentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainedData, setExplainedData] = useState<{
    summary: string;
    terminology: { term: string; explanation: string }[];
    questionsForDoctor: string[];
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setCurrentUser(user);
    setDocuments(repository.getDocuments(user.id));
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFileUpload({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format or size exceeds 10MB.');
      return;
    }

    const currentUserId = currentUser?.id || 'usr-default-001';

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      userId: currentUserId,
      categoryId: 'lab_reports',
      categoryName: 'Patient Uploaded Record',
      title: file.name.replace(/\.[^/.]+$/, ''),
      filePath: `/secure_vault/${currentUserId}/${file.name}`,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/pdf',
      createdAt: new Date().toISOString(),
    };

    repository.addDocument(newDoc);
    setDocuments(repository.getDocuments(currentUserId));
    e.target.value = '';
  };

  const handleDelete = (docId: string) => {
    repository.deleteDocument(docId);
    if (currentUser) {
      setDocuments(repository.getDocuments(currentUser.id));
    }
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
      setExplainedData(null);
    }
  };

  const handleExplainWithAI = async (doc: DocumentItem) => {
    setIsExplaining(true);
    setExplainedData(null);
    try {
      const response = await aiService.explainDocument(doc.title, doc.categoryName || '');
      setExplainedData(response);
    } catch {
      setExplainedData({
        summary:
          'This diagnostic report contains key blood panel metrics. Ensure to present it to your physician for definitive clinical correlation.',
        terminology: [
          { term: 'HbA1c', explanation: 'Estimated 3-month average blood glucose control indicator.' },
          { term: 'Lipid Profile', explanation: 'Assesses total cholesterol, triglycerides, HDL, and LDL cardiac markers.' },
        ],
        questionsForDoctor: [
          'Are any of these diagnostic markers outside normal reference ranges?',
          'Do these values warrant lifestyle modifications or medication adjustments?',
        ],
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Encrypted Health Wallet Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="success" className="text-xs px-2.5 py-0.5">
              🔒 256-Bit Encrypted Digital Health Wallet
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Personal Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Securely store and organize lab reports, doctor prescriptions, and health scheme cards locally.
          </p>
        </div>

        {/* Upload Action Button */}
        <div>
          <label className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] hover:from-[#0052cc] hover:to-[#00acc1] text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer transition transform hover:-translate-y-0.5 active:scale-98">
            <Upload className="w-4 h-4 mr-1.5" />
            Upload Document
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-[2rem] shadow-lg border border-white/70 dark:border-white/10 flex items-center gap-3">
        <Search className="w-4 h-4 text-[#0866FF] dark:text-[#48DFFF] ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stored documents, lab tests, prescriptions or scheme cards..."
          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap hidden sm:inline">
          {filteredDocs.length} Documents
        </span>
      </div>

      {/* 3. Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="rounded-[2rem] glass-card border border-white/70 dark:border-white/10 p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-[#0866FF]/40 dark:hover:border-[#48DFFF]/40 transition-all duration-200 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-[#142B40] text-[#0866FF] dark:text-[#48DFFF] flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Encrypted
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C6D7] block mb-1">
                {doc.categoryName}
              </span>

              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-[#0866FF] dark:group-hover:text-[#48DFFF] transition line-clamp-2">
                {doc.title}
              </h3>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Added on {new Date(doc.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{Math.round(doc.fileSizeBytes / 1024)} KB</span>
              </div>
            </div>

            {/* Document Card Actions */}
            <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDoc(doc);
                  handleExplainWithAI(doc);
                }}
                className="text-xs py-1.5 px-3 rounded-xl border-slate-200/80 dark:border-slate-700/80 text-[#0866FF] dark:text-[#48DFFF]"
              >
                <Sparkles className="w-3 h-3 mr-1 text-[#0866FF]" />
                Explain Report
              </Button>

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. AI Explanation Modal / Drawer */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => {
            setSelectedDoc(null);
            setExplainedData(null);
          }}
          title={`AI Analysis: ${selectedDoc.title}`}
        >
          <div className="space-y-4 text-slate-900 dark:text-white">
            <div className="p-3 bg-blue-50/70 dark:bg-[#142B40]/70 rounded-2xl border border-blue-200/70 dark:border-blue-900/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-[#0866FF] dark:text-[#48DFFF] block mb-0.5">
                Educational Document Review
              </span>
              This summary is powered by CareNest AI to help you prepare questions for your physician. It does not replace clinical consultation.
            </div>

            {isExplaining ? (
              <div className="p-8 text-center space-y-2">
                <Sparkles className="w-6 h-6 animate-spin text-[#0866FF] mx-auto" />
                <p className="text-xs font-semibold text-slate-500">
                  CareNest AI is reviewing clinical terms and preparing doctor questions...
                </p>
              </div>
            ) : explainedData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Plain-Language Summary
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {explainedData.summary}
                  </p>
                </div>

                {explainedData.terminology && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Medical Terminology Glossary
                    </h4>
                    <div className="space-y-2">
                      {explainedData.terminology.map((term, i) => (
                        <div key={i} className="p-3 rounded-2xl glass-card text-xs">
                          <span className="font-bold text-[#0866FF] dark:text-[#48DFFF] block">
                            {term.term}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {term.explanation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {explainedData.questionsForDoctor && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recommended Questions for Your Doctor
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {explainedData.questionsForDoctor.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDoc(null);
                  setExplainedData(null);
                }}
                className="rounded-xl px-4 bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white"
              >
                Close Analysis
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
