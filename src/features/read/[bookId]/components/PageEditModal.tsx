"use client";

import { handleTextareaShortcuts } from "@/lib/textarea-shortcuts";
import { Check, Pencil, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./styles/PageEditModal.module.css";

interface PageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  pageNumber: number;
  initialContent: string;
  pin: string;
  onSaved: (newContent: string) => void;
}

export default function PageEditModal({
  isOpen,
  onClose,
  bookId,
  pageNumber,
  initialContent,
  pin,
  onSaved,
}: PageEditModalProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setError("");
      setSuccess(false);
    }
  }, [isOpen, initialContent]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      setError("Nội dung không được để trống");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/books/${bookId}/pages/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageNumber,
          content: content.trim(),
          pin,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        onSaved(data.content);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(data.error || "Không thể lưu trang. Vui lòng thử lại.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }, [content, bookId, pageNumber, pin, onSaved, onClose]);

  // Handle Ctrl+S / Cmd+S
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleSave, onClose]);

  const handleTextareaKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    await handleTextareaShortcuts(e, {
      onChanged: () => {
        setError("");
        setSuccess(false);
      },
    });
  }, []);

  if (!isOpen) return null;

  const hasChanges = content !== initialContent;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.editIcon}>
              <Pencil size={18} color="white" />
            </div>
            <div>
              <div className={styles.title}>Chỉnh sửa nội dung</div>
              <div className={styles.pageLabel}>Trang {pageNumber}</div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.editorContainer}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
              setSuccess(false);
            }}
            onKeyDown={handleTextareaKeyDown}
            disabled={saving}
            spellCheck={false}
            autoFocus
          />
        </div>

        <div className={styles.footer}>
          <div>
            {success && (
              <span className={styles.success}>
                <Check size={14} /> Đã lưu thành công!
              </span>
            )}
            {error && <span className={styles.error}>{error}</span>}
            {!success && !error && (
              <span className={styles.charCount}>{content.length.toLocaleString()} ký tự</span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={(e) => {
                e.preventDefault();
                handleSave();
              }}
              disabled={saving || !hasChanges}
            >
              <Save size={14} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
