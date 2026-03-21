/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Paintbrush, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface VisualizeButtonProps {
  content: string;
  bookTitle: string;
  bookId?: string;
  currentPage?: number;
  highlightedText?: string;
}

export default function VisualizeButton({ 
  content, 
  bookTitle, 
  bookId, 
  currentPage, 
  highlightedText 
}: VisualizeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [result, setResult] = useState<{ prompt: string; imageUrl: string } | null>(null);

  const handleVisualize = async () => {
    setLoading(true);
    setResult(null);
    setImageLoaded(false);
    try {
      const response = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          bookTitle, 
          bookId, 
          currentPage, 
          highlightedText 
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to visualize");
      }

      setResult(data);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Could not generate visualization. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="btn-ghost"
          style={{
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 20,
            background: "rgba(194, 94, 48, 0.1)",
            color: "#c25e30",
            border: "1px solid rgba(194, 94, 48, 0.2)",
            transition: "all 0.2s ease",
          }}
          onClick={() => {
            handleVisualize();
          }}
        >
          <Paintbrush size={16} />
          Illuminate Scene
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-background border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Paintbrush className="text-[#c25e30]" size={20} />
            Scene Visualization
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            AI-generated illustration of the current page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-6 w-full">
              <div className="relative">
                 <Loader2 className="animate-spin text-[#c25e30]" size={48} />
                 <div className="absolute inset-0 animate-ping rounded-full border-2 border-[#c25e30]/20" />
              </div>
              <p className="text-muted-foreground animate-pulse font-medium">Scanning text for imagery...</p>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-6 w-full animate-in fade-in zoom-in duration-300">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted shadow-inner group">
                <img
                  src={result.imageUrl}
                  alt="Visualized scene"
                  className={`object-cover w-full h-full transition-opacity duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              <div className="bg-muted/30 p-5 rounded-xl border border-border/50 backdrop-blur-sm">
                <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 mb-3">AI Prompt Layer</h4>
                <p className="text-sm italic leading-relaxed text-foreground/90">
                   <span className="text-[#c25e30] text-lg font-serif">&ldquo;</span>
                   {result.prompt}
                   <span className="text-[#c25e30] text-lg font-serif">&rdquo;</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Something went wrong. Please try again.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
