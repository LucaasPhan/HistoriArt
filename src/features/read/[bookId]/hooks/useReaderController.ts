"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConversationMode } from "@/lib/prompts";
import { buildAssistantChatMessage, buildUserChatMessage, getChatStorageKey } from "../helpers";
import type { ChatMessage, InteractionMode } from "../types";
import type { BookData } from "@/lib/sample-books";

function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/[*_~`#]/g, "") // Remove bold, italic, strikethrough, code, headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Keep link text, remove URL
    .replace(/^\s*[-+]\s/gm, "") // Remove bullet points
    .replace(/\s{2,}/g, " ") // Collapse multiple spaces
    .trim();
}

type UseReaderControllerArgs = {
  bookId: string;
  sampleBook?: BookData;
};

// The SpeechRecognition DOM types are not guaranteed to exist in this repo's TS lib,
// so we type only the fields we actually use (structural typing).
type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};
type SpeechRecognitionResultsLike = ArrayLike<SpeechRecognitionResultLike>;
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultsLike;
};
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
};
type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

export default function useReaderController({
  bookId,
  sampleBook,
}: UseReaderControllerArgs) {
  const [currentPage, setCurrentPage] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionCoords, setSelectionCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [dictatedText, setDictatedText] = useState("");
  const [pageDirection, setPageDirection] = useState<"next" | "prev">("next");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("chat");

  // Dynamic book state (for Gutenberg books)
  const [dynamicContent, setDynamicContent] = useState<string>("");
  const [dynamicTotalPages, setDynamicTotalPages] = useState<number>(0);
  const [dynamicBookTitle, setDynamicBookTitle] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const typewriterFinishedRef = useRef<Set<number>>(new Set());
  const voiceTranscriptRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const [showCopied, setShowCopied] = useState(false);

  // In this MVP the app always uses the "buddy" system prompt mode.
  const mode: ConversationMode = "buddy";

  const isDynamic = useMemo(() => !sampleBook, [sampleBook]);

  const totalPages = useMemo(
    () => (sampleBook ? sampleBook.totalPages : dynamicTotalPages),
    [sampleBook, dynamicTotalPages],
  );

  const content = useMemo(() => {
    if (sampleBook) return sampleBook.pages[currentPage] || "Content not available.";
    return dynamicContent;
  }, [sampleBook, currentPage, dynamicContent]);

  const bookTitle = useMemo(
    () => (sampleBook ? sampleBook.title : dynamicBookTitle),
    [sampleBook, dynamicBookTitle],
  );

  const scrollToEnd = useCallback(() => {
    chatEndRef.current?.scrollIntoView();
  }, []);

  const handleStopResponse = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(getChatStorageKey(bookId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        setMessages(parsed);
        // Mark all loaded messages as finished typing so they don't reanimate
        parsed.forEach((_, i) => typewriterFinishedRef.current.add(i));
      } catch (e) {
        console.error("Failed to parse saved chat", e);
      }
    }
    setIsChatLoaded(true);
  }, [bookId]);

  // Save to local storage
  useEffect(() => {
    if (!isChatLoaded) return;
    localStorage.setItem(getChatStorageKey(bookId), JSON.stringify(messages));
  }, [messages, bookId, isChatLoaded]);

  // Fetch page content for dynamic books
  useEffect(() => {
    if (!isDynamic) return;
    setPageLoading(true);

    fetch(`/api/books/${bookId}/pages?page=${currentPage}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.content) {
          setDynamicContent(data.content);
          setDynamicTotalPages(data.totalPages);
        }
      })
      .catch(() => setDynamicContent("Failed to load page content."))
      .finally(() => setPageLoading(false));
  }, [bookId, currentPage, isDynamic]);

  // Fetch book title for dynamic books
  useEffect(() => {
    if (!isDynamic) return;
    fetch(`/api/books`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.books?.find((b: { id: string }) => b.id === bookId);
        if (found) setDynamicBookTitle(found.title);
      })
      .catch(() => {});
  }, [bookId, isDynamic]);

  // When switching away from voice, stop any active recognition & TTS
  useEffect(() => {
    if (interactionMode !== "chat") return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  }, [interactionMode, isListening]);

  // Text-to-Speech
  const fallbackBrowserTTS = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakText = useCallback(
    async (text: string) => {
      // Only speak aloud in voice mode.
      if (interactionMode === "chat") return;

      setIsSpeaking(true);
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.slice(0, 2000) }),
        });

        if (!response.ok) throw new Error("TTS failed");

        const audioData = await response.arrayBuffer();
        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          fallbackBrowserTTS(text);
        };

        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
        fallbackBrowserTTS(text);
      }
    },
    [fallbackBrowserTTS, interactionMode],
  );

  // Send Message
  const handleSendMessage = useCallback(
    async (messageText?: string) => {
      const text = (messageText || input).trim();
      if (!text || isLoading) return;

      const now = new Date().toISOString();
      abortControllerRef.current = new AbortController();

      const userMsg = buildUserChatMessage(text, now);
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current?.signal,
          body: JSON.stringify({
            message: text,
            bookId,
            bookTitle,
            pageContent: content,
            currentPage,
            highlightedText: selectedText || undefined,
            mode,
            conversationHistory: messages.slice(-8),
          }),
        });

        const data = await response.json();

        if (
          data.navigation === "next" &&
          currentPage < totalPages
        ) {
          setPageDirection("next");
          setCurrentPage((p) => p + 1);
        } else if (
          data.navigation === "prev" &&
          currentPage > 1
        ) {
          setPageDirection("prev");
          setCurrentPage((p) => p - 1);
        }

        const aiMsg = buildAssistantChatMessage(
          data.response || data.error || "Sorry, I couldn't process that.",
          new Date().toISOString(),
        );

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(true);
        speakText(cleanTextForSpeech(aiMsg.content));
      } catch (err: unknown) {
        const errLike = err as { name?: string; message?: string };
        if (errLike?.name === "AbortError") {
          setIsLoading(false);
          return;
        }
        console.error("DEBUG FETCH:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Connection error: ${errLike?.message || String(err)}. Please try again.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      isLoading,
      bookId,
      bookTitle,
      content,
      currentPage,
      messages,
      mode,
      selectedText,
      speakText,
      totalPages,
    ],
  );

  // Speech Recognition
  const startListening = useCallback(() => {
    // Prevent mic conflicts by stopping TTS first
    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);

    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructorLike;
      webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onerror = (event: { error: string; message?: string }) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        console.warn("Microphone access was denied.");
      }
      setIsListening(false);
    };

    voiceTranscriptRef.current = "";
    setDictatedText("");

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      let finalChunk = "";
      for (
        let i = event.resultIndex;
        i < event.results.length;
        ++i
      ) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalChunk) {
        const appended = voiceTranscriptRef.current + finalChunk;
        voiceTranscriptRef.current = appended;
        setDictatedText(appended);
      }

      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalMsg = voiceTranscriptRef.current.trim();
      if (finalMsg) {
        handleSendMessage(finalMsg);
      }
      voiceTranscriptRef.current = "";
      setDictatedText("");
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setChatOpen(true);
  }, [handleSendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

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
  }, [messages, interimTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      recognitionRef.current?.stop?.();
      if (currentAudioRef.current) currentAudioRef.current.pause();
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    // Layout/meta
    isDynamic,
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
      }
    }, [currentPage]),
    goNext: useCallback(() => {
      if (currentPage < totalPages) {
        setPageDirection("next");
        setCurrentPage((p) => p + 1);
      }
    }, [currentPage, totalPages]),
    jumpToPage: useCallback(
      (page: number) => {
        setPageDirection(page > currentPage ? "next" : "prev");
        setCurrentPage(page);
      },
      [currentPage],
    ),

    // Sidebar
    chatOpen,
    setChatOpen,
    interactionMode,
    setInteractionMode,
    messages,
    input,
    setInput,
    isLoading,
    isTyping,
    isListening,
    isSpeaking,
    dictatedText,
    interimTranscript,
    selectedText,
    selectionCoords,
    showCopied,
    copyToClipboard,
    handleTextSelection,
    handleDoubleClick,
    scrollToEnd,
    chatEndRef,
    typewriterFinishedRef,
    onStopResponse: handleStopResponse,
    onSendMessage: handleSendMessage,

    // Voice
    toggleVoice,
    isChatLoaded,
    startListening,
    stopListening,

    // Close / stop
    mode,

    // For ChatSidebar
    onInputChange: setInput,

    onLastMessageFinished: useCallback(() => {
      setIsTyping(false);
    }, []),
  };
}

