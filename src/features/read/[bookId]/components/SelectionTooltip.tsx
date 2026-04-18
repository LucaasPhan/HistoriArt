import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Film, MessageCircle, MoreVertical } from "lucide-react";
import { memo } from "react";

type SelectionCoords = { x: number; y: number };

type SelectionTooltipProps = {
  selectionCoords: SelectionCoords | null;
  showCopied: boolean;
  selectedText: string;
  onCopy: () => void;
  onSendToChat?: () => void;
  onHighlight: (color: string) => void;
  onLookUp?: () => void;
  isAdmin?: boolean;
  onAddMedia?: () => void;
};

const SelectionTooltip = memo(function SelectionTooltip({
  selectionCoords,
  showCopied,
  selectedText,
  onCopy,
  onSendToChat,
  onHighlight,
  onLookUp,
  isAdmin,
  onAddMedia,
}: SelectionTooltipProps) {
  const isSingleWord =
    selectedText.trim().split(/\s+/).length === 1 && selectedText.trim().length > 0;
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {selectionCoords && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          style={{
            position: "fixed",
            left: selectionCoords.x,
            top: selectionCoords.y,
            transform: "translateX(-50%)",
            zIndex: 100,
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-lg)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                }}
              >
                {showCopied ? (
                  <>
                    <Check size={14} color="#10b981" />
                    <span>{t("common.copied")}</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={14} color="var(--accent-primary)" />
                    <span>{t("tooltip.options")}</span>
                    <MoreVertical size={14} style={{ marginLeft: 4, opacity: 0.6 }} />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="flex min-w-48 flex-col gap-4 border-(--border-subtle) bg-(--bg-secondary) p-2! text-(--text-primary) shadow-lg backdrop-blur-md"
            >
              <div
                style={{ display: "flex", gap: 8, padding: "4px 8px", justifyContent: "center" }}
              >
                {["#fef08a", "#bbf7d0", "#fbcfe8", "#bfdbfe"].map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      onHighlight(color);
                    }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: "1px solid rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "transform 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    aria-label={`Highlight with ${color}`}
                  />
                ))}
              </div>
              <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />
              {isSingleWord && onLookUp && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onLookUp();
                  }}
                >
                  <BookOpen size={14} className="mr-2" />
                  <span>{t("tooltip.lookup")}</span>
                </DropdownMenuItem>
              )}
              {isAdmin && onAddMedia && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMedia();
                  }}
                >
                  <Film size={14} className="mr-2" />
                  <span className="font-medium text-[var(--accent-primary)]">
                    {t("tooltip.addMedia")}
                  </span>
                </DropdownMenuItem>
              )}
              {onSendToChat && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendToChat();
                  }}
                >
                  <MessageCircle size={14} className="mr-2" />
                  <span>{t("tooltip.sendToChat")}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 12,
              height: 12,
              background: "var(--bg-secondary)",
              borderRight: "1px solid var(--border-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

SelectionTooltip.displayName = "SelectionTooltip";

export default SelectionTooltip;
