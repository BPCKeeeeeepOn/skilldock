"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyButton({
  text,
  label = "复制",
  copiedLabel = "已复制",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
        copied
          ? "border-[#111216] bg-[#c8ff29] text-[#111216]"
          : "border-[#111216]/25 bg-white text-[#111216] hover:border-[#111216] hover:bg-[#eae8e0]"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-[#111216]" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 text-[#4e5361]" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
