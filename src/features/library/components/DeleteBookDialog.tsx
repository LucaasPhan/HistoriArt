import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { DeleteBookDialogProps } from "../types";

export default function DeleteBookDialog({ open, title, onOpenChange, onConfirm }: DeleteBookDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)",
          padding: 0,
          overflow: "hidden",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #ef4444, #f97316)",
            borderRadius: "16px 16px 0 0",
          }}
        />

        <div style={{ padding: "28px 28px 24px" }}>
          <AlertDialogHeader className="gap-3">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <AlertTriangle size={22} style={{ color: "#ef4444" }} />
            </div>

            <AlertDialogTitle
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--font-sans)",
                color: "var(--text-primary)",
              }}
            >
              Delete &ldquo;{title}&rdquo;?
            </AlertDialogTitle>

            <AlertDialogDescription
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Thao tác này sẽ xóa vĩnh viễn sách và toàn bộ dữ liệu liên quan — bao gồm ghi chú và
              tiến trình đọc. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter style={{ marginTop: 24, gap: 10 }}>
            <AlertDialogCancel
              style={{
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onConfirm}
              style={{
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                background: "#ef4444",
                color: "white",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
