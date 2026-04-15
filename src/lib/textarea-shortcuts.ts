import type React from "react";

type EditOperation = {
  replaceStart: number;
  replaceEnd: number;
  replacement: string;
  selectionStart: number;
  selectionEnd: number;
};

function applyEditOperation(
  textarea: HTMLTextAreaElement,
  op: EditOperation,
  onChanged?: () => void,
) {
  textarea.setRangeText(op.replacement, op.replaceStart, op.replaceEnd, "preserve");
  textarea.setSelectionRange(op.selectionStart, op.selectionEnd);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  onChanged?.();
}

function toggleInlineWrap(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  wrap: string,
): EditOperation {
  const selected = value.slice(selectionStart, selectionEnd);
  const wrapLength = wrap.length;

  if (!selected) {
    const inserted = `${wrap}${wrap}`;
    return {
      replaceStart: selectionStart,
      replaceEnd: selectionEnd,
      replacement: inserted,
      selectionStart: selectionStart + wrapLength,
      selectionEnd: selectionStart + wrapLength,
    };
  }

  // Selection already includes markers => unwrap directly
  const hasWrap =
    selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length >= wrapLength * 2;
  if (hasWrap) {
    const unwrapped = selected.slice(wrap.length, selected.length - wrap.length);
    return {
      replaceStart: selectionStart,
      replaceEnd: selectionEnd,
      replacement: unwrapped,
      selectionStart,
      selectionEnd: selectionStart + unwrapped.length,
    };
  }

  // Selection is inside markers => unwrap surrounding markers
  const hasOuterWrap =
    selectionStart >= wrapLength &&
    value.slice(selectionStart - wrapLength, selectionStart) === wrap &&
    value.slice(selectionEnd, selectionEnd + wrapLength) === wrap;
  if (hasOuterWrap) {
    return {
      replaceStart: selectionStart - wrapLength,
      replaceEnd: selectionEnd + wrapLength,
      replacement: selected,
      selectionStart: selectionStart - wrapLength,
      selectionEnd: selectionEnd - wrapLength,
    };
  }

  const wrapped = `${wrap}${selected}${wrap}`;
  return {
    replaceStart: selectionStart,
    replaceEnd: selectionEnd,
    replacement: wrapped,
    selectionStart: selectionStart + wrapLength,
    selectionEnd: selectionEnd + wrapLength,
  };
}

function indentOrOutdentLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  outdent: boolean,
  indent = "\t",
): EditOperation {
  if (!outdent && selectionStart === selectionEnd) {
    return {
      replaceStart: selectionStart,
      replaceEnd: selectionEnd,
      replacement: indent,
      selectionStart: selectionStart + indent.length,
      selectionEnd: selectionStart + indent.length,
    };
  }

  const blockStart = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const block = value.slice(blockStart, selectionEnd);
  const lines = block.split("\n");

  if (!outdent) {
    const indented = lines.map((line) => indent + line).join("\n");
    return {
      replaceStart: blockStart,
      replaceEnd: selectionEnd,
      replacement: indented,
      selectionStart: selectionStart + indent.length,
      selectionEnd: selectionEnd + indent.length * lines.length,
    };
  }

  const removedPerLine = lines.map((line) => {
    if (line.startsWith(indent)) return indent.length;
    if (line.startsWith("  ")) return 2;
    return 0;
  });

  const outdented = lines
    .map((line) => {
      if (line.startsWith(indent)) return line.slice(indent.length);
      if (line.startsWith("  ")) return line.slice(2);
      return line;
    })
    .join("\n");

  const removedTotal = removedPerLine.reduce((a, b) => a + b, 0);
  const removedOnFirstLine = removedPerLine[0] ?? 0;

  return {
    replaceStart: blockStart,
    replaceEnd: selectionEnd,
    replacement: outdented,
    selectionStart: Math.max(blockStart, selectionStart - removedOnFirstLine),
    selectionEnd: Math.max(blockStart, selectionEnd - removedTotal),
  };
}

type ShortcutOptions = {
  onChanged?: () => void;
};

export async function handleTextareaShortcuts(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  { onChanged }: ShortcutOptions,
) {
  const textarea = e.currentTarget;
  const { value, selectionStart, selectionEnd } = textarea;
  const key = e.key.toLowerCase();
  const metaOrCtrl = e.metaKey || e.ctrlKey;

  if (key === "tab") {
    e.preventDefault();
    const op = indentOrOutdentLines(value, selectionStart, selectionEnd, e.shiftKey);
    applyEditOperation(textarea, op, onChanged);
    return;
  }

  if (!metaOrCtrl) return;

  // Copy entire editor content
  if (key === "c" && e.shiftKey) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // no-op if clipboard permission is denied
    }
    return;
  }

  // Paste as plain text
  if (key === "v" && e.shiftKey) {
    e.preventDefault();
    try {
      const plain = await navigator.clipboard.readText();
      const op: EditOperation = {
        replaceStart: selectionStart,
        replaceEnd: selectionEnd,
        replacement: plain,
        selectionStart: selectionStart + plain.length,
        selectionEnd: selectionStart + plain.length,
      };
      applyEditOperation(textarea, op, onChanged);
    } catch {
      // fallback to browser default paste behavior when clipboard API is unavailable
    }
  }
}
