import { useTranslation } from "@/lib/i18n";
import { Check, Loader2, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./AIGeneratePanel.module.css";

type AIGeneratePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  chapterNumber: number;
  onSaved: () => void;
};

export default function AIGeneratePanel({
  isOpen,
  onClose,
  bookId,
  chapterNumber,
  onSaved,
}: AIGeneratePanelProps) {
  const { t } = useTranslation();
  const [count, setCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<Set<string>>(
    new Set(["multiple_choice", "true_false", "short_answer"]),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);

  const QUESTION_TYPES = [
    { key: "multiple_choice", label: "Trắc nghiệm" },
    { key: "true_false", label: "Đúng / Sai" },
    { key: "short_answer", label: "Tự luận" },
  ];

  const toggleType = (key: string) => {
    setQuestionTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setQuestions([]);
      setSavedIds(new Set());
      setCount(5);
    }
  }, [isOpen, chapterNumber, bookId]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!bookId) return;
    setIsGenerating(true);
    setQuestions([]);
    setSavedIds(new Set());

    try {
      // 1. Fetch chapter boundaries
      const cRes = await fetch(`/api/books/${bookId}/chapters`);
      const { chapters } = await cRes.json();
      const chapter = chapters?.find((c: any) => c.chapterNumber === chapterNumber);

      let pageContent = "";
      if (chapter) {
        // Fetch pages sequentially
        for (let i = chapter.startPage; i <= chapter.endPage; i++) {
          const pRes = await fetch(`/api/books/${bookId}/pages?page=${i}`);
          if (pRes.ok) {
            const data = await pRes.json();
            if (data.content) pageContent += data.content + "\\n\\n";
          }
        }
      }

      if (!pageContent) throw new Error("Could not extract chapter text");

      // 2. Generate
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          chapterNumber,
          pageContent,
          count,
          questionTypes: Array.from(questionTypes),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Generation failed");
      }

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveQuestion = async (q: any, index: number) => {
    try {
      const payload = {
        bookId,
        chapterNumber,
        ...q,
        isPublished: false,
      };
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");

      setSavedIds((prev) => new Set(prev).add(index));
      toast.success("Saved to drafts");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveAll = async () => {
    setIsSavingAll(true);
    let successCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (!savedIds.has(i)) {
        try {
          const payload = { bookId, chapterNumber, ...questions[i], isPublished: false };
          const res = await fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            setSavedIds((prev) => new Set(prev).add(i));
            successCount++;
          }
        } catch (e) {}
      }
    }
    setIsSavingAll(false);
    if (successCount > 0) {
      toast.success(`Saved ${successCount} questions to drafts`);
      onSaved();
    }
  };

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : styles.overlayClosed}`}
      onClick={onClose}
    >
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : styles.panelClosed}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.titleGroup}>
            <div className={styles.iconWrapper}>
              <Sparkles size={20} className={styles.icon} />
            </div>
            {t("admin.generateWithAI")}
          </h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Count */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Số lượng câu hỏi</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={styles.input}
            />
          </div>

          {/* Question types */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Loại câu hỏi</label>
            <div className={styles.typeContainer}>
              {QUESTION_TYPES.map(({ key, label }) => {
                const active = questionTypes.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    className={`${styles.typeBtn} ${active ? styles.typeBtnActive : styles.typeBtnInactive}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <button
            disabled={isGenerating}
            onClick={handleGenerate}
            className={`${styles.generateBtn} ${isGenerating ? styles.generateBtnDisabled : styles.generateBtnActive}`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isGenerating ? t("admin.generating") : "Tạo câu hỏi bằng AI"}
          </button>
        </div>

        {/* Results Stream */}
        <div
          className={`${styles.resultsArea} ${questions.length > 0 ? styles.resultsAreaPadding : ""}`}
        >
          {questions.map((q, i) => (
            <div key={i} className={styles.questionCard}>
              <div className={styles.typeBadge}>
                {q.questionType.replace("_", " ").toUpperCase()}
              </div>
              <p className={styles.questionText}>{q.question}</p>

              {q.questionType === "multiple_choice" && (
                <ul className={styles.optionsList}>
                  {q.options?.map((opt: string, j: number) => {
                    const isCorrect = q.correctIndex === j;
                    return (
                      <li
                        key={j}
                        className={`${styles.optionItem} ${isCorrect ? styles.optionItemCorrect : styles.optionItemNormal}`}
                      >
                        {opt}
                      </li>
                    );
                  })}
                </ul>
              )}
              {q.questionType === "true_false" && (
                <div className={styles.answerBadge}>
                  <p className={styles.answerText}>
                    <span className={styles.answerLabel}>Sự thật:</span>{" "}
                    {q.correctIndex === 0 ? "Đúng" : "Sai"}
                  </p>
                </div>
              )}
              {q.questionType === "short_answer" && (
                <div className={styles.answerBadge}>
                  <p className={styles.answerText}>
                    <span className={styles.answerLabel}>Đáp án gợi ý:</span>
                    {q.acceptedAnswers?.join(" • ")}
                  </p>
                </div>
              )}

              <div className={styles.cardFooter}>
                {savedIds.has(i) ? (
                  <button disabled className={styles.savedBadge}>
                    <Check size={14} strokeWidth={3} /> Đã thêm vào bản nháp
                  </button>
                ) : (
                  <button onClick={() => saveQuestion(q, i)} className={styles.saveBtn}>
                    <Plus size={14} strokeWidth={2.5} /> Thêm vào bản nháp
                  </button>
                )}
              </div>
            </div>
          ))}
          {questions.length === 0 && !isGenerating && (
            <div className={styles.emptyState}>
              <Sparkles size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>Hãy nhấn tạo để AI phân tích nội dung chương này.</p>
            </div>
          )}
        </div>

        {questions.length > 0 && (
          <div className={styles.stickyFooter}>
            <button
              onClick={saveAll}
              disabled={isSavingAll || savedIds.size === questions.length}
              className={`${styles.saveAllBtn} ${isSavingAll || savedIds.size === questions.length ? styles.saveAllBtnDisabled : styles.saveAllBtnActive}`}
            >
              {isSavingAll && <Loader2 className="animate-spin" size={16} />}
              Thêm tất cả {questions.length} câu vào bản nháp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
