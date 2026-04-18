"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import AIGeneratePanel from "@/features/admin/components/AIGeneratePanel";
import QuizQuestionForm from "@/features/admin/components/QuizQuestionForm";
import { useTranslation } from "@/lib/i18n";
import { BookOpen, Check, Layers, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./AdminQuiz.module.css";
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
  const [availableBooks, setAvailableBooks] = useState<{ id: string; title: string }[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [bookId, setBookId] = useState("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Fetch Available Books
  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        if (data.books) {
          setAvailableBooks(data.books);
          if (data.books.length > 0) {
            setBookId(data.books[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingBooks(false));
  }, []);

  // Fetch chapters
  useEffect(() => {
    if (!bookId) return;
    fetch(`/api/books/${bookId}/chapters`)
      .then((res) => res.json())
      .then((data) => {
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
      .then((res) => res.json())
      .then((data) => {
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
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Question deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageWrapper}>
        {/* PAGE TITLE */}
        <div className={styles.pageTitleSection}>
          <BookOpen className="text-accent-primary" size={22} />
          <h1 className={styles.pageTitle}>{t("admin.quizManager")}</h1>
        </div>

        <div className={styles.gridContainer}>
          {/* ── LEFT SIDEBAR ── */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              {/* Book selector */}
              <div className={`${styles.sidebarSection} ${styles.bookSelector}`}>
                <p className={styles.sidebarLabel}>{t("admin.Book")}</p>
                <div className={styles.selectWrapper}>
                  <select
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    className={styles.customSelect}
                    disabled={loadingBooks}
                  >
                    {loadingBooks ? (
                      <option>Loading books...</option>
                    ) : (
                      availableBooks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))
                    )}
                  </select>
                  <div className={styles.selectIcon}>
                    <Layers size={12} />
                  </div>
                </div>
              </div>

              {/* Chapter list */}
              <div className={`${styles.sidebarSection} ${styles.chapterSelector}`}>
                <p className={styles.chapterLabel}>{t("admin.selectChapter")}</p>
                <div className={styles.chapterList}>
                  {chapters.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => setSelectedChapter(chap.chapterNumber)}
                      className={`${styles.chapterBtn} ${
                        selectedChapter === chap.chapterNumber
                          ? styles.chapterBtnActive
                          : styles.chapterBtnInactive
                      }`}
                    >
                      <span className="block truncate">{chap.title}</span>
                    </button>
                  ))}
                  {chapters.length === 0 && (
                    <p className="text-text-tertiary py-8 text-center text-[11px]">
                      No chapters found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className={styles.mainPanel}>
            {/* Panel header */}
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <Layers size={18} className="text-text-secondary" />
                {t("quiz.question")} {t("quiz.of")} {t("dashboard.chapter")}{" "}
                {selectedChapter ?? "-"}
              </h2>

              <div className={styles.headerActions}>
                <button
                  disabled={
                    selectedChapter === null ||
                    questions.length === 0 ||
                    questions.every((q) => q.isPublished)
                  }
                  onClick={async () => {
                    const drafts = questions.filter((q) => !q.isPublished);
                    if (drafts.length === 0) return;
                    if (!confirm(`Publish all ${drafts.length} drafts?`)) return;
                    try {
                      for (const q of drafts) {
                        await fetch("/api/quiz", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...q, isPublished: true }),
                        });
                      }
                      setQuestions((prev) => prev.map((q) => ({ ...q, isPublished: true })));
                      toast.success("All questions published!");
                    } catch (e) {
                      toast.error("Failed to publish some questions");
                    }
                  }}
                  className={`${styles.actionBtnBase} ${styles.btnSecondary}`}
                >
                  <Check size={13} className="text-green-500" />
                  {"Publish All"}
                </button>

                <button
                  disabled={selectedChapter === null}
                  onClick={() => setShowAIPanel(true)}
                  className={`${styles.actionBtnBase} ${styles.btnTonal}`}
                >
                  <Sparkles size={13} style={{ color: "var(--accent-primary)" }} />
                  {t("admin.generateWithAI")}
                </button>

                <button
                  disabled={selectedChapter === null}
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowForm(true);
                  }}
                  className={`${styles.actionBtnBase} ${styles.btnPrimary}`}
                >
                  <Plus size={13} strokeWidth={3} />
                  {t("admin.addQuestion")}
                </button>
              </div>
            </div>

            {/* Question list */}
            <div className={styles.questionList}>
              {loadingQuestions ? (
                <div className={styles.loadingBox}>
                  <Loader2 size={28} className="text-accent-primary animate-spin" />
                  <span className={styles.loadingText}>{t("common.loading")}</span>
                </div>
              ) : questions.length === 0 ? (
                <div className={styles.emptyBox}>
                  <div className={styles.emptyIconCircle}>
                    <BookOpen size={24} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                  </div>
                  <p className={styles.emptyText}>{t("quiz.noQuestions")}</p>
                  <button onClick={() => setShowForm(true)} className={styles.emptyBtn}>
                    <Plus size={13} />
                    {t("admin.addQuestion")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {questions.map((q, i) => (
                    <div key={q.id} className={styles.questionItem}>
                      <div className={styles.questionInfo}>
                        <div className={styles.questionMeta}>
                          <span className={styles.metaText}>
                            {q.questionType === "multiple_choice"
                              ? t("admin.multipleChoice")
                              : q.questionType === "true_false"
                                ? t("admin.trueFalse")
                                : t("admin.shortAnswer")}
                          </span>
                          <span className={styles.metaSeparator}>•</span>
                          <span className={styles.metaText}>
                            {q.isPublished ? t("admin.published") : t("admin.draft")}
                          </span>
                        </div>
                        <p className={styles.questionText}>{q.question}</p>
                      </div>

                      <div className={styles.itemActions}>
                        {!q.isPublished && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/quiz", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ ...q, isPublished: true }),
                                });
                                if (!res.ok) throw new Error();
                                setQuestions((prev) =>
                                  prev.map((item) =>
                                    item.id === q.id ? { ...item, isPublished: true } : item,
                                  ),
                                );
                                toast.success("Published!");
                              } catch (e) {
                                toast.error("Failed to publish");
                              }
                            }}
                            className={`${styles.iconBtn} ${styles.iconBtnPublish}`}
                            title={t("admin.publish")}
                          >
                            <Check size={15} strokeWidth={3} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setShowForm(true);
                          }}
                          className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                          title={t("admin.editQuestion")}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
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
            .then((res) => res.json())
            .then((data) => {
              if (data.questions) setQuestions(data.questions);
            })
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
            .then((res) => res.json())
            .then((data) => {
              if (data.questions) setQuestions(data.questions);
            })
            .finally(() => setLoadingQuestions(false));
        }}
      />

      <PageMountSignaler />
    </div>
  );
}
