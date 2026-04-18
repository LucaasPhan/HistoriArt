"use client";

import { Lock } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import styles from "./styles/PinVerifyModal.module.css";

interface PinVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (pin: string) => void;
  purpose?: "edit" | "delete";
}

export default function PinVerifyModal({
  isOpen,
  onClose,
  onVerified,
  purpose = "edit",
}: PinVerifyModalProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", ""]);
      setError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digit
      const digit = value.replace(/\D/g, "").slice(-1);
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);
      setError("");

      // Auto-focus next input
      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [digits, onClose],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length > 0) {
      const newDigits = ["", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 3);
      inputRefs.current[nextFocus]?.focus();
    }
  }, []);

  const handleVerify = useCallback(async () => {
    const pin = digits.join("");
    if (pin.length !== 4) {
      setError(t("auth.missingPin"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, purpose }),
      });

      const data = await res.json();

      if (data.valid) {
        onVerified(pin);
      } else {
        // Use server-provided error if available (already translated or code-based),
        // otherwise fallback to a generic invalid PIN message.
        setError(data.error || t("auth.pinInvalid"));
        setDigits(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(t("auth.verifyError"));
    } finally {
      setLoading(false);
    }
  }, [digits, onVerified, purpose]);

  // Auto-submit when all 4 digits are entered
  useEffect(() => {
    if (isOpen && digits.every((d) => d !== "")) {
      handleVerify();
    }
  }, [digits, handleVerify, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.lockIcon}>
          <Lock size={24} color="white" />
        </div>

        <h2 className={styles.title}>Xác minh danh tính</h2>
        <p className={styles.subtitle}>
          {purpose === "delete"
            ? "Nhập mã PIN 4 chữ số của nhà phát triển để xóa sách"
            : "Nhập mã PIN 4 chữ số của nhà phát triển để chỉnh sửa nội dung sách"}
        </p>

        <div className={styles.pinContainer} onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={styles.pinInput}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              placeholder="•"
              autoComplete="off"
              disabled={loading}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            className={styles.verifyBtn}
            onClick={handleVerify}
            disabled={loading || digits.some((d) => d === "")}
          >
            {loading ? "Đang xác minh..." : "Xác minh"}
          </button>
        </div>
      </div>
    </div>
  );
}
