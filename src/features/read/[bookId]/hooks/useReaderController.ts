"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Highlight } from "../components/HighlightsSidebar";
import type { MediaAnnotation } from "../types";

type UseReaderControllerArgs = {
  bookId: string;
};

export default function useReaderController({ bookId }: UseReaderControllerArgs) {
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [currentPage, setCurrentPage] = useState(
    !isNaN(initialPage) && initialPage >= 1 ? initialPage : 1,
  );
  const [mediaPanelOpen, setMediaPanelOpen] = useState(false);
  const [chaptersSidebarOpen, setChaptersSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(`last_page_${bookId}`, currentPage.toString());

    // Sync to DB
    fetch("/api/reading-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, pageNumber: currentPage }),
    }).catch(console.error);
  }, [currentPage, bookId]);

  const [selectedText, setSelectedText] = useState("");
  const [selectionCoords, setSelectionCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [pageDirection, setPageDirection] = useState<"next" | "prev">("next");

  // --- Highlights (Local Storage Only) ---
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightsLoaded, setHighlightsLoaded] = useState(false);
  const [highlightsSidebarOpen, setHighlightsSidebarOpen] = useState(false);

  const getHighlightsStorageKey = useCallback((bid: string) => `highlights_v2_${bid}`, []);

  useEffect(() => {
    const saved = localStorage.getItem(getHighlightsStorageKey(bookId));
    if (saved) {
      try {
        setHighlights(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved highlights", e);
      }
    }
    setHighlightsLoaded(true);
  }, [bookId, getHighlightsStorageKey]);

  useEffect(() => {
    if (!highlightsLoaded) return;
    localStorage.setItem(getHighlightsStorageKey(bookId), JSON.stringify(highlights));
  }, [highlights, bookId, highlightsLoaded, getHighlightsStorageKey]);

  const handleHighlight = useCallback(
    (color: string) => {
      if (!selectedText) return;
      const newHighlight: Highlight = {
        id: crypto.randomUUID(),
        bookId,
        userId: "local",
        text: selectedText,
        color,
        pageNumber: currentPage,
        createdAt: new Date().toISOString(),
      };
      setHighlights((prev) => [...prev, newHighlight]);
      setSelectionCoords(null);
      toast.success("Đã lưu ghi chú");
    },
    [selectedText, currentPage, bookId],
  );

  const handleDeleteHighlight = useCallback((id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    toast.success("Đã xóa ghi chú");
  }, []);

  // --- Active annotations (multimedia) ---
  const [activeAnnotations, setActiveAnnotations] = useState<MediaAnnotation[]>([]);

  // Dynamic book state (for DB books)
  const [dynamicContent, setDynamicContent] = useState<string>("");
  const [dynamicTotalPages, setDynamicTotalPages] = useState<number>(0);
  const [dynamicBookTitle, setDynamicBookTitle] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const [showCopied, setShowCopied] = useState(false);

  const totalPages = dynamicTotalPages;
  const content = dynamicContent;
  const bookTitle = dynamicBookTitle;

  const [chapters, setChapters] = useState<{ title: string; page: number }[]>([]);

  useEffect(() => {
    fetch(`/api/books/${bookId}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chapters) {
          setChapters(data.chapters);
        }
      })
      .catch(console.error);
  }, [bookId]);

  // Fetch page content for dynamic books
  useEffect(() => {
    setPageLoading(true);

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/books/${bookId}/pages?page=${currentPage}`);
        const data = await res.json();
        if (!isActive) return;

        if (data.isProcessing) {
          setDynamicContent("Sách đang được xử lý. Vui lòng chờ...");
          setDynamicTotalPages(data.totalPages || 1);

          timeoutId = setTimeout(() => {
            setRetryTick((t) => t + 1);
          }, 2000);
        } else if (data.content) {
          setDynamicContent(data.content);
          setDynamicTotalPages(data.totalPages);
        } else if (data.error) {
          setDynamicContent(data.error);
        }
      } catch {
        if (isActive) setDynamicContent("Không thể tải nội dung trang.");
      } finally {
        if (isActive) setPageLoading(false);
      }
    };

    fetchContent();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [bookId, currentPage, retryTick]);

  // Fetch book title for dynamic books
  useEffect(() => {
    fetch(`/api/books`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.books?.find((b: { id: string }) => b.id === bookId);
        if (found) setDynamicBookTitle(found.title);
      })
      .catch(() => {});
  }, [bookId]);

  // Reader Utilities
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 2) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelectionCoords({
          x: rect.left + rect.width / 2,
          y: rect.top - 50,
        });
      }
    } else {
      setSelectionCoords(null);
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    if (!selectedText) return;
    navigator.clipboard.writeText(selectedText);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
      setSelectionCoords(null);
    }, 1000);
  }, [selectedText]);

  const handleDoubleClick = useCallback(() => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) navigator.clipboard.writeText(selection);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement) return;
      if (target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight" && currentPage < totalPages) {
        setPageDirection("next");
        setCurrentPage((p) => p + 1);
      }
      if (e.key === "ArrowLeft" && currentPage > 1) {
        setPageDirection("prev");
        setCurrentPage((p) => p - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages]);

  return {
    // Layout/meta
    isDynamic: true,
    totalPages,
    content,
    bookTitle,
    pageLoading,

    // Page navigation
    currentPage,
    pageDirection,
    setCurrentPage,
    setPageDirection,
    goPrev: useCallback(() => {
      if (currentPage > 1) {
        setPageDirection("prev");
        setCurrentPage((p) => p - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, [currentPage]),
    goNext: useCallback(() => {
      if (currentPage < totalPages) {
        setPageDirection("next");
        setCurrentPage((p) => p + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, [currentPage, totalPages]),
    jumpToPage: useCallback(
      (page: number) => {
        setPageDirection(page > currentPage ? "next" : "prev");
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      [currentPage],
    ),

    // Media panel
    mediaPanelOpen,
    setMediaPanelOpen,
    activeAnnotations,
    setActiveAnnotations,

    // Selection
    selectedText,
    selectionCoords,
    showCopied,
    copyToClipboard,
    handleTextSelection,
    handleDoubleClick,

    // Highlights
    highlights,
    highlightsSidebarOpen,
    setHighlightsSidebarOpen,
    onHighlight: handleHighlight,
    onDeleteHighlight: handleDeleteHighlight,
    onClearAllHighlights: useCallback(() => {
      setHighlights([]);
      toast.success("Đã xóa tất cả ghi chú");
    }, []),

    // Chapters
    chapters,
    chaptersSidebarOpen,
    setChaptersSidebarOpen,

    // Content editing (admin)
    setContent: useCallback((newContent: string) => {
      setDynamicContent(newContent);
    }, []),
  };
}
