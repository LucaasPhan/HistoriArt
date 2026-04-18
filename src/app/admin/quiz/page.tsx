"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import { useTranslation } from "@/lib/i18n";
import { BookOpen, Layers, Plus, Sparkles, Pencil, Trash2, Loader2, Check } from "lucide-react";
import React, { useEffect, useState } from "react";
const AVAILABLE_BOOKS = [
  { id: "an-tu-cong-chua", title: "An Tư" },
  { id: "diem-hen-lich-su", title: "Điện Biên Phủ - Điểm hẹn lịch sử" },
  { id: "tong-hanh-dinh-trong-mua-xuan-toan-thang", title: "Tổng Hành Dinh Trong Mùa Xuân Toàn Thắng" },
];
import QuizQuestionForm from "@/features/admin/components/QuizQuestionForm";
import AIGeneratePanel from "@/features/admin/components/AIGeneratePanel";
import { toast } from "sonner";

type QuizQuestion = {
  id: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  isPublished: boolean;
};

export default function AdminQuizManagerPage() {
  const { t } = useTranslation();
  const [bookId, setBookId] = useState(AVAILABLE_BOOKS[0].id);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Fetch chapters
  useEffect(() => {
    fetch(`/api/books/${bookId}/chapters`)
      .then(res => res.json())
      .then(data => {
        if (data.chapters) {
          setChapters(data.chapters);
          if (data.chapters.length > 0) {
            setSelectedChapter(data.chapters[0].chapterNumber);
          } else {
            setSelectedChapter(null);
          }
        }
      })
      .catch(console.error);
  }, [bookId]);

  // Fetch questions
  useEffect(() => {
    if (!selectedChapter) {
      setQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    fetch(`/api/quiz?bookId=${bookId}&chapterNumber=${selectedChapter}`)
      .then(res => res.json())
      .then(data => {
        if (data.questions) setQuestions(data.questions);
      })
      .catch(console.error)
      .finally(() => setLoadingQuestions(false));
  }, [bookId, selectedChapter]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/quiz?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Question deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center" style={{ paddingTop: "120px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px" }}>
      <div className="w-full flex flex-col" style={{ maxWidth: "1280px" }}>
        {/* PAGE TITLE */}
        <div className="flex items-center" style={{ gap: "12px", marginBottom: "32px" }}>
          <BookOpen className="text-accent-primary" size={22} />
          <h1 className="text-2xl font-black text-text-primary" style={{ margin: 0 }}>
            {t("admin.quizManager")}
          </h1>
        </div>

        <div className="grid items-start lg:grid-cols-[260px_1fr] grid-cols-1" style={{ gap: "24px" }}>
          
          {/* ── LEFT SIDEBAR ── */}
          <div className="sticky" style={{ top: "120px" }}>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)" }}>
              {/* Book selector */}
              <div style={{ paddingTop: "20px", paddingBottom: "12px", paddingLeft: "16px", paddingRight: "16px" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary" style={{ marginBottom: "8px" }}>{t("admin.selectBook")}</p>
                <div className="relative">
                  <select
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    className="w-full text-sm outline-none cursor-pointer rounded-lg font-semibold appearance-none"
                    style={{ padding: "10px 32px 10px 12px", background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                  >
                    {AVAILABLE_BOOKS.map(b => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                  <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ right: "12px", color: "var(--text-tertiary)" }}>
                    <Layers size={12} />
                  </div>
                </div>
              </div>

              {/* Chapter list */}
              <div style={{ paddingBottom: "16px", paddingLeft: "16px", paddingRight: "16px" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary" style={{ marginBottom: "12px" }}>{t("admin.selectChapter")}</p>
                <div className="flex flex-col overflow-y-auto" style={{ gap: "6px", maxHeight: "460px" }}>
                  {chapters.map(chap => (
                    <button
                      key={chap.id}
                      onClick={() => setSelectedChapter(chap.chapterNumber)}
                      className={`text-left text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
                        selectedChapter === chap.chapterNumber
                          ? "text-white shadow-md"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                      style={Object.assign(
                        { padding: "10px 16px" },
                        selectedChapter === chap.chapterNumber
                          ? { background: "var(--accent-gradient)", boxShadow: "0 4px 12px rgba(212,110,86,0.3)" }
                          : { background: "transparent" }
                      )}
                    >
                      <span className="truncate block">{chap.title}</span>
                    </button>
                  ))}
                  {chapters.length === 0 && (
                    <p className="text-[11px] text-text-tertiary text-center" style={{ paddingTop: "32px", paddingBottom: "32px" }}>No chapters found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex flex-col min-w-0">
            {/* Panel header */}
            <div className="flex items-center justify-between" style={{ gap: "16px", marginBottom: "20px" }}>
              <h2 className="flex items-center text-base font-bold text-text-primary" style={{ gap: "8px", margin: 0 }}>
                <Layers size={18} className="text-text-secondary" />
                {t("quiz.question")} {t("quiz.of")} {t("dashboard.chapter")} {selectedChapter ?? "-"}
              </h2>

              <div className="flex items-center" style={{ gap: "8px" }}>
                <button
                  disabled={selectedChapter === null || questions.length === 0 || questions.every(q => q.isPublished)}
                  onClick={async () => {
                    const drafts = questions.filter(q => !q.isPublished);
                    if (drafts.length === 0) return;
                    if (!confirm(`Publish all ${drafts.length} drafts?`)) return;
                    try {
                      for (const q of drafts) {
                        await fetch("/api/quiz", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...q, isPublished: true })
                        });
                      }
                      setQuestions(prev => prev.map(q => ({ ...q, isPublished: true })));
                      toast.success("All questions published!");
                    } catch (e) {
                      toast.error("Failed to publish some questions");
                    }
                  }}
                  className="flex items-center rounded-full text-xs font-bold transition-all disabled:opacity-40"
                  style={{ gap: "6px", padding: "8px 16px", background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                >
                  <Check size={13} className="text-green-500" />
                  {"Publish All"}
                </button>

                <button
                  disabled={selectedChapter === null}
                  onClick={() => setShowAIPanel(true)}
                  className="flex items-center rounded-full text-xs font-bold transition-all disabled:opacity-40"
                  style={{ gap: "6px", padding: "8px 16px", background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                >
                  <Sparkles size={13} style={{ color: "var(--accent-primary)" }} />
                  {t("admin.generateWithAI")}
                </button>

                <button
                  disabled={selectedChapter === null}
                  onClick={() => { setEditingQuestion(null); setShowForm(true); }}
                  className="flex items-center rounded-full text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                  style={{ gap: "6px", padding: "8px 16px", background: "var(--accent-gradient)" }}
                >
                  <Plus size={13} strokeWidth={3} />
                  {t("admin.addQuestion")}
                </button>
              </div>
            </div>

            {/* Question list */}
            <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)" }}>
              {loadingQuestions ? (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: "64px", paddingBottom: "64px", gap: "12px" }}>
                  <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary animate-pulse">{t("common.loading")}</span>
                </div>
              ) : questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: "80px", paddingBottom: "80px", gap: "16px" }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
                    <BookOpen size={24} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                  </div>
                  <p className="text-sm font-bold text-text-secondary" style={{ margin: 0 }}>{t("quiz.noQuestions")}</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center rounded-full text-xs font-bold transition-all"
                    style={{ gap: "8px", padding: "8px 20px", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}
                  >
                    <Plus size={13} />
                    {t("admin.addQuestion")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="group relative flex items-center justify-between transition-colors duration-200"
                      style={{
                        paddingTop: "16px", paddingBottom: "16px", paddingLeft: "24px", paddingRight: "24px", gap: "16px",
                        borderTop: i > 0 ? "1px solid var(--border-subtle)" : undefined,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center" style={{ gap: "8px", marginBottom: "4px" }}>
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-tertiary">
                            {q.questionType === "multiple_choice" ? t("admin.multipleChoice") : q.questionType === "true_false" ? t("admin.trueFalse") : t("admin.shortAnswer")}
                          </span>
                          <span className="text-[10px] text-text-tertiary">•</span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-tertiary">
                            {q.isPublished ? t("admin.published") : t("admin.draft")}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary leading-snug" style={{ margin: 0 }}>
                          {q.question}
                        </p>
                      </div>

                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ gap: "4px" }}>
                        {!q.isPublished && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/quiz", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ ...q, isPublished: true })
                                });
                                if (!res.ok) throw new Error();
                                setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, isPublished: true } : item));
                                toast.success("Published!");
                              } catch (e) {
                                toast.error("Failed to publish");
                              }
                            }}
                            className="rounded-lg transition-colors text-green-500 hover:bg-green-500/10"
                            style={{ padding: "8px" }}
                            title={t("admin.publish")}
                          >
                            <Check size={15} strokeWidth={3} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingQuestion(q); setShowForm(true); }}
                          className="rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
                          style={{ padding: "8px" }}
                          title={t("admin.editQuestion")}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="rounded-lg transition-colors text-text-tertiary hover:text-red-500"
                          style={{ padding: "8px" }}
                          title={t("admin.deleteQuestion")}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <QuizQuestionForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        question={editingQuestion} 
        bookId={bookId}
        chapterNumber={selectedChapter || 1}
        onSaved={() => {
          // Trigger re-fetch
          setLoadingQuestions(true);
          fetch(`/api/quiz?bookId=${bookId}&chapterNumber=${selectedChapter}`)
            .then(res => res.json())
            .then(data => { if (data.questions) setQuestions(data.questions); })
            .finally(() => setLoadingQuestions(false));
        }}
      />
      
      <AIGeneratePanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        bookId={bookId}
        chapterNumber={selectedChapter || 1}
        onSaved={() => {
          setLoadingQuestions(true);
          fetch(`/api/quiz?bookId=${bookId}&chapterNumber=${selectedChapter}`)
            .then(res => res.json())
            .then(data => { if (data.questions) setQuestions(data.questions); })
            .finally(() => setLoadingQuestions(false));
        }}
      />

      <PageMountSignaler/>
    </div>
  );
}
