"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Loader2, BookX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import styles from "./DictionaryPopup.module.css";

/* ─── Types from dictionaryapi.dev v2 ─── */
type Phonetic = {
  text?: string;
  audio?: string;
};

type Definition = {
  definition: string;
  example?: string;
  synonyms?: string[];
};

type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
};

type DictionaryEntry = {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings: Meaning[];
};

type DictionaryPopupProps = {
  word: string | null;
  onClose: () => void;
};

export default function DictionaryPopup({ word, onClose }: DictionaryPopupProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchDefinition = useCallback(async (w: string) => {
    // Take only the first word if multiple words selected
    const singleWord = w.trim().split(/\s+/)[0].replace(/[^a-zA-Z'-]/g, "");
    if (!singleWord) {
      setError("Please select a single word to look up.");
      return;
    }

    setLoading(true);
    setError(null);
    setEntry(null);

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(singleWord)}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          setError(`No definition found for "${singleWord}".`);
        } else {
          setError("Failed to fetch definition. Please try again.");
        }
        return;
      }

      const data: DictionaryEntry[] = await res.json();
      if (data.length > 0) {
        setEntry(data[0]);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (word) {
      fetchDefinition(word);
    } else {
      setEntry(null);
      setError(null);
    }
  }, [word, fetchDefinition]);

  const playAudio = useCallback(() => {
    if (!entry?.phonetics) return;
    const audioUrl = entry.phonetics.find((p) => p.audio && p.audio.length > 0)?.audio;
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, [entry]);

  const phoneticText =
    entry?.phonetic ||
    entry?.phonetics?.find((p) => p.text)?.text ||
    null;

  const hasAudio = entry?.phonetics?.some((p) => p.audio && p.audio.length > 0);

  // Collect all synonyms across meanings
  const allSynonyms = entry
    ? Array.from(
        new Set(
          entry.meanings.flatMap((m) => [
            ...(m.synonyms || []),
            ...m.definitions.flatMap((d) => d.synonyms || []),
          ])
        )
      ).slice(0, 8)
    : [];

  return (
    <Dialog open={!!word} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="w-[50vw] max-w-[50vw] p-0 overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-glow), 0 25px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Accent bar */}
        <div className={styles.accentBar} />

        <DialogTitle className="sr-only">
          Dictionary: {word}
        </DialogTitle>

        <div className={styles.body}>
          <AnimatePresence mode="wait">
            {loading ? (
              /* ─── Loading ─── */
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.loadingState}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <Loader2 size={28} color="var(--accent-primary)" />
                </motion.div>
                <span className={styles.loadingText}>Looking up definition…</span>
              </motion.div>
            ) : error ? (
              /* ─── Error ─── */
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.errorState}
              >
                <div className={styles.errorIcon}>
                  <BookX size={24} />
                </div>
                <p className={styles.errorText}>{error}</p>
              </motion.div>
            ) : entry ? (
              /* ─── Result ─── */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Word header */}
                <div className={styles.wordHeader}>
                  <h2 className={styles.word}>{entry.word}</h2>
                  {phoneticText && (
                    <span className={styles.phonetic}>{phoneticText}</span>
                  )}
                  {hasAudio && (
                    <button
                      onClick={playAudio}
                      className={styles.audioButton}
                      aria-label="Play pronunciation"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>

                {/* Meanings */}
                {entry.meanings.map((meaning, mi) => (
                  <div key={`${meaning.partOfSpeech}-${mi}`} className={styles.meaningSection}>
                    <div className={styles.partOfSpeech}>
                      <span>{meaning.partOfSpeech}</span>
                      <div className={styles.partOfSpeechLine} />
                    </div>

                    <ol className={styles.definitionList}>
                      {meaning.definitions.slice(0, 3).map((def, di) => (
                        <li key={di} className={styles.definitionItem}>
                          <span className={styles.definitionIndex}>{di + 1}.</span>
                          <div>
                            <span>{def.definition}</span>
                            {def.example && (
                              <p className={styles.example}>"{def.example}"</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}

                {/* Synonyms */}
                {allSynonyms.length > 0 && (
                  <div className={styles.synonymsSection}>
                    <span className={styles.synonymsLabel}>Synonyms</span>
                    <div className={styles.synonymsList}>
                      {allSynonyms.map((syn) => (
                        <span key={syn} className={styles.synonymPill}>
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
