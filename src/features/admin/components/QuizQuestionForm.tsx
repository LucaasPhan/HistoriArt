import { useTranslation } from "@/lib/i18n";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./QuizQuestionForm.module.css";

type QuizQuestionFormProps = {
  isOpen: boolean;
  onClose: () => void;
  question: any | null; // using any for simplicity, or QuizQuestion
  bookId: string;
  chapterNumber: number;
  onSaved: () => void;
};

export default function QuizQuestionForm({
  isOpen,
  onClose,
  question,
  bookId,
  chapterNumber,
  onSaved,
}: QuizQuestionFormProps) {
  const { t } = useTranslation();

  const [qType, setQType] = useState<"multiple_choice" | "true_false" | "short_answer">(
    "multiple_choice",
  );
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [acceptedAnswersText, setAcceptedAnswersText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (question) {
        setQType(question.questionType);
        setQText(question.question);
        setOptions(question.options || ["", "", "", ""]);
        setCorrectIndex(question.correctIndex ?? 0);
        setAcceptedAnswersText(
          question.acceptedAnswers ? question.acceptedAnswers.join("\\n") : "",
        );
        setExplanation(question.explanation || "");
      } else {
        setQType("multiple_choice");
        setQText("");
        setOptions(["", "", "", ""]);
        setCorrectIndex(0);
        setAcceptedAnswersText("");
        setExplanation("");
      }
    }
  }, [isOpen, question]);

  if (!isOpen) return null;

  const handleSave = async (isPublished: boolean) => {
    if (!qText.trim()) return toast.error("Question text is required");

    let payload: any = {
      bookId,
      chapterNumber,
      questionType: qType,
      question: qText,
      explanation,
      isPublished,
    };

    if (qType === "multiple_choice") {
      if (options.some((o) => !o.trim())) return toast.error("All 4 options must be filled");
      payload.options = options;
      payload.correctIndex = correctIndex;
    } else if (qType === "true_false") {
      payload.correctIndex = correctIndex;
    } else if (qType === "short_answer") {
      const answers = acceptedAnswersText
        .split("\\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (answers.length === 0) return toast.error("At least one accepted answer is required");
      payload.acceptedAnswers = answers;
    }

    if (question?.id) payload.id = question.id;

    setIsSaving(true);
    try {
      const res = await fetch("/api/quiz", {
        method: question ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      toast.success(isPublished ? "Published!" : "Draft saved!");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {question ? t("admin.editQuestion") : t("admin.addQuestion")}
          </h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t("admin.questionType")}</label>
            <select
              value={qType}
              onChange={(e) => setQType(e.target.value as any)}
              className={styles.select}
            >
              <option value="multiple_choice">{t("admin.multipleChoice")}</option>
              <option value="true_false">{t("admin.trueFalse")}</option>
              <option value="short_answer">{t("admin.shortAnswer")}</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t("quiz.question")}</label>
            <textarea
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className={`${styles.textarea} ${styles.textareaQuestion}`}
              placeholder="What year did..."
            />
          </div>

          {qType === "multiple_choice" && (
            <div className={styles.fieldGroup}>
              <label className={`${styles.label} mb-2`}>{t("admin.options")}</label>
              <div className={styles.optionsContainer}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.optionRow}>
                    <input
                      type="radio"
                      name="correctIndex"
                      checked={correctIndex === i}
                      onChange={() => setCorrectIndex(i)}
                      className={styles.radio}
                    />
                    <textarea
                      value={options[i]}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className={`${styles.optionInput} ${correctIndex === i ? styles.optionInputSelected : ""}`}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      rows={1}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {qType === "true_false" && (
            <div className={styles.fieldGroup}>
              <label className={`${styles.label} mb-2`}>{t("admin.correctOption")}</label>
              <div className={styles.tfContainer}>
                <label className={styles.tfLabel}>
                  <input
                    type="radio"
                    name="tf"
                    checked={correctIndex === 0}
                    onChange={() => setCorrectIndex(0)}
                    className={styles.radio}
                  />
                  <span className={styles.tfText}>{t("quiz.true")}</span>
                </label>
                <label className={styles.tfLabel}>
                  <input
                    type="radio"
                    name="tf"
                    checked={correctIndex === 1}
                    onChange={() => setCorrectIndex(1)}
                    className={styles.radio}
                  />
                  <span className={styles.tfText}>{t("quiz.false")}</span>
                </label>
              </div>
            </div>
          )}

          {qType === "short_answer" && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("admin.acceptedAnswers")}</label>
              <textarea
                value={acceptedAnswersText}
                onChange={(e) => setAcceptedAnswersText(e.target.value)}
                className={`${styles.textarea} ${styles.textareaMono}`}
                placeholder="Answer 1\nAnswer 2"
              />
              <p className={styles.hintText}>Enter each answer on a new line.</p>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t("quiz.explanation")} (Optional)</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className={`${styles.textarea} ${styles.textareaSmall}`}
              placeholder="Provide a hint or context..."
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn} disabled={isSaving}>
            Cancel
          </button>

          <button onClick={() => handleSave(false)} className={styles.draftBtn} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : t("admin.draft")}
          </button>

          <button
            onClick={() => handleSave(true)}
            className={styles.publishBtn}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : t("admin.publish")}
          </button>
        </div>
      </div>
    </div>
  );
}
