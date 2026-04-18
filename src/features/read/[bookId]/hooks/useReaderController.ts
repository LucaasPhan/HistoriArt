"use client";

import type { ConversationMode } from "@/lib/prompts";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CHAT_SAVE_DELAY,
  HIGHLIGHTS_STORAGE_KEY_PREFIX,
  LAST_PAGE_STORAGE_KEY_PREFIX,
  MAX_HISTORY_MESSAGES,
  MAX_MEDIA_ATTACHMENTS,
  PAGE_RETRY_DELAY,
  READER_MODE,
} from "../constants";
import { buildAssistantChatMessage, buildUserChatMessage } from "../helpers";
import type {
  ChatMediaContext,
  ChatMessage,
  Highlight,
  MediaAnnotation,
  UseReaderControllerArgs,
} from "../types";

export default function useReaderController({ bookId }: UseReaderControllerArgs) {
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [currentPage, setCurrentPage] = useState(
    !isNaN(initialPage) && initialPage >= 1 ? initialPage : 1,
  );
  const [mediaPanelOpen, setMediaPanelOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chaptersSidebarOpen, setChaptersSidebarOpen] = useState(false);

  // --- Quiz State ---
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [showChapterCompleteDialog, setShowChapterCompleteDialog] = useState(false);
  const [activeQuizChapter, setActiveQuizChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [quizzesDone, setQuizzesDone] = useState<number[]>([]);
  const [suppressQuizPopup, setSuppressQuizPopup] = useState(false);

  useEffect(() => {
    fetch(`/api/quiz/preferences?bookId=${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences) {
          setSuppressQuizPopup(data.preferences.suppressPopup);
        }
      })
      .catch(console.error);
  }, [bookId]);

  // Load finished quizzes and reading progress
  useEffect(() => {
    // 1. Load Quiz Results
    fetch(`/api/quiz/results?bookId=${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.results)) {
          const done = data.results
            .map((r: { chapterNumber: number | null }) => r.chapterNumber)
            .filter((n: number | null): n is number => n != null);
          if (done.length > 0) {
            setQuizzesDone(done);
            setCompletedChapters((prev) => Array.from(new Set([...prev, ...done])));
          }
        }
      })
      .catch(console.error);

    // 2. Load Reading Progress
    fetch(`/api/reading-progress`)
      .then((res) => res.json())
      .then((data) => {
        const lastPage = data.progress?.[bookId];
        if (lastPage && lastPage > currentPage) {
          setCurrentPage(lastPage);
        }
      })
      .catch(console.error);
  }, [bookId]); // Run once on mount or when bookId changes

  useEffect(() => {
    if (currentPage == null) return;
    localStorage.setItem(`${LAST_PAGE_STORAGE_KEY_PREFIX}${bookId}`, currentPage.toString());

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  // --- Highlights (Local Storage Only) ---
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightsLoaded, setHighlightsLoaded] = useState(false);
  const [highlightsSidebarOpen, setHighlightsSidebarOpen] = useState(false);

  const getHighlightsStorageKey = useCallback(
    (bid: string) => `${HIGHLIGHTS_STORAGE_KEY_PREFIX}${bid}`,
    [],
  );

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
  const pageCache = useRef<Record<number, { content: string; totalPages: number }>>({});
  const pageRequests = useRef<Record<number, boolean>>({});
  const [dynamicTotalPages, setDynamicTotalPages] = useState<number>(0);
  const [dynamicBookTitle, setDynamicBookTitle] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typewriterFinishedRef = useRef<Set<number>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const [showCopied, setShowCopied] = useState(false);
  const mode: ConversationMode = READER_MODE;

  const totalPages = dynamicTotalPages;
  const content = dynamicContent;
  const bookTitle = dynamicBookTitle;

  // --- Chapters ---
  const [chapters, setChapters] = useState<{ title: string; page: number; endPage?: number }[]>([]);

  useEffect(() => {
    fetch(`/api/books/${bookId}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chapters) {
          // API returns startPage (DB schema), normalize to page for the reader
          const mappedChapters = data.chapters.map(
            (c: {
              title: string;
              start_page?: number;
              startPage?: number;
              end_page?: number;
              endPage?: number;
            }) => ({
              title: c.title,
              page: c.startPage ?? c.start_page ?? 1,
              endPage: c.endPage ?? c.end_page,
            }),
          );
          setChapters(mappedChapters);

          // Calculate completed chapters based on current progress
          const initialCompleted: number[] = [];
          mappedChapters.forEach((ch: any, idx: number) => {
            if (ch.endPage && currentPage >= ch.endPage) {
              initialCompleted.push(idx + 1);
            }
          });
          if (initialCompleted.length > 0) {
            setCompletedChapters((prev) => Array.from(new Set([...prev, ...initialCompleted])));
          }
        }
      })
      .catch(console.error);
  }, [bookId, currentPage]);

  // Detect chapter completion
  const prevPageRef = useRef(currentPage);

  useEffect(() => {
    if (chapters.length === 0) return;

    // Moving forward to next page
    if (currentPage > prevPageRef.current) {
      const prevPage = prevPageRef.current;
      const prevChapterIdx = [...chapters].reverse().findIndex((c) => c.page <= prevPage);

      if (prevChapterIdx !== -1) {
        const actualIdx = chapters.length - 1 - prevChapterIdx;
        const currentChapterIdx = [...chapters].reverse().findIndex((c) => c.page <= currentPage);
        const actualCurrentIdx = chapters.length - 1 - currentChapterIdx;

        // Crossed a chapter boundary
        if (
          actualIdx !== actualCurrentIdx ||
          (chapters[actualIdx].endPage &&
            prevPage === chapters[actualIdx].endPage &&
            currentPage > prevPage)
        ) {
          const completedChapter = actualIdx + 1; // 1-indexed
          if (!completedChapters.includes(completedChapter)) {
            setCompletedChapters((prev) => [...prev, completedChapter]);
            if (!suppressQuizPopup) {
              setActiveQuizChapter(completedChapter);
              setShowChapterCompleteDialog(true);
            }
          }
        }
      }
    }

    // Last page of the book
    if (currentPage === dynamicTotalPages && dynamicTotalPages > 0) {
      const lastChapter = chapters.length;
      if (!completedChapters.includes(lastChapter)) {
        setCompletedChapters((prev) => [...prev, lastChapter]);
        if (!suppressQuizPopup) {
          setActiveQuizChapter(lastChapter);
          setShowChapterCompleteDialog(true);
        }
      }
    }

    prevPageRef.current = currentPage;
  }, [currentPage, chapters, suppressQuizPopup, completedChapters, dynamicTotalPages]);

  // Determine current viewing chapter (1-indexed)
  const currentChapterIdx = [...chapters].reverse().findIndex((c) => c.page <= currentPage);
  const currentViewingChapter =
    currentChapterIdx !== -1 ? chapters.length - currentChapterIdx : chapters.length > 0 ? 1 : 0;

  const scrollToEnd = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleStopResponse = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Load chat from cloud storage
  useEffect(() => {
    let active = true;
    fetch(`/api/conversations/${bookId}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch conversation");
        return r.json() as Promise<{ messages?: ChatMessage[] }>;
      })
      .then((data) => {
        if (!active) return;
        try {
          const parsed = Array.isArray(data.messages) ? data.messages : [];
          setMessages(parsed);
          parsed.forEach((_, i) => typewriterFinishedRef.current.add(i));
        } catch (e) {
          console.error("Failed to parse saved chat", e);
        }
      })
      .catch(() => {
        if (!active) return;
        setMessages([]);
      })
      .finally(() => {
        if (!active) return;
        setIsChatLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [bookId]);

  // Save chat to cloud storage
  useEffect(() => {
    if (!isChatLoaded) return;
    const timer = setTimeout(() => {
      fetch(`/api/conversations/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      }).catch(() => {});
    }, CHAT_SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [messages, bookId, isChatLoaded]);

  // Fetch page content for dynamic books
  useEffect(() => {
    const prefetchPage = (page: number) => {
      if (pageCache.current[page] || pageRequests.current[page]) return;
      pageRequests.current[page] = true;
      fetch(`/api/books/${bookId}/pages?page=${page}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.content && !data.isProcessing) {
            pageCache.current[page] = { content: data.content, totalPages: data.totalPages };
          }
        })
        .catch(() => {})
        .finally(() => {
          delete pageRequests.current[page];
        });
    };

    const cached = pageCache.current[currentPage];
    if (cached) {
      setDynamicContent(cached.content);
      setDynamicTotalPages(cached.totalPages);
      setPageLoading(false);

      // Prefetch neighbors
      prefetchPage(currentPage + 1);
      if (currentPage > 1) prefetchPage(currentPage - 1);
      return;
    }

    setPageLoading(true);
    setDynamicContent(""); // Clear old content immediately to avoid flashing

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchContent = async () => {
      pageRequests.current[currentPage] = true;
      try {
        const res = await fetch(`/api/books/${bookId}/pages?page=${currentPage}`);
        const data = await res.json();
        if (!isActive) return;

        if (data.isProcessing) {
          setDynamicContent("Sách đang được xử lý. Vui lòng chờ...");
          setDynamicTotalPages(data.totalPages || 1);

          timeoutId = setTimeout(() => {
            setRetryTick((t) => t + 1);
          }, PAGE_RETRY_DELAY);
        } else if (data.content) {
          setDynamicContent(data.content);
          setDynamicTotalPages(data.totalPages);
          pageCache.current[currentPage] = { content: data.content, totalPages: data.totalPages };

          prefetchPage(currentPage + 1);
          if (currentPage > 1) prefetchPage(currentPage - 1);
        } else if (data.error) {
          setDynamicContent(data.error);
        }
      } catch {
        if (isActive) setDynamicContent("Không thể tải nội dung trang.");
      } finally {
        if (isActive) setPageLoading(false);
        delete pageRequests.current[currentPage];
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

  const handleSendMessage = useCallback(
    async (messageText?: string, mediaContext?: MediaAnnotation[]) => {
      const text = (messageText || input).trim();
      const hasMediaContext = (mediaContext?.length || 0) > 0;
      if ((!text && !hasMediaContext) || isLoading) return false;
      const outgoingText = text || "Phân tích tư liệu mình vừa đính kèm giúp mình.";

      abortControllerRef.current = new AbortController();
      const userMsg = buildUserChatMessage(outgoingText, new Date().toISOString());
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      const preparedMediaContext: ChatMediaContext[] = (mediaContext || [])
        .slice(0, MAX_MEDIA_ATTACHMENTS)
        .map((annotation) => ({
          id: annotation.id,
          mediaType: annotation.mediaType,
          passageText: annotation.passageText?.slice(0, 500),
          caption: annotation.caption?.slice(0, 700),
          mediaUrl: annotation.mediaUrl,
          sources: annotation.sources?.slice(0, 3).map((s) => s.slice(0, 250)),
        }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            message: outgoingText,
            bookId,
            bookTitle,
            pageContent: content,
            currentPage,
            highlightedText: selectedText || undefined,
            mode,
            mediaContext: preparedMediaContext,
            conversationHistory: messages
              .slice(-MAX_HISTORY_MESSAGES)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (response.status === 401) {
          setMessages((prev) => prev.slice(0, -1));
          toast.error("Vui lòng đăng nhập để dùng AI chat.");
          setIsLoading(false);
          return false;
        }

        const data = (await response.json()) as {
          response?: string;
          error?: string;
          navigation?: "next" | "prev" | null;
        };

        if (data.navigation === "next" && currentPage < totalPages) {
          setPageDirection("next");
          setCurrentPage((p) => p + 1);
        } else if (data.navigation === "prev" && currentPage > 1) {
          setPageDirection("prev");
          setCurrentPage((p) => p - 1);
        }

        const aiMsg = buildAssistantChatMessage(
          data.response || data.error || "Xin lỗi, mình chưa xử lý được yêu cầu này.",
          new Date().toISOString(),
        );

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(true);
      } catch (err: unknown) {
        const errLike = err as { name?: string; message?: string };
        if (errLike?.name === "AbortError") {
          setIsLoading(false);
          return false;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Lỗi kết nối: ${errLike?.message || String(err)}. Vui lòng thử lại.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
      return true;
    },
    [
      input,
      isLoading,
      bookId,
      bookTitle,
      content,
      currentPage,
      selectedText,
      mode,
      messages,
      totalPages,
    ],
  );

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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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
    chatOpen,
    setChatOpen,
    activeAnnotations,
    setActiveAnnotations,

    // Chat
    messages,
    input,
    setInput,
    isLoading,
    isTyping,
    isChatLoaded,
    chatEndRef,
    typewriterFinishedRef,
    mode,
    scrollToEnd,
    onStopResponse: handleStopResponse,
    onSendMessage: handleSendMessage,
    onInputChange: setInput,
    onClearChat: useCallback(() => {
      setMessages([]);
      typewriterFinishedRef.current.clear();
      fetch(`/api/conversations/${bookId}`, { method: "DELETE" }).catch(() => {});
      toast.success("Đã xóa lịch sử chat");
    }, [bookId]),
    onLastMessageFinished: useCallback(() => {
      setIsTyping(false);
    }, []),

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

    // Quiz
    quizModalOpen,
    setQuizModalOpen,
    showChapterCompleteDialog,
    setShowChapterCompleteDialog,
    activeQuizChapter,
    setActiveQuizChapter,
    completedChapters,
    quizzesDone,
    setSuppressQuizPopup,
    currentViewingChapter,

    // Content editing (admin)
    setContent: useCallback(
      (newContent: string) => {
        setDynamicContent(newContent);
        // Update the page cache so navigating away and back shows the edited content
        const cached = pageCache.current[currentPage];
        if (cached) {
          pageCache.current[currentPage] = { ...cached, content: newContent };
        } else {
          pageCache.current[currentPage] = { content: newContent, totalPages: dynamicTotalPages };
        }
      },
      [currentPage, dynamicTotalPages],
    ),
  };
}
