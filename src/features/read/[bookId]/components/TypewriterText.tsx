"use client";

import React, { memo, useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  messageIndex: number;
  finishedRef: React.RefObject<Set<number> | null>;
  onUpdate: () => void;
  onFinished?: () => void;
};

const TypewriterText = memo(function TypewriterText({
  text,
  messageIndex,
  finishedRef,
  onUpdate,
  onFinished,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState(
    finishedRef.current?.has(messageIndex) ? text : "",
  );

  useEffect(() => {
    const finished = finishedRef.current;
    if (!finished) return;

    if (finished.has(messageIndex)) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const interval = window.setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      onUpdate();

      if (i >= text.length) {
        window.clearInterval(interval);
        finished.add(messageIndex);
        onFinished?.();
      }
    }, 12);

    return () => window.clearInterval(interval);
  }, [text, messageIndex, finishedRef, onUpdate, onFinished]);

  return <span>{displayedText}</span>;
});

TypewriterText.displayName = "TypewriterText";

export default TypewriterText;

