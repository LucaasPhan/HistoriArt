"use client";

import * as Popover from "@radix-ui/react-popover";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Star } from "lucide-react";
import React from "react";
import type { BookMetadata } from "../types";
import styles from "./styles/BookInfoPopover.module.css";

interface BookInfoPopoverProps {
  children: React.ReactNode;
  bookData: BookMetadata | null;
}

export default function BookInfoPopover({ children, bookData }: BookInfoPopoverProps) {
  if (!bookData) return <>{children}</>;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className={styles.titleTrigger}>{children}</div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.popoverContent}
          side="bottom"
          align="start"
          sideOffset={20}
        >
          <div className={styles.cardContainer}>
            {/* Background Layer */}
            <div className={styles.backgroundCover}>
              {bookData.coverUrl ? (
                <img
                  src={bookData.coverUrl}
                  alt={bookData.title}
                  className={styles.coverImage}
                />
              ) : (
                <div
                  className={styles.coverImage}
                  style={{
                    background: `linear-gradient(135deg, ${bookData.coverGradient[0]}, ${bookData.coverGradient[1]})`,
                  }}
                />
              )}
              <div className={styles.overlay} />
            </div>

            {/* Content Layer */}
            <div className={styles.contentSide}>
              <h3 className={styles.title}>{bookData.title}</h3>
              <p className={styles.author}>{bookData.author}</p>
              
              <p className={styles.description}>
                {bookData.description || "Chưa có mô tả cho tác phẩm này. Hãy bắt đầu đọc để khám phá nội dung hấp dẫn bên trong."}
              </p>

              <div className={styles.footer}>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <BookOpen size={14} className={styles.statIcon} />
                    <span>{bookData.totalPages} trang</span>
                  </div>
                  {bookData.estimatedReadTime && (
                    <div className={styles.statItem}>
                      <Clock size={14} className={styles.statIcon} />
                      <span>{bookData.estimatedReadTime}p</span>
                    </div>
                  )}
                  <div className={styles.statItem}>
                    <Star size={14} className={styles.statIcon} />
                    <span>4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
