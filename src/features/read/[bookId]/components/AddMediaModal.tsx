import imageCompression from "browser-image-compression";
import { BookOpen, Film, Plus, Save, Trash2, X } from "lucide-react";
import { handleTextareaShortcuts } from "@/lib/textarea-shortcuts";
import React, { useEffect, useRef, useState } from "react";
import type { MediaAnnotation } from "../types";
import styles from "./styles/AddMediaModal.module.css";

type AddMediaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  passageText: string;
  onSubmit: (data: {
    mediaType: "image" | "video" | "audio" | "annotation";
    mediaUrl: string;
    caption: string;
    sources: string[];
  }) => void;
  isSubmitting?: boolean;
  editData?: MediaAnnotation | null;
};

export default function AddMediaModal({
  isOpen,
  onClose,
  passageText,
  onSubmit,
  isSubmitting = false,
  editData = null,
}: AddMediaModalProps) {
  type MediaInputMode = "upload" | "url";
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "annotation">("image");
  const [mediaInputMode, setMediaInputMode] = useState<MediaInputMode>("upload");
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const resizeCaption = () => {
    const el = captionRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPendingFile(null);
      return;
    }

    // 100MB limit check
    if (file.size > 100 * 1024 * 1024) {
      alert("Kích thước file vượt quá giới hạn 100MB");
      e.target.value = "";
      setPendingFile(null);
      return;
    }

    try {
      setIsUploading(true);
      let fileToUpload: File | Blob = file;

      // Automatically compress if it's an image
      if (file.type.startsWith("image/")) {
        try {
          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          fileToUpload = await imageCompression(file, options);
        } catch (error) {
          console.error("Compression error:", error);
          // If compression fails, use original
        }
      }

      setPendingFile(fileToUpload);
      setMediaUrl(""); // Clear the manual URL box since we have a file waiting
    } catch (error: any) {
      console.error("Lỗi xử lý file:", error);
      alert(error.message || "Xử lý file thất bại");
      e.target.value = "";
      setPendingFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Filter out empty sources
    const filteredSources = sources.filter((s) => s.trim() !== "");

    if (mediaType !== "annotation") {
      if (mediaInputMode === "upload" && !pendingFile) {
        alert("Vui lòng chọn file để tải lên.");
        return;
      }
      if (mediaInputMode === "url" && !mediaUrl.trim()) {
        alert("Vui lòng nhập đường dẫn URL.");
        return;
      }
    }

    if (mediaInputMode === "upload" && pendingFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", pendingFile);

        const response = await fetch("/api/upload-media", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        onSubmit({ mediaType, mediaUrl: data.url, caption, sources: filteredSources });
        setPendingFile(null);
      } catch (error: any) {
        console.error("Lỗi lưu file:", error);
        alert(error.message || "Lưu file thất bại");
      } finally {
        setIsUploading(false);
      }
    } else {
      onSubmit({ mediaType, mediaUrl, caption, sources: filteredSources });
    }
  };

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMediaType(e.target.value as any);
    setMediaInputMode("upload");
    setMediaUrl("");
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMediaInputModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as MediaInputMode;
    setMediaInputMode(mode);
    if (mode === "upload") {
      setMediaUrl("");
    } else {
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Sources management
  const addSource = () => {
    setSources((prev) => [...prev, ""]);
  };

  const updateSource = (index: number, value: string) => {
    setSources((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset form when opened or editData changes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setMediaType(editData.mediaType);
        setMediaInputMode(editData.mediaUrl ? "url" : "upload");
        setMediaUrl(editData.mediaUrl || "");
        setCaption(editData.caption || "");
        setSources(editData.sources && editData.sources.length > 0 ? editData.sources : []);
      } else {
        setMediaType("image");
        setMediaInputMode("upload");
        setMediaUrl("");
        setCaption("");
        setSources([]);
        setPendingFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  }, [isOpen, editData]);

  useEffect(() => {
    if (!isOpen) return;
    resizeCaption();
  }, [caption, isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.editIcon}>
              <Film size={18} color="white" />
            </div>
            <div>
              <div className={styles.title}>{editData ? "Cập Nhật Tư Liệu" : "Thêm Tư Liệu"}</div>
              <div className={styles.pageLabel}>Gắn media vào trang hoặc đoạn văn bản</div>
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

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label className={styles.subLabel}>Đoạn văn bản đã chọn</label>
            <div className={styles.passageBox}>
              {passageText ? (
                `"${passageText.length > 150 ? passageText.substring(0, 150) + "..." : passageText}"`
              ) : (
                <span style={{ fontStyle: "normal", color: "var(--text-tertiary)" }}>
                  Tư liệu chung cho trang này (không gắn với đoạn văn cụ thể)
                </span>
              )}
            </div>
          </div>

          <div className={styles.mediaControlsRow}>
            <div className={styles.formGroup}>
              <label htmlFor="mediaType" className={styles.label}>
                Loại tư liệu
              </label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={handleMediaTypeChange}
                className={styles.select}
              >
                <option value="image">Hình ảnh</option>
                <option value="video">Video nhúng (iframe)</option>
                <option value="audio">Âm thanh</option>
                <option value="annotation">Chỉ văn bản giải nghĩa</option>
              </select>
            </div>

            {mediaType !== "annotation" && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="mediaInputMode" className={styles.label}>
                    Nguồn tư liệu
                  </label>
                  <select
                    id="mediaInputMode"
                    value={mediaInputMode}
                    onChange={handleMediaInputModeChange}
                    className={styles.select}
                    disabled={isUploading || isSubmitting}
                  >
                    <option value="upload">Tải file lên</option>
                    <option value="url">Nhập URL</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {mediaInputMode === "upload"
                      ? `Tải lên ${mediaType === "audio" ? "âm thanh" : mediaType === "video" ? "video" : "ảnh"}`
                      : `Đường dẫn ${mediaType === "video" ? "nhúng (Embed URL)" : mediaType === "audio" ? "âm thanh" : "ảnh"}`}
                  </label>

                  {mediaInputMode === "upload" ? (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className={styles.fileInput}
                        accept={
                          mediaType === "audio"
                            ? "audio/*"
                            : mediaType === "video"
                              ? "video/*"
                              : "image/*"
                        }
                        onChange={handleFileUpload}
                        disabled={isUploading || isSubmitting}
                      />
                      {isUploading && (
                        <span className={styles.uploadHint}>Đang xử lý & tải lên (vui lòng đợi)...</span>
                      )}
                    </>
                  ) : (
                    <input
                      id="mediaUrl"
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={
                        mediaType === "video"
                          ? "https://www.youtube.com/embed/XXXXX"
                          : mediaType === "audio"
                            ? "https://example.com/audio.mp3"
                            : "https://example.com/image.jpg"
                      }
                      className={styles.input}
                      disabled={isUploading || isSubmitting}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="caption" className={styles.label}>
              Mô tả / Hiệu đính
            </label>
            <textarea
              ref={captionRef}
              id="caption"
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
                resizeCaption();
              }}
              onKeyDown={async (e) => {
                await handleTextareaShortcuts(e, {});
                requestAnimationFrame(resizeCaption);
              }}
              placeholder="Bạn muốn lưu ý điều gì về chi tiết lịch sử này? Nhập nội dung diễn giải..."
              className={styles.textarea}
              spellCheck={false}
            />
          </div>

          {/* Sources Section (APA Format) */}
          <div className={styles.formGroup}>
            <div className={styles.sourcesHeader}>
              <div className={styles.sourcesLabelGroup}>
                <BookOpen size={14} color="var(--accent-primary)" />
                <label className={styles.label}>Nguồn tham khảo (APA)</label>
              </div>
              <button
                type="button"
                className={styles.addSourceBtn}
                onClick={addSource}
                disabled={isSubmitting}
              >
                <Plus size={13} />
                Thêm nguồn
              </button>
            </div>

            {sources.length === 0 ? (
              <div className={styles.sourcesEmpty}>
                <BookOpen size={16} style={{ opacity: 0.4 }} />
                <span>
                  Chưa có nguồn tham khảo nào. Bấm &quot;Thêm nguồn&quot; để thêm trích dẫn APA.
                </span>
              </div>
            ) : (
              <div className={styles.sourcesList}>
                {sources.map((source, index) => (
                  <div key={index} className={styles.sourceItem}>
                    <span className={styles.sourceIndex}>{index + 1}</span>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => updateSource(index, e.target.value)}
                      placeholder="Nguyễn, V. A. (2020). Tên sách. Nhà xuất bản."
                      className={styles.sourceInput}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className={styles.removeSourceBtn}
                      onClick={() => removeSource(index)}
                      disabled={isSubmitting}
                      title="Xóa nguồn"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className={styles.footer} style={{ marginTop: 24 }}>
          <div /> {/* Left spacer */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              disabled={isSubmitting}
            >
              <Save size={14} />
              {isSubmitting ? "Đang lưu..." : editData ? "Cập nhật" : "Lưu tư liệu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
