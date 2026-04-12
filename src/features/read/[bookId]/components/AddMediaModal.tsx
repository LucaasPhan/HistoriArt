import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import type { MediaAnnotation } from "../types";

type AddMediaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  passageText: string;
  onSubmit: (data: {
    mediaType: "image" | "video" | "audio" | "annotation";
    mediaUrl: string;
    caption: string;
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
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "annotation">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ mediaType, mediaUrl, caption });
  };

  // Reset form when opened or editData changes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setMediaType(editData.mediaType);
        setMediaUrl(editData.mediaUrl || "");
        setCaption(editData.caption || "");
      } else {
        setMediaType("image");
        setMediaUrl("");
        setCaption("");
      }
    }
  }, [isOpen, editData]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 overflow-hidden border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 p-0 text-[var(--text-primary)] shadow-[var(--shadow-card)] backdrop-blur-xl sm:max-w-lg">
        <DialogHeader className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 px-6 py-5">
          <DialogTitle className="font-serif text-xl font-semibold text-[var(--text-primary)]">
            {editData ? "Cập Nhật Tư Liệu" : "Thêm Tư Liệu"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editData ? "Chỉnh sửa thông tin tư liệu đã chọn" : "Thêm tư liệu mới cho đoạn văn bản"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-5">
          {/* Passage Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">
              Đoạn văn bản đã chọn
            </label>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 px-4 py-3 leading-relaxed text-[var(--text-secondary)] italic shadow-inner">
              {passageText ? (
                `"${passageText.length > 150 ? passageText.substring(0, 150) + "..." : passageText}"`
              ) : (
                <span className="text-[var(--text-tertiary)] not-italic">
                  Tư liệu chung cho trang này (không gắn với đoạn văn cụ thể)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Media Type */}
            <div className="flex flex-col gap-2 md:col-span-1">
              <label htmlFor="mediaType" className="text-sm font-medium text-[var(--text-primary)]">
                Loại tư liệu
              </label>
              <div className="relative">
                <select
                  id="mediaType"
                  value={mediaType}
                  onChange={(e) =>
                    setMediaType(e.target.value as "image" | "video" | "audio" | "annotation")
                  }
                  className="w-full cursor-pointer appearance-none rounded-lg border border-[var(--border-hover)] bg-[var(--bg-primary)] px-4 py-2.5 text-[var(--text-primary)] transition-all outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-glow)]"
                >
                  <option value="image">Hình ảnh</option>
                  <option value="video">Video nhúng (iframe)</option>
                  <option value="audio">Âm thanh</option>
                  <option value="annotation">Chỉ văn bản giải nghĩa</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-tertiary)]">
                  <svg
                    className="h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* URL Input */}
            {mediaType !== "annotation" && (
              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="mediaUrl"
                  className="flex items-center justify-between text-sm font-medium text-[var(--text-primary)]"
                >
                  Đường dẫn{" "}
                  {mediaType === "video"
                    ? "nhúng (Embed URL)"
                    : mediaType === "audio"
                      ? "âm thanh"
                      : "ảnh"}
                  {mediaType === "video" && (
                    <span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">
                      VD: youtube.com/embed/...
                    </span>
                  )}
                </label>
                <input
                  id="mediaUrl"
                  type="url"
                  required
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={
                    mediaType === "video"
                      ? "https://www.youtube.com/embed/XXXXX"
                      : mediaType === "audio"
                        ? "https://example.com/audio.mp3"
                        : "https://example.com/image.jpg"
                  }
                  className="w-full rounded-lg border border-[var(--border-hover)] bg-[var(--bg-primary)] px-4 py-2.5 text-[var(--text-primary)] transition-all outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-glow)]"
                />
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="flex flex-col gap-2">
            <label htmlFor="caption" className="text-sm font-medium text-[var(--text-primary)]">
              Mô tả / Hiệu đính
            </label>
            <textarea
              id="caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Bạn muốn lưu ý điều gì về chi tiết lịch sử này? Nhập nội dung diễn giải..."
              className="w-full resize-none rounded-lg border border-[var(--border-hover)] bg-[var(--bg-primary)] px-4 py-3 leading-relaxed text-[var(--text-primary)] transition-all outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-glow)]"
            />
          </div>

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-3 border-t border-[var(--border-subtle)] pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[var(--border-hover)] bg-transparent px-5 py-2.5 font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-w-[120px] items-center justify-center rounded-lg px-6 py-2.5 font-medium text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: "var(--accent-gradient)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang xử lý...
                </div>
              ) : editData ? (
                "Cập nhật"
              ) : (
                "Lưu tư liệu"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
