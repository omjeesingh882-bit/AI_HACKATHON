"use client";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SuggestedQuestions({ onSelect }: { onSelect: (q: string) => void }) {
  const suggestions = [
    "What events are happening this month?",
    "Summarize the latest college notice",
    "What hackathons are available?",
    "What are the exam schedules?",
    "Show me internship opportunities",
    "What workshops are coming up?",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-4xl mx-auto my-6">
      {suggestions.map((q, idx) => (
        <Button
          key={idx}
          variant="outline"
          className="h-auto py-3 px-4 flex justify-start text-left items-start gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm"
          onClick={() => onSelect(q)}
        >
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-sm text-foreground/80 font-normal whitespace-normal line-clamp-2">
            {q}
          </span>
        </Button>
      ))}
    </div>
  );
}