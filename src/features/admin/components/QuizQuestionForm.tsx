import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

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
  onSaved
}: QuizQuestionFormProps) {
  const { t } = useTranslation();
  
  const [qType, setQType] = useState<"multiple_choice" | "true_false" | "short_answer">("multiple_choice");
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
        setAcceptedAnswersText(question.acceptedAnswers ? question.acceptedAnswers.join("\\n") : "");
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
      isPublished
    };

    if (qType === "multiple_choice") {
      if (options.some(o => !o.trim())) return toast.error("All 4 options must be filled");
      payload.options = options;
      payload.correctIndex = correctIndex;
    } else if (qType === "true_false") {
      payload.correctIndex = correctIndex;
    } else if (qType === "short_answer") {
      const answers = acceptedAnswersText.split("\\n").map(s => s.trim()).filter(s => s.length > 0);
      if (answers.length === 0) return toast.error("At least one accepted answer is required");
      payload.acceptedAnswers = answers;
    }

    if (question?.id) payload.id = question.id;

    setIsSaving(true);
    try {
      const res = await fetch("/api/quiz", {
        method: question ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-2xl relative bg-bg-card text-text-primary border border-border-subtle"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold m-0">{question ? t("admin.editQuestion") : t("admin.addQuestion")}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-bg-secondary rounded-full flex ml-auto transition-colors"
          >
            <X size={20}/>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">{t("admin.questionType")}</label>
            <select 
              value={qType} onChange={e => setQType(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-border-subtle outline-none bg-bg-secondary text-text-primary"
            >
              <option value="multiple_choice">{t("admin.multipleChoice")}</option>
              <option value="true_false">{t("admin.trueFalse")}</option>
              <option value="short_answer">{t("admin.shortAnswer")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">{t("quiz.question")}</label>
            <textarea 
              value={qText} onChange={e => setQText(e.target.value)}
              className="w-full p-3 rounded-lg border border-border-subtle outline-none min-h-[80px] bg-bg-secondary text-text-primary font-serif italic"
              placeholder="What year did..."
            />
          </div>

          {qType === "multiple_choice" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">{t("admin.options")}</label>
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="correctIndex" 
                      checked={correctIndex === i} 
                      onChange={() => setCorrectIndex(i)}
                      className="w-4 h-4 cursor-pointer accent-accent-primary"
                    />
                    <input 
                      type="text" 
                      value={options[i]} onChange={e => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className={`flex-1 p-2.5 rounded-lg border outline-none bg-bg-secondary text-text-primary transition-all ${correctIndex === i ? 'border-accent-primary ring-1 ring-accent-primary/20' : 'border-border-subtle'}`}
                      placeholder={`Option ${String.fromCharCode(65+i)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {qType === "true_false" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">{t("admin.correctOption")}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border-subtle bg-bg-secondary hover:border-accent-primary transition-colors flex-1">
                  <input type="radio" name="tf" checked={correctIndex === 0} onChange={() => setCorrectIndex(0)} className="w-4 h-4 accent-accent-primary"/> 
                  <span className="text-sm font-semibold">{t("quiz.true")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border-subtle bg-bg-secondary hover:border-accent-primary transition-colors flex-1">
                  <input type="radio" name="tf" checked={correctIndex === 1} onChange={() => setCorrectIndex(1)} className="w-4 h-4 accent-accent-primary"/> 
                  <span className="text-sm font-semibold">{t("quiz.false")}</span>
                </label>
              </div>
            </div>
          )}

          {qType === "short_answer" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">{t("admin.acceptedAnswers")}</label>
              <textarea 
                value={acceptedAnswersText} onChange={e => setAcceptedAnswersText(e.target.value)}
                className="w-full p-3 rounded-lg border border-border-subtle outline-none min-h-[100px] bg-bg-secondary text-text-primary font-mono text-xs"
                placeholder="Answer 1\nAnswer 2"
              />
              <p className="text-[10px] text-text-tertiary mt-1 italic">Enter each answer on a new line.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">{t("quiz.explanation")} (Optional)</label>
            <textarea 
              value={explanation} onChange={e => setExplanation(e.target.value)}
              className="w-full p-3 rounded-lg border border-border-subtle outline-none min-h-[60px] bg-bg-secondary text-text-primary text-sm"
              placeholder="Provide a hint or context..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-border-subtle">
          <button 
            onClick={onClose}
            className="px-4 py-2 border-none bg-transparent hover:text-text-primary text-text-secondary text-sm font-medium cursor-pointer transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          
          <button 
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 rounded-lg border border-border-subtle bg-transparent hover:border-text-primary text-text-primary text-sm font-bold cursor-pointer transition-all active:scale-[0.98]"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : t("admin.draft")}
          </button>
          
          <button 
            onClick={() => handleSave(true)}
            className="btn-primary min-w-[110px] py-2.5 flex items-center justify-center font-bold"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : t("admin.publish")}
          </button>
        </div>
      </div>
    </div>
  );
}
