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
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { repository } from '@/lib/data/repository';
import { aiService } from '@/lib/ai/service';
import { validateFileUpload } from '@/lib/security';
import { DocumentItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function DocumentsPage() {
  const { t } = useLanguage();
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
    setDocuments(repository.getDocuments());
  }, []);

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
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      userId: 'usr-default-001',
      categoryId: 'lab_reports',
      categoryName: 'Patient Uploaded Record',
      title: file.name.replace(/\.[^/.]+$/, ''),
      filePath: `/secure_vault/${file.name}`,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/pdf',
      createdAt: new Date().toISOString(),
    };

    repository.addDocument(newDoc);
    setDocuments(repository.getDocuments());
    e.target.value = '';
  };

  const handleDelete = (docId: string) => {
    repository.deleteDocument(docId);
    setDocuments(repository.getDocuments());
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
      setExplainedData(null);
    }
  };

  const handleExplainWithAI = async (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsExplaining(true);
    setExplainedData(null);

    try {
      const result = await aiService.explainDocument(doc.title, 'Clinical document content');
      setExplainedData(result);
    } catch (err) {
      console.error('Failed to explain document:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.categoryName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Badge variant="default">Encrypted Storage</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          {t.documents.title}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.documents.subtitle}
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-slate-300 hover:border-teal-500 transition-colors p-8 text-center bg-white/70">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t.documents.uploadBtn}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t.documents.dragDropText}
            </p>
          </div>

          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileUpload}
              className="sr-only"
            />
            <span className="inline-flex items-center px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-xs transition">
              Select Document File
            </span>
          </label>

          {uploadError && (
            <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            Stored Documents ({filteredDocs.length})
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="p-5 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                      {doc.categoryName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{doc.title}</h3>
                  <p className="text-xs text-slate-500">
                    Size: {(doc.fileSizeBytes / 1024).toFixed(1)} KB • Type: {doc.mimeType}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleExplainWithAI(doc)}
                    className="inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-xl border border-teal-200 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {t.documents.explainWithAI}
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500 text-xs">
            {t.documents.noDocs}
          </Card>
        )}
      </div>

      {/* Document AI Explanation Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title}
        description="Patient-Friendly Document Explanation (Original document remains unaltered)"
      >
        {isExplaining ? (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center space-y-2">
            <Sparkles className="w-6 h-6 text-teal-600 animate-spin" />
            <span>{t.documents.explaining}</span>
          </div>
        ) : explainedData ? (
          <div className="space-y-4 text-xs">
            {/* Plain English Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Plain English Summary:</span>
              <p className="text-slate-700 leading-relaxed">{explainedData.summary}</p>
            </div>

            {/* Terminology */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">
                {t.documents.terminology}
              </span>
              {explainedData.terminology.map((term, i) => (
                <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
                  <span className="font-bold text-teal-800">{term.term}</span>
                  <p className="text-slate-600">{term.explanation}</p>
                </div>
              ))}
            </div>

            {/* Questions to ask doctor */}
            <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1.5">
              <span className="font-bold text-indigo-950 block">
                {t.documents.questionsForDoctor}
              </span>
              <ul className="list-disc list-inside space-y-1 text-indigo-900">
                {explainedData.questionsForDoctor.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Disclaimer: This AI summary is for health literacy. It does not replace professional pathology review.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
