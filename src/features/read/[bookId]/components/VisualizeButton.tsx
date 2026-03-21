/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Paintbrush, Loader2, Sparkles, Download, RotateCcw, LogIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TransitionLink } from "@/components/TransitionLink";

interface VisualizeButtonProps {
  content: string;
  bookTitle: string;
  bookId?: string;
  currentPage?: number;
  highlightedText?: string;
  isAuthenticated?: boolean;
}

/* ─── Loading phase messages ─────────────────── */
const LOADING_PHASES = [
  "Scanning text for imagery…",
  "Extracting visual elements…",
  "Composing scene description…",
  "Painting with AI brushstrokes…",
  "Rendering final touches…",
];

export default function VisualizeButton({
  content,
  bookTitle,
  bookId,
  currentPage,
  highlightedText,
  isAuthenticated = true,
}: VisualizeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [result, setResult] = useState<{ prompt: string; imageUrl: string } | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isCached, setIsCached] = useState(false);

  /* Load cached image when dialog opens */
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !bookId || currentPage == null) return;
    // Don't re-fetch if we already have a result
    if (result) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/visualize?bookId=${encodeURIComponent(bookId)}&page=${currentPage}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.cached) {
          setResult({ prompt: data.prompt, imageUrl: data.imageUrl });
          setIsCached(true);
        }
      } catch {
        // Silently fail — user can still generate
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, isAuthenticated, bookId, currentPage, result]);

  /* cycle through loading messages */
  useEffect(() => {
    if (!loading) return;
    setLoadingPhase(0);
    const interval = setInterval(() => {
      setLoadingPhase((p) => (p + 1) % LOADING_PHASES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleVisualize = useCallback(async () => {
    if (!isAuthenticated) {
      return; // Custom UI shown in DialogContent instead
    }

    setLoading(true);
    setResult(null);
    setImageLoaded(false);
    setShowPrompt(false);
    setIsCached(false);
    try {
      const response = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          bookTitle,
          bookId,
          currentPage,
          highlightedText,
        }),
      });

      if (response.status === 401) {
        toast.error("Please sign in to use Illuminate Scene.");
        return;
      }

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to visualize");
      }

      setResult(data);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Could not generate visualization. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, content, bookTitle, bookId, currentPage, highlightedText]);

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const a = document.createElement("a");
    a.href = result.imageUrl;
    a.download = `illuminate-scene-${bookId}-p${currentPage}.png`;
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            borderRadius: "var(--radius-full)",
            background: "var(--accent-glow)",
            color: "var(--accent-primary)",
            border: "1px solid rgba(212, 110, 86, 0.18)",
            transition: "all 0.3s cubic-bezier(0.2, 0, 0.2, 1)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.01em",
            boxShadow: "0 2px 12px rgba(212, 110, 86, 0.08)",
            cursor: "var(--cursor-pointer)",
            position: "relative",
            overflow: "hidden",
            height: "36px", // Standard height for ghost buttons in this app
          }}
          onClick={handleVisualize}
        >
          {/* subtle shimmer sweep on the button */}
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg, transparent 40%, rgba(212,110,86,0.12) 50%, transparent 60%)",
              animation: "shimmer 3s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <Paintbrush size={14} />
          <span style={{ position: "relative" }}>Illuminate Scene</span>
        </motion.button>
      </DialogTrigger>

      <DialogContent
        className="p-0 overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-glow), 0 25px 60px rgba(0,0,0,0.25)",
          maxWidth: "min(640px, 90vw)",
          maxHeight: "85vh",
          width: "100%",
          display: "flex",
          flexDirection: "column" as const,
        }}
      >
        {/* ─── Decorative top accent bar ─── */}
        <div
          style={{
            height: 3,
            background: "var(--accent-gradient)",
            borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          }}
        />

        <div style={{ padding: "24px 28px 20px", flex: 1, overflowY: "auto" }}>
          {!isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0, 0.2, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "32px 16px 24px",
                gap: 24,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "var(--accent-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(212, 110, 86, 0.15)",
                  boxShadow: "0 0 40px rgba(212, 110, 86, 0.2)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: "50%",
                    border: "1px dashed rgba(212, 110, 86, 0.3)",
                    animation: "spin 10s linear infinite",
                  }}
                />
                <Sparkles size={32} color="var(--accent-primary)" />
              </motion.div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "var(--font-sans)",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Unlock Scene Visualization
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    maxWidth: 340,
                    margin: "0 auto",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Bring your reading to life. Sign in to paint beautiful, AI-generated illustrations of the scenes you&apos;re exploring.
                </p>
              </div>

              <TransitionLink
                href="/login"
                style={{
                  marginTop: 12,
                  padding: "12px 32px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent-gradient)",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 8px 24px rgba(212, 110, 86, 0.25)",
                  transition: "all 0.3s cubic-bezier(0.2, 0, 0.2, 1)",
                }}
              >
                <LogIn size={18} />
                Sign In to Continue
              </TransitionLink>
            </motion.div>
          ) : (
            <>
              <DialogHeader>
            <DialogTitle
              style={{
                fontSize: 20,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-sans)",
                color: "var(--text-primary)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(212, 110, 86, 0.15)",
                }}
              >
                <Paintbrush size={18} color="var(--accent-primary)" />
              </div>
              <span>Scene Visualization</span>
            </DialogTitle>
            <DialogDescription
              style={{
                color: "var(--text-tertiary)",
                fontSize: 13,
                marginTop: 4,
                fontFamily: "var(--font-sans)",
              }}
            >
              AI-generated illustration of the current page
            </DialogDescription>
          </DialogHeader>

          <div style={{ marginTop: 20 }}>
            <AnimatePresence mode="wait">
              {loading ? (
                /* ─── Loading State ─────────────────────────── */
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "64px 24px",
                    gap: 28,
                    width: "100%",
                  }}
                >
                  {/* Orbiting rings + spinner */}
                  <div style={{ position: "relative", width: 80, height: 80 }}>
                    {/* outer orbit ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      style={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        border: "1.5px dashed rgba(212, 110, 86, 0.2)",
                      }}
                    />
                    {/* orbiting dot */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                      style={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: -3,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent-primary)",
                          boxShadow: "0 0 10px var(--accent-primary)",
                        }}
                      />
                    </motion.div>

                    {/* center glow + icon */}
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: "var(--accent-glow)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(212, 110, 86, 0.12)",
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Loader2 size={28} color="var(--accent-primary)" />
                      </motion.div>
                    </div>

                    {/* pulse rings */}
                    {[1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          delay: i * 0.5,
                          ease: "easeOut",
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          border: "1.5px solid var(--accent-primary)",
                        }}
                      />
                    ))}
                  </div>

                  {/* cycling phase text */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingPhase}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                        fontSize: 14,
                        fontFamily: "var(--font-sans)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {LOADING_PHASES[loadingPhase]}
                    </motion.p>
                  </AnimatePresence>

                  {/* progress hint bar */}
                  <div
                    style={{
                      width: 200,
                      height: 3,
                      borderRadius: 2,
                      background: "var(--border-subtle)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      style={{
                        width: "40%",
                        height: "100%",
                        borderRadius: 2,
                        background: "var(--accent-gradient)",
                      }}
                    />
                  </div>
                </motion.div>
              ) : result ? (
                /* ─── Result State ──────────────────────────── */
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.2, 0, 0.2, 1] }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    width: "100%",
                  }}
                >
                  {/* image container */}
                  <motion.div
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.2, 0, 0.2, 1] }}
                    style={{
                      position: "relative",
                      aspectRatio: "16/10",
                      width: "100%",
                      overflow: "hidden",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    <img
                      src={result.imageUrl}
                      alt="Visualized scene"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        transition: "opacity 0.8s cubic-bezier(0.2, 0, 0.2, 1), transform 0.4s ease",
                        opacity: imageLoaded ? 1 : 0,
                      }}
                      onLoad={() => setImageLoaded(true)}
                    />

                    {/* loading shimmer on image */}
                    {!imageLoaded && (
                      <div
                        className="shimmer"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "var(--bg-tertiary)",
                        }}
                      />
                    )}

                    {/* cinematic gradient overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 80%, rgba(0,0,0,0.08) 100%)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* floating action buttons */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: imageLoaded ? 1 : 0 }}
                      transition={{ delay: 0.3 }}
                      style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        title="Download image"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(0,0,0,0.45)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "var(--cursor-pointer)",
                        }}
                      >
                        <Download size={16} />
                      </motion.button>
                    </motion.div>

                    {/* page badge */}
                    {currentPage && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          background: "rgba(0,0,0,0.45)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Page {currentPage}
                      </div>
                    )}
                  </motion.div>

                  {/* prompt reveal section */}
                  <div
                    style={{
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setShowPrompt((p) => !p)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "12px 16px",
                        background: "transparent",
                        border: "none",
                        cursor: "var(--cursor-pointer)",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase" as const,
                        fontFamily: "var(--font-sans)",
                        transition: "color 0.2s ease",
                      }}
                    >
                      <Sparkles size={13} color="var(--accent-primary)" />
                      <span>AI Prompt Layer</span>
                      <motion.span
                        animate={{ rotate: showPrompt ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ marginLeft: "auto", fontSize: 16, lineHeight: 1 }}
                      >
                        ▾
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {showPrompt && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.2, 0, 0.2, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            style={{
                              padding: "0 16px 16px",
                              borderTop: "1px solid var(--border-subtle)",
                              paddingTop: 14,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13,
                                fontStyle: "italic",
                                lineHeight: 1.7,
                                color: "var(--text-secondary)",
                                fontFamily: "var(--font-serif)",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--accent-primary)",
                                  fontSize: 18,
                                  fontFamily: "var(--font-serif)",
                                  lineHeight: 1,
                                }}
                              >
                                &ldquo;
                              </span>
                              {result.prompt}
                              <span
                                style={{
                                  color: "var(--accent-primary)",
                                  fontSize: 18,
                                  fontFamily: "var(--font-serif)",
                                  lineHeight: 1,
                                }}
                              >
                                &rdquo;
                              </span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                /* ─── Error / Empty State ────────────────────── */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "var(--accent-glow)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(212, 110, 86, 0.12)",
                    }}
                  >
                    <Paintbrush size={24} color="var(--accent-primary)" />
                  </div>
                  <p
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: 14,
                      maxWidth: 260,
                      lineHeight: 1.6,
                    }}
                  >
                    Something went wrong. Please try again.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleVisualize}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--accent-gradient)",
                      color: "white",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "var(--cursor-pointer)",
                      boxShadow: "0 4px 16px var(--accent-glow)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <RotateCcw size={14} />
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
