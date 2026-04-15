"use client";

import { TransitionLink } from "@/components/TransitionLink";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Clipboard,
  Clock,
  ExternalLink,
  Heart,
  Link2,
  Loader2,
  Pencil,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Book } from "../types";

type Props = {
  book: Book;
  index: number;
  isContinue: boolean;
  continuePage?: number;
  href: string;
  isFavorite: boolean;
  isProcessing: boolean;
  isAdmin: boolean;
  hoveredCardId: string | null;
  onHoverChange: (cardId: string | null) => void;
  onToggleFavorite: (book: Book) => void;
  onCopyLink: (book: Book) => void;
  onCopyTitle: (book: Book) => void;
  onOpenEdit: (book: Book) => void;
};

function DescriptionPreview({ description }: { description: string }) {
  return (
    <div
      style={{
        color: "var(--text-tertiary)",
        fontSize: 13,
        lineHeight: 1.5,
        marginBottom: 16,
        flex: 1,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      <ReactMarkdown
        components={{
          p: (props) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            const { node, ...rest } = props as any;
            return <span {...rest} />;
          },
        }}
      >
        {description.replace(/--/g, "—")}
      </ReactMarkdown>
    </div>
  );
}

export default function BookCard({
  book,
  index,
  isContinue,
  continuePage,
  href,
  isFavorite,
  isProcessing,
  isAdmin,
  hoveredCardId,
  onHoverChange,
  onToggleFavorite,
  onCopyLink,
  onCopyTitle,
  onOpenEdit,
}: Props) {
  const cardId = isContinue ? `continue-${book.id}` : book.id;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onMouseEnter={() => onHoverChange(cardId)}
          onMouseLeave={() => onHoverChange(null)}
          whileHover={{ y: -8 }}
          style={{ height: "100%" }}
        >
          <TransitionLink
            href={isProcessing ? "#" : href}
            className="no-underline"
            onClick={isProcessing ? (e: React.MouseEvent) => e.preventDefault() : undefined}
            style={isProcessing ? { cursor: "default" } : undefined}
          >
            <div
              className="book-card"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
                boxShadow: "var(--shadow-card)",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                position: "relative",
              }}
            >
              <AnimatePresence>
                {isFavorite && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.45)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Heart size={13} fill="var(--accent-primary)" color="var(--accent-primary)" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                style={{
                  height: 180,
                  background: book.coverUrl
                    ? "var(--bg-tertiary)"
                    : `linear-gradient(135deg, ${book.coverGradient[0]}, ${book.coverGradient[1]})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: book.coverUrl ? 12 : 24,
                  position: "relative",
                  overflow: "hidden",
                }}
                animate={{ scale: hoveredCardId === cardId ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    style={{ objectFit: "contain", objectPosition: "center" }}
                    sizes="260px"
                    unoptimized
                  />
                ) : (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 70%)",
                      }}
                    />
                    <Sparkles size={40} color="rgba(255,255,255,0.85)" />
                  </>
                )}

                {isProcessing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      zIndex: 5,
                    }}
                  >
                    <Loader2 size={28} color="white" style={{ animation: "spin 1.2s linear infinite" }} />
                    <span
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      Downloading…
                    </span>
                  </div>
                )}
              </motion.div>

              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {book.title}
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 12,
                    marginBottom: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {book.author}
                </p>

                <DescriptionPreview description={book.description} />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {isProcessing ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--accent-primary)",
                          fontWeight: 600,
                        }}
                      >
                        <Loader2 size={12} style={{ animation: "spin 1.2s linear infinite" }} />
                        Processing…
                      </span>
                    ) : (
                      <>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={12} />
                          {book.estimatedReadTime || book.totalPages}p
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Star size={12} fill="var(--accent-primary)" stroke="var(--accent-primary)" />
                          4.8
                        </span>
                      </>
                    )}
                  </div>

                  {isContinue ? (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--accent-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Page {continuePage}
                    </span>
                  ) : (
                    <motion.span
                      style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-primary)" }}
                      animate={{ x: hoveredCardId === cardId ? 4 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      →
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </TransitionLink>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent
        className="w-56 overflow-hidden p-0"
        style={{
          padding: 10,
          gap: 10,
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          backdropFilter: "blur(24px)",
        }}
      >
        <ContextMenuLabel
          className="px-3 pt-3"
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-sans)",
            padding: "5px 10px 5px 10px",
          }}
        >
          {book.title.length > 28 ? book.title.slice(0, 28) + "…" : book.title}
        </ContextMenuLabel>

        <div style={{ padding: "2px 4px 4px" }}>
          <ContextMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
            onSelect={() => (window.location.href = href)}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOpen size={14} style={{ color: "var(--text-secondary)" }} />
            </div>
            <span>Open Book</span>
          </ContextMenuItem>
          <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />
          <ContextMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
            onSelect={() => window.open(href, "_blank")}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ExternalLink size={14} style={{ color: "var(--text-secondary)" }} />
            </div>
            <span>Open in New Tab</span>
          </ContextMenuItem>

          <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />

          {isAdmin && (
            <>
              <ContextMenuItem
                className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
                style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
                onSelect={() => onOpenEdit(book)}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Pencil size={14} style={{ color: "var(--text-secondary)" }} />
                </div>
                <span>Edit Book</span>
              </ContextMenuItem>
              <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />
            </>
          )}

          <ContextMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
            onSelect={() => onToggleFavorite(book)}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s ease",
              }}
            >
              <Heart
                size={14}
                fill={isFavorite ? "var(--accent-primary)" : "none"}
                style={{
                  color: isFavorite ? "var(--accent-primary)" : "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
            <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
          </ContextMenuItem>

          <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />

          <ContextMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
            onSelect={() => onCopyLink(book)}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Link2 size={14} style={{ color: "var(--text-secondary)" }} />
            </div>
            <span>Copy Link</span>
          </ContextMenuItem>
          <ContextMenuSeparator className="my-1" style={{ background: "var(--border-subtle)" }} />
          <ContextMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)" }}
            onSelect={() => onCopyTitle(book)}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clipboard size={14} style={{ color: "var(--text-secondary)" }} />
            </div>
            <span>Copy Title & Author</span>
          </ContextMenuItem>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
