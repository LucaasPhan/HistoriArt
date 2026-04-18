import React, { useState, useEffect } from "react";
import { X, Loader2, Sparkles, Plus, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

type AIGeneratePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  chapterNumber: number;
  onSaved: () => void;
};

export default function AIGeneratePanel({ isOpen, onClose, bookId, chapterNumber, onSaved }: AIGeneratePanelProps) {
  const { t } = useTranslation();
  const [count, setCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<Set<string>>(new Set(["multiple_choice", "true_false", "short_answer"]));
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);

  const QUESTION_TYPES = [
    { key: "multiple_choice", label: "Trắc nghiệm" },
    { key: "true_false",      label: "Đúng / Sai" },
    { key: "short_answer",    label: "Tự luận" },
  ];

  const toggleType = (key: string) => {
    setQuestionTypes(prev => {
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
        body: JSON.stringify({ bookId, chapterNumber, pageContent, count, questionTypes: Array.from(questionTypes) })
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
        isPublished: false
      };
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save");
      
      setSavedIds(prev => new Set(prev).add(index));
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
          const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          if (res.ok) {
            setSavedIds(prev => new Set(prev).add(i));
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
      className={`fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-sm transition-all ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-[500px] h-full overflow-y-auto shadow-2xl flex flex-col transition-transform duration-300 border-l border-border-subtle bg-bg-primary text-text-primary ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle p-6 bg-gradient-to-r from-purple-500/5 to-transparent">
          <h2 className="text-xl font-bold flex items-center gap-3 m-0">
            <div className="p-2 rounded-lg bg-accent-glow flex">
              <Sparkles size={20} className="text-accent-primary"/>
            </div>
            {t("admin.generateWithAI")}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-bg-secondary rounded-full flex items-center transition-colors"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col border-b border-border-subtle p-6 gap-5">
          {/* Count */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-text-secondary uppercase tracking-wider">
              Số lượng câu hỏi
            </label>
            <input
              type="number" min={1} max={20} value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full px-[18px] py-[14px] rounded-xl border border-border-subtle bg-bg-card text-text-primary text-base font-semibold outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all appearance-none"
            />
          </div>

          {/* Question types */}
          <div>
            <label className="block text-xs font-semibold mb-3 text-text-secondary uppercase tracking-wider">
              Loại câu hỏi
            </label>
            <div className="flex gap-2 flex-wrap">
              {QUESTION_TYPES.map(({ key, label }) => {
                const active = questionTypes.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border-1.5 transition-all
                      ${active 
                        ? 'border-accent-primary bg-accent-glow text-accent-primary' 
                        : 'border-border-subtle bg-bg-card text-text-secondary hover:bg-bg-secondary'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <button
            disabled={isGenerating} onClick={handleGenerate}
            className={`w-full py-3.5 rounded-xl font-bold text-[15px] flex justify-center items-center gap-2 transition-all duration-300
              ${isGenerating 
                ? 'bg-border-subtle text-text-secondary cursor-not-allowed' 
                : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20} />}
            {isGenerating ? t("admin.generating") : "Tạo câu hỏi bằng AI"}
          </button>
        </div>

        {/* Results Stream */}
        <div className={`flex-1 flex flex-col gap-5 p-6 bg-bg-secondary overflow-y-auto ${questions.length > 0 ? 'pb-24' : 'pb-6'}`}>
          {questions.map((q, i) => (
            <div 
              key={i} 
              className="group rounded-2xl border border-border-subtle shadow-sm flex flex-col p-5 gap-3 bg-bg-card hover:translate-y-[-4px] transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md bg-accent-glow text-accent-primary">
                  {q.questionType.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-[15px] leading-relaxed text-text-primary m-0">{q.question}</p>
              
              {q.questionType === "multiple_choice" && (
                <ul className="flex flex-col gap-2 mt-1 p-0 list-none">
                  {q.options?.map((opt: string, j: number) => {
                    const isCorrect = q.correctIndex === j;
                    return (
                      <li key={j} className={`px-4 py-2.5 rounded-lg text-sm border transition-colors
                        ${isCorrect 
                          ? 'border-green-500/30 bg-green-500/10 text-green-700 font-semibold' 
                          : 'bg-bg-secondary border-transparent text-text-secondary'}`}>
                        {opt}
                      </li>
                    );
                  })}
                </ul>
              )}
              {q.questionType === "true_false" && (
                <div className="mt-1 px-4 py-2.5 rounded-lg border border-green-500/30 bg-green-500/10 inline-block w-fit">
                  <p className="m-0 text-xs font-bold text-green-700">
                    Sự thật: {q.correctIndex === 0 ? "Đúng" : "Sai"}
                  </p>
                </div>
              )}
              {q.questionType === "short_answer" && (
                <div className="mt-1 px-4 py-2.5 rounded-lg border border-green-500/30 bg-green-500/10">
                  <p className="m-0 text-xs text-green-700">
                    <span className="opacity-70 text-text-secondary mr-1.5">Đáp án gợi ý:</span>
                    {q.acceptedAnswers?.join(" • ")}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border-subtle flex justify-end">
                {savedIds.has(i) ? (
                  <button disabled className="text-[11px] font-bold px-4 py-2 rounded-lg bg-green-500/15 text-green-700 flex items-center gap-1.5 border-none cursor-default">
                    <Check size={14} strokeWidth={3}/> Đã thêm vào bản nháp
                  </button>
                ) : (
                  <button 
                    onClick={() => saveQuestion(q, i)} 
                    className="text-[11px] font-bold px-4 py-2 rounded-lg border border-border-subtle bg-transparent text-text-secondary flex items-center gap-1.5 cursor-pointer transition-all hover:border-accent-primary hover:bg-accent-glow hover:text-accent-primary shadow-sm active:scale-95"
                  >
                    <Plus size={14} strokeWidth={2.5}/> Thêm vào bản nháp
                  </button>
                )}
              </div>
            </div>
          ))}
          {questions.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 opacity-50 text-center">
              <Sparkles size={48} className="mb-4 text-text-tertiary mx-auto block" />
              <p className="text-sm text-text-secondary max-w-[200px]">Hãy nhấn tạo để AI phân tích nội dung chương này.</p>
            </div>
          )}
        </div>

        {questions.length > 0 && (
          <div className="border-t border-border-subtle backdrop-blur-xl sticky bottom-0 w-full p-6 bg-bg-card/90">
            <button
              onClick={saveAll} disabled={isSavingAll || savedIds.size === questions.length}
              className={`w-full py-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all border-none
                ${(isSavingAll || savedIds.size === questions.length) 
                  ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed opacity-50' 
                  : 'bg-text-primary text-bg-primary hover:opacity-90 active:scale-[0.99] shadow-xl'}`}
            >
              {isSavingAll && <Loader2 className="animate-spin" size={16}/>}
              Thêm tất cả {questions.length} câu vào bản nháp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
