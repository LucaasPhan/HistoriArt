import { Loader2, BookOpen, X, Save, Upload } from "lucide-react";
import { ChangeEvent, RefObject, useEffect } from "react";
import { EditBookForm } from "../types";
import styles from "./styles/EditBookDialog.module.css";

type Props = {
  open: boolean;
  form: EditBookForm;
  isUploadingCover: boolean;
  isSaving: boolean;
  coverFileInputRef: RefObject<HTMLInputElement | null>;
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: keyof EditBookForm, value: string) => void;
  onUploadClick: () => void;
  onRemoveCover: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
};

export default function EditBookDialog({
  open,
  form,
  isUploadingCover,
  isSaving,
  coverFileInputRef,
  onOpenChange,
  onFieldChange,
  onUploadClick,
  onRemoveCover,
  onFileChange,
  onSave,
}: Props) {
  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => onOpenChange(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.editIcon}>
              <BookOpen size={18} color="white" />
            </div>
            <div>
              <div className={styles.title}>Edit Book</div>
              <div className={styles.pageLabel}>Update title, author, description, and cover image.</div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              placeholder="Book title"
              maxLength={255}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Author</label>
            <input
              className={styles.input}
              value={form.author}
              onChange={(e) => onFieldChange("author", e.target.value)}
              placeholder="Book author"
              maxLength={255}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder="Book description"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cover image URL</label>
            <input
              className={styles.input}
              value={form.coverUrl}
              onChange={(e) => onFieldChange("coverUrl", e.target.value)}
              placeholder="https://..."
            />
            <div className={styles.coverControls}>
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={onUploadClick}
                disabled={isUploadingCover}
              >
                {isUploadingCover ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Upload size={14} />
                )}
                {isUploadingCover ? "Uploading..." : "Upload Cover"}
              </button>
              <button
                type="button"
                className={styles.removeCoverBtn}
                onClick={onRemoveCover}
              >
                Remove cover
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
              }}
              disabled={isSaving || isUploadingCover}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={(e) => {
                e.preventDefault();
                onSave();
              }}
              disabled={isSaving || isUploadingCover}
            >
              {isSaving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
